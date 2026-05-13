import { STORAGE_KEYS } from './constants';

// IndexedDB configuration
const DB_NAME = 'CLMS_OfflineDB';
const DB_VERSION = 1;
const STORES = {
  ATTENDANCE: 'attendance',
  REQUESTS: 'requests',
  SYNC_QUEUE: 'syncQueue'
};

let db = null;

// Open database connection
export const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Create stores
      if (!database.objectStoreNames.contains(STORES.ATTENDANCE)) {
        database.createObjectStore(STORES.ATTENDANCE, { keyPath: 'id' });
      }
      
      if (!database.objectStoreNames.contains(STORES.REQUESTS)) {
        database.createObjectStore(STORES.REQUESTS, { keyPath: 'id' });
      }
      
      if (!database.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        database.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Save data to store
export const saveToStore = async (storeName, data) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Get data from store
export const getFromStore = async (storeName, id) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get all data from store
export const getAllFromStore = async (storeName) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Delete from store
export const deleteFromStore = async (storeName, id) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Clear store
export const clearStore = async (storeName) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Add to sync queue
export const addToSyncQueue = async (data) => {
  const syncItem = {
    ...data,
    timestamp: new Date().toISOString(),
    attempts: 0
  };
  return await saveToStore(STORES.SYNC_QUEUE, syncItem);
};

// Get sync queue
export const getSyncQueue = async () => {
  return await getAllFromStore(STORES.SYNC_QUEUE);
};

// Remove from sync queue
export const removeFromSyncQueue = async (id) => {
  return await deleteFromStore(STORES.SYNC_QUEUE, id);
};

// Save offline attendance
export const saveOfflineAttendance = async (attendanceData) => {
  return await saveToStore(STORES.ATTENDANCE, attendanceData);
};

// Get offline attendance
export const getOfflineAttendance = async () => {
  return await getAllFromStore(STORES.ATTENDANCE);
};

// Clear all offline data
export const clearAllOfflineData = async () => {
  await clearStore(STORES.ATTENDANCE);
  await clearStore(STORES.REQUESTS);
  await clearStore(STORES.SYNC_QUEUE);
};

// Check if online
export const isOnline = () => {
  return navigator.onLine;
};

// Save to localStorage
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('LocalStorage save error:', error);
    return false;
  }
};

// Get from localStorage
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('LocalStorage get error:', error);
    return defaultValue;
  }
};

// Remove from localStorage
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('LocalStorage remove error:', error);
    return false;
  }
};