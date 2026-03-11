/**
 * localStorage Mock Implementation
 * Provides localStorage functionality for testing environment (Node.js + Jest)
 * since Node.js doesn't have native localStorage support
 */

interface MockStorage {
  [key: string]: string;
}

class LocalStorageMock implements Storage {
  private store: MockStorage = {};

  constructor() {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    // Simulate quota exceeded error when storage gets too large
    const totalSize = JSON.stringify(this.store).length + key.length + value.length;

    // Simulate 5MB quota (5 * 1024 * 1024 = 5242880 characters)
    if (totalSize > 5242880) {
      const error = new Error('QuotaExceededError: localStorage quota exceeded');
      error.name = 'QuotaExceededError';
      throw error;
    }

    this.store[key] = String(value);
  }

  // Helper methods for testing
  _getMockStore(): MockStorage {
    return { ...this.store };
  }

  _setMockStore(newStore: MockStorage): void {
    this.store = { ...newStore };
  }

  _getStorageSize(): number {
    return JSON.stringify(this.store).length;
  }
}

// Create the mock instance
const localStorageMock = new LocalStorageMock();

// Define the global localStorage object
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Make it available globally for tests
(global as any).localStorage = localStorageMock;

// Clean up between tests
beforeEach(() => {
  localStorageMock.clear();
});

export default localStorageMock;