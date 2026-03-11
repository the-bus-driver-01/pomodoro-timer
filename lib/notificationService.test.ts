/**
 * Comprehensive test suite for browser notification service
 */

import {
  isNotificationSupported,
  areNotificationsAvailable,
  getPermissionStatus,
  requestPermission,
  sendNotification,
  sendWorkCompleteNotification,
  sendBreakCompleteNotification,
  notificationService,
  NotificationError,
  NotificationErrorCodes,
  type NotificationPermission,
  type NotificationOptions,
} from './notificationService';

// Mock the Notification API
const mockNotification = jest.fn();
const mockNotificationInstance = {
  close: jest.fn(),
  onclick: null,
  onerror: null,
  onclose: null,
  onshow: null,
};

// Mock the global objects
const mockWindow = {
  location: { protocol: 'https:', hostname: 'example.com' },
  focus: jest.fn(),
};

const mockNavigator = {
  serviceWorker: {},
};

// Store original globals
const originalWindow = global.window;
const originalNotification = global.Notification;
const originalNavigator = global.navigator;

describe('Browser Notification Service', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup global mocks
    global.window = mockWindow as any;
    global.navigator = mockNavigator as any;
    global.console = {
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn()
    } as any;

    mockNotification.mockImplementation(() => mockNotificationInstance);
    mockNotification.permission = 'default';
    mockNotification.requestPermission = jest.fn().mockResolvedValue('granted');

    global.Notification = mockNotification as any;
  });

  afterEach(() => {
    // Restore original globals
    global.window = originalWindow;
    global.Notification = originalNotification;
    global.navigator = originalNavigator;
  });

  describe('isNotificationSupported', () => {
    it('should return true when Notification and serviceWorker are available', () => {
      expect(isNotificationSupported()).toBe(true);
    });

    it('should return false when Notification is not available', () => {
      global.Notification = undefined as any;
      expect(isNotificationSupported()).toBe(false);
    });

    it('should return false when serviceWorker is not available', () => {
      global.navigator = {} as any;
      expect(isNotificationSupported()).toBe(false);
    });
  });

  describe('areNotificationsAvailable', () => {
    it('should return available: true for HTTPS sites', () => {
      const result = areNotificationsAvailable();
      expect(result.available).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return available: true for localhost', () => {
      mockWindow.location = { protocol: 'http:', hostname: 'localhost' };
      const result = areNotificationsAvailable();
      expect(result.available).toBe(true);
    });

    it('should return available: false for HTTP sites (not localhost)', () => {
      mockWindow.location = { protocol: 'http:', hostname: 'example.com' };
      const result = areNotificationsAvailable();
      expect(result.available).toBe(false);
      expect(result.reason).toBe('Notifications require HTTPS or localhost');
    });

    it('should return available: false when Notification API is not supported', () => {
      global.Notification = undefined as any;
      const result = areNotificationsAvailable();
      expect(result.available).toBe(false);
      expect(result.reason).toBe('Notification API is not supported in this browser');
    });
  });

  describe('getPermissionStatus', () => {
    it('should return current notification permission', () => {
      mockNotification.permission = 'granted';
      expect(getPermissionStatus()).toBe('granted');
    });

    it('should return "denied" when notifications are not supported', () => {
      global.Notification = undefined as any;
      expect(getPermissionStatus()).toBe('denied');
    });
  });

  describe('requestPermission', () => {
    it('should request permission when in default state', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValue('granted');

      const result = await requestPermission();

      expect(mockNotification.requestPermission).toHaveBeenCalled();
      expect(result).toBe('granted');
    });

    it('should return current permission without requesting when already granted', async () => {
      mockNotification.permission = 'granted';

      const result = await requestPermission();

      expect(mockNotification.requestPermission).not.toHaveBeenCalled();
      expect(result).toBe('granted');
    });

    it('should return current permission without requesting when already denied', async () => {
      mockNotification.permission = 'denied';

      const result = await requestPermission();

      expect(mockNotification.requestPermission).not.toHaveBeenCalled();
      expect(result).toBe('denied');
    });

    it('should throw NotificationError when notifications are not available', async () => {
      global.Notification = undefined as any;

      await expect(requestPermission()).rejects.toThrow(NotificationError);
      await expect(requestPermission()).rejects.toThrow('Notification API is not supported in this browser');
    });

    it('should throw NotificationError when user denies permission', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValue('denied');

      await expect(requestPermission()).rejects.toThrow(NotificationError);
      await expect(requestPermission()).rejects.toThrow('User denied notification permission');
    });

    it('should handle permission request errors gracefully', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockRejectedValue(new Error('Request failed'));

      await expect(requestPermission()).rejects.toThrow(NotificationError);
      await expect(requestPermission()).rejects.toThrow('Failed to request notification permission');
    });
  });

  describe('sendNotification', () => {
    beforeEach(() => {
      mockNotification.permission = 'granted';
    });

    it('should create and return a notification when permission is granted', async () => {
      const result = await sendNotification('Test Title', 'Test Message');

      expect(mockNotification).toHaveBeenCalledWith('Test Title', {
        body: 'Test Message',
        icon: '/favicon.ico',
      });
      expect(result).toBe(mockNotificationInstance);
    });

    it('should handle custom options correctly', async () => {
      const options: NotificationOptions = {
        icon: '/custom-icon.png',
        requireInteraction: true,
        vibrate: [200, 100, 200],
      };

      await sendNotification('Test Title', 'Test Message', options);

      expect(mockNotification).toHaveBeenCalledWith('Test Title', {
        body: 'Test Message',
        icon: '/custom-icon.png',
        requireInteraction: true,
        vibrate: [200, 100, 200],
      });
    });

    it('should set up event handlers correctly', async () => {
      const customOnClick = jest.fn();
      const options: NotificationOptions = {
        onclick: customOnClick,
      };

      await sendNotification('Test Title', 'Test Message', options);

      expect(mockNotificationInstance.onclick).toBeDefined();
      expect(mockNotificationInstance.onerror).toBeDefined();
    });

    it('should return null and use fallback when permission is not granted', async () => {
      mockNotification.permission = 'denied';

      const result = await sendNotification('Test Title', 'Test Message');

      expect(result).toBeNull();
      expect(global.console.warn).toHaveBeenCalledWith(
        'Notification permission not granted. Current status:',
        'denied'
      );
    });

    it('should return null and use fallback when notifications are not available', async () => {
      global.Notification = undefined as any;

      const result = await sendNotification('Test Title', 'Test Message');

      expect(result).toBeNull();
      expect(global.console.warn).toHaveBeenCalled();
    });

    it('should handle notification creation errors gracefully', async () => {
      mockNotification.mockImplementation(() => {
        throw new Error('Creation failed');
      });

      const result = await sendNotification('Test Title', 'Test Message');

      expect(result).toBeNull();
      expect(global.console.error).toHaveBeenCalledWith(
        'Error sending notification:',
        expect.any(Error)
      );
    });
  });

  describe('sendWorkCompleteNotification', () => {
    beforeEach(() => {
      mockNotification.permission = 'granted';
    });

    it('should send work complete notification with default message', async () => {
      await sendWorkCompleteNotification();

      expect(mockNotification).toHaveBeenCalledWith(
        'Work Session Complete! 🎉',
        expect.objectContaining({
          body: 'Great job! Time for a well-deserved break.',
          icon: '/icons/work-complete.png',
          requireInteraction: true,
          tag: 'work-complete',
          data: { type: 'work-complete', duration: undefined },
        })
      );
    });

    it('should include duration in message when provided', async () => {
      await sendWorkCompleteNotification(1500); // 25 minutes in seconds

      expect(mockNotification).toHaveBeenCalledWith(
        'Work Session Complete! 🎉',
        expect.objectContaining({
          body: 'Great job! Time for a well-deserved break (25 minutes).',
          data: { type: 'work-complete', duration: 1500 },
        })
      );
    });

    it('should include start break action', async () => {
      await sendWorkCompleteNotification();

      expect(mockNotification).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          actions: [
            {
              action: 'start-break',
              title: 'Start Break',
              icon: '/icons/break.png'
            }
          ]
        })
      );
    });
  });

  describe('sendBreakCompleteNotification', () => {
    beforeEach(() => {
      mockNotification.permission = 'granted';
    });

    it('should send break complete notification with default message', async () => {
      await sendBreakCompleteNotification();

      expect(mockNotification).toHaveBeenCalledWith(
        'Break Time Over! ⏰',
        expect.objectContaining({
          body: 'Break complete. Ready to get back to work?',
          icon: '/icons/break-complete.png',
          requireInteraction: true,
          tag: 'break-complete',
          data: { type: 'break-complete', duration: undefined },
        })
      );
    });

    it('should include duration in message when provided', async () => {
      await sendBreakCompleteNotification(900); // 15 minutes in seconds

      expect(mockNotification).toHaveBeenCalledWith(
        'Break Time Over! ⏰',
        expect.objectContaining({
          body: 'Break complete (15 minutes). Ready to get back to work?',
          data: { type: 'break-complete', duration: 900 },
        })
      );
    });

    it('should include start work action', async () => {
      await sendBreakCompleteNotification();

      expect(mockNotification).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          actions: [
            {
              action: 'start-work',
              title: 'Start Work',
              icon: '/icons/work.png'
            }
          ]
        })
      );
    });
  });

  describe('notificationService object', () => {
    it('should export all expected methods and constants', () => {
      expect(notificationService.isSupported).toBe(isNotificationSupported);
      expect(notificationService.areAvailable).toBe(areNotificationsAvailable);
      expect(notificationService.getPermissionStatus).toBe(getPermissionStatus);
      expect(notificationService.requestPermission).toBe(requestPermission);
      expect(notificationService.sendNotification).toBe(sendNotification);
      expect(notificationService.sendWorkCompleteNotification).toBe(sendWorkCompleteNotification);
      expect(notificationService.sendBreakCompleteNotification).toBe(sendBreakCompleteNotification);
      expect(notificationService.ErrorCodes).toBe(NotificationErrorCodes);
      expect(notificationService.Error).toBe(NotificationError);
    });
  });

  describe('NotificationError', () => {
    it('should create error with message and code', () => {
      const error = new NotificationError('Test error', 'TEST_CODE');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NotificationError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('NotificationError');
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow: request permission and send notification', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValue('granted');

      // Request permission
      const permission = await requestPermission();
      expect(permission).toBe('granted');

      // Update mock to reflect granted permission
      mockNotification.permission = 'granted';

      // Send notification
      const notification = await sendNotification('Test', 'Message');
      expect(notification).toBeTruthy();
      expect(mockNotification).toHaveBeenCalledWith('Test', expect.any(Object));
    });

    it('should handle denied permission gracefully throughout workflow', async () => {
      mockNotification.permission = 'denied';

      // Try to send notification without permission
      const notification = await sendNotification('Test', 'Message');
      expect(notification).toBeNull();

      // Timer notifications should also handle denied permission
      const workNotification = await sendWorkCompleteNotification();
      expect(workNotification).toBeNull();

      const breakNotification = await sendBreakCompleteNotification();
      expect(breakNotification).toBeNull();
    });
  });
});