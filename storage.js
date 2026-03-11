/**
 * JavaScript version of the Storage Service for testing purposes
 * This demonstrates the functionality that would be tested by the full Jest suite
 */

class StorageService {
  constructor(options = {}) {
    this.prefix = options.prefix || '';
    this.serializer = options.serializer || {
      stringify: JSON.stringify,
      parse: JSON.parse
    };
  }

  save(key, value) {
    try {
      if (!this.isValidKey(key)) {
        throw new Error('Invalid key provided');
      }

      const fullKey = this.getFullKey(key);
      const serializedValue = this.serializer.stringify(value);

      localStorage.setItem(fullKey, serializedValue);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  retrieve(key, defaultValue) {
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
      console.error('Error retrieving from localStorage:', error);
      return defaultValue !== undefined ? defaultValue : null;
    }
  }

  update(key, updater) {
    try {
      const currentValue = this.retrieve(key);
      const newValue = updater(currentValue);
      return this.save(key, newValue);
    } catch (error) {
      console.error('Error updating localStorage:', error);
      return false;
    }
  }

  delete(key) {
    try {
      if (!this.isValidKey(key)) {
        throw new Error('Invalid key provided');
      }

      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
      return false;
    }
  }

  exists(key) {
    try {
      const fullKey = this.getFullKey(key);
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      return false;
    }
  }

  clear() {
    try {
      const keysToDelete = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  getKeys() {
    const keys = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
    } catch (error) {
      console.error('Error getting keys from localStorage:', error);
    }

    return keys;
  }

  getStorageInfo() {
    try {
      let used = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          used += key.length + value.length;
        }
      }

      const total = 5 * 1024 * 1024; // 5MB
      const available = total - used;

      return { used, total, available };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, total: 0, available: 0 };
    }
  }

  isValidKey(key) {
    return typeof key === 'string' && key.length > 0;
  }

  getFullKey(key) {
    return this.prefix + key;
  }
}

module.exports = { StorageService };