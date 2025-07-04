export interface Notification {
    id: string;
    userId: string;
    message: string;
    priority: NotificationPriority;
    channel: NotificationChannel;
    timestamp: Date;
    // Add more fields as needed
}

export type NotificationPriority = 'low' | 'normal' | 'high';

import { NotificationChannel } from './User.js'; 