import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase';
import {
  DeliveryProfile,
  DeliveryAssignment,
  DeliveryLocation,
  OrderArchive,
  DeliveryEarningsEntry,
  DeliveryPayment,
  DeliveryIssue,
  DeliverySchedule,
  DeliveryAvailabilityStatus
} from '../models';
import { INITIAL_DELIVERY_PROFILES } from '../data/initialData';
import { orderRepository } from './orderRepository';

const PROFILES_STORAGE_KEY = 'folmishti_delivery_profiles';
const ASSIGNMENTS_STORAGE_KEY = 'folmishti_delivery_assignments';
const LOCATIONS_STORAGE_KEY = 'folmishti_delivery_locations';
const ARCHIVES_STORAGE_KEY = 'folmishti_order_archives';
const EARNINGS_STORAGE_KEY = 'folmishti_delivery_earnings';
const PAYMENTS_STORAGE_KEY = 'folmishti_delivery_payments';
const ISSUES_STORAGE_KEY = 'folmishti_delivery_issues';

class DeliveryRepository {
  // -----------------------------------------------------------
  // 1. DELIVERY PROFILES MANAGEMENT
  // -----------------------------------------------------------

  async getDeliveryProfiles(): Promise<DeliveryProfile[]> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(collection(db, 'deliveryProfiles'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryProfile));
        }
      } catch (err) {
        console.warn('Firestore delivery profiles read error:', err);
      }
    }

    // Local / Demo fallback
    const stored = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }

    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(INITIAL_DELIVERY_PROFILES));
    return INITIAL_DELIVERY_PROFILES as DeliveryProfile[];
  }

  async getDeliveryProfile(uid: string): Promise<DeliveryProfile | null> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDoc(doc(db, 'deliveryProfiles', uid));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as DeliveryProfile;
        }
      } catch (err) {
        console.warn('Firestore getDeliveryProfile error:', err);
      }
    }

    const profiles = await this.getDeliveryProfiles();
    return profiles.find(p => p.uid === uid || p.id === uid) || null;
  }

  async saveDeliveryProfile(profile: DeliveryProfile): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'deliveryProfiles', profile.uid), profile, { merge: true });
      } catch (err) {
        console.warn('Firestore saveDeliveryProfile error:', err);
      }
    }

    const profiles = await this.getDeliveryProfiles();
    const idx = profiles.findIndex(p => p.uid === profile.uid || p.id === profile.uid);
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...profile, updatedAt: new Date().toISOString() };
    } else {
      profiles.push({ ...profile, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  }

  async updateAvailability(uid: string, availability: DeliveryAvailabilityStatus): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'deliveryProfiles', uid), {
          availability,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Firestore updateAvailability error:', err);
      }
    }

    const profiles = await this.getDeliveryProfiles();
    const agent = profiles.find(p => p.uid === uid || p.id === uid);
    if (agent) {
      agent.availability = availability;
      agent.updatedAt = new Date().toISOString();
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
    }
  }

  async updateSchedule(uid: string, schedule: DeliverySchedule): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'deliveryProfiles', uid), {
          schedule,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Firestore updateSchedule error:', err);
      }
    }

    const profiles = await this.getDeliveryProfiles();
    const agent = profiles.find(p => p.uid === uid || p.id === uid);
    if (agent) {
      agent.schedule = schedule;
      agent.updatedAt = new Date().toISOString();
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
    }
  }

  // -----------------------------------------------------------
  // 2. ASSIGNMENT & REASSIGNMENT WORKFLOW
  // -----------------------------------------------------------

  async assignDeliveryPerson(
    orderId: string,
    deliveryPersonId: string,
    reason?: string,
    adminUid: string = 'admin'
  ): Promise<boolean> {
    const order = await orderRepository.getOrderById(orderId);
    const profile = await this.getDeliveryProfile(deliveryPersonId);

    if (!order || !profile) {
      throw new Error('Order or Delivery Person not found.');
    }

    if (profile.status !== 'active') {
      throw new Error('Delivery Person is currently suspended or inactive.');
    }

    const previousDeliveryPersonId = order.assignedDeliveryPersonId;
    const isReassignment = Boolean(previousDeliveryPersonId && previousDeliveryPersonId !== deliveryPersonId);
    const nowIso = new Date().toISOString();

    // Reassignment history item
    const reassignmentItem = isReassignment ? {
      previousDeliveryPersonId: previousDeliveryPersonId!,
      previousDeliveryPersonName: order.assignedDeliveryPersonName || 'Previous Agent',
      reason: reason || 'Admin reassigned order',
      timestamp: nowIso,
      reassignedBy: adminUid
    } : null;

    // 1. Update Order in repository
    const statusNote = isReassignment
      ? `Reassigned to ${profile.name}. Reason: ${reason || 'Reallocation'}`
      : `Assigned to delivery person: ${profile.name}`;

    await orderRepository.updateOrderStatus(orderId, 'assigned', statusNote);

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          assignedDeliveryPersonId: profile.uid,
          assignedDeliveryPersonName: profile.name,
          assignedDeliveryPersonPhone: profile.phone,
          deliveryAssignedAt: nowIso,
          updatedAt: nowIso
        });
      } catch (err) {
        console.warn('Firestore order assignment update error:', err);
      }
    }

    // 2. If reassignment, reduce workload on previous agent
    if (isReassignment && previousDeliveryPersonId) {
      const prevProfile = await this.getDeliveryProfile(previousDeliveryPersonId);
      if (prevProfile) {
        prevProfile.currentActiveDeliveries = Math.max(0, (prevProfile.currentActiveDeliveries || 1) - 1);
        if (prevProfile.currentActiveDeliveries === 0) {
          prevProfile.availability = 'available';
        }
        await this.saveDeliveryProfile(prevProfile);
      }
    }

    // 3. Update active workload on newly assigned agent
    profile.currentActiveDeliveries = (profile.currentActiveDeliveries || 0) + 1;
    profile.availability = 'in_order';
    profile.currentActiveOrderId = orderId;
    await this.saveDeliveryProfile(profile);

    // 4. Record DeliveryAssignment
    const assignment: DeliveryAssignment = {
      id: orderId,
      orderId,
      orderNumber: order.orderNumber,
      deliveryPersonId: profile.uid,
      deliveryPersonName: profile.name,
      deliveryPersonPhone: profile.phone,
      customerName: order.deliveryAddress.fullName,
      customerPhone: order.deliveryAddress.phone,
      deliveryAddress: order.deliveryAddress,
      status: 'assigned',
      deliveryFee: order.deliveryFee,
      assignedAt: nowIso,
      assignedBy: adminUid,
      reassignmentHistory: reassignmentItem ? [reassignmentItem] : []
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'deliveryAssignments', orderId), assignment, { merge: true });
      } catch (err) {
        console.warn('Firestore assignment write error:', err);
      }
    }

    const assignments = this.getLocalAssignments();
    const aIdx = assignments.findIndex(a => a.orderId === orderId);
    if (aIdx >= 0) {
      const existing = assignments[aIdx];
      if (reassignmentItem) {
        existing.reassignmentHistory = [...(existing.reassignmentHistory || []), reassignmentItem];
      }
      assignments[aIdx] = { ...existing, ...assignment };
    } else {
      assignments.push(assignment);
    }
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));

    return true;
  }

  async getAssignmentsForAgent(deliveryPersonId: string): Promise<DeliveryAssignment[]> {
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, 'deliveryAssignments'),
          where('deliveryPersonId', '==', deliveryPersonId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryAssignment));
        }
      } catch (err) {
        console.warn('Firestore getAssignmentsForAgent error:', err);
      }
    }

    return this.getLocalAssignments().filter(a => a.deliveryPersonId === deliveryPersonId);
  }

  async getAssignmentForOrder(orderId: string): Promise<DeliveryAssignment | null> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDoc(doc(db, 'deliveryAssignments', orderId));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as DeliveryAssignment;
        }
      } catch (err) {
        console.warn('Firestore getAssignmentForOrder error:', err);
      }
    }

    return this.getLocalAssignments().find(a => a.orderId === orderId) || null;
  }

  // -----------------------------------------------------------
  // 3. LIVE GPS TRACKING & STATUS TRANSITIONS
  // -----------------------------------------------------------

  async startDelivery(orderId: string, deliveryPersonId: string): Promise<void> {
    await orderRepository.updateOrderStatus(
      orderId,
      'out_for_delivery',
      'ডেলিভারি পার্সন পণ্য নিয়ে আপনার ঠিকানার দিকে রওনা হয়েছেন।'
    );

    const nowIso = new Date().toISOString();

    // Initialize or update location
    await this.updateLocation(orderId, deliveryPersonId, {
      latitude: 23.8103, // Default Dhaka coordinates origin
      longitude: 90.4125,
      status: 'live'
    });

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'deliveryAssignments', orderId), {
          status: 'out_for_delivery',
          startedAt: nowIso
        });
      } catch {}
    }

    const assignments = this.getLocalAssignments();
    const a = assignments.find(x => x.orderId === orderId);
    if (a) {
      a.status = 'out_for_delivery';
      a.startedAt = nowIso;
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
    }
  }

  async updateLocation(
    orderId: string,
    deliveryPersonId: string,
    data: Partial<DeliveryLocation>
  ): Promise<void> {
    const location: DeliveryLocation = {
      orderId,
      deliveryPersonId,
      latitude: data.latitude || 23.8103,
      longitude: data.longitude || 90.4125,
      heading: data.heading,
      speed: data.speed,
      accuracy: data.accuracy,
      status: data.status || 'live',
      timestamp: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'deliveryLocations', orderId), location, { merge: true });
      } catch (err) {
        console.warn('Firestore updateLocation error:', err);
      }
    }

    const locs = this.getLocalLocations();
    locs[orderId] = location;
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(locs));

    // Dispatch custom browser event for live reactive map updates
    window.dispatchEvent(new CustomEvent('folmishti_location_update', { detail: location }));
  }

  subscribeToLocation(
    orderId: string,
    callback: (location: DeliveryLocation | null) => void
  ): () => void {
    if (isFirebaseConfigured) {
      try {
        const unsub = onSnapshot(
          doc(db, 'deliveryLocations', orderId),
          snap => {
            if (snap.exists()) {
              callback(snap.data() as DeliveryLocation);
            } else {
              callback(this.getLocalLocations()[orderId] || null);
            }
          },
          err => {
            console.warn('Location snapshot error:', err);
            callback(this.getLocalLocations()[orderId] || null);
          }
        );
        return unsub;
      } catch {}
    }

    // Local subscription via event listener
    const handler = (e: any) => {
      if (e.detail?.orderId === orderId) {
        callback(e.detail);
      }
    };
    window.addEventListener('folmishti_location_update', handler);

    // Initial value
    callback(this.getLocalLocations()[orderId] || null);

    return () => {
      window.removeEventListener('folmishti_location_update', handler);
    };
  }

  async markHandedOver(orderId: string, deliveryPersonId: string): Promise<void> {
    const nowIso = new Date().toISOString();

    await orderRepository.updateOrderStatus(
      orderId,
      'handed_over',
      'ডেলিভারি পার্সন পণ্য গ্রাহকের নিকট হস্তান্তর করেছেন। অনুগ্রহ করে পণ্য বুঝে নিয়ে নিশ্চিত করুন।'
    );

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          handedOverAt: nowIso
        });
        await updateDoc(doc(db, 'deliveryAssignments', orderId), {
          status: 'handed_over',
          handedOverAt: nowIso
        });
        await updateDoc(doc(db, 'deliveryLocations', orderId), {
          status: 'ended'
        });
      } catch (err) {
        console.warn('Firestore markHandedOver error:', err);
      }
    }

    const assignments = this.getLocalAssignments();
    const a = assignments.find(x => x.orderId === orderId);
    if (a) {
      a.status = 'handed_over';
      a.handedOverAt = nowIso;
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
    }
  }

  // -----------------------------------------------------------
  // 4. CUSTOMER RECEIPT CONFIRMATION & ARCHIVING
  // -----------------------------------------------------------

  async confirmCustomerReceipt(orderId: string, customerUid: string): Promise<OrderArchive> {
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found.');
    }

    const nowIso = new Date().toISOString();

    // 1. Transition order status
    await orderRepository.updateOrderStatus(
      orderId,
      'receipt_confirmed',
      'গ্রাহক পণ্য গ্রহণের বিষয়টি নিশ্চিত করেছেন।'
    );

    // 2. Create immutable archive snapshot
    const archive: OrderArchive = {
      id: orderId,
      orderId,
      orderNumber: order.orderNumber,
      userId: customerUid,
      userEmail: order.userEmail,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      deliveryFee: order.deliveryFee,
      total: order.total,
      currency: 'BDT',
      paymentMethod: order.paymentMethod,
      paymentStatus: 'paid',
      deliveryAddress: order.deliveryAddress,
      deliveryPersonInternalId: order.assignedDeliveryPersonId || '',
      deliveryPersonName: order.assignedDeliveryPersonName || 'Direct Store Delivery',
      orderDate: order.createdAt,
      handoverTimestamp: order.handedOverAt || nowIso,
      receiptConfirmedTimestamp: nowIso,
      archivedAt: nowIso,
      isRated: false
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'orderArchives', orderId), archive, { merge: true });
        await updateDoc(doc(db, 'orders', orderId), {
          receiptConfirmedAt: nowIso,
          paymentStatus: 'paid',
          isArchived: true
        });
      } catch (err) {
        console.warn('Firestore archive write error:', err);
      }
    }

    const archives = this.getLocalArchives();
    if (!archives.some(a => a.orderId === orderId)) {
      archives.push(archive);
      localStorage.setItem(ARCHIVES_STORAGE_KEY, JSON.stringify(archives));
    }

    // 3. Generate earnings ledger entry idempotently
    if (order.assignedDeliveryPersonId) {
      await this.recordDeliveryEarnings(
        orderId,
        order.orderNumber,
        order.assignedDeliveryPersonId,
        order.assignedDeliveryPersonName || 'Agent',
        order.deliveryFee || 60
      );
    }

    return archive;
  }

  async reportDeliveryIssue(
    orderId: string,
    customerUid: string,
    customerName: string,
    customerPhone: string,
    issueType: DeliveryIssue['issueType'],
    description: string
  ): Promise<DeliveryIssue> {
    const order = await orderRepository.getOrderById(orderId);
    const nowIso = new Date().toISOString();

    await orderRepository.updateOrderStatus(
      orderId,
      'delivery_issue',
      `গ্রাহক সমস্যা রিপোর্ট করেছেন: ${description}`
    );

    const issue: DeliveryIssue = {
      id: `issue_${orderId}_${Date.now()}`,
      orderId,
      orderNumber: order?.orderNumber || orderId,
      userId: customerUid,
      customerName,
      customerPhone,
      deliveryPersonId: order?.assignedDeliveryPersonId || undefined,
      deliveryPersonName: order?.assignedDeliveryPersonName || undefined,
      issueType,
      description,
      status: 'open',
      createdAt: nowIso
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'deliveryIssues', issue.id), issue);
        await updateDoc(doc(db, 'orders', orderId), {
          deliveryIssueReported: true,
          deliveryIssueDetails: description
        });
      } catch (err) {
        console.warn('Firestore reportDeliveryIssue error:', err);
      }
    }

    const issues = this.getLocalIssues();
    issues.push(issue);
    localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(issues));

    return issue;
  }

  async getCustomerArchives(userId: string): Promise<OrderArchive[]> {
    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, 'orderArchives'), where('userId', '==', userId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as OrderArchive));
        }
      } catch (err) {
        console.warn('Firestore getCustomerArchives error:', err);
      }
    }

    return this.getLocalArchives().filter(a => a.userId === userId);
  }

  async submitArchiveRating(
    orderId: string,
    productRating: number,
    deliveryRating: number,
    reviewComment: string
  ): Promise<void> {
    const nowIso = new Date().toISOString();

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'orderArchives', orderId), {
          isRated: true,
          productRating,
          deliveryRating,
          reviewComment,
          ratedAt: nowIso
        });
      } catch (err) {
        console.warn('Firestore submitArchiveRating error:', err);
      }
    }

    const archives = this.getLocalArchives();
    const a = archives.find(x => x.orderId === orderId);
    if (a) {
      a.isRated = true;
      a.productRating = productRating;
      a.deliveryRating = deliveryRating;
      a.reviewComment = reviewComment;
      localStorage.setItem(ARCHIVES_STORAGE_KEY, JSON.stringify(archives));
    }
  }

  // -----------------------------------------------------------
  // 5. EARNINGS LEDGER & ADMIN PAYMENTS
  // -----------------------------------------------------------

  private async recordDeliveryEarnings(
    orderId: string,
    orderNumber: string,
    deliveryPersonId: string,
    deliveryPersonName: string,
    amount: number
  ): Promise<void> {
    const entryId = `earn_${orderId}`;
    const nowIso = new Date().toISOString();

    const entry: DeliveryEarningsEntry = {
      id: entryId,
      orderId,
      orderNumber,
      deliveryPersonId,
      deliveryPersonName,
      amount,
      currency: 'BDT',
      status: 'eligible',
      earnedAt: nowIso
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'deliveryEarnings', entryId), entry, { merge: true });
      } catch (err) {
        console.warn('Firestore earnings write error:', err);
      }
    }

    const earnings = this.getLocalEarnings();
    if (!earnings.some(e => e.id === entryId)) {
      earnings.push(entry);
      localStorage.setItem(EARNINGS_STORAGE_KEY, JSON.stringify(earnings));
    }

    // Update delivery person profile metrics
    const profile = await this.getDeliveryProfile(deliveryPersonId);
    if (profile) {
      profile.totalCompletedDeliveries = (profile.totalCompletedDeliveries || 0) + 1;
      profile.totalEarnedDeliveryCharge = (profile.totalEarnedDeliveryCharge || 0) + amount;
      profile.outstandingPayableAmount = (profile.outstandingPayableAmount || 0) + amount;
      profile.currentActiveDeliveries = Math.max(0, (profile.currentActiveDeliveries || 1) - 1);
      if (profile.currentActiveDeliveries === 0) {
        profile.availability = 'available';
        profile.currentActiveOrderId = null;
      }
      await this.saveDeliveryProfile(profile);
    }
  }

  async getEarningsForAgent(deliveryPersonId: string): Promise<DeliveryEarningsEntry[]> {
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, 'deliveryEarnings'),
          where('deliveryPersonId', '==', deliveryPersonId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryEarningsEntry));
        }
      } catch (err) {
        console.warn('Firestore getEarningsForAgent error:', err);
      }
    }

    return this.getLocalEarnings().filter(e => e.deliveryPersonId === deliveryPersonId);
  }

  async getAllEarnings(): Promise<DeliveryEarningsEntry[]> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(collection(db, 'deliveryEarnings'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryEarningsEntry));
        }
      } catch (err) {
        console.warn('Firestore getAllEarnings error:', err);
      }
    }

    return this.getLocalEarnings();
  }

  async recordPayment(
    deliveryPersonId: string,
    amount: number,
    paymentMethod: DeliveryPayment['paymentMethod'],
    transactionReference: string,
    notes: string = '',
    adminUid: string = 'admin'
  ): Promise<DeliveryPayment> {
    const profile = await this.getDeliveryProfile(deliveryPersonId);
    if (!profile) {
      throw new Error('Delivery Person not found.');
    }

    if (amount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    if (amount > (profile.outstandingPayableAmount || 0)) {
      throw new Error(`Payment amount (৳${amount}) exceeds outstanding balance (৳${profile.outstandingPayableAmount}).`);
    }

    const nowIso = new Date().toISOString();
    const paymentId = `pay_${Date.now()}`;

    // Find eligible ledger entries covered by this payment
    const earnings = await this.getEarningsForAgent(deliveryPersonId);
    const eligibleEntries = earnings.filter(e => e.status === 'eligible');
    const coveredIds: string[] = [];
    let allocated = 0;

    for (const ent of eligibleEntries) {
      if (allocated + ent.amount <= amount) {
        coveredIds.push(ent.id);
        allocated += ent.amount;
        ent.status = 'paid';
        ent.paymentId = paymentId;
      }
    }

    const payment: DeliveryPayment = {
      id: paymentId,
      deliveryPersonId,
      deliveryPersonName: profile.name,
      amount,
      paymentDate: nowIso,
      paymentMethod,
      transactionReference,
      notes,
      ledgerEntryIds: coveredIds,
      status: 'paid',
      recordedBy: adminUid,
      createdAt: nowIso
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'deliveryPayments', paymentId), payment);
        for (const cId of coveredIds) {
          await updateDoc(doc(db, 'deliveryEarnings', cId), {
            status: 'paid',
            paymentId
          });
        }
      } catch (err) {
        console.warn('Firestore recordPayment error:', err);
      }
    }

    // Save payment locally
    const payments = this.getLocalPayments();
    payments.push(payment);
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));

    // Update earnings locally
    localStorage.setItem(EARNINGS_STORAGE_KEY, JSON.stringify(this.getLocalEarnings()));

    // Update profile balances
    profile.totalPaidAmount = (profile.totalPaidAmount || 0) + amount;
    profile.outstandingPayableAmount = Math.max(0, (profile.outstandingPayableAmount || 0) - amount);
    await this.saveDeliveryProfile(profile);

    return payment;
  }

  async getPaymentsForAgent(deliveryPersonId: string): Promise<DeliveryPayment[]> {
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, 'deliveryPayments'),
          where('deliveryPersonId', '==', deliveryPersonId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryPayment));
        }
      } catch (err) {
        console.warn('Firestore getPaymentsForAgent error:', err);
      }
    }

    return this.getLocalPayments().filter(p => p.deliveryPersonId === deliveryPersonId);
  }

  async getAllPayments(): Promise<DeliveryPayment[]> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(collection(db, 'deliveryPayments'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryPayment));
        }
      } catch (err) {
        console.warn('Firestore getAllPayments error:', err);
      }
    }

    return this.getLocalPayments();
  }

  async getAllIssues(): Promise<DeliveryIssue[]> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(collection(db, 'deliveryIssues'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryIssue));
        }
      } catch (err) {
        console.warn('Firestore getAllIssues error:', err);
      }
    }

    return this.getLocalIssues();
  }

  // -----------------------------------------------------------
  // LOCAL STORAGE HELPERS
  // -----------------------------------------------------------

  private getLocalAssignments(): DeliveryAssignment[] {
    const s = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  }

  private getLocalLocations(): Record<string, DeliveryLocation> {
    const s = localStorage.getItem(LOCATIONS_STORAGE_KEY);
    return s ? JSON.parse(s) : {};
  }

  private getLocalArchives(): OrderArchive[] {
    const s = localStorage.getItem(ARCHIVES_STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  }

  private getLocalEarnings(): DeliveryEarningsEntry[] {
    const s = localStorage.getItem(EARNINGS_STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  }

  private getLocalPayments(): DeliveryPayment[] {
    const s = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  }

  private getLocalIssues(): DeliveryIssue[] {
    const s = localStorage.getItem(ISSUES_STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  }
}

export const deliveryRepository = new DeliveryRepository();
