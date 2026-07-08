import { db } from '../config/firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

// ========== VẬT TƯ XƯỞNG ==========
export const addMaterial = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'materials'), {
      ...data,
      createdAt: serverTimestamp(),
      status: 'active'
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMaterials = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'materials'));
    const materials = [];
    querySnapshot.forEach(doc => {
      materials.push({ id: doc.id, ...doc.data() });
    });
    return materials;
  } catch (error) {
    console.error('Lỗi lấy vật tư:', error);
    return [];
  }
};

export const updateMaterial = async (materialId, data) => {
  try {
    await updateDoc(doc(db, 'materials', materialId), data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteMaterial = async (materialId) => {
  try {
    await deleteDoc(doc(db, 'materials', materialId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ========== THIẾT BỊ ==========
export const addEquipment = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'equipments'), {
      ...data,
      createdAt: serverTimestamp(),
      status: data.status || 'working'
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getEquipments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'equipments'));
    const equipments = [];
    querySnapshot.forEach(doc => {
      equipments.push({ id: doc.id, ...doc.data() });
    });
    return equipments;
  } catch (error) {
    console.error('Lỗi lấy thiết bị:', error);
    return [];
  }
};

export const updateEquipment = async (equipmentId, data) => {
  try {
    await updateDoc(doc(db, 'equipments', equipmentId), data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ========== MƯỢN/TRẢ VẬT TƯ ==========
export const createBorrowRequest = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'borrowRequests'), {
      ...data,
      createdAt: serverTimestamp(),
      status: 'pending'
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getBorrowRequests = async (filter = {}) => {
  try {
    let constraints = [];
    if (filter.studentId) {
      constraints.push(where('studentId', '==', filter.studentId));
    }
    if (filter.status) {
      constraints.push(where('status', '==', filter.status));
    }

    const q = constraints.length > 0
      ? query(collection(db, 'borrowRequests'), ...constraints)
      : query(collection(db, 'borrowRequests'), orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const requests = [];
    querySnapshot.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    return requests.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt));
  } catch (error) {
    console.error('Lỗi lấy đơn mượn:', error);
    return [];
  }
};

export const updateBorrowRequest = async (requestId, data) => {
  try {
    await updateDoc(doc(db, 'borrowRequests', requestId), data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

function getMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  return new Date(value).getTime() || 0;
}

// ========== SINH VIÊN RA VÀO ==========
export const recordStudentEntry = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'studentEntries'), {
      ...data,
      timestamp: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getStudentEntries = async (filter = {}) => {
  try {
    let constraints = [];
    if (filter.studentId) {
      constraints.push(where('studentId', '==', filter.studentId));
    }
    if (filter.date) {
      constraints.push(where('date', '==', filter.date));
    }

    let q = collection(db, 'studentEntries');
    if (constraints.length > 0) {
      q = query(q, ...constraints, orderBy('timestamp', 'desc'));
    } else {
      q = query(q, orderBy('timestamp', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const entries = [];
    querySnapshot.forEach(doc => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    return entries;
  } catch (error) {
    console.error('Lỗi lấy ra vào sinh viên:', error);
    return [];
  }
};

// ========== THÔNG BÁO ==========
export const sendNotification = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...data,
      createdAt: serverTimestamp(),
      read: false
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getNotifications = async (userId, unreadOnly = false) => {
  try {
    let q;
    if (unreadOnly) {
      q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    return notifications;
  } catch (error) {
    console.error('Lỗi lấy thông báo:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ========== TIN NHẮN ==========
export const sendMessage = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMessages = async (conversationId) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return messages;
  } catch (error) {
    console.error('Lỗi lấy tin nhắn:', error);
    return [];
  }
};

// ========== THỜI KHÓA BIỂU ==========
export const addSchedule = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'schedules'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getSchedules = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'schedules'));
    const schedules = [];
    querySnapshot.forEach(doc => {
      schedules.push({ id: doc.id, ...doc.data() });
    });
    return schedules;
  } catch (error) {
    console.error('Lỗi lấy thời khóa biểu:', error);
    return [];
  }
};

// ========== TÌM KIẾM ==========
export const searchMaterials = async (keyword) => {
  try {
    const materials = await getMaterials();
    return materials.filter(m =>
      m.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(keyword.toLowerCase()))
    );
  } catch (error) {
    console.error('Lỗi tìm kiếm:', error);
    return [];
  }
};

export const searchEquipments = async (keyword) => {
  try {
    const equipments = await getEquipments();
    return equipments.filter(e =>
      e.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(keyword.toLowerCase()))
    );
  } catch (error) {
    console.error('Lỗi tìm kiếm:', error);
    return [];
  }
};
