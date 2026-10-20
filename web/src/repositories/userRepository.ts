import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase';
import { INITIAL_REGISTERED_USERS, RegisteredUserItem } from '../data/initialData';

const USERS_STORAGE_KEY = 'folmishti_registered_users';

class UserRepository {
  async getRegisteredUsers(): Promise<RegisteredUserItem[]> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          const remoteUsers = snap.docs.map(d => {
            const data = d.data();
            return {
              uid: d.id,
              name: data.displayName || data.name || 'সম্মানিত গ্রাহক',
              email: data.email || '',
              phone: data.phone || '',
              district: data.district || data.city || 'ঢাকা',
              role: data.role || 'customer',
              ordersCount: data.ordersCount || 0,
              totalSpent: data.totalSpent || 0,
              status: data.status || 'active',
              joinedDate: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '2026-01-01'
            } as RegisteredUserItem;
          });

          // Merge with any initial demo records not already present
          const existingUids = new Set(remoteUsers.map(u => u.uid));
          const merged = [...remoteUsers];
          for (const u of INITIAL_REGISTERED_USERS) {
            if (!existingUids.has(u.uid)) {
              merged.push(u);
            }
          }
          return merged;
        }
      } catch (err) {
        console.warn('Firestore users read error:', err);
      }
    }

    // Local / Demo storage fallback
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: RegisteredUserItem[] = JSON.parse(stored);
        const existingUids = new Set(parsed.map(u => u.uid));
        const merged = [...parsed];
        for (const u of INITIAL_REGISTERED_USERS) {
          if (!existingUids.has(u.uid)) {
            merged.push(u);
          }
        }
        return merged;
      } catch (e) {
        console.error('Failed to parse stored users:', e);
      }
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_REGISTERED_USERS));
    return INITIAL_REGISTERED_USERS;
  }

  async saveRegisteredUser(user: RegisteredUserItem): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.name,
          email: user.email,
          phone: user.phone,
          district: user.district || 'ঢাকা',
          role: user.role,
          status: user.status,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore save user error:', err);
      }
    }

    const users = await this.getRegisteredUsers();
    const idx = users.findIndex(u => u.uid === user.uid);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.unshift(user);
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  async updateUserRole(uid: string, role: 'customer' | 'admin' | 'delivery'): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'users', uid), { role, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Firestore update role error:', err);
      }
    }

    const users = await this.getRegisteredUsers();
    const target = users.find(u => u.uid === uid);
    if (target) {
      target.role = role;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }
}

export const userRepository = new UserRepository();
