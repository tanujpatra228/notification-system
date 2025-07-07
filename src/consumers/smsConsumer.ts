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
        // Expect user data to be present in notification.user
        const user: User | undefined = (notification as any).user;
        if (!user) {
            console.error('No user data provided in notification');
            return;
        }
        await twilioProvider.sendNotification(notification, user);
    },
    { connection }
); 