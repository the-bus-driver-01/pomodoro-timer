/**
 * Comprehensive tests for StorageService
 * Tests cover all CRUD operations, data type handling, error cases, and edge cases
 */

import {
  StorageService,
  storage,
  saveToStorage,
  retrieveFromStorage,
  updateInStorage,
  deleteFromStorage,
  clearStorage,
  StorageValue
} from './storage';

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new StorageService();
  });

  describe('Basic CRUD Operations', () => {
    describe('save()', () => {
      it('should save a string value', () => {
        const result = storageService.save('testKey', 'testValue');
        expect(result).toBe(true);
        expect(localStorage.getItem('testKey')).toBe('"testValue"');
      });

      it('should save a number value', () => {
        const result = storageService.save('numberKey', 42);
        expect(result).toBe(true);
        expect(localStorage.getItem('numberKey')).toBe('42');
      });

      it('should save a boolean value', () => {
        const result = storageService.save('boolKey', true);
        expect(result).toBe(true);
        expect(localStorage.getItem('boolKey')).toBe('true');
      });

      it('should save an object value', () => {
        const testObject = { name: 'John', age: 30 };
        const result = storageService.save('objKey', testObject);
        expect(result).toBe(true);
        expect(localStorage.getItem('objKey')).toBe(JSON.stringify(testObject));
      });

      it('should save an array value', () => {
        const testArray = [1, 2, 3, 'test'];
        const result = storageService.save('arrayKey', testArray);
        expect(result).toBe(true);
        expect(localStorage.getItem('arrayKey')).toBe(JSON.stringify(testArray));
      });

      it('should save null value', () => {
        const result = storageService.save('nullKey', null);
        expect(result).toBe(true);
        expect(localStorage.getItem('nullKey')).toBe('null');
      });

      it('should return false for invalid key', () => {
        const result = storageService.save('', 'value');
        expect(result).toBe(false);
      });

      it('should handle circular references in objects gracefully', () => {
        const circularObj: any = { name: 'test' };
        circularObj.self = circularObj;

        // Mock JSON.stringify to throw an error for circular references
        const originalStringify = JSON.stringify;
        JSON.stringify = jest.fn(() => {
          throw new TypeError('Converting circular structure to JSON');
        });

        const result = storageService.save('circularKey', circularObj);
        expect(result).toBe(false);

        // Restore original JSON.stringify
        JSON.stringify = originalStringify;
      });
    });

    describe('retrieve()', () => {
      beforeEach(() => {
        localStorage.setItem('stringKey', '"testString"');
        localStorage.setItem('numberKey', '123');
        localStorage.setItem('booleanKey', 'false');
        localStorage.setItem('objectKey', '{"name":"Alice","age":25}');
        localStorage.setItem('arrayKey', '[1,2,3]');
        localStorage.setItem('nullKey', 'null');
      });

      it('should retrieve a string value', () => {
        const result = storageService.retrieve('stringKey');
        expect(result).toBe('testString');
      });

      it('should retrieve a number value', () => {
        const result = storageService.retrieve('numberKey');
        expect(result).toBe(123);
      });

      it('should retrieve a boolean value', () => {
        const result = storageService.retrieve('booleanKey');
        expect(result).toBe(false);
      });

      it('should retrieve an object value', () => {
        const result = storageService.retrieve('objectKey');
        expect(result).toEqual({ name: 'Alice', age: 25 });
      });

      it('should retrieve an array value', () => {
        const result = storageService.retrieve('arrayKey');
        expect(result).toEqual([1, 2, 3]);
      });

      it('should retrieve null value', () => {
        const result = storageService.retrieve('nullKey');
        expect(result).toBe(null);
      });

      it('should return null for non-existent key', () => {
        const result = storageService.retrieve('nonExistentKey');
        expect(result).toBe(null);
      });

      it('should return default value for non-existent key', () => {
        const defaultValue = 'default';
        const result = storageService.retrieve('nonExistentKey', defaultValue);
        expect(result).toBe(defaultValue);
      });

      it('should return null for invalid key', () => {
        const result = storageService.retrieve('');
        expect(result).toBe(null);
      });

      it('should handle corrupted JSON gracefully', () => {
        localStorage.setItem('corruptedKey', 'invalid-json{');
        const result = storageService.retrieve('corruptedKey', 'default');
        expect(result).toBe('default');
      });
    });

    describe('update()', () => {
      it('should update an existing string value', () => {
        storageService.save('updateKey', 'initial');
        const result = storageService.update('updateKey', (current) => `${current}_updated`);

        expect(result).toBe(true);
        expect(storageService.retrieve('updateKey')).toBe('initial_updated');
      });

      it('should update an existing number value', () => {
        storageService.save('numberKey', 10);
        const result = storageService.update('numberKey', (current) => (current as number) + 5);

        expect(result).toBe(true);
        expect(storageService.retrieve('numberKey')).toBe(15);
      });

      it('should update an existing object value', () => {
        const initialObj = { count: 1, name: 'test' };
        storageService.save('objKey', initialObj);

        const result = storageService.update('objKey', (current) => ({
          ...current as object,
          count: (current as any).count + 1
        }));

        expect(result).toBe(true);
        expect(storageService.retrieve('objKey')).toEqual({ count: 2, name: 'test' });
      });

      it('should handle update for non-existent key', () => {
        const result = storageService.update('nonExistentKey', (current) =>
          current === null ? 'new value' : current
        );

        expect(result).toBe(true);
        expect(storageService.retrieve('nonExistentKey')).toBe('new value');
      });

      it('should return false when updater throws an error', () => {
        storageService.save('errorKey', 'initial');
        const result = storageService.update('errorKey', () => {
          throw new Error('Update error');
        });

        expect(result).toBe(false);
        // Original value should remain unchanged
        expect(storageService.retrieve('errorKey')).toBe('initial');
      });
    });

    describe('delete()', () => {
      beforeEach(() => {
        storageService.save('deleteKey', 'toDelete');
      });

      it('should delete an existing key', () => {
        const result = storageService.delete('deleteKey');
        expect(result).toBe(true);
        expect(storageService.retrieve('deleteKey')).toBe(null);
      });

      it('should return true for non-existent key', () => {
        const result = storageService.delete('nonExistentKey');
        expect(result).toBe(true);
      });

      it('should return false for invalid key', () => {
        const result = storageService.delete('');
        expect(result).toBe(false);
      });
    });
  });

  describe('Advanced Operations', () => {
    describe('exists()', () => {
      beforeEach(() => {
        storageService.save('existingKey', 'value');
      });

      it('should return true for existing key', () => {
        expect(storageService.exists('existingKey')).toBe(true);
      });

      it('should return false for non-existent key', () => {
        expect(storageService.exists('nonExistentKey')).toBe(false);
      });

      it('should return false for invalid key', () => {
        expect(storageService.exists('')).toBe(false);
      });
    });

    describe('clear()', () => {
      beforeEach(() => {
        storageService.save('key1', 'value1');
        storageService.save('key2', 'value2');
        // Add some keys with different prefixes
        localStorage.setItem('otherPrefix_key', 'value');
      });

      it('should clear all keys with current prefix', () => {
        const result = storageService.clear();
        expect(result).toBe(true);
        expect(storageService.exists('key1')).toBe(false);
        expect(storageService.exists('key2')).toBe(false);
        // Keys with other prefixes should remain
        expect(localStorage.getItem('otherPrefix_key')).toBe('value');
      });
    });

    describe('getKeys()', () => {
      beforeEach(() => {
        storageService.save('key1', 'value1');
        storageService.save('key2', 'value2');
        storageService.save('key3', 'value3');
        // Add some keys with different prefixes
        localStorage.setItem('otherPrefix_key', 'value');
      });

      it('should return all keys with current prefix', () => {
        const keys = storageService.getKeys();
        expect(keys).toHaveLength(3);
        expect(keys).toContain('key1');
        expect(keys).toContain('key2');
        expect(keys).toContain('key3');
        expect(keys).not.toContain('otherPrefix_key');
      });

      it('should return empty array when no keys exist', () => {
        storageService.clear();
        const keys = storageService.getKeys();
        expect(keys).toEqual([]);
      });
    });

    describe('getStorageInfo()', () => {
      it('should return storage usage information', () => {
        storageService.save('testKey', 'testValue');
        const info = storageService.getStorageInfo();

        expect(info).toHaveProperty('used');
        expect(info).toHaveProperty('total');
        expect(info).toHaveProperty('available');
        expect(typeof info.used).toBe('number');
        expect(typeof info.total).toBe('number');
        expect(typeof info.available).toBe('number');
        expect(info.used).toBeGreaterThan(0);
        expect(info.total).toBeGreaterThan(info.used);
        expect(info.available).toBe(info.total - info.used);
      });
    });
  });

  describe('Prefix Support', () => {
    it('should work with custom prefix', () => {
      const prefixedStorage = new StorageService({ prefix: 'app_' });

      prefixedStorage.save('testKey', 'testValue');
      expect(localStorage.getItem('app_testKey')).toBe('"testValue"');
      expect(prefixedStorage.retrieve('testKey')).toBe('testValue');
    });

    it('should isolate keys with different prefixes', () => {
      const storage1 = new StorageService({ prefix: 'app1_' });
      const storage2 = new StorageService({ prefix: 'app2_' });

      storage1.save('key', 'value1');
      storage2.save('key', 'value2');

      expect(storage1.retrieve('key')).toBe('value1');
      expect(storage2.retrieve('key')).toBe('value2');
    });
  });

  describe('Custom Serializer Support', () => {
    it('should work with custom serializer', () => {
      const customStorage = new StorageService({
        serializer: {
          stringify: (value) => `custom_${JSON.stringify(value)}`,
          parse: (value) => JSON.parse(value.replace('custom_', ''))
        }
      });

      customStorage.save('customKey', { test: 'value' });
      expect(localStorage.getItem('customKey')).toBe('custom_{"test":"value"}');
      expect(customStorage.retrieve('customKey')).toEqual({ test: 'value' });
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage quota exceeded error', () => {
      // Create a very large string to exceed quota
      const largeString = 'x'.repeat(6 * 1024 * 1024); // 6MB string

      const result = storageService.save('largeKey', largeString);
      expect(result).toBe(false);
    });

    it('should handle localStorage not available', () => {
      // Mock localStorage to throw error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('localStorage not available');
      });

      const result = storageService.save('errorKey', 'value');
      expect(result).toBe(false);

      // Restore original method
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values', () => {
      const result = storageService.save('undefinedKey', undefined);
      expect(result).toBe(true);
      expect(storageService.retrieve('undefinedKey')).toBeUndefined();
    });

    it('should handle empty string values', () => {
      const result = storageService.save('emptyKey', '');
      expect(result).toBe(true);
      expect(storageService.retrieve('emptyKey')).toBe('');
    });

    it('should handle zero values', () => {
      storageService.save('zeroKey', 0);
      expect(storageService.retrieve('zeroKey')).toBe(0);
    });

    it('should handle false values', () => {
      storageService.save('falseKey', false);
      expect(storageService.retrieve('falseKey')).toBe(false);
    });

    it('should handle special characters in keys', () => {
      const specialKey = 'key-with_special.chars@123!';
      storageService.save(specialKey, 'value');
      expect(storageService.retrieve(specialKey)).toBe('value');
    });
  });
});

