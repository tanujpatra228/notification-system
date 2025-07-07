import { Worker, Job } from 'bullmq';
import { emailQueue } from '../queues/emailQueue.js';
import { Notification, User } from '../models/index.js';
import { connection } from '../queues/redisConnection.js';
import { OutlookProvider } from '../providers/OutlookProvider.js';

const outlookProvider = new OutlookProvider();

export const emailConsumer = new Worker<Notification>(
    emailQueue.name,
    async (job: Job<Notification>) => {
        const notification = job.data;
        // Expect user data to be present in notification.user
        const user: User | undefined = (notification as any).user;
        if (!user) {
            console.error('No user data provided in notification');
            return;
        }
        await outlookProvider.sendNotification(notification, user);
        // notification.subject is supported for email notifications
    },
    { connection }
); 