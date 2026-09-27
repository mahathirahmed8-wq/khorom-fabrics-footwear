import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getDocFromServer,
  writeBatch,
  runTransaction,
  Unsubscribe,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  ActionCodeSettings,
} from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { isAuthorizedAdmin, Product, FacebookPendingPost } from '../types';

// Your web app's Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyAk2WM9KNwN2lXHWbSBjuh4YEaNBnQIvgw",
  authDomain: "khorom2.firebaseapp.com",
  projectId: "khorom2",
  storageBucket: "khorom2.firebasestorage.app",
  messagingSenderId: "470894441434",
  appId: "1:470894441434:web:a71ae5f44caf0f857246e3",
  measurementId: "G-XM6GL67RC8",
  firestoreDatabaseId: "(default)",
};

// Initialize Firebase singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Safe Analytics Initialization
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn('Firebase analytics init:', e);
      }
    }
  }).catch(() => {});
}

// -------------------------------------------------------------
// FIREBASE AUTHENTICATION (EMAIL & PASSWORD ONLY - NO GOOGLE)
// -------------------------------------------------------------

// 1. Register with Email + Password (PURE FIREBASE AUTH - SOLE SOURCE OF TRUTH)
export async function registerWithEmailPassword(
  name: string,
  email: string,
  pass: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!pass || pass.length < 6) {
      return { success: false, error: 'Password should be at least 6 characters.' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    const fbUser = userCredential.user;

    // Update display name in Firebase Auth
    if (cleanName) {
      try {
        await updateProfile(fbUser, { displayName: cleanName });
      } catch (profileErr) {
        console.warn('Could not update Firebase displayName:', profileErr);
      }
    }

    // Save non-sensitive user profile to Firestore (NEVER STORE PASSWORD!)
    const userDocRef = doc(db, 'users', fbUser.uid);
    const isAdmin = isAuthorizedAdmin(cleanEmail);
    const userData = {
      id: fbUser.uid,
      name: cleanName || cleanEmail.split('@')[0],
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName || cleanEmail)}`,
      role: isAdmin ? 'admin' : 'customer',
      membershipTier: isAdmin ? 'Royal Admin' : 'VIP Member',
      points: 50,
      totalOrders: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString(),
      provider: 'email',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    try {
      await setDoc(userDocRef, userData, { merge: true });
    } catch (fsErr) {
      console.warn('Could not save user profile to Firestore:', fsErr);
    }

    return { success: true, user: userData };
  } catch (err: any) {
    console.error('Firebase registration error:', err);
    let errorMsg = 'Registration failed. Please try again.';
    if (err?.code === 'auth/email-already-in-use') {
      errorMsg = 'This email is already registered. Please sign in or use a different email.';
    } else if (err?.code === 'auth/weak-password') {
      errorMsg = 'Password should be at least 6 characters.';
    } else if (err?.code === 'auth/invalid-email') {
      errorMsg = 'Please enter a valid email address.';
    } else if (err?.code === 'auth/network-request-failed') {
      errorMsg = 'Network error. Please check your internet connection.';
    } else if (err?.message) {
      errorMsg = err.message;
    }
    return { success: false, error: errorMsg };
  }
}

// 2. Login with Email + Password (PURE FIREBASE AUTH - SOLE SOURCE OF TRUTH)
export async function loginWithEmailPassword(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!pass) {
      return { success: false, error: 'Please enter your password.' };
    }

    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    const fbUser = userCredential.user;

    try {
      const idToken = await fbUser.getIdToken();
      cachedIdToken = idToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('khorom_id_token', idToken);
      }
    } catch (tokenErr) {
      console.warn('Could not cache token on login:', tokenErr);
    }

    // Fetch user profile from Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    let userData: any = null;
    try {
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        userData = userSnap.data();
      }
    } catch (e) {
      console.warn('Could not read user profile from Firestore:', e);
    }

    const isAdmin = isAuthorizedAdmin(cleanEmail);

    if (!userData) {
      userData = {
        id: fbUser.uid,
        name: fbUser.displayName || cleanEmail.split('@')[0] || 'Customer',
        email: cleanEmail,
        avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fbUser.displayName || cleanEmail)}`,
        role: isAdmin ? 'admin' : 'customer',
        membershipTier: isAdmin ? 'Royal Admin' : 'VIP Member',
        joinedDate: new Date().toISOString(),
        provider: 'email',
      };
      try {
        await setDoc(userDocRef, { ...userData, lastLoginAt: serverTimestamp() }, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore setDoc notice:', fsErr);
      }
    } else {
      userData.role = isAdmin ? 'admin' : (userData.role || 'customer');
      if (isAdmin) userData.membershipTier = 'Royal Admin';
      try {
        await setDoc(userDocRef, { ...userData, lastLoginAt: serverTimestamp() }, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore update lastLoginAt notice:', fsErr);
      }
    }

    return { success: true, user: userData };
  } catch (err: any) {
    console.error('Firebase login error:', err);
    let errorMsg = 'Email or password is incorrect.';
    if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
      errorMsg = 'Email or password is incorrect.';
    } else if (err?.code === 'auth/user-not-found') {
      errorMsg = 'No account found with this email.';
    } else if (err?.code === 'auth/too-many-requests') {
      errorMsg = 'Too many attempts. Please try again later.';
    } else if (err?.code === 'auth/invalid-email') {
      errorMsg = 'Please enter a valid email address.';
    } else if (err?.code === 'auth/network-request-failed') {
      errorMsg = 'Unable to connect. Please check your internet connection and try again.';
    } else if (err?.message) {
      errorMsg = err.message;
    }
    return { success: false, error: errorMsg };
  }
}

