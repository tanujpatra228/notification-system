import { User, Notification, Provider } from '../models/index.js';

export class NotificationService {
    private providers: Provider[] = [];

    registerProvider(provider: Provider) {
        this.providers.push(provider);
    }

    async sendNotification(notification: Notification, user: User): Promise<boolean> {
        // Check user preferences (e.g., doNotDisturb, allowed channels)
        if (user.preferences.doNotDisturb) {
            return false;
        }
        // Find a provider that matches the notification channel
        const provider = this.providers.find(p => p.name === notification.channel);
        if (!provider) {
            throw new Error('No provider found for channel: ' + notification.channel);
        }
        // Send notification using the provider
        return provider.sendNotification(notification, user);
    }
} 