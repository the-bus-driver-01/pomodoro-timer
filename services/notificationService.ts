/**
 * Notification service for sending browser notifications
 */
export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.requestPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async requestPermission(): Promise<void> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }
  }

  public async sendNotification(title: string, body?: string, options?: NotificationOptions): Promise<void> {
    try {
      // Ensure we have permission
      if (this.permission !== 'granted') {
        await this.requestPermission();
      }

      if (this.permission === 'granted' && 'Notification' in window) {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          ...options,
        });
      } else {
        console.warn('Notifications not supported or permission denied');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  public isSupported(): boolean {
    return 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    return this.permission;
  }
}

// Export a convenient function for sending notifications
export const sendNotification = (title: string, body?: string, options?: NotificationOptions): Promise<void> => {
  return NotificationService.getInstance().sendNotification(title, body, options);
};