// Jest setup file for browser notification service tests

// Mock console methods to avoid noise in test output
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};

// Setup jsdom environment globals if needed
if (typeof global.window === 'undefined') {
  global.window = {};
}

if (typeof global.navigator === 'undefined') {
  global.navigator = {};
}