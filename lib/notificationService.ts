/**
 * Browser notification service for managing permissions and sending notifications
 */

// TypeScript interfaces for notification options
export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
  data?: any;
  onclick?: (this: Notification, ev: Event) => any;
  onerror?: (this: Notification, ev: Event) => any;
  onclose?: (this: Notification, ev: Event) => any;
  onshow?: (this: Notification, ev: Event) => any;
}

export interface NotificationConfig {
  title: string;
  options?: NotificationOptions;
}

export type NotificationPermission = 'granted' | 'denied' | 'default';

// Error types for better error handling
export class NotificationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'NotificationError';
  }
}

export const NotificationErrorCodes = {
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PERMISSION_REQUEST_FAILED: 'PERMISSION_REQUEST_FAILED',
  SEND_FAILED: 'SEND_FAILED',
} as const;

/**
 * Check if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Check if notifications are available and can be used
 */
export function areNotificationsAvailable(): { available: boolean; reason?: string } {
  if (!('Notification' in window)) {
    return {
      available: false,
      reason: 'Notification API is not supported in this browser'
    };
  }

  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    return {
      available: false,
      reason: 'Notifications require HTTPS or localhost'
    };
  }

  return { available: true };
}

/**
 * Get current notification permission status
 */
export function getPermissionStatus(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission as NotificationPermission;
}

/**
 * Request notification permission from the user
 */
export async function requestPermission(): Promise<NotificationPermission> {
  const availability = areNotificationsAvailable();
  if (!availability.available) {
    throw new NotificationError(
      availability.reason || 'Notifications are not available',
      NotificationErrorCodes.NOT_SUPPORTED
    );
  }

  const currentPermission = getPermissionStatus();

  // If permission is already granted or denied, return current state
  if (currentPermission === 'granted' || currentPermission === 'denied') {
    return currentPermission;
  }

  try {
    // Request permission if it's in default state
    const permission = await Notification.requestPermission();

    if (permission === 'denied') {
      throw new NotificationError(
        'User denied notification permission',
        NotificationErrorCodes.PERMISSION_DENIED
      );
    }

    return permission as NotificationPermission;
  } catch (error) {
    if (error instanceof NotificationError) {
      throw error;
    }

    console.error('Error requesting notification permission:', error);
    throw new NotificationError(
      'Failed to request notification permission',
      NotificationErrorCodes.PERMISSION_REQUEST_FAILED
    );
  }
}

/**
 * Send a notification to the user
 * Works even when the tab is not focused
 */
export async function sendNotification(
  title: string,
  message?: string,
  options?: NotificationOptions
): Promise<Notification | null> {
  const availability = areNotificationsAvailable();
  if (!availability.available) {
    console.warn('Notifications not available:', availability.reason);
    // Try fallback method
    return showFallbackNotification(title, message);
  }

  const permission = getPermissionStatus();

  if (permission !== 'granted') {
    console.warn('Notification permission not granted. Current status:', permission);

    if (permission === 'default') {
      console.info('Consider calling requestPermission() first');
    }

    // Try fallback method
    return showFallbackNotification(title, message);
  }

  try {
    const notificationOptions: NotificationOptions = {
      body: message,
      icon: options?.icon || '/favicon.ico',
      ...options,
    };

    // Create the notification - this works even when tab is not focused
    const notification = new Notification(title, notificationOptions);

    // Add event listeners for notification interactions
    notification.onclick = (event) => {
      // Focus the window when notification is clicked
      if (window.focus) {
        window.focus();
      }

      // Close the notification
      notification.close();

      // Call custom click handler if provided
      if (options?.onclick) {
        options.onclick.call(notification, event);
      }
    };

    notification.onerror = (event) => {
      console.error('Notification error:', event);
      // Try fallback method on error
      showFallbackNotification(title, message);
    };

    notification.onclose = (event) => {
      if (options?.onclose) {
        options.onclose.call(notification, event);
      }
    };

    notification.onshow = (event) => {
      if (options?.onshow) {
        options.onshow.call(notification, event);
      }
    };

    // Auto-close notification after 5 seconds unless requireInteraction is true
    if (!options?.requireInteraction) {
      setTimeout(() => {
        try {
          notification.close();
        } catch (e) {
          // Notification might already be closed
        }
      }, 5000);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);

    // Try fallback method
    return showFallbackNotification(title, message);
  }
}

/**
 * Fallback notification method when native notifications are not available
 * Uses browser alert or console message as last resort
 */
function showFallbackNotification(title: string, message?: string): null {
  const fullMessage = message ? `${title}\n${message}` : title;

  // Try to show a non-intrusive fallback (could be replaced with a custom toast notification)
  if (typeof console !== 'undefined') {
    console.info('📢 Notification:', fullMessage);
  }

  // In a real application, you might want to show a custom toast notification here
  // instead of using alert, which is intrusive

  return null;
}

/**
 * Send a notification for work session completion
 */
export async function sendWorkCompleteNotification(
  duration?: number
): Promise<Notification | null> {
  const title = 'Work Session Complete! 🎉';
  const durationText = duration ? ` (${Math.round(duration / 60)} minutes)` : '';
  const message = `Great job! Time for a well-deserved break${durationText}.`;

  const options: NotificationOptions = {
    icon: '/icons/work-complete.png', // You can customize this icon path
    badge: '/icons/badge.png',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    tag: 'work-complete',
    data: { type: 'work-complete', duration },
    actions: [
      {
        action: 'start-break',
        title: 'Start Break',
        icon: '/icons/break.png'
      }
    ]
  };

  return await sendNotification(title, message, options);
}

/**
 * Send a notification for break session completion
 */
export async function sendBreakCompleteNotification(
  duration?: number
): Promise<Notification | null> {
  const title = 'Break Time Over! ⏰';
  const durationText = duration ? ` (${Math.round(duration / 60)} minutes)` : '';
  const message = `Break complete${durationText}. Ready to get back to work?`;

  const options: NotificationOptions = {
    icon: '/icons/break-complete.png', // You can customize this icon path
    badge: '/icons/badge.png',
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300],
    tag: 'break-complete',
    data: { type: 'break-complete', duration },
    actions: [
      {
        action: 'start-work',
        title: 'Start Work',
        icon: '/icons/work.png'
      }
    ]
  };

  return await sendNotification(title, message, options);
}

/**
 * Service object with all notification-related methods
 * Provides a clean, organized API for consumers
 */
export const notificationService = {
  // Core functions
  isSupported: isNotificationSupported,
  areAvailable: areNotificationsAvailable,
  getPermissionStatus,
  requestPermission,
  sendNotification,

  // Timer-specific functions
  sendWorkCompleteNotification,
  sendBreakCompleteNotification,

  // Utility types and constants
  ErrorCodes: NotificationErrorCodes,
  Error: NotificationError,
} as const;

// Default export for convenience
export default notificationService;