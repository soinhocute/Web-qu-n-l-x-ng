import { db } from '../config/firebase.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

const auth = getAuth();

export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: userData.fullName });

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      fullName: userData.fullName,
      role: userData.role,
      status: 'active',
      createdAt: new Date(),
      phone: userData.phone || '',
      code: userData.code || '',
      organization: userData.organization || '',
      address: userData.address || ''
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserInfo = async (uid) => {
  try {
    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error('Lỗi lấy thông tin user:', error);
    return null;
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const updateUserInfo = async (uid, data) => {
  try {
    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDocId = querySnapshot.docs[0].id;
      await updateDoc(doc(db, 'users', userDocId), data);
      return { success: true };
    }
    return { success: false, error: 'User không tìm thấy' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