// Update User Profile (Customer Name is REQUIRED, photo is optional, NO password stored)
export async function updateUserProfileData(
  userId: string,
  updates: { name: string; avatar?: string; phone?: string; address?: string; city?: string }
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const cleanName = updates.name?.trim();
    if (!cleanName) {
      return { success: false, error: 'Customer name is required.' };
    }

    const userDocRef = doc(db, 'users', userId);
    const updatePayload: Record<string, any> = {
      name: cleanName,
      updatedAt: serverTimestamp(),
    };

    if (updates.avatar !== undefined) {
      updatePayload.avatar = updates.avatar;
    }
    if (updates.phone !== undefined) {
      updatePayload.phone = updates.phone.trim();
    }
    if (updates.address !== undefined) {
      updatePayload.address = updates.address.trim();
    }
    if (updates.city !== undefined) {
      updatePayload.city = updates.city.trim();
    }

    await setDoc(userDocRef, updatePayload, { merge: true });

    // Update Firebase Auth profile if current user matches
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: cleanName,
          ...(updates.avatar !== undefined ? { photoURL: updates.avatar } : {}),
        });
      } catch (authErr) {
        console.warn('Could not update Firebase Auth displayName/photoURL:', authErr);
      }
    }

    const snap = await getDoc(userDocRef);
    const updatedData = snap.exists() ? snap.data() : { id: userId, ...updatePayload };
    return { success: true, user: updatedData };
  } catch (err: any) {
    console.error('Update user profile error:', err);
    return { success: false, error: err?.message || 'Failed to update profile' };
  }
}

// 3. Send Password Reset Email (SECURE FIREBASE PASSWORD RESET FLOW)
export async function resetPasswordEmail(
  email: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Try passing ActionCodeSettings if running on an authorized domain (localhost or firebaseapp.com)
    let sentWithActionSettings = false;
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isDomainAllowlisted =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.endsWith('firebaseapp.com') ||
        hostname.endsWith('web.app');

      if (isDomainAllowlisted) {
        try {
          const actionCodeSettings: ActionCodeSettings = {
            url: `${window.location.origin}/reset-password`,
            handleCodeInApp: true,
          };
          await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
          sentWithActionSettings = true;
        } catch (actErr: any) {
          if (actErr?.code === 'auth/unauthorized-continue-uri') {
            console.warn('Domain not in continue URI allowlist, falling back to standard reset link');
          } else {
            throw actErr;
          }
        }
      }
    }

    if (!sentWithActionSettings) {
      await sendPasswordResetEmail(auth, cleanEmail);
    }

    return {
      success: true,
      message: 'Password reset link has been sent to your email.',
    };
  } catch (err: any) {
    console.error('Password reset email error:', err);
    let errorMsg = 'Unable to send reset email. Please try again.';
    if (err?.code === 'auth/user-not-found') {
      errorMsg = 'No account found with this email.';
    } else if (err?.code === 'auth/invalid-email') {
      errorMsg = 'Please enter a valid email address.';
    } else if (err?.code === 'auth/network-request-failed') {
      errorMsg = 'Unable to send reset email. Please check your internet connection and try again.';
    } else if (err?.code === 'auth/too-many-requests') {
      errorMsg = 'Too many reset attempts. Please try again later.';
    } else if (err?.message) {
      errorMsg = err.message;
    }
    return { success: false, error: errorMsg };
  }
}

// 4. Verify Reset Code from Link
export async function verifyResetCode(
  oobCode: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    if (!oobCode || !oobCode.trim()) {
      return { success: false, error: 'This password reset link is invalid or has expired.' };
    }
    const email = await verifyPasswordResetCode(auth, oobCode.trim());
    return { success: true, email };
  } catch (err: any) {
    console.error('Verify reset code error:', err);
    let errorMsg = 'This password reset link is invalid or has expired.';
    if (err?.code === 'auth/expired-action-code') {
      errorMsg = 'This password reset link is invalid or has expired.';
    } else if (err?.code === 'auth/invalid-action-code') {
      errorMsg = 'This password reset link is invalid or has expired.';
    }
    return { success: false, error: errorMsg };
  }
}

// 5. Confirm New Password with Action Code
export async function confirmResetPassword(
  oobCode: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!oobCode || !oobCode.trim()) {
      return { success: false, error: 'This password reset link is invalid or has expired.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password should be at least 6 characters.' };
    }
    await confirmPasswordReset(auth, oobCode.trim(), newPassword);
    return {
      success: true,
      message: 'Password reset successful. You can now sign in with your new password.',
    };
  } catch (err: any) {
    console.error('Confirm reset password error:', err);
    let errorMsg = 'Unable to reset password. Please try again.';
    if (err?.code === 'auth/weak-password') {
      errorMsg = 'Password should be at least 6 characters.';
    } else if (
      err?.code === 'auth/expired-action-code' ||
      err?.code === 'auth/invalid-action-code'
    ) {
      errorMsg = 'This password reset link is invalid or has expired.';
    } else if (err?.message) {
      errorMsg = err.message;
    }
    return { success: false, error: errorMsg };
  }
}

