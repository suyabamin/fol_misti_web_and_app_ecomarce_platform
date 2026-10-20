import { Order, OrderStatus } from '../models';
import { db, isFirebaseConfigured } from '../services/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, query, where, orderBy, getDoc } from 'firebase/firestore';
import { productRepository } from './productRepository';

const STORAGE_KEY = 'folmishti_orders';

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error(e);
  }
}

export const orderRepository = {
  async getAll(): Promise<Order[]> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        }
      } catch (err) {
        console.warn('Firestore orders fetch failed', err);
      }
    }
    return getLocalOrders();
  },

  async getByUser(userId: string): Promise<Order[]> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(query(collection(db, 'orders'), where('userId', '==', userId)));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        }
      } catch (err) {
        console.warn(err);
      }
    }
    const orders = getLocalOrders();
    return orders.filter(o => o.userId === userId);
  },

  async getById(orderId: string): Promise<Order | null> {
    if (isFirebaseConfigured) {
      try {
        const d = await getDoc(doc(db, 'orders', orderId));
        if (d.exists()) {
          return { id: d.id, ...d.data() } as Order;
        }
      } catch (err) {
        console.warn(err);
      }
    }
    const orders = getLocalOrders();
    return orders.find(o => o.id === orderId || o.orderNumber === orderId) || null;
  },

  async create(order: Order): Promise<Order> {
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'orders', order.id), order);
      } catch (err) {
        console.warn('Firestore order creation failed, persisting locally', err);
      }
    }
    // Also deduct stock in local products
    for (const item of order.items) {
      const p = await productRepository.getById(item.productId);
      if (p) {
        await productRepository.updateStock(p.id, Math.max(0, p.stock - item.quantity));
      }
    }

    const list = getLocalOrders();
    list.unshift(order);
    saveLocalOrders(list);
    return order;
  },

  async updateStatus(orderId: string, status: OrderStatus, note?: string): Promise<void> {
    const list = getLocalOrders();
    const order = list.find(o => o.id === orderId || o.orderNumber === orderId);

    if (order) {
      order.status = status;
      order.statusHistory.push({
        status,
        timestamp: new Date().toISOString(),
        note: note || `অর্ডারের বর্তমান অবস্থা: ${status}`
      });

      if (isFirebaseConfigured) {
        try {
          await updateDoc(doc(db, 'orders', order.id), {
            status,
            statusHistory: order.statusHistory,
            updatedAt: new Date().toISOString()
          });
        } catch (err) {
          console.warn(err);
        }
      }

      saveLocalOrders(list);
    }
  },

  async cancelOrder(orderId: string, cancelReason?: string): Promise<{ success: boolean; message: string }> {
    const list = getLocalOrders();
    const order = list.find(o => o.id === orderId || o.orderNumber === orderId);

    if (!order) {
      return { success: false, message: 'অর্ডারটি পাওয়া যায়নি।' };
    }

    if (order.status !== 'pending' && order.status !== 'processing') {
      return { success: false, message: `এই অর্ডারটি আর বাতিল করা যাবে না (বর্তমান অবস্থা: ${order.status})` };
    }

    // Restore stock exactly once
    if (!order.stockRestored) {
      for (const item of order.items) {
        const p = await productRepository.getById(item.productId);
        if (p) {
          await productRepository.updateStock(p.id, p.stock + item.quantity);
        }
      }
      order.stockRestored = true;
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      note: cancelReason || 'অর্ডারটি সফলভাবে বাতিল করা হয়েছে ও স্টক পুনরোদ্ধার করা হয়েছে।'
    });

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'orders', order.id), {
          status: 'cancelled',
          stockRestored: true,
          statusHistory: order.statusHistory,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn(err);
      }
    }

    saveLocalOrders(list);
    return { success: true, message: 'অর্ডারটি বাতিল করা হয়েছে।' };
  },

  // Aliases for convenience
  async getOrders(): Promise<Order[]> {
    return this.getAll();
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    return this.getById(orderId);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<void> {
    return this.updateStatus(orderId, status, note);
  }
};
