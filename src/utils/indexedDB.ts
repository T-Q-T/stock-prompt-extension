// IndexedDB 工具类

const DB_NAME = 'PromptStockDB';
const DB_VERSION = 1;

export interface DBStores {
  prompts: 'prompts';
  folders: 'folders';
  stockHistory: 'stockHistory';
}

const STORES: DBStores = {
  prompts: 'prompts',
  folders: 'folders',
  stockHistory: 'stockHistory',
};

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Prompts store
        if (!db.objectStoreNames.contains(STORES.prompts)) {
          const promptStore = db.createObjectStore(STORES.prompts, { keyPath: 'id' });
          promptStore.createIndex('folderId', 'folderId', { unique: false });
          promptStore.createIndex('order', 'order', { unique: false });
        }

        // Folders store
        if (!db.objectStoreNames.contains(STORES.folders)) {
          const folderStore = db.createObjectStore(STORES.folders, { keyPath: 'id' });
          folderStore.createIndex('order', 'order', { unique: false });
        }

        // Stock history store
        if (!db.objectStoreNames.contains(STORES.stockHistory)) {
          const historyStore = db.createObjectStore(STORES.stockHistory, { keyPath: 'id' });
          historyStore.createIndex('queryTime', 'queryTime', { unique: false });
        }
      };
    });
  }

  async getAll<T>(storeName: keyof DBStores): Promise<T[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: keyof DBStores, id: string): Promise<T | undefined> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async add<T>(storeName: keyof DBStores, data: T): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: keyof DBStores, data: T): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: keyof DBStores, id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: keyof DBStores): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(
    storeName: keyof DBStores,
    indexName: string,
    value: any
  ): Promise<T[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new IndexedDBManager();

