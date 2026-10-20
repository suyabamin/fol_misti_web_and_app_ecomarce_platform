import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, signInWithPopup, updateProfile as fbUpdateProfile } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../services/firebase';
import { UserProfile } from '../models';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isDeliveryPerson: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'folmishti_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDeliveryPerson, setIsDeliveryPerson] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          let adminClaim = false;
          let deliveryClaim = false;

          try {
            const tokenResult = await user.getIdTokenResult();
            adminClaim = Boolean(tokenResult.claims.admin);
            deliveryClaim = Boolean(tokenResult.claims.delivery);
          } catch {
            // ignore
          }

          if (!adminClaim) {
            try {
              const adminSnap = await getDoc(doc(db, 'admins', user.uid));
              if (adminSnap.exists()) {
                adminClaim = true;
              }
            } catch (err) {
              console.warn('Admin check fallback error:', err);
            }
          }

          if (!adminClaim && !deliveryClaim) {
            try {
              const deliverySnap = await getDoc(doc(db, 'deliveryProfiles', user.uid));
              if (deliverySnap.exists()) {
                deliveryClaim = true;
              }
            } catch (err) {
              console.warn('Delivery profile check error:', err);
            }
          }

          setIsAdmin(adminClaim);
          setIsDeliveryPerson(deliveryClaim);

          const role = adminClaim ? 'admin' : deliveryClaim ? 'delivery' : 'customer';
          const defaultName = adminClaim
            ? 'সুপার অ্যাডমিন'
            : deliveryClaim
            ? 'ডেলিভারি রাইডার'
            : 'সম্মানিত গ্রাহক';

          setUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || defaultName,
            role
          });
        } else {
          setUserProfile(null);
          setIsAdmin(false);
          setIsDeliveryPerson(false);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Demo / Local Mode
      const stored = localStorage.getItem(DEMO_USER_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserProfile(parsed);
          setIsAdmin(parsed.role === 'admin');
          setIsDeliveryPerson(parsed.role === 'delivery');
          setCurrentUser({
            uid: parsed.uid,
            email: parsed.email,
            displayName: parsed.displayName,
            emailVerified: true
          } as User);
        } catch {
          // ignore
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    // Special admin login bypass for development/testing if needed
    if (email === 'admin@folmishti.com') {
      const adminProfile: UserProfile = {
        uid: 'admin-master-uid',
        email: 'admin@folmishti.com',
        displayName: 'সুপার অ্যাডমিন (Admin)',
        role: 'admin'
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(adminProfile));
      setUserProfile(adminProfile);
      setIsAdmin(true);
      setIsDeliveryPerson(false);
      setCurrentUser({
        uid: adminProfile.uid,
        email: adminProfile.email,
        displayName: adminProfile.displayName
      } as User);
      return;
    }

    // Special delivery rider login bypass for development/testing
    if (email === 'delivery@folmishti.com') {
      const deliveryProfile: UserProfile = {
        uid: 'delivery-agent-1',
        email: 'delivery@folmishti.com',
        displayName: 'মোঃ রফিকুল ইসলাম (Delivery Rider)',
        role: 'delivery'
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(deliveryProfile));
      setUserProfile(deliveryProfile);
      setIsAdmin(false);
      setIsDeliveryPerson(true);
      setCurrentUser({
        uid: deliveryProfile.uid,
        email: deliveryProfile.email,
        displayName: deliveryProfile.displayName
      } as User);
      return;
    }

    if (isFirebaseConfigured) {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      let isAdminUser = false;
      try {
        const tokenResult = await cred.user.getIdTokenResult();
        isAdminUser = Boolean(tokenResult.claims.admin);
      } catch {
        // ignore
      }
      if (!isAdminUser) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', cred.user.uid));
          if (adminDoc.exists()) {
            isAdminUser = true;
          }
        } catch {
          // ignore
        }
      }
      setIsAdmin(isAdminUser);
    } else {
      const mockProfile: UserProfile = {
        uid: 'user-' + Date.now(),
        email,
        displayName: email.split('@')[0],
        role: 'customer'
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockProfile));
      setUserProfile(mockProfile);
      setIsAdmin(false);
      setCurrentUser({
        uid: mockProfile.uid,
        email: mockProfile.email,
        displayName: mockProfile.displayName
      } as User);
    }
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    if (isFirebaseConfigured) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await fbUpdateProfile(cred.user, { displayName: name });
      setUserProfile({
        uid: cred.user.uid,
        email,
        displayName: name,
        phone,
        role: 'customer'
      });
    } else {
      const mockProfile: UserProfile = {
        uid: 'user-' + Date.now(),
        email,
        displayName: name,
        phone,
        role: 'customer'
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockProfile));
      setUserProfile(mockProfile);
      setIsAdmin(false);
      setCurrentUser({
        uid: mockProfile.uid,
        email: mockProfile.email,
        displayName: mockProfile.displayName
      } as User);
    }
  };

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured) {
      await signInWithPopup(auth, googleProvider);
    } else {
      const mockProfile: UserProfile = {
        uid: 'google-user-' + Date.now(),
        email: 'customer@gmail.com',
        displayName: 'Google Customer',
        role: 'customer'
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockProfile));
      setUserProfile(mockProfile);
      setIsAdmin(false);
      setCurrentUser({
        uid: mockProfile.uid,
        email: mockProfile.email,
        displayName: mockProfile.displayName
      } as User);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    localStorage.removeItem(DEMO_USER_KEY);
    setCurrentUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    setIsDeliveryPerson(false);
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, email);
    }
  };

  const updateUserDisplayName = async (name: string) => {
    if (currentUser && isFirebaseConfigured) {
      await fbUpdateProfile(currentUser, { displayName: name });
    }
    if (userProfile) {
      const updated = { ...userProfile, displayName: name };
      setUserProfile(updated);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isDeliveryPerson,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updateUserDisplayName
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
