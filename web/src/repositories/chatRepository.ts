import { SupportConversation, ChatMessage } from '../models';
import { db, isFirebaseConfigured } from '../services/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';

const CONV_STORAGE_KEY = 'folmishti_conversations';
const MSG_STORAGE_KEY_PREFIX = 'folmishti_msgs_';

function getLocalConversations(): SupportConversation[] {
  try {
    const raw = localStorage.getItem(CONV_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalConversations(list: SupportConversation[]) {
  try {
    localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('folmishti_chat_updated'));
  } catch (e) {
    console.error(e);
  }
}

function getLocalMessages(convId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(MSG_STORAGE_KEY_PREFIX + convId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMessages(convId: string, msgs: ChatMessage[]) {
  try {
    localStorage.setItem(MSG_STORAGE_KEY_PREFIX + convId, JSON.stringify(msgs));
    window.dispatchEvent(new CustomEvent('folmishti_message_added', { detail: { convId } }));
  } catch (e) {
    console.error(e);
  }
}

export const chatRepository = {
  async getOrCreateConversation(
    userId: string,
    userName: string,
    userEmail?: string,
    userPhone?: string
  ): Promise<SupportConversation> {
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, 'supportConversations'),
          where('userId', '==', userId),
          where('status', '!=', 'closed')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          return { id: d.id, ...d.data() } as SupportConversation;
        }

        // Create new
        const newDocRef = doc(collection(db, 'supportConversations'));
        const newConv: SupportConversation = {
          id: newDocRef.id,
          userId,
          userName,
          userEmail: userEmail || '',
          userPhone: userPhone || '',
          status: 'open',
          lastMessageText: '',
          lastMessageTimestamp: new Date().toISOString(),
          unreadCountAdmin: 0,
          unreadCountUser: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(newDocRef, newConv);
        return newConv;
      } catch (err) {
        console.warn('Firestore conversation query failed, using local fallback', err);
      }
    }

    // Local fallback
    const list = getLocalConversations();
    const existing = list.find(c => c.userId === userId && c.status !== 'closed');
    if (existing) {
      return existing;
    }

    const newLocalConv: SupportConversation = {
      id: `conv-${userId}-${Date.now()}`,
      userId,
      userName,
      userEmail: userEmail || '',
      userPhone: userPhone || '',
      status: 'open',
      lastMessageText: 'চ্যাট শুরু হয়েছে।',
      lastMessageTimestamp: new Date().toISOString(),
      unreadCountAdmin: 0,
      unreadCountUser: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newLocalConv);
    saveLocalConversations(list);

    // Initial greeting message from support
    const welcomeMsg: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      conversationId: newLocalConv.id,
      senderId: 'admin-bot',
      senderName: 'ফল মিষ্টি কাস্টমার সাপোর্ট',
      senderRole: 'admin',
      text: 'আসসালামু আলাইকুম! ফল মিষ্টিতে আপনাকে স্বাগতম। আমরা কীভাবে আপনাকে সাহায্য করতে পারি?',
      read: true,
      createdAt: new Date().toISOString()
    };
    saveLocalMessages(newLocalConv.id, [welcomeMsg]);

    return newLocalConv;
  },

  async getAllConversations(): Promise<SupportConversation[]> {
    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, 'supportConversations'), orderBy('updatedAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportConversation));
        }
      } catch (err) {
        console.warn(err);
      }
    }
    return getLocalConversations();
  },

  async sendMessage(
    convId: string,
    senderId: string,
    senderName: string,
    senderRole: 'customer' | 'admin',
    text: string
  ): Promise<ChatMessage> {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      conversationId: convId,
      senderId,
      senderName,
      senderRole,
      text: text.trim(),
      read: false,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        const msgRef = doc(collection(db, `supportConversations/${convId}/messages`));
        msg.id = msgRef.id;
        await setDoc(msgRef, msg);

        const updateData: any = {
          lastMessageText: msg.text,
          lastMessageTimestamp: msg.createdAt,
          updatedAt: msg.createdAt
        };
        if (senderRole === 'customer') {
          updateData.unreadCountAdmin = (updateData.unreadCountAdmin || 0) + 1;
        } else {
          updateData.unreadCountUser = (updateData.unreadCountUser || 0) + 1;
        }
        await updateDoc(doc(db, 'supportConversations', convId), updateData);
      } catch (err) {
        console.warn('Firestore send message failed', err);
      }
    }

    // Local update
    const messages = getLocalMessages(convId);
    messages.push(msg);
    saveLocalMessages(convId, messages);

    const convs = getLocalConversations();
    const conv = convs.find(c => c.id === convId);
    if (conv) {
      conv.lastMessageText = msg.text;
      conv.lastMessageTimestamp = msg.createdAt;
      conv.updatedAt = msg.createdAt;
      if (senderRole === 'customer') {
        conv.unreadCountAdmin += 1;
      } else {
        conv.unreadCountUser += 1;
      }
      saveLocalConversations(convs);
    }

    return msg;
  },

  subscribeMessages(convId: string, callback: (msgs: ChatMessage[]) => void): () => void {
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, `supportConversations/${convId}/messages`),
          orderBy('createdAt', 'asc')
        );
        const unsubscribe = onSnapshot(q, snap => {
          const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
          callback(msgs);
        });
        return unsubscribe;
      } catch (err) {
        console.warn('Firestore subscribe error', err);
      }
    }

    // Local subscriber with event listener
    callback(getLocalMessages(convId));

    const handler = (e: any) => {
      if (!e.detail || e.detail.convId === convId) {
        callback(getLocalMessages(convId));
      }
    };

    window.addEventListener('folmishti_message_added', handler);
    return () => window.removeEventListener('folmishti_message_added', handler);
  },

  async markAsRead(convId: string, role: 'customer' | 'admin'): Promise<void> {
    const convs = getLocalConversations();
    const conv = convs.find(c => c.id === convId);
    if (conv) {
      if (role === 'admin') conv.unreadCountAdmin = 0;
      else conv.unreadCountUser = 0;
      saveLocalConversations(convs);
    }

    if (isFirebaseConfigured) {
      try {
        const field = role === 'admin' ? 'unreadCountAdmin' : 'unreadCountUser';
        await updateDoc(doc(db, 'supportConversations', convId), { [field]: 0 });
      } catch (err) {
        console.warn(err);
      }
    }
  },

  async updateConversationStatus(convId: string, status: 'open' | 'assigned' | 'closed'): Promise<void> {
    const convs = getLocalConversations();
    const conv = convs.find(c => c.id === convId);
    if (conv) {
      conv.status = status;
      saveLocalConversations(convs);
    }

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'supportConversations', convId), { status });
      } catch (err) {
        console.warn(err);
      }
    }
  }
};
