/**
 * Browser Notification Service for Pomodoro Timer
 * Handles browser notifications for work and break session completions
 */

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export interface PomodoroNotificationOptions {
  workSessionTitle?: string;
  workSessionMessage?: string;
  breakSessionTitle?: string;
  breakSessionMessage?: string;
  icon?: string;
}

export class NotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission;
  private options: PomodoroNotificationOptions;

  constructor(options: PomodoroNotificationOptions = {}) {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.options = {
      workSessionTitle: 'Work Session Complete!',
      workSessionMessage: 'Time for a break. Great job staying focused!',
      breakSessionTitle: 'Break Time Over!',
      breakSessionMessage: 'Ready to get back to work? Let\'s stay productive!',
      icon: '/favicon.ico',
      ...options
    };
  }

  /**
   * Check if browser notifications are supported
   */
  public isNotificationSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Get current notification permission status
   */
  public getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  /**
   * Request notification permission from the user
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (this.permission === 'granted') {
      return this.permission;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw new Error('Failed to request notification permission');
    }
  }

  /**
   * Send a browser notification
   */
  private async sendNotification(config: NotificationConfig): Promise<Notification | null> {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return null;
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const notification = new Notification(config.title, {
        body: config.body,
        icon: config.icon || this.options.icon,
        tag: config.tag,
        requireInteraction: false,
        silent: false
      });

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new Error('Failed to send notification');
    }
  }

  /**
   * Send notification when work session is complete
   */
  public async notifyWorkSessionComplete(): Promise<Notification | null> {
    return this.sendNotification({
      title: this.options.workSessionTitle!,
      body: this.options.workSessionMessage!,
      tag: 'work-complete',
      icon: this.options.icon
    });
  }

  /**
   * Send notification when break session is complete
   */
  public async notifyBreakSessionComplete(): Promise<Notification | null> {
    return this.sendNotification({
      title: this.options.breakSessionTitle!,
      body: this.options.breakSessionMessage!,
      tag: 'break-complete',
      icon: this.options.icon
    });
  }

  /**
   * Send a custom notification
   */
  public async sendCustomNotification(title: string, message: string, tag?: string): Promise<Notification | null> {
    return this.sendNotification({
      title,
      body: message,
      tag,
      icon: this.options.icon
    });
  }

  /**
   * Update notification options
   */
  public updateOptions(newOptions: Partial<PomodoroNotificationOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Check if notifications can be sent (supported and permission granted)
   */
  public canSendNotifications(): boolean {
    return this.isSupported && this.permission === 'granted';
  }
}

// Singleton instance for easy usage throughout the app
export const notificationService = new NotificationService();