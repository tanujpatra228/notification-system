import { Provider } from '../models/Provider.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

export class MockProvider implements Provider {
    name = 'mock';

    async sendNotification(notification: Notification, user: User): Promise<boolean> {
        console.log(`MockProvider: Sending notification to ${user.email}: ${notification.message}`);
        return true;
    }
} 