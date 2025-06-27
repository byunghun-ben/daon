import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys for offline data
export const OFFLINE_STORAGE_KEYS = {
  PENDING_ACTIVITIES: "@daon:offline:pending_activities",
  PENDING_DIARY_ENTRIES: "@daon:offline:pending_diary_entries", 
  PENDING_GROWTH_RECORDS: "@daon:offline:pending_growth_records",
  CACHED_CHILDREN: "@daon:offline:cached_children",
  CACHED_ACTIVITIES: "@daon:offline:cached_activities",
  CACHED_DIARY_ENTRIES: "@daon:offline:cached_diary_entries",
  CACHED_GROWTH_RECORDS: "@daon:offline:cached_growth_records",
  LAST_SYNC_TIME: "@daon:offline:last_sync_time",
} as const;

// Generic offline storage interface
export interface OfflineItem<T = any> {
  id: string;
  data: T;
  action: "create" | "update" | "delete";
  timestamp: number;
  retryCount: number;
}

// Offline storage utilities
export class OfflineStorage {
  // Save pending operations
  static async savePendingOperation<T>(
    key: string, 
    operation: Omit<OfflineItem<T>, "id" | "timestamp" | "retryCount">
  ): Promise<void> {
    try {
      const operationWithMeta: OfflineItem<T> = {
        ...operation,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      };

      const existingOperations = await this.getPendingOperations<T>(key);
      const updatedOperations = [...existingOperations, operationWithMeta];
      
      await AsyncStorage.setItem(key, JSON.stringify(updatedOperations));
    } catch (error) {
      console.error("Failed to save pending operation:", error);
    }
  }

  // Get pending operations
  static async getPendingOperations<T>(key: string): Promise<OfflineItem<T>[]> {
    try {
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to get pending operations:", error);
      return [];
    }
  }

  // Remove pending operation
  static async removePendingOperation(key: string, operationId: string): Promise<void> {
    try {
      const operations = await this.getPendingOperations(key);
      const filtered = operations.filter(op => op.id !== operationId);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to remove pending operation:", error);
    }
  }

  // Update retry count for failed operations
  static async incrementRetryCount(key: string, operationId: string): Promise<void> {
    try {
      const operations = await this.getPendingOperations(key);
      const updated = operations.map(op => 
        op.id === operationId 
          ? { ...op, retryCount: op.retryCount + 1 }
          : op
      );
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to increment retry count:", error);
    }
  }

  // Cache data for offline access
  static async cacheData<T>(key: string, data: T[]): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error("Failed to cache data:", error);
    }
  }

  // Get cached data
  static async getCachedData<T>(key: string, maxAge: number = 24 * 60 * 60 * 1000): Promise<T[] | null> {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;

      const cacheItem = JSON.parse(stored);
      const age = Date.now() - cacheItem.timestamp;
      
      if (age > maxAge) {
        // Cache expired, remove it
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error("Failed to get cached data:", error);
      return null;
    }
  }

  // Clear all offline data
  static async clearAllOfflineData(): Promise<void> {
    try {
      const keys = Object.values(OFFLINE_STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error("Failed to clear offline data:", error);
    }
  }

  // Get last sync time
  static async getLastSyncTime(): Promise<number | null> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_STORAGE_KEYS.LAST_SYNC_TIME);
      return stored ? parseInt(stored, 10) : null;
    } catch (error) {
      console.error("Failed to get last sync time:", error);
      return null;
    }
  }

  // Set last sync time
  static async setLastSyncTime(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_STORAGE_KEYS.LAST_SYNC_TIME, timestamp.toString());
    } catch (error) {
      console.error("Failed to set last sync time:", error);
    }
  }
}