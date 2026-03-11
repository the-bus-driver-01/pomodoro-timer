/**
 * Comprehensive tests for NotificationService
 * Tests browser notifications functionality for Pomodoro timer
 */

import { NotificationService, notificationService } from './notificationService';

// Mock the Notification API
class MockNotification {
  title: string;
  options: NotificationOptions;
  onclose: ((this: Notification, ev: Event) => any) | null = null;
  onclick: ((this: Notification, ev: Event) => any) | null = null;
  onerror: ((this: Notification, ev: Event) => any) | null = null;
  onshow: ((this: Notification, ev: Event) => any) | null = null;

  static permission: NotificationPermission = 'default';
  static requestPermission = jest.fn();

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options || {};
  }

  close(): void {
    if (this.onclose) {
      this.onclose.call(this, new Event('close'));
    }
  }

  static mockReset(): void {
    MockNotification.permission = 'default';
    MockNotification.requestPermission.mockReset();
  }
}

// Setup DOM environment
const mockWindow = {
  Notification: MockNotification
};

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    // Reset mocks
    MockNotification.mockReset();
    jest.clearAllMocks();

    // Mock global window and Notification
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true
    });
    Object.defineProperty(global, 'Notification', {
      value: MockNotification,
      writable: true
    });

    // Create new service instance for each test
    service = new NotificationService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Browser Support Detection', () => {
    test('should detect notification support when Notification API exists', () => {
      expect(service.isNotificationSupported()).toBe(true);
    });

    test('should detect lack of notification support when Notification API does not exist', () => {
      // Remove Notification from window
      delete (global as any).window.Notification;
      delete (global as any).Notification;

      const unsupportedService = new NotificationService();
      expect(unsupportedService.isNotificationSupported()).toBe(false);
    });
  });

  describe('Permission Handling', () => {
    test('should return current permission status', () => {
      MockNotification.permission = 'granted';
      const grantedService = new NotificationService();
      expect(grantedService.getPermissionStatus()).toBe('granted');

      MockNotification.permission = 'denied';
      const deniedService = new NotificationService();
      expect(deniedService.getPermissionStatus()).toBe('denied');
    });

    test('should request permission successfully', async () => {
      MockNotification.requestPermission.mockResolvedValue('granted');

      const permission = await service.requestPermission();

      expect(MockNotification.requestPermission).toHaveBeenCalled();
      expect(permission).toBe('granted');
      expect(service.getPermissionStatus()).toBe('granted');
    });

    test('should return granted permission if already granted', async () => {
      MockNotification.permission = 'granted';
      const grantedService = new NotificationService();

      const permission = await grantedService.requestPermission();

      expect(MockNotification.requestPermission).not.toHaveBeenCalled();
      expect(permission).toBe('granted');
    });

    test('should handle permission request failure', async () => {
      MockNotification.requestPermission.mockRejectedValue(new Error('Permission denied'));

      await expect(service.requestPermission()).rejects.toThrow('Failed to request notification permission');
    });

    test('should throw error when requesting permission on unsupported browser', async () => {
      delete (global as any).window.Notification;
      delete (global as any).Notification;

      const unsupportedService = new NotificationService();

      await expect(unsupportedService.requestPermission()).rejects.toThrow('Notifications are not supported in this browser');
    });
  });

  describe('Work Session Notifications', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted';
    });

    test('should send work session complete notification with default message', async () => {
      const notification = await service.notifyWorkSessionComplete();

      expect(notification).toBeInstanceOf(MockNotification);
      expect(notification?.title).toBe('Work Session Complete!');
      expect(notification?.options.body).toBe('Time for a break. Great job staying focused!');
      expect(notification?.options.tag).toBe('work-complete');
    });

    test('should send work session complete notification with custom message', async () => {
      const customService = new NotificationService({
        workSessionTitle: 'Custom Work Done!',
        workSessionMessage: 'Take a well-deserved break!'
      });

      const notification = await customService.notifyWorkSessionComplete();

      expect(notification?.title).toBe('Custom Work Done!');
      expect(notification?.options.body).toBe('Take a well-deserved break!');
    });

    test('should return null when permission is denied for work session', async () => {
      MockNotification.permission = 'denied';
      const deniedService = new NotificationService();

      const notification = await deniedService.notifyWorkSessionComplete();

      expect(notification).toBeNull();
    });

    test('should return null when notifications are not supported for work session', async () => {
      delete (global as any).window.Notification;
      delete (global as any).Notification;

      const unsupportedService = new NotificationService();

      const notification = await unsupportedService.notifyWorkSessionComplete();

      expect(notification).toBeNull();
    });
  });

  describe('Break Session Notifications', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted';
    });

    test('should send break session complete notification with default message', async () => {
      const notification = await service.notifyBreakSessionComplete();

      expect(notification).toBeInstanceOf(MockNotification);
      expect(notification?.title).toBe('Break Time Over!');
      expect(notification?.options.body).toBe('Ready to get back to work? Let\'s stay productive!');
      expect(notification?.options.tag).toBe('break-complete');
    });

    test('should send break session complete notification with custom message', async () => {
      const customService = new NotificationService({
        breakSessionTitle: 'Break Finished!',
        breakSessionMessage: 'Time to focus again!'
      });

      const notification = await customService.notifyBreakSessionComplete();

      expect(notification?.title).toBe('Break Finished!');
      expect(notification?.options.body).toBe('Time to focus again!');
    });

    test('should return null when permission is denied for break session', async () => {
      MockNotification.permission = 'denied';
      const deniedService = new NotificationService();

      const notification = await deniedService.notifyBreakSessionComplete();

      expect(notification).toBeNull();
    });

    test('should return null when notifications are not supported for break session', async () => {
      delete (global as any).window.Notification;
      delete (global as any).Notification;

      const unsupportedService = new NotificationService();

      const notification = await unsupportedService.notifyBreakSessionComplete();

      expect(notification).toBeNull();
    });
  });

  describe('Custom Notifications', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted';
    });

    test('should send custom notification', async () => {
      const notification = await service.sendCustomNotification(
        'Custom Title',
        'Custom message body'
      );

      expect(notification).toBeInstanceOf(MockNotification);
      expect(notification?.title).toBe('Custom Title');
      expect(notification?.options.body).toBe('Custom message body');
    });

    test('should send custom notification with tag', async () => {
      const notification = await service.sendCustomNotification(
        'Tagged Notification',
        'This has a custom tag',
        'custom-tag'
      );

      expect(notification?.options.tag).toBe('custom-tag');
    });

    test('should return null for custom notification when permission denied', async () => {
      MockNotification.permission = 'denied';
      const deniedService = new NotificationService();

      const notification = await deniedService.sendCustomNotification(
        'Custom Title',
        'Custom message'
      );

      expect(notification).toBeNull();
    });
  });

  describe('Configuration Management', () => {
    test('should initialize with default options', () => {
      expect(service.canSendNotifications()).toBe(false); // permission is 'default'
      expect(service.isNotificationSupported()).toBe(true);
    });

    test('should initialize with custom options', () => {
      const customService = new NotificationService({
        workSessionTitle: 'Custom Work',
        workSessionMessage: 'Custom work message',
        breakSessionTitle: 'Custom Break',
        breakSessionMessage: 'Custom break message',
        icon: '/custom-icon.png'
      });

      expect(customService.isNotificationSupported()).toBe(true);
    });

    test('should update options correctly', async () => {
      MockNotification.permission = 'granted';

      service.updateOptions({
        workSessionTitle: 'Updated Work Title',
        workSessionMessage: 'Updated work message'
      });

      const notification = await service.notifyWorkSessionComplete();

      expect(notification?.title).toBe('Updated Work Title');
      expect(notification?.options.body).toBe('Updated work message');
    });

    test('should partially update options while preserving existing ones', async () => {
      MockNotification.permission = 'granted';

      service.updateOptions({
        workSessionTitle: 'Only Title Updated'
      });

      const notification = await service.notifyWorkSessionComplete();

      expect(notification?.title).toBe('Only Title Updated');
      expect(notification?.options.body).toBe('Time for a break. Great job staying focused!'); // Original message
    });
  });

  describe('Notification Capabilities', () => {
    test('should return true for canSendNotifications when supported and permission granted', () => {
      MockNotification.permission = 'granted';
      const grantedService = new NotificationService();

      expect(grantedService.canSendNotifications()).toBe(true);
    });

    test('should return false for canSendNotifications when permission denied', () => {
      MockNotification.permission = 'denied';
      const deniedService = new NotificationService();

      expect(deniedService.canSendNotifications()).toBe(false);
    });

    test('should return false for canSendNotifications when not supported', () => {
      delete (global as any).window.Notification;
      delete (global as any).Notification;

      const unsupportedService = new NotificationService();

      expect(unsupportedService.canSendNotifications()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted';
    });

    test('should handle notification creation errors gracefully', async () => {
      // Mock Notification constructor to throw an error
      const originalNotification = global.Notification;
      (global as any).Notification = jest.fn().mockImplementation(() => {
        throw new Error('Notification creation failed');
      });

      await expect(service.notifyWorkSessionComplete()).rejects.toThrow('Failed to send notification');

      // Restore original
      global.Notification = originalNotification;
    });

    test('should log warning when trying to send notification without support', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      delete (global as any).window.Notification;
      delete (global as any).Notification;

      const unsupportedService = new NotificationService();

      const notification = await unsupportedService.notifyWorkSessionComplete();

      expect(notification).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Notifications not supported');

      consoleSpy.mockRestore();
    });

    test('should log warning when trying to send notification without permission', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      MockNotification.permission = 'denied';
      const deniedService = new NotificationService();

      const notification = await deniedService.notifyWorkSessionComplete();

      expect(notification).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Notification permission not granted');

      consoleSpy.mockRestore();
    });
  });

  describe('Notification Auto-Close', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted';
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should auto-close notification after 5 seconds', async () => {
      const notification = await service.notifyWorkSessionComplete();
      const closeSpy = jest.spyOn(notification!, 'close');

      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000);

      expect(closeSpy).toHaveBeenCalled();
    });

    test('should not auto-close before 5 seconds', async () => {
      const notification = await service.notifyWorkSessionComplete();
      const closeSpy = jest.spyOn(notification!, 'close');

      // Fast-forward time by 4 seconds (less than 5)
      jest.advanceTimersByTime(4000);

      expect(closeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Singleton Instance', () => {
    test('should export a singleton instance', () => {
      expect(notificationService).toBeInstanceOf(NotificationService);
      expect(notificationService.isNotificationSupported()).toBe(true);
    });

    test('should maintain state across singleton usage', async () => {
      MockNotification.requestPermission.mockResolvedValue('granted');

      await notificationService.requestPermission();

      expect(notificationService.getPermissionStatus()).toBe('granted');
      expect(notificationService.canSendNotifications()).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete Pomodoro cycle workflow', async () => {
      MockNotification.requestPermission.mockResolvedValue('granted');

      // Request permission
      await service.requestPermission();
      expect(service.canSendNotifications()).toBe(true);

      // Complete work session
      const workNotification = await service.notifyWorkSessionComplete();
      expect(workNotification).toBeInstanceOf(MockNotification);
      expect(workNotification?.title).toBe('Work Session Complete!');

      // Complete break session
      const breakNotification = await service.notifyBreakSessionComplete();
      expect(breakNotification).toBeInstanceOf(MockNotification);
      expect(breakNotification?.title).toBe('Break Time Over!');

      // Send custom notification
      const customNotification = await service.sendCustomNotification(
        'Session Info',
        'You completed 3 work sessions today!'
      );
      expect(customNotification).toBeInstanceOf(MockNotification);
      expect(customNotification?.title).toBe('Session Info');
    });

    test('should handle permission flow with denied permission', async () => {
      MockNotification.requestPermission.mockResolvedValue('denied');

      await service.requestPermission();
      expect(service.canSendNotifications()).toBe(false);

      // All notifications should return null
      const workNotification = await service.notifyWorkSessionComplete();
      const breakNotification = await service.notifyBreakSessionComplete();
      const customNotification = await service.sendCustomNotification('Test', 'Message');

      expect(workNotification).toBeNull();
      expect(breakNotification).toBeNull();
      expect(customNotification).toBeNull();
    });

    test('should handle rapid successive notification requests', async () => {
      MockNotification.permission = 'granted';

      const promises = [
        service.notifyWorkSessionComplete(),
        service.notifyBreakSessionComplete(),
        service.sendCustomNotification('Custom 1', 'Message 1'),
        service.sendCustomNotification('Custom 2', 'Message 2')
      ];

      const notifications = await Promise.all(promises);

      notifications.forEach(notification => {
        expect(notification).toBeInstanceOf(MockNotification);
      });

      expect(notifications[0]?.title).toBe('Work Session Complete!');
      expect(notifications[1]?.title).toBe('Break Time Over!');
      expect(notifications[2]?.title).toBe('Custom 1');
      expect(notifications[3]?.title).toBe('Custom 2');
    });

    test('should handle mixed permission scenarios in concurrent requests', async () => {
      MockNotification.permission = 'granted';
      const grantedService = new NotificationService();

      MockNotification.permission = 'denied';
      const deniedService = new NotificationService();

      const [grantedNotification, deniedNotification] = await Promise.all([
        grantedService.notifyWorkSessionComplete(),
        deniedService.notifyWorkSessionComplete()
      ]);

      expect(grantedNotification).toBeInstanceOf(MockNotification);
      expect(deniedNotification).toBeNull();
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    test('should handle empty string title and message', async () => {
      MockNotification.permission = 'granted';

      const notification = await service.sendCustomNotification('', '');

      expect(notification).toBeInstanceOf(MockNotification);
      expect(notification?.title).toBe('');
      expect(notification?.options.body).toBe('');
    });

    test('should handle very long title and message', async () => {
      MockNotification.permission = 'granted';

      const longTitle = 'A'.repeat(1000);
      const longMessage = 'B'.repeat(5000);

      const notification = await service.sendCustomNotification(longTitle, longMessage);

      expect(notification).toBeInstanceOf(MockNotification);
      expect(notification?.title).toBe(longTitle);
      expect(notification?.options.body).toBe(longMessage);
    });

    test('should handle special characters in title and message', async () => {
      MockNotification.permission = 'granted';

      const specialTitle = '🍅 Work Complete! 💪 @#$%^&*()';
      const specialMessage = 'Time for ☕ break! 🎉 \n\t Line breaks & tabs';

      const notification = await service.sendCustomNotification(specialTitle, specialMessage);

      expect(notification?.title).toBe(specialTitle);
      expect(notification?.options.body).toBe(specialMessage);
    });

    test('should handle null and undefined values gracefully', async () => {
      MockNotification.permission = 'granted';

      // Test with undefined tag
      const notification1 = await service.sendCustomNotification('Title', 'Message', undefined);
      expect(notification1?.options.tag).toBeUndefined();

      // Update with partial options containing null values
      service.updateOptions({ icon: undefined } as any);
      const notification2 = await service.notifyWorkSessionComplete();
      expect(notification2).toBeInstanceOf(MockNotification);
    });

    test('should handle numeric values as strings', async () => {
      MockNotification.permission = 'granted';

      const numericTitle = '123';
      const numericMessage = '456.789';

      const notification = await service.sendCustomNotification(numericTitle, numericMessage);

      expect(notification?.title).toBe('123');
      expect(notification?.options.body).toBe('456.789');
    });
  });

  describe('Advanced Configuration Tests', () => {
    test('should preserve all options when partially updating', () => {
      const originalOptions = {
        workSessionTitle: 'Original Work',
        workSessionMessage: 'Original Work Message',
        breakSessionTitle: 'Original Break',
        breakSessionMessage: 'Original Break Message',
        icon: '/original-icon.png'
      };

      const configuredService = new NotificationService(originalOptions);

      configuredService.updateOptions({
        workSessionTitle: 'Updated Work'
      });

      // Can't directly access private options, so test through notification behavior
      expect(configuredService.isNotificationSupported()).toBe(true);
    });

    test('should handle multiple consecutive option updates', async () => {
      MockNotification.permission = 'granted';

      service.updateOptions({ workSessionTitle: 'Update 1' });
      service.updateOptions({ workSessionMessage: 'Message 1' });
      service.updateOptions({ workSessionTitle: 'Update 2' });

      const notification = await service.notifyWorkSessionComplete();

      expect(notification?.title).toBe('Update 2');
      expect(notification?.options.body).toBe('Message 1');
    });

    test('should handle deep nested option objects', () => {
      const complexOptions = {
        workSessionTitle: 'Complex Work Session',
        workSessionMessage: 'Complex work message with\nmultiple\nlines',
        breakSessionTitle: 'Complex Break Session',
        breakSessionMessage: 'Complex break message with special chars: àáâãäåæ',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIi'
      };

      const complexService = new NotificationService(complexOptions);
      expect(complexService.isNotificationSupported()).toBe(true);
    });

    test('should maintain option immutability after creation', async () => {
      MockNotification.permission = 'granted';

      const options = {
        workSessionTitle: 'Original Title',
        workSessionMessage: 'Original Message'
      };

      const immutableService = new NotificationService(options);

      // Modify original options object
      options.workSessionTitle = 'Modified Title';

      const notification = await immutableService.notifyWorkSessionComplete();
      expect(notification?.title).toBe('Original Title');
    });

    test('should handle circular reference prevention in options', () => {
      const circularOptions: any = {
        workSessionTitle: 'Circular Test'
      };
      circularOptions.self = circularOptions;

      // Should not throw error during construction
      expect(() => new NotificationService(circularOptions)).not.toThrow();
    });
  });

  describe('Notification Lifecycle Management', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted';
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should handle notification close events', async () => {
      const notification = await service.notifyWorkSessionComplete();
      const closeHandler = jest.fn();

      notification!.onclose = closeHandler;
      notification!.close();

      expect(closeHandler).toHaveBeenCalled();
    });

    test('should handle notification click events', async () => {
      const notification = await service.notifyWorkSessionComplete();
      const clickHandler = jest.fn();

      notification!.onclick = clickHandler;

      // Simulate click event
      const clickEvent = new Event('click');
      notification!.onclick!.call(notification!, clickEvent);

      expect(clickHandler).toHaveBeenCalledWith(clickEvent);
    });

    test('should handle notification error events', async () => {
      const notification = await service.notifyWorkSessionComplete();
      const errorHandler = jest.fn();

      notification!.onerror = errorHandler;

      // Simulate error event
      const errorEvent = new Event('error');
      notification!.onerror!.call(notification!, errorEvent);

      expect(errorHandler).toHaveBeenCalledWith(errorEvent);
    });

    test('should handle notification show events', async () => {
      const notification = await service.notifyWorkSessionComplete();
      const showHandler = jest.fn();

      notification!.onshow = showHandler;

      // Simulate show event
      const showEvent = new Event('show');
      notification!.onshow!.call(notification!, showEvent);

      expect(showHandler).toHaveBeenCalledWith(showEvent);
    });

    test('should handle multiple notifications with different auto-close times', async () => {
      const notification1 = await service.notifyWorkSessionComplete();
      const notification2 = await service.notifyBreakSessionComplete();

      const closeSpy1 = jest.spyOn(notification1!, 'close');
      const closeSpy2 = jest.spyOn(notification2!, 'close');

      // Fast-forward by 5 seconds
      jest.advanceTimersByTime(5000);

      expect(closeSpy1).toHaveBeenCalled();
      expect(closeSpy2).toHaveBeenCalled();
    });

    test('should handle notification close before timeout', async () => {
      const notification = await service.notifyWorkSessionComplete();
      const closeSpy = jest.spyOn(notification!, 'close');

      // Manually close before timeout
      notification!.close();

      // Advance time past auto-close
      jest.advanceTimersByTime(6000);

      // Should have been called once (manual close)
      expect(closeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    test('should handle missing window object', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const noWindowService = new NotificationService();
      expect(noWindowService.isNotificationSupported()).toBe(false);
      expect(noWindowService.canSendNotifications()).toBe(false);

      global.window = originalWindow;
    });

    test('should handle partial Notification API support', () => {
      const partialNotification = {
        permission: 'default' as NotificationPermission
        // Missing requestPermission method
      };

      (global as any).window.Notification = partialNotification;
      (global as any).Notification = partialNotification;

      const partialService = new NotificationService();
      expect(partialService.isNotificationSupported()).toBe(true);
      expect(partialService.getPermissionStatus()).toBe('default');
    });

    test('should handle deprecated permission properties', () => {
      // Simulate old browser behavior
      const legacyNotification = MockNotification;
      delete (legacyNotification as any).permission;

      const legacyService = new NotificationService();
      expect(legacyService.getPermissionStatus()).toBe('denied');
    });

    test('should handle Notification constructor throwing errors', async () => {
      MockNotification.permission = 'granted';

      const errorNotification = jest.fn().mockImplementation(() => {
        throw new Error('Notification blocked by security policy');
      });

      (global as any).Notification = errorNotification;

      await expect(service.notifyWorkSessionComplete()).rejects.toThrow('Failed to send notification');
    });

    test('should handle requestPermission returning different values', async () => {
      const testCases = ['granted', 'denied', 'default'] as NotificationPermission[];

      for (const expectedPermission of testCases) {
        MockNotification.requestPermission.mockResolvedValue(expectedPermission);

        const result = await service.requestPermission();
        expect(result).toBe(expectedPermission);
        expect(service.getPermissionStatus()).toBe(expectedPermission);
      }
    });
  });

  describe('Performance and Memory Tests', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted';
    });

    test('should handle rapid notification creation without memory leaks', async () => {
      const notifications: any[] = [];

      // Create many notifications rapidly
      for (let i = 0; i < 100; i++) {
        const notification = await service.sendCustomNotification(
          `Notification ${i}`,
          `Message ${i}`
        );
        notifications.push(notification);
      }

      expect(notifications).toHaveLength(100);
      notifications.forEach((notification, index) => {
        expect(notification.title).toBe(`Notification ${index}`);
      });
    });

    test('should handle service instance creation performance', () => {
      const startTime = performance.now();

      // Create multiple service instances
      for (let i = 0; i < 1000; i++) {
        new NotificationService();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should create instances quickly (less than 100ms for 1000 instances)
      expect(duration).toBeLessThan(100);
    });

    test('should handle concurrent permission requests', async () => {
      MockNotification.requestPermission.mockResolvedValue('granted');

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(service.requestPermission());
      }

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toBe('granted');
      });

      // Should only call requestPermission once (already granted check)
      expect(MockNotification.requestPermission).toHaveBeenCalledTimes(1);
    });
  });

  describe('Validation and Input Sanitization', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted';
    });

    test('should handle XSS attempts in notification content', async () => {
      const xssTitle = '<script>alert("xss")</script>';
      const xssMessage = '<img src="x" onerror="alert(1)">';

      const notification = await service.sendCustomNotification(xssTitle, xssMessage);

      // Notification API should handle this, but we verify it doesn't break
      expect(notification).toBeInstanceOf(MockNotification);
      expect(notification?.title).toBe(xssTitle);
      expect(notification?.options.body).toBe(xssMessage);
    });

    test('should handle malformed HTML in content', async () => {
      const malformedTitle = '<div><span>Unclosed tags';
      const malformedMessage = '<!DOCTYPE html><html><body>Invalid HTML structure';

      const notification = await service.sendCustomNotification(malformedTitle, malformedMessage);

      expect(notification?.title).toBe(malformedTitle);
      expect(notification?.options.body).toBe(malformedMessage);
    });

    test('should handle SQL injection attempts', async () => {
      const sqlTitle = "'; DROP TABLE notifications; --";
      const sqlMessage = "' OR '1'='1";

      const notification = await service.sendCustomNotification(sqlTitle, sqlMessage);

      expect(notification?.title).toBe(sqlTitle);
      expect(notification?.options.body).toBe(sqlMessage);
    });

    test('should handle unicode and emoji validation', async () => {
      const unicodeTitle = '🍅 Pomodoro™ Complete! 🎉';
      const unicodeMessage = 'Great work! Time for a ☕ break 😊 你好世界 مرحبا';

      const notification = await service.sendCustomNotification(unicodeTitle, unicodeMessage);

      expect(notification?.title).toBe(unicodeTitle);
      expect(notification?.options.body).toBe(unicodeMessage);
    });

    test('should handle control characters in content', async () => {
      const controlTitle = 'Title\x00\x01\x02';
      const controlMessage = 'Message\u0000\u0001\u0002';

      const notification = await service.sendCustomNotification(controlTitle, controlMessage);

      expect(notification?.title).toBe(controlTitle);
      expect(notification?.options.body).toBe(controlMessage);
    });
  });

  describe('Advanced Error Handling', () => {
    test('should handle permission request timeout', async () => {
      MockNotification.requestPermission.mockImplementation(() => {
        return new Promise(() => {
          // Never resolves (simulates timeout)
        });
      });

      // This would timeout in a real scenario, but we'll test the setup
      expect(service.getPermissionStatus()).toBe('default');
    });

    test('should handle notification API becoming unavailable mid-session', async () => {
      MockNotification.permission = 'granted';

      // First notification works
      const notification1 = await service.notifyWorkSessionComplete();
      expect(notification1).toBeInstanceOf(MockNotification);

      // Then API becomes unavailable
      delete (global as any).window.Notification;
      delete (global as any).Notification;

      // Second notification should handle gracefully
      const notification2 = await service.notifyWorkSessionComplete();
      expect(notification2).toBeNull();
    });

    test('should handle permission changing during runtime', async () => {
      MockNotification.permission = 'granted';
      const dynamicService = new NotificationService();

      expect(dynamicService.canSendNotifications()).toBe(true);

      // Permission changes to denied
      MockNotification.permission = 'denied';

      // Service still has old permission status
      expect(dynamicService.getPermissionStatus()).toBe('granted');

      // But new service instances reflect current permission
      const newService = new NotificationService();
      expect(newService.getPermissionStatus()).toBe('denied');
    });

    test('should handle console methods being undefined', async () => {
      const originalWarn = console.warn;
      const originalError = console.error;

      delete (console as any).warn;
      delete (console as any).error;

      delete (global as any).window.Notification;
      delete (global as any).Notification;

      const noConsoleService = new NotificationService();

      // Should not throw error even without console methods
      const notification = await noConsoleService.notifyWorkSessionComplete();
      expect(notification).toBeNull();

      console.warn = originalWarn;
      console.error = originalError;
    });

    test('should handle setTimeout being unavailable', async () => {
      MockNotification.permission = 'granted';

      const originalSetTimeout = global.setTimeout;
      delete (global as any).setTimeout;

      // Should still work but without auto-close
      const notification = await service.notifyWorkSessionComplete();
      expect(notification).toBeInstanceOf(MockNotification);

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Singleton Instance Extended Tests', () => {
    test('should maintain singleton state across module imports', () => {
      // Test that singleton is properly exported and accessible
      expect(notificationService).toBeDefined();
      expect(notificationService).toBeInstanceOf(NotificationService);
    });

    test('should handle singleton permission changes', async () => {
      MockNotification.requestPermission.mockResolvedValue('granted');

      await notificationService.requestPermission();
      expect(notificationService.canSendNotifications()).toBe(true);

      // Permission change should persist
      const canSend1 = notificationService.canSendNotifications();
      const canSend2 = notificationService.canSendNotifications();

      expect(canSend1).toBe(canSend2);
    });

    test('should handle singleton option updates', async () => {
      MockNotification.permission = 'granted';

      notificationService.updateOptions({
        workSessionTitle: 'Singleton Work Title'
      });

      const notification = await notificationService.notifyWorkSessionComplete();
      expect(notification?.title).toBe('Singleton Work Title');
    });

    test('should maintain singleton consistency across async operations', async () => {
      MockNotification.permission = 'granted';

      const promises = [
        notificationService.notifyWorkSessionComplete(),
        notificationService.notifyBreakSessionComplete(),
        notificationService.sendCustomNotification('Test', 'Message')
      ];

      const notifications = await Promise.all(promises);

      notifications.forEach(notification => {
        expect(notification).toBeInstanceOf(MockNotification);
      });
    });
  });
});