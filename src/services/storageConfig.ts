/**
 * การตั้งค่าระบบจัดเก็บข้อมูล (Storage Backend Configuration)
 * เลือกระหว่าง:
 * 1. 'local'  : จัดเก็บในเครื่องผ่าน LocalStorage (ค่าเริ่มต้น - ออฟไลน์ 100%)
 * 2. 'mysql'  : จัดเก็บผ่าน MySQL (XAMPP phpMyAdmin หรือ MySQL Server)
 * 3. 'sqlite' : จัดเก็บผ่าน SQLite ในเครื่อง
 */

export type StorageBackendType = 'local' | 'mysql' | 'sqlite';

export interface StorageConfig {
  backend: StorageBackendType;
  apiUrl: string;
  autoSync: boolean;
  syncIntervalSeconds: number;
  lastSyncTimestamp?: string;
  mysqlHost?: string;
  mysqlPort?: number;
  mysqlDatabase?: string;
  mysqlUser?: string;
  statusMessage?: string;
  isConnected?: boolean;
}

const STORAGE_CONFIG_KEY = 'stem_storage_backend_config_v1';

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  backend: 'local',
  apiUrl: 'http://localhost:3001/api', // หรือ 'http://localhost/stem-api/index.php'
  autoSync: true,
  syncIntervalSeconds: 30,
  mysqlHost: 'localhost',
  mysqlPort: 3306,
  mysqlDatabase: 'stem_education_db',
  mysqlUser: 'root',
  statusMessage: 'ใช้งานโหมดจัดเก็บในเครื่อง (LocalStorage ออฟไลน์ 100%)',
  isConnected: true,
};

class StorageConfigManager {
  private config: StorageConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  public getConfig(): StorageConfig {
    return { ...this.config };
  }

  public saveConfig(newConfig: Partial<StorageConfig>): StorageConfig {
    this.config = {
      ...this.config,
      ...newConfig,
    };
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Cannot persist storage config to localStorage:', e);
    }
    return { ...this.config };
  }

  private loadConfig(): StorageConfig {
    try {
      const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (raw) {
        return {
          ...DEFAULT_STORAGE_CONFIG,
          ...JSON.parse(raw),
        };
      }
    } catch {}
    return { ...DEFAULT_STORAGE_CONFIG };
  }
}

export const storageConfigManager = new StorageConfigManager();