describe('Utility Functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveToStorage', () => {
    it('should save value using default storage instance', () => {
      const result = saveToStorage('utilKey', 'utilValue');
      expect(result).toBe(true);
      expect(localStorage.getItem('utilKey')).toBe('"utilValue"');
    });
  });

  describe('retrieveFromStorage', () => {
    it('should retrieve value using default storage instance', () => {
      localStorage.setItem('utilKey', '"utilValue"');
      const result = retrieveFromStorage('utilKey');
      expect(result).toBe('utilValue');
    });

    it('should return default value when key does not exist', () => {
      const result = retrieveFromStorage('nonExistent', 'default');
      expect(result).toBe('default');
    });
  });

  describe('updateInStorage', () => {
    it('should update value using default storage instance', () => {
      saveToStorage('updateKey', 'initial');
      const result = updateInStorage('updateKey', (current) => `${current}_updated`);
      expect(result).toBe(true);
      expect(retrieveFromStorage('updateKey')).toBe('initial_updated');
    });
  });

  describe('deleteFromStorage', () => {
    it('should delete value using default storage instance', () => {
      saveToStorage('deleteKey', 'toDelete');
      const result = deleteFromStorage('deleteKey');
      expect(result).toBe(true);
      expect(retrieveFromStorage('deleteKey')).toBe(null);
    });
  });

  describe('clearStorage', () => {
    it('should clear all values using default storage instance', () => {
      saveToStorage('key1', 'value1');
      saveToStorage('key2', 'value2');
      const result = clearStorage();
      expect(result).toBe(true);
      expect(retrieveFromStorage('key1')).toBe(null);
      expect(retrieveFromStorage('key2')).toBe(null);
    });
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should handle complete workflow: save, retrieve, update, delete', () => {
    // Save initial data
    expect(saveToStorage('workflow', { step: 1, data: 'initial' })).toBe(true);

    // Retrieve and verify
    const retrieved = retrieveFromStorage('workflow');
    expect(retrieved).toEqual({ step: 1, data: 'initial' });

    // Update
    expect(updateInStorage('workflow', (current: any) => ({
      ...current,
      step: current.step + 1,
      data: 'updated'
    }))).toBe(true);

    // Verify update
    const updated = retrieveFromStorage('workflow');
    expect(updated).toEqual({ step: 2, data: 'updated' });

    // Delete
    expect(deleteFromStorage('workflow')).toBe(true);

    // Verify deletion
    expect(retrieveFromStorage('workflow')).toBe(null);
  });

  it('should handle multiple data types in a single session', () => {
    const testData = {
      string: 'test string',
      number: 42,
      boolean: true,
      object: { nested: { value: 'deep' } },
      array: [1, 'two', { three: 3 }],
      nullValue: null
    };

    // Save all types
    Object.entries(testData).forEach(([key, value]) => {
      expect(saveToStorage(key, value)).toBe(true);
    });

    // Retrieve and verify all types
    Object.entries(testData).forEach(([key, expectedValue]) => {
      const retrieved = retrieveFromStorage(key);
      expect(retrieved).toEqual(expectedValue);
    });

    // Verify all keys exist
    const storageInstance = new StorageService();
    const keys = storageInstance.getKeys();
    expect(keys).toHaveLength(Object.keys(testData).length);
  });
});