// 6. Logout Firebase User
export async function logoutFirebaseUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase sign out error:', err);
  }
}

// 7. Auth State Listener
export function onAuthStateChangedListener(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// -------------------------------------------------------------
// FIRESTORE DATA SAVE FUNCTIONS (USER INPUT TO DATABASE)
// -------------------------------------------------------------

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  senderRole: 'customer' | 'support' | 'admin';
  userId?: string;
  userEmail?: string;
  userPhone?: string;
  timestamp: any;
  createdAt: number;
}

// 1. Save Chat Message to Firestore
export async function saveChatMessageToFirestore(msg: {
  id?: string;
  text: string;
  sender: string;
  senderRole?: 'customer' | 'support' | 'admin';
  userId?: string;
  userEmail?: string;
  userPhone?: string;
}): Promise<string | null> {
  try {
    const messageId = msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const chatDocRef = doc(db, 'chats', messageId);
    
    await setDoc(chatDocRef, {
      id: messageId,
      text: msg.text,
      sender: msg.sender || 'Anonymous',
      senderRole: msg.senderRole || 'customer',
      userId: msg.userId || 'guest',
      userEmail: msg.userEmail || '',
      userPhone: msg.userPhone || '',
      createdAt: Date.now(),
      timestamp: serverTimestamp(),
      savedToFirebase: true,
    }, { merge: true });

    return messageId;
  } catch (error) {
    console.warn('Firestore chat save error:', error);
    return null;
  }
}

// 2. Real-time Chat Subscription
export function subscribeToChatMessages(
  onMessagesUpdate: (messages: ChatMessage[]) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, 'chats'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          messages.push({
            id: docSnap.id,
            text: data.text || '',
            sender: data.sender || 'User',
            senderRole: data.senderRole || 'customer',
            userId: data.userId,
            userEmail: data.userEmail,
            userPhone: data.userPhone,
            timestamp: data.timestamp,
            createdAt: data.createdAt || Date.now(),
          });
        });
        onMessagesUpdate(messages);
      },
      (error) => {
        console.warn('Firestore chat listener warning:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToChatMessages setup error:', err);
    return () => {};
  }
}

// 3. Save Order to Firestore (Ensures userId and status: 'processing')
export async function saveOrderToFirestore(orderData: any): Promise<boolean> {
  try {
    const orderId = orderData.id || `ord-${Date.now()}`;
    const orderDocRef = doc(db, 'orders', orderId);
    await setDoc(orderDocRef, {
      ...orderData,
      status: orderData.status || 'processing',
      firestoreSyncedAt: serverTimestamp(),
      savedToFirebase: true,
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore order save warning:', error);
    return false;
  }
}

// 3a. Update Order Status in Firestore (Admin only)
export async function updateFirestoreOrderStatus(
  orderId: string,
  status: string,
  paymentStatus?: string
): Promise<boolean> {
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    const updates: any = {
      status,
      updatedAtFirestore: serverTimestamp(),
      updatedAt: new Date().toISOString(),
    };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }
    await setDoc(orderDocRef, updates, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore order status update warning:', error);
    return false;
  }
}

// 3b. Real-time Subscription for Isolated User Orders
// Strictly filters by userId - prevents cross-user access
export function subscribeUserOrders(
  userId: string,
  userEmailOrCallback: string | ((orders: any[]) => void),
  optionalCallback?: (orders: any[]) => void
): Unsubscribe {
  const onOrdersUpdate =
    typeof userEmailOrCallback === 'function'
      ? userEmailOrCallback
      : typeof optionalCallback === 'function'
      ? optionalCallback
      : () => {};

  if (!userId) return () => {};
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const userOrders: any[] = [];
        snapshot.forEach((docSnap) => {
          userOrders.push(docSnap.data());
        });
        // Sort in memory by createdAt descending
        userOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onOrdersUpdate(userOrders);
      },
      (error) => {
        console.warn('Firestore user orders listener warning:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeUserOrders error:', err);
    return () => {};
  }
}

// 3c. Real-time Subscription for All Orders (Authorized Admin Only)
export function subscribeAllOrders(
  onOrdersUpdate: (orders: any[]) => void
): Unsubscribe {
  try {
    const q = query(collection(db, 'orders'));

    return onSnapshot(
      q,
      (snapshot) => {
        const allOrders: any[] = [];
        snapshot.forEach((docSnap) => {
          allOrders.push(docSnap.data());
        });
        allOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onOrdersUpdate(allOrders);
      },
      (error) => {
        console.warn('Firestore all orders listener warning:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeAllOrders error:', err);
    return () => {};
  }
}

// 3d. Save Category to Firestore
export async function saveCategoryToFirestore(categoryData: any): Promise<boolean> {
  try {
    const catId = categoryData.id ? String(categoryData.id).trim() : '';
    if (!catId) return false;
    const catDocRef = doc(db, 'categories', catId);

    const rawSubs = Array.isArray(categoryData.subcategories) ? categoryData.subcategories : [];
    const cleanSubs = rawSubs
      .filter((s: any) => s && (s.id || s.nameBn || s.nameEn))
      .map((s: any) => {
        const subObj: any = {
          id: String(s.id || '').trim(),
          nameBn: String(s.nameBn || '').trim(),
          nameEn: String(s.nameEn || '').trim(),
          parentId: String(s.parentId || catId).trim(),
        };
        if (typeof s.itemCount === 'number') {
          subObj.itemCount = s.itemCount;
        }
        if (Array.isArray(s.types) && s.types.length > 0) {
          subObj.types = s.types.map((t: any) => ({
            id: String(t.id || '').trim(),
            nameBn: String(t.nameBn || '').trim(),
            nameEn: String(t.nameEn || '').trim(),
          }));
        }
        return subObj;
      });

    const catPayload: any = {
      id: catId,
      nameBn: String(categoryData.nameBn || '').trim(),
      nameEn: String(categoryData.nameEn || '').trim(),
      iconName: String(categoryData.iconName || 'LayoutGrid').trim(),
      itemCount: typeof categoryData.itemCount === 'number' ? categoryData.itemCount : 0,
      order: typeof categoryData.order === 'number' ? categoryData.order : (categoryData.orderIndex ?? 0),
      orderIndex: typeof categoryData.orderIndex === 'number' ? categoryData.orderIndex : (categoryData.order ?? 0),
      subcategories: cleanSubs,
      updatedAtFirestore: serverTimestamp(),
      savedToFirebase: true,
    };

    await setDoc(catDocRef, catPayload, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore category save warning:', error);
    return false;
  }
}

// 3e. Delete Category from Firestore
export async function deleteCategoryFromFirestore(categoryId: string): Promise<boolean> {
  try {
    const catDocRef = doc(db, 'categories', categoryId);
    await deleteDoc(catDocRef);
    return true;
  } catch (error) {
    console.warn('Firestore category delete warning:', error);
    return false;
  }
}

// 3f. Fetch Categories from Firestore
export async function fetchCategoriesFromFirestore(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    const list: any[] = [];
    snap.forEach((d) => {
      const data = d.data();
      const id = d.id || data.id;
      if (id) {
        const rawSubs = Array.isArray(data.subcategories) ? data.subcategories : [];
        const cleanSubs = rawSubs.map((s: any) => ({
          id: String(s.id || '').trim(),
          nameBn: String(s.nameBn || '').trim(),
          nameEn: String(s.nameEn || '').trim(),
          parentId: String(s.parentId || id).trim(),
          ...(typeof s.itemCount === 'number' ? { itemCount: s.itemCount } : {}),
          ...(Array.isArray(s.types) ? { types: s.types } : {}),
        }));
        list.push({
          id,
          nameBn: data.nameBn || '',
          nameEn: data.nameEn || '',
          iconName: data.iconName || 'LayoutGrid',
          itemCount: typeof data.itemCount === 'number' ? data.itemCount : 0,
          order: typeof data.order === 'number' ? data.order : (data.orderIndex ?? 0),
          orderIndex: typeof data.orderIndex === 'number' ? data.orderIndex : (data.order ?? 0),
          subcategories: cleanSubs,
        });
      }
    });
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return list;
  } catch (error) {
    console.warn('Firestore categories fetch warning:', error);
    return [];
  }
}

// 3g. Subscribe to Categories from Firestore in real-time
export function subscribeCategoriesFromFirestore(
  onUpdate: (categories: any[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  try {
    const coll = collection(db, 'categories');
    return onSnapshot(
      coll,
      (snapshot) => {
        if (snapshot.empty) return;
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const id = docSnap.id || data.id;
          if (id) {
            const rawSubs = Array.isArray(data.subcategories) ? data.subcategories : [];
            const cleanSubs = rawSubs.map((s: any) => ({
              id: String(s.id || '').trim(),
              nameBn: String(s.nameBn || '').trim(),
              nameEn: String(s.nameEn || '').trim(),
              parentId: String(s.parentId || id).trim(),
              ...(typeof s.itemCount === 'number' ? { itemCount: s.itemCount } : {}),
              ...(Array.isArray(s.types) ? { types: s.types } : {}),
            }));
            list.push({
              id,
              nameBn: data.nameBn || '',
              nameEn: data.nameEn || '',
              iconName: data.iconName || 'LayoutGrid',
              itemCount: typeof data.itemCount === 'number' ? data.itemCount : 0,
              order: typeof data.order === 'number' ? data.order : (data.orderIndex ?? 0),
              orderIndex: typeof data.orderIndex === 'number' ? data.orderIndex : (data.order ?? 0),
              subcategories: cleanSubs,
            });
          }
        });
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        onUpdate(list);
      },
      (err) => {
        console.warn('Firestore categories onSnapshot warning:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('subscribeCategoriesFromFirestore setup error:', err);
    if (onError) onError(err);
    return () => {};
  }
}

// 4. Centralized Products Management via Firestore (Single Source of Truth)

export function subscribeToProductsFromFirestore(
  onUpdate: (products: Product[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  try {
    const productsColl = collection(db, 'products');
    return onSnapshot(
      productsColl,
      (snapshot) => {
        const prods: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const pId = docSnap.id || data.id || data.productId;

          const realPrice = Number(data.realPrice ?? data.originalPrice ?? data.price) || 0;
          const discountPrice =
            data.discountPrice !== undefined && data.discountPrice !== null && data.discountPrice !== ''
              ? Number(data.discountPrice)
              : data.originalPrice && Number(data.price) < Number(data.originalPrice)
              ? Number(data.price)
              : null;

          const sellingPrice = discountPrice !== null && discountPrice > 0 ? discountPrice : realPrice;
          const originalPrice =
            discountPrice !== null && discountPrice > 0 && discountPrice < realPrice
              ? realPrice
              : data.originalPrice
              ? Number(data.originalPrice)
              : undefined;

          const rawStock =
            typeof data.stock === 'number'
              ? data.stock
              : typeof data.stockCount === 'number'
              ? data.stockCount
              : Number(data.stockCount ?? data.stock ?? 0);
          const cleanStock = isNaN(rawStock) || rawStock < 0 ? 0 : Math.round(rawStock);

          prods.push({
            id: pId,
            productId: pId,
            position: typeof data.position === 'number' ? data.position : 9999,
            titleBn: data.titleBn || data.name || data.titleEn || '',
            titleEn: data.titleEn || data.name || data.titleBn || '',
            descriptionBn: data.descriptionBn || '',
            descriptionEn: data.descriptionEn || '',
            price: sellingPrice,
            originalPrice: originalPrice,
            realPrice: realPrice,
            discountPrice: discountPrice,
            category: data.category || data.categoryId || 'clothing',
            categoryId: data.categoryId || data.category || 'clothing',
            subcategory: data.subcategory || data.subcategoryId || '',
            subcategoryId: data.subcategoryId || data.subcategory || '',
            itemType: data.itemType || '',
            image: data.image || (Array.isArray(data.images) && data.images[0]) || '',
            images:
              Array.isArray(data.images) && data.images.length > 0
                ? data.images
                : data.image
                ? [data.image]
                : [],
            rating: typeof data.rating === 'number' ? data.rating : 5.0,
            reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
            inStock: cleanStock > 0,
            stockCount: cleanStock,
            stock: cleanStock,
            isFeatured: !!(data.isFeatured || data.featured),
            featured: !!(data.isFeatured || data.featured),
            isNew: data.isNew !== undefined ? !!data.isNew : true,
            isBestSeller: !!data.isBestSeller,
            isHotDeal: !!(data.isHotDeal || data.hotDeal),
            hotDeal: !!(data.isHotDeal || data.hotDeal),
            isPreOrder: !!data.isPreOrder,
            published: data.published !== false,
            status: data.status || (data.published === false ? 'draft' : 'published'),
            specifications: data.specifications || {},
            colors: Array.isArray(data.colors) ? data.colors : [],
            sizes: Array.isArray(data.sizes) ? data.sizes : [],
            tags: Array.isArray(data.tags) ? data.tags : ['Gents'],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });

        prods.sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999));
        onUpdate(prods);
      },
      (err) => {
        console.warn('Firestore products onSnapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('subscribeToProductsFromFirestore setup error:', err);
    if (onError) onError(err);
    return () => {};
  }
}

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  try {
    const productsColl = collection(db, 'products');
    const snapshot = await getDocs(productsColl);
    if (snapshot.empty) return [];
    const prods: Product[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const pId = docSnap.id || data.id || data.productId;

      const realPrice = Number(data.realPrice ?? data.originalPrice ?? data.price) || 0;
      const discountPrice =
        data.discountPrice !== undefined && data.discountPrice !== null && data.discountPrice !== ''
          ? Number(data.discountPrice)
          : data.originalPrice && Number(data.price) < Number(data.originalPrice)
          ? Number(data.price)
          : null;

      const sellingPrice = discountPrice !== null && discountPrice > 0 ? discountPrice : realPrice;
      const originalPrice =
        discountPrice !== null && discountPrice > 0 && discountPrice < realPrice
          ? realPrice
          : data.originalPrice
          ? Number(data.originalPrice)
          : undefined;

      const rawStock =
        typeof data.stock === 'number'
          ? data.stock
          : typeof data.stockCount === 'number'
          ? data.stockCount
          : Number(data.stockCount ?? data.stock ?? 0);
      const cleanStock = isNaN(rawStock) || rawStock < 0 ? 0 : Math.round(rawStock);

      prods.push({
        id: pId,
        productId: pId,
        position: typeof data.position === 'number' ? data.position : 9999,
        titleBn: data.titleBn || data.name || data.titleEn || '',
        titleEn: data.titleEn || data.name || data.titleBn || '',
        descriptionBn: data.descriptionBn || '',
        descriptionEn: data.descriptionEn || '',
        price: sellingPrice,
        originalPrice: originalPrice,
        realPrice: realPrice,
        discountPrice: discountPrice,
        category: data.category || data.categoryId || 'clothing',
        categoryId: data.categoryId || data.category || 'clothing',
        subcategory: data.subcategory || data.subcategoryId || '',
        subcategoryId: data.subcategoryId || data.subcategory || '',
        itemType: data.itemType || '',
        image: data.image || (Array.isArray(data.images) && data.images[0]) || '',
        images:
          Array.isArray(data.images) && data.images.length > 0
            ? data.images
            : data.image
            ? [data.image]
            : [],
        rating: typeof data.rating === 'number' ? data.rating : 5.0,
        reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
        inStock: cleanStock > 0,
        stockCount: cleanStock,
        stock: cleanStock,
        isFeatured: !!(data.isFeatured || data.featured),
        featured: !!(data.isFeatured || data.featured),
        isNew: data.isNew !== undefined ? !!data.isNew : true,
        isBestSeller: !!data.isBestSeller,
        isHotDeal: !!(data.isHotDeal || data.hotDeal),
        hotDeal: !!(data.isHotDeal || data.hotDeal),
        isPreOrder: !!data.isPreOrder,
        published: data.published !== false,
        status: data.status || (data.published === false ? 'draft' : 'published'),
        specifications: data.specifications || {},
        colors: Array.isArray(data.colors) ? data.colors : [],
        sizes: Array.isArray(data.sizes) ? data.sizes : [],
        tags: Array.isArray(data.tags) ? data.tags : ['Gents'],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    return prods.sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999));
  } catch (err) {
    console.warn('fetchProductsFromFirestore error:', err);
    return [];
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 12000, errorMsg = 'Firebase request timed out'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), timeoutMs)),
  ]);
}

export async function saveProductToFirestore(productData: any): Promise<{ success: boolean; error?: string }> {
  try {
    const productId = String(productData.id || productData.productId || `khorom-${Date.now()}`);
    const productDocRef = doc(db, 'products', productId);

    const realPrice = Number(productData.realPrice ?? productData.originalPrice ?? productData.price) || 0;
    const discountPrice =
      productData.discountPrice !== undefined && productData.discountPrice !== null && productData.discountPrice !== ''
        ? Number(productData.discountPrice)
        : productData.originalPrice && productData.price && Number(productData.price) < Number(productData.originalPrice)
        ? Number(productData.price)
        : null;

    const sellingPrice = discountPrice !== null && discountPrice > 0 ? discountPrice : realPrice;
    const originalPrice =
      discountPrice !== null && discountPrice > 0 && discountPrice < realPrice
        ? realPrice
        : productData.originalPrice
        ? Number(productData.originalPrice)
        : null;

    const rawStock =
      typeof productData.stock === 'number'
        ? productData.stock
        : typeof productData.stockCount === 'number'
        ? productData.stockCount
        : Number(productData.stockCount ?? productData.stock ?? 0);
    const cleanStock = isNaN(rawStock) || rawStock < 0 ? 0 : Math.round(rawStock);

    const docPayload: any = {
      id: productId,
      productId: productId,
      position: typeof productData.position === 'number' ? productData.position : 9999,
      titleBn: productData.titleBn || productData.name || productData.titleEn || '',
      titleEn: productData.titleEn || productData.name || productData.titleBn || '',
      name: productData.titleEn || productData.titleBn || '',
      descriptionBn: productData.descriptionBn || '',
      descriptionEn: productData.descriptionEn || '',
      price: sellingPrice,
      realPrice: realPrice,
      discountPrice: discountPrice,
      originalPrice: originalPrice,
      category: productData.category || productData.categoryId || 'clothing',
      categoryId: productData.categoryId || productData.category || 'clothing',
      subcategory: productData.subcategory || productData.subcategoryId || '',
      subcategoryId: productData.subcategoryId || productData.subcategory || '',
      itemType: productData.itemType || '',
      image: productData.image || (Array.isArray(productData.images) && productData.images[0]) || '',
      images:
        Array.isArray(productData.images) && productData.images.length > 0
          ? productData.images
          : productData.image
          ? [productData.image]
          : [],
      rating: typeof productData.rating === 'number' ? productData.rating : 5.0,
      reviewCount: typeof productData.reviewCount === 'number' ? productData.reviewCount : 0,
      inStock: cleanStock > 0,
      stockCount: cleanStock,
      stock: cleanStock,
      isFeatured: !!(productData.isFeatured || productData.featured),
      featured: !!(productData.isFeatured || productData.featured),
      isNew: productData.isNew !== undefined ? !!productData.isNew : true,
      isBestSeller: !!productData.isBestSeller,
      isHotDeal: !!(productData.isHotDeal || productData.hotDeal),
      hotDeal: !!(productData.isHotDeal || productData.hotDeal),
      isPreOrder: !!productData.isPreOrder,
      published: productData.published !== false,
      status: productData.status || (productData.published === false ? 'draft' : 'published'),
      specifications: productData.specifications || {},
      colors: Array.isArray(productData.colors) ? productData.colors : [],
      sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
      tags: Array.isArray(productData.tags) ? productData.tags : ['Gents'],
      updatedAt: serverTimestamp(),
      savedToFirebase: true,
    };

    if (productData.createdAt) {
      docPayload.createdAt = productData.createdAt;
    } else {
      docPayload.createdAt = serverTimestamp();
    }

    await withTimeout(
      setDoc(productDocRef, docPayload, { merge: true }),
      6000,
      'Firebase server write timed out.'
    );
    return { success: true };
  } catch (error: any) {
    console.warn('Firestore product save warning:', error);
    return { success: false, error: error?.message || 'Failed to save to Firestore' };
  }
}

// Auth token helpers for verified backend requests
let cachedIdToken: string | null = null;

if (typeof window !== 'undefined') {
  try {
    cachedIdToken = localStorage.getItem('khorom_id_token') || null;
  } catch {}

  auth.onIdTokenChanged(async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        cachedIdToken = token;
        localStorage.setItem('khorom_id_token', token);
      } catch (e) {
        cachedIdToken = null;
        localStorage.removeItem('khorom_id_token');
      }
    } else {
      cachedIdToken = null;
      localStorage.removeItem('khorom_id_token');
    }
  });
}

export async function getAuthToken(): Promise<string | null> {
  try {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      cachedIdToken = token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('khorom_id_token', token);
      }
      return token;
    }
  } catch (err) {
    console.warn('Failed to retrieve Firebase ID token:', err);
  }
  if (!cachedIdToken && typeof window !== 'undefined') {
    try {
      cachedIdToken = localStorage.getItem('khorom_id_token');
    } catch {}
  }
  return cachedIdToken;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function getAuthHeadersSync(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  let token = cachedIdToken;
  if (!token && typeof window !== 'undefined') {
    try {
      token = localStorage.getItem('khorom_id_token');
      if (token) cachedIdToken = token;
    } catch {}
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Atomically Update Product Positions in Firestore (Authoritative Source of Truth)
export async function updateProductPositionsInFirestore(
  positions: { id: string; position: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!Array.isArray(positions) || positions.length === 0) {
      return { success: true };
    }

    const BATCH_SIZE = 450;
    for (let i = 0; i < positions.length; i += BATCH_SIZE) {
      const chunk = positions.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      for (const item of chunk) {
        if (!item.id) continue;
        const ref = doc(db, 'products', item.id);
        batch.set(
          ref,
          {
            position: Number(item.position),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      await withTimeout(batch.commit(), 15000, 'Firestore position update timed out');
    }
    return { success: true };
  } catch (err: any) {
    console.error('Failed to update product positions in Firestore:', err);
    return { success: false, error: err?.message || 'Failed to update positions in Firestore' };
  }
}

// Seed initial products to Firestore if empty
export async function seedProductsToFirestore(initialList: Product[]): Promise<boolean> {
  try {
    for (const p of initialList) {
      await saveProductToFirestore(p);
    }
    return true;
  } catch (err) {
    console.warn('Failed to seed products to Firestore:', err);
    return false;
  }
}

// 5. Save User / Login Log to Firestore
export async function saveUserToFirestore(userData: any): Promise<boolean> {
  try {
    const userId = userData.id || userData.email || `usr-${Date.now()}`;
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      ...userData,
      lastActive: serverTimestamp(),
      savedToFirebase: true,
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore user save warning:', error);
    return false;
  }
}

// 6. Save Newsletter Subscriber to Firestore
export async function saveSubscriberToFirestore(email: string, source: string = 'footer_newsletter'): Promise<boolean> {
  try {
    const subId = email.replace(/[^a-zA-Z0-9]/g, '_');
    const subDocRef = doc(db, 'subscribers', subId);
    await setDoc(subDocRef, {
      email,
      source,
      subscribedAt: serverTimestamp(),
      savedToFirebase: true,
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore subscriber save warning:', error);
    return false;
  }
}

// 7. Save Product Review / Rating to Firestore
export async function saveReviewToFirestore(reviewData: {
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  userEmail?: string;
}): Promise<boolean> {
  try {
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const docRef = doc(db, 'reviews', reviewId);
    await setDoc(docRef, {
      ...reviewData,
      createdAt: serverTimestamp(),
      savedToFirebase: true,
    });
    return true;
  } catch (error) {
    console.warn('Firestore review save warning:', error);
    return false;
  }
}

// 8. Save Customer Inquiry / Contact to Firestore
export async function saveInquiryToFirestore(inquiry: {
  name: string;
  phoneOrEmail: string;
  subject?: string;
  message: string;
  productId?: string;
}): Promise<boolean> {
  try {
    const inqId = `inq-${Date.now()}`;
    const docRef = doc(db, 'inquiries', inqId);
    await setDoc(docRef, {
      ...inquiry,
      submittedAt: serverTimestamp(),
      savedToFirebase: true,
    });
    return true;
  } catch (error) {
    console.warn('Firestore inquiry save warning:', error);
    return false;
  }
}

// 9. Save Website Customization Settings to Firestore
export async function saveSettingsToFirestore(settings: any): Promise<boolean> {
  try {
    const docRef = doc(db, 'settings', 'website_config');
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp(),
      savedToFirebase: true,
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore settings save warning:', error);
    return false;
  }
}

export async function fetchSettingsFromFirestore(): Promise<any | null> {
  try {
    const docRef = doc(db, 'settings', 'website_config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn('Firestore fetchSettingsFromFirestore warning:', err);
    return null;
  }
}

export function subscribeSettingsFromFirestore(
  onUpdate: (settings: any) => void
): Unsubscribe {
  try {
    const docRef = doc(db, 'settings', 'website_config');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data());
        }
      },
      (err) => console.warn('Firestore settings listener warning:', err)
    );
  } catch (err) {
    console.warn('subscribeSettingsFromFirestore error:', err);
    return () => {};
  }
}

// 10. Save Promo Code / Coupon to Firestore
export async function savePromoToFirestore(promo: any): Promise<boolean> {
  try {
    const promoId = String(promo.code || `promo-${Date.now()}`).toUpperCase();
    const docRef = doc(db, 'coupons', promoId);
    await setDoc(docRef, {
      ...promo,
      code: promoId,
      updatedAt: serverTimestamp(),
      savedToFirebase: true,
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore coupon save warning:', error);
    return false;
  }
}

// 11. Save Customer Feedback or General Message to Firestore
export async function saveFeedbackToFirestore(feedback: {
  name: string;
  contact: string;
  message: string;
  rating?: number;
}): Promise<boolean> {
  try {
    const feedbackId = `fb-${Date.now()}`;
    const docRef = doc(db, 'feedback', feedbackId);
    await setDoc(docRef, {
      ...feedback,
      createdAt: serverTimestamp(),
      savedToFirebase: true,
    });
    return true;
  } catch (error) {
    console.warn('Firestore feedback save warning:', error);
    return false;
  }
}

// 12. Delete Product from Firestore
export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Firestore delete product warning:', err);
    return false;
  }
}

// 13. Delete Coupon from Firestore
export async function deleteCouponFromFirestore(code: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'coupons', code.toUpperCase());
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Firestore delete coupon warning:', err);
    return false;
  }
}

// 14. Delete Chat Message from Firestore
export async function deleteChatMessageFromFirestore(messageId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'chats', messageId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Firestore delete chat warning:', err);
    return false;
  }
}

// 15. Test Firestore Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified with project:', firebaseConfig.projectId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline. Please check network.');
      return false;
    }
    return true;
  }
}

// 16. Offers Management in Firestore
export async function saveOfferToFirestore(offerData: any): Promise<boolean> {
  try {
    const offerId = offerData.id || `offer-${Date.now()}`;
    const offerDocRef = doc(db, 'offers', offerId);
    await setDoc(
      offerDocRef,
      {
        ...offerData,
        updatedAtFirestore: serverTimestamp(),
        savedToFirebase: true,
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Firestore offer save warning:', error);
    return false;
  }
}

export async function deleteOfferFromFirestore(offerId: string): Promise<boolean> {
  try {
    const offerDocRef = doc(db, 'offers', offerId);
    await deleteDoc(offerDocRef);
    return true;
  } catch (error) {
    console.warn('Firestore offer delete warning:', error);
    return false;
  }
}

export function subscribeOffers(onOffersUpdate: (offers: any[]) => void): Unsubscribe {
  try {
    const q = query(collection(db, 'offers'));
    return onSnapshot(
      q,
      (snapshot) => {
        const offers: any[] = [];
        snapshot.forEach((docSnap) => {
          offers.push(docSnap.data());
        });
        onOffersUpdate(offers);
      },
      (error) => {
        console.warn('Firestore offers listener warning:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeOffers error:', err);
    return () => {};
  }
}

// 17. KHOROM Coins Transactions in Firestore
export async function saveCoinTransactionToFirestore(txData: any): Promise<boolean> {
  try {
    const txId = txData.id || `coin-tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const txDocRef = doc(db, 'coin_transactions', txId);
    await setDoc(
      txDocRef,
      {
        ...txData,
        createdAtFirestore: serverTimestamp(),
        savedToFirebase: true,
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Firestore coin transaction save warning:', error);
    return false;
  }
}

export function subscribeUserCoinTransactions(
  userId: string,
  onTxUpdate: (txs: any[]) => void
): Unsubscribe {
  if (!userId) return () => {};
  try {
    const q = query(collection(db, 'coin_transactions'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data());
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onTxUpdate(list);
      },
      (error) => {
        console.warn('Firestore user coin transactions listener warning:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeUserCoinTransactions error:', err);
    return () => {};
  }
}

// 18. KHOROM Coin Settings in Firestore
export async function saveCoinSettingsToFirestore(settings: any): Promise<boolean> {
  try {
    const settingsDocRef = doc(db, 'coin_settings', 'default');
    await setDoc(
      settingsDocRef,
      {
        ...settings,
        updatedAtFirestore: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Firestore coin settings save warning:', error);
    return false;
  }
}

export function subscribeCoinSettings(onSettingsUpdate: (settings: any) => void): Unsubscribe {
  try {
    const docRef = doc(db, 'coin_settings', 'default');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onSettingsUpdate(docSnap.data());
        }
      },
      (error) => {
        console.warn('Firestore coin settings listener warning:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeCoinSettings error:', err);
    return () => {};
  }
}

// -------------------------------------------------------------
// 19. FACEBOOK PAGE POSTS (STEP 5 & 6)
// -------------------------------------------------------------

export async function saveFacebookPostToFirestore(post: FacebookPendingPost): Promise<boolean> {
  try {
    const postRef = doc(db, 'facebook_posts', post.id);
    await setDoc(
      postRef,
      {
        ...post,
        updatedAtFirestore: serverTimestamp(),
        savedToFirebase: true,
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Firestore Facebook post save warning:', error);
    return false;
  }
}

export function subscribeFacebookPosts(
  onPostsUpdate: (posts: FacebookPendingPost[]) => void
): Unsubscribe {
  try {
    const coll = collection(db, 'facebook_posts');
    return onSnapshot(
      coll,
      (snapshot) => {
        const postsMap = new Map<string, FacebookPendingPost>();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as FacebookPendingPost;
          const docId = data.id || docSnap.id;
          if (docId && !postsMap.has(docId)) {
            postsMap.set(docId, { ...data, id: docId });
          }
        });
        const posts = Array.from(postsMap.values());
        // Sort descending by date
        posts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onPostsUpdate(posts);
      },
      (error) => {
        console.warn('Firestore Facebook posts listener warning:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeFacebookPosts error:', err);
    return () => {};
  }
}

export async function updateFacebookPostInFirestore(
  postId: string,
  updates: Partial<FacebookPendingPost>
): Promise<boolean> {
  try {
    const postRef = doc(db, 'facebook_posts', postId);
    await updateDoc(postRef, {
      ...updates,
      updatedAtFirestore: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.warn('Firestore Facebook post update warning:', error);
    return false;
  }
}

export async function deleteFacebookPostFromFirestore(postId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'facebook_posts', postId);
    await deleteDoc(postRef);
    return true;
  } catch (error) {
    console.warn('Firestore Facebook post delete warning:', error);
    return false;
  }
}
