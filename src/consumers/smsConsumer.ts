import { Worker, Job } from 'bullmq';
import { smsQueue } from '../queues/smsQueue.js';
import { Notification, User } from '../models/index.js';
import { connection } from '../queues/redisConnection.js';
import { TwilioProvider } from '../providers/TwilioProvider.js';

const twilioProvider = new TwilioProvider();

export const smsConsumer = new Worker<Notification>(
    smsQueue.name,
    async (job: Job<Notification>) => {
        const notification = job.data;
        // Mock user for demonstration; in real use, fetch user from DB or service
        const user: User = {
            id: notification.userId,
            name: 'Test User',
            email: 'test@example.com',
            phone: '+919265353025',
            preferences: {
                channels: ['sms'],
                doNotDisturb: false
            }
        };
        await twilioProvider.sendNotification(notification, user);
    },
    { connection }
); 