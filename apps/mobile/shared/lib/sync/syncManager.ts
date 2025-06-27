import NetInfo from "@react-native-community/netinfo";
import { OfflineStorage, OFFLINE_STORAGE_KEYS, type OfflineItem } from "../storage/offlineStorage";
import { activitiesApi } from "../../api/activities";
import { diaryApi } from "../../api/diary";
import { growthApi } from "../../api/growth";
import { childrenApi } from "../../api/children";

// Sync manager for handling offline operations
export class SyncManager {
  private static instance: SyncManager;
  private isSyncing = false;
  private syncListeners: Array<(isOnline: boolean) => void> = [];

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  constructor() {
    this.initNetworkListener();
  }

  // Initialize network connectivity listener
  private initNetworkListener(): void {
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isSyncing) {
        this.syncPendingOperations();
      }
      
      // Notify listeners about network status
      this.syncListeners.forEach(listener => listener(!!state.isConnected));
    });
  }

  // Add sync status listener
  addSyncListener(listener: (isOnline: boolean) => void): () => void {
    this.syncListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.syncListeners.indexOf(listener);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  // Check if device is online
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return !!state.isConnected;
  }

  // Save operation for offline sync
  async saveForOfflineSync<T>(
    key: string,
    data: T,
    action: "create" | "update" | "delete"
  ): Promise<void> {
    await OfflineStorage.savePendingOperation(key, { data, action });
    
    // Try to sync immediately if online
    if (await this.isOnline()) {
      this.syncPendingOperations();
    }
  }

  // Sync all pending operations
  async syncPendingOperations(): Promise<void> {
    if (this.isSyncing) return;

    this.isSyncing = true;
    console.log("Starting sync of pending operations...");

    try {
      // Sync in order: children -> activities -> diary -> growth
      await this.syncPendingActivities();
      await this.syncPendingDiaryEntries();
      await this.syncPendingGrowthRecords();
      
      // Update last sync time
      await OfflineStorage.setLastSyncTime(Date.now());
      
      console.log("Sync completed successfully");
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync pending activity operations
  private async syncPendingActivities(): Promise<void> {
    const operations = await OfflineStorage.getPendingOperations(
      OFFLINE_STORAGE_KEYS.PENDING_ACTIVITIES
    );

    for (const operation of operations) {
      try {
        await this.syncActivityOperation(operation);
        await OfflineStorage.removePendingOperation(
          OFFLINE_STORAGE_KEYS.PENDING_ACTIVITIES,
          operation.id
        );
      } catch (error) {
        console.error("Failed to sync activity operation:", error);
        await OfflineStorage.incrementRetryCount(
          OFFLINE_STORAGE_KEYS.PENDING_ACTIVITIES,
          operation.id
        );
        
        // Remove operation if too many retries
        if (operation.retryCount >= 3) {
          await OfflineStorage.removePendingOperation(
            OFFLINE_STORAGE_KEYS.PENDING_ACTIVITIES,
            operation.id
          );
        }
      }
    }
  }

  // Sync pending diary operations
  private async syncPendingDiaryEntries(): Promise<void> {
    const operations = await OfflineStorage.getPendingOperations(
      OFFLINE_STORAGE_KEYS.PENDING_DIARY_ENTRIES
    );

    for (const operation of operations) {
      try {
        await this.syncDiaryOperation(operation);
        await OfflineStorage.removePendingOperation(
          OFFLINE_STORAGE_KEYS.PENDING_DIARY_ENTRIES,
          operation.id
        );
      } catch (error) {
        console.error("Failed to sync diary operation:", error);
        await OfflineStorage.incrementRetryCount(
          OFFLINE_STORAGE_KEYS.PENDING_DIARY_ENTRIES,
          operation.id
        );
        
        if (operation.retryCount >= 3) {
          await OfflineStorage.removePendingOperation(
            OFFLINE_STORAGE_KEYS.PENDING_DIARY_ENTRIES,
            operation.id
          );
        }
      }
    }
  }

  // Sync pending growth record operations
  private async syncPendingGrowthRecords(): Promise<void> {
    const operations = await OfflineStorage.getPendingOperations(
      OFFLINE_STORAGE_KEYS.PENDING_GROWTH_RECORDS
    );

    for (const operation of operations) {
      try {
        await this.syncGrowthOperation(operation);
        await OfflineStorage.removePendingOperation(
          OFFLINE_STORAGE_KEYS.PENDING_GROWTH_RECORDS,
          operation.id
        );
      } catch (error) {
        console.error("Failed to sync growth operation:", error);
        await OfflineStorage.incrementRetryCount(
          OFFLINE_STORAGE_KEYS.PENDING_GROWTH_RECORDS,
          operation.id
        );
        
        if (operation.retryCount >= 3) {
          await OfflineStorage.removePendingOperation(
            OFFLINE_STORAGE_KEYS.PENDING_GROWTH_RECORDS,
            operation.id
          );
        }
      }
    }
  }

  // Execute activity sync operation
  private async syncActivityOperation(operation: OfflineItem): Promise<void> {
    switch (operation.action) {
      case "create":
        await activitiesApi.createActivity(operation.data);
        break;
      case "update":
        if (operation.data.id) {
          await activitiesApi.updateActivity(operation.data.id, operation.data);
        }
        break;
      case "delete":
        if (operation.data.id) {
          await activitiesApi.deleteActivity(operation.data.id);
        }
        break;
    }
  }

  // Execute diary sync operation
  private async syncDiaryOperation(operation: OfflineItem): Promise<void> {
    switch (operation.action) {
      case "create":
        await diaryApi.createDiaryEntry(operation.data);
        break;
      case "update":
        if (operation.data.id) {
          await diaryApi.updateDiaryEntry(operation.data.id, operation.data);
        }
        break;
      case "delete":
        if (operation.data.id) {
          await diaryApi.deleteDiaryEntry(operation.data.id);
        }
        break;
    }
  }

  // Execute growth record sync operation
  private async syncGrowthOperation(operation: OfflineItem): Promise<void> {
    switch (operation.action) {
      case "create":
        await growthApi.createGrowthRecord(operation.data);
        break;
      case "update":
        if (operation.data.id) {
          await growthApi.updateGrowthRecord(operation.data.id, operation.data);
        }
        break;
      case "delete":
        if (operation.data.id) {
          await growthApi.deleteGrowthRecord(operation.data.id);
        }
        break;
    }
  }

  // Cache data for offline access
  async cacheAppData(): Promise<void> {
    try {
      // Cache children data
      const childrenResponse = await childrenApi.getChildren();
      await OfflineStorage.cacheData(
        OFFLINE_STORAGE_KEYS.CACHED_CHILDREN,
        childrenResponse.children
      );

      // Cache recent activities for each child
      for (const child of childrenResponse.children) {
        const activitiesResponse = await activitiesApi.getActivities({
          childId: child.id,
          limit: 50,
          offset: 0,
        });
        await OfflineStorage.cacheData(
          `${OFFLINE_STORAGE_KEYS.CACHED_ACTIVITIES}_${child.id}`,
          activitiesResponse.activities
        );

        // Cache recent diary entries
        const diaryResponse = await diaryApi.getDiaryEntries({
          childId: child.id,
          limit: 20,
          offset: 0,
        });
        await OfflineStorage.cacheData(
          `${OFFLINE_STORAGE_KEYS.CACHED_DIARY_ENTRIES}_${child.id}`,
          diaryResponse.diaryEntries
        );

        // Cache growth records
        const growthResponse = await growthApi.getGrowthRecords({
          childId: child.id,
          limit: 50,
          offset: 0,
        });
        await OfflineStorage.cacheData(
          `${OFFLINE_STORAGE_KEYS.CACHED_GROWTH_RECORDS}_${child.id}`,
          growthResponse.growthRecords
        );
      }
    } catch (error) {
      console.error("Failed to cache app data:", error);
    }
  }

  // Get number of pending operations
  async getPendingOperationsCount(): Promise<number> {
    const [activities, diaryEntries, growthRecords] = await Promise.all([
      OfflineStorage.getPendingOperations(OFFLINE_STORAGE_KEYS.PENDING_ACTIVITIES),
      OfflineStorage.getPendingOperations(OFFLINE_STORAGE_KEYS.PENDING_DIARY_ENTRIES),
      OfflineStorage.getPendingOperations(OFFLINE_STORAGE_KEYS.PENDING_GROWTH_RECORDS),
    ]);

    return activities.length + diaryEntries.length + growthRecords.length;
  }

  // Force sync (manual trigger)
  async forceSync(): Promise<void> {
    if (!(await this.isOnline())) {
      throw new Error("No internet connection available");
    }
    
    await this.syncPendingOperations();
    await this.cacheAppData();
  }
}