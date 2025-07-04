import { Notification } from './Notification.js';
import { User } from './User.js';

export interface Provider {
    name: string;
    sendNotification(notification: Notification, user: User): Promise<boolean>;
} 