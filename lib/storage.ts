/**
 * Local Storage Service
 * Provides a type-safe interface for localStorage operations with support for
 * different data types and error handling.
 */

export type StorageValue = string | number | boolean | Record<string, any> | Array<any> | null;

export interface StorageOptions {
  prefix?: string;
  serializer?: {
    stringify: (value: any) => string;
    parse: (value: string) => any;
  };
  enableLogging?: boolean;
  storageQuota?: number;
}

export class StorageService {
  private prefix: string;
  private serializer: {
    stringify: (value: any) => string;
    parse: (value: string) => any;
  };
  private enableLogging: boolean;
  private storageQuota: number;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || '';
    this.serializer = options.serializer || {
      stringify: JSON.stringify,
      parse: JSON.parse
    };
    this.enableLogging = options.enableLogging ?? false;
    this.storageQuota = options.storageQuota ?? (5 * 1024 * 1024); // Default 5MB
  }

  /**
   * Save a value to localStorage
   * @param key - The key to store the value under
   * @param value - The value to store (will be serialized)
   * @returns true if successful, false otherwise
   */
  save(key: string, value: StorageValue): boolean {
    try {
      if (!this.isValidKey(key)) {
        throw new Error('Invalid key provided');
      }

      const fullKey = this.getFullKey(key);
      const serializedValue = this.serializer.stringify(value);

      localStorage.setItem(fullKey, serializedValue);
      return true;
    } catch (error) {
      this.logError('Error saving to localStorage:', error);
      return false;
    }
  }

  /**
   * Retrieve a value from localStorage
   * @param key - The key to retrieve the value for
   * @param defaultValue - Default value to return if key doesn't exist
   * @returns The retrieved value or default value
   */
  retrieve<T = StorageValue>(key: string, defaultValue?: T): T | null {
    try {
      if (!this.isValidKey(key)) {
        throw new Error('Invalid key provided');
      }

      const fullKey = this.getFullKey(key);
      const item = localStorage.getItem(fullKey);

      if (item === null) {
        return defaultValue !== undefined ? defaultValue : null;
      }

      return this.serializer.parse(item);
    } catch (error) {
      this.logError('Error retrieving from localStorage:', error);
      return defaultValue !== undefined ? defaultValue : null;
    }
  }

  /**
   * Update an existing value in localStorage
   * @param key - The key to update
   * @param updater - Function that receives current value and returns new value
   * @returns true if successful, false otherwise
   */
  update<T = StorageValue>(key: string, updater: (current: T | null) => T): boolean {
    try {
      const currentValue = this.retrieve<T>(key);
      const newValue = updater(currentValue);
      return this.save(key, newValue);
    } catch (error) {
      this.logError('Error updating localStorage:', error);
      return false;
    }
  }

  /**
   * Delete a value from localStorage
   * @param key - The key to delete
   * @returns true if successful, false otherwise
   */
  delete(key: string): boolean {
    try {
      if (!this.isValidKey(key)) {
        throw new Error('Invalid key provided');
      }

      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      this.logError('Error deleting from localStorage:', error);
      return false;
    }
  }

  /**
   * Check if a key exists in localStorage
   * @param key - The key to check
   * @returns true if key exists, false otherwise
   */
  exists(key: string): boolean {
    try {
      const fullKey = this.getFullKey(key);
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear all items with the current prefix from localStorage
   * @returns true if successful, false otherwise
   */
  clear(): boolean {
    try {
      const keysToDelete: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      this.logError('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Get all keys with the current prefix
   * @returns Array of keys (without prefix)
   */
  getKeys(): string[] {
    const keys: string[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
    } catch (error) {
      this.logError('Error getting keys from localStorage:', error);
    }

    return keys;
  }

  /**
   * Get storage usage information
   * @returns Object with storage usage stats
   */
  getStorageInfo(): { used: number; total: number; available: number } {
    try {
      let used = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          used += key.length + value.length;
        }
      }

      // Use configured storage quota
      const total = this.storageQuota;
      const available = total - used;

      return { used, total, available };
    } catch (error) {
      this.logError('Error getting storage info:', error);
      return { used: 0, total: 0, available: 0 };
    }
  }

  /**
   * Log errors if logging is enabled
   * @param message - The error message
   * @param error - The error object (optional)
   */
  private logError(message: string, error?: any): void {
    if (this.enableLogging) {
      console.error(message, error);
    }
  }

  /**
   * Validate that a key is valid for localStorage
   * @param key - The key to validate
   * @returns true if valid, false otherwise
   */
  private isValidKey(key: string): boolean {
    return typeof key === 'string' && key.length > 0;
  }

  /**
   * Get the full key including prefix
   * @param key - The original key
   * @returns The full key with prefix
   */
  private getFullKey(key: string): string {
    return this.prefix + key;
  }
}

// Export a default instance
export const storage = new StorageService();

// Export utility functions for common operations
export const saveToStorage = (key: string, value: StorageValue): boolean =>
  storage.save(key, value);

export const retrieveFromStorage = <T = StorageValue>(key: string, defaultValue?: T): T | null =>
  storage.retrieve(key, defaultValue);

export const updateInStorage = <T = StorageValue>(key: string, updater: (current: T | null) => T): boolean =>
  storage.update(key, updater);

export const deleteFromStorage = (key: string): boolean =>
  storage.delete(key);

export const clearStorage = (): boolean =>
  storage.clear();