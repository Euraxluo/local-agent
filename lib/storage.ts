import { ChatWindowMessage } from "@/schema/ChatWindowMessage";

const DB_NAME = 'local-agent-db';
const STORE_NAME = 'chat-history';
const DB_VERSION = 1;

export class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("Error opening database");
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async saveMessages(messages: ChatWindowMessage[]): Promise<void> {
    if (!this.db) {
      console.error("Database not initialized");
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // 在同一个事务中执行清除和添加操作
      const clearRequest = store.clear();

      clearRequest.onerror = () => {
        console.error("Error clearing messages");
        reject(clearRequest.error);
      };

      clearRequest.onsuccess = () => {
        // 在清除成功后添加新消息
        const addRequest = store.add({ messages });

        addRequest.onerror = () => {
          console.error("Error saving messages");
          reject(addRequest.error);
        };

        addRequest.onsuccess = () => {
          resolve();
        };
      };

      // 监听事务完成
      transaction.oncomplete = () => {
        console.log("Transaction completed successfully");
      };

      transaction.onerror = () => {
        console.error("Transaction failed");
        reject(transaction.error);
      };
    });
  }

  async getMessages(): Promise<ChatWindowMessage[]> {
    if (!this.db) {
      console.error("Database not initialized");
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        console.error("Error getting messages");
        reject(request.error);
      };

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.length > 0) {
          resolve(result[result.length - 1].messages);
        } else {
          resolve([]);
        }
      };
    });
  }

  async clearMessages(): Promise<void> {
    if (!this.db) {
      console.error("Database not initialized");
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => {
        console.error("Error clearing messages");
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log("Messages cleared successfully");
        resolve();
      };

      // 监听事务完成
      transaction.oncomplete = () => {
        console.log("Clear transaction completed successfully");
      };
    });
  }
} 