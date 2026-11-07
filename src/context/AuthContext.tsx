import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfileData: (displayName: string, photoURL?: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default 5 GB free storage quota
const DEFAULT_STORAGE_LIMIT = 5 * 1024 * 1024 * 1024; // 5,368,709,120 bytes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync or create user profile in Firestore
  const syncUserProfile = async (firebaseUser: User) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        const newProfile: UserProfile = {
          userId: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'CloudVault User',
          photoURL: firebaseUser.photoURL || '',
          storageUsed: 0,
          storageLimit: DEFAULT_STORAGE_LIMIT,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      } else {
        const data = snap.data() as UserProfile;
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error synchronizing user profile:', err);
      // Fallback local representation if network glitch
      setUserProfile({
        userId: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'CloudVault User',
        photoURL: firebaseUser.photoURL || '',
        storageUsed: 0,
        storageLimit: DEFAULT_STORAGE_LIMIT,
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);

        // Listen for live updates to storageUsed or profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeProfile = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          }
        );

        setLoading(false);
        return () => unsubscribeProfile();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (name.trim()) {
      await updateFirebaseProfile(userCredential.user, {
        displayName: name.trim(),
      });
    }
    await syncUserProfile(userCredential.user);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    await syncUserProfile(userCredential.user);
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logOut = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfileData = async (displayName: string, photoURL?: string) => {
    if (!auth.currentUser) throw new Error('Not authenticated');

    await updateFirebaseProfile(auth.currentUser, {
      displayName: displayName.trim(),
      photoURL: photoURL || auth.currentUser.photoURL,
    });

    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const updated: Partial<UserProfile> = {
      displayName: displayName.trim(),
      photoURL: photoURL || auth.currentUser.photoURL || '',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, updated, { merge: true });

    setUserProfile((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const refreshUserProfile = async () => {
    if (!auth.currentUser) return;
    await syncUserProfile(auth.currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        resetPassword,
        logOut,
        updateUserProfileData,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
