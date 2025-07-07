import { Worker, Job } from 'bullmq';
import { pushQueue } from '../queues/pushQueue.js';
import { Notification, User } from '../models/index.js';
import { connection } from '../queues/redisConnection.js';

export const pushConsumer = new Worker<Notification>(
    pushQueue.name,
    async (job: Job<Notification>) => {
        const notification = job.data;
        // Expect user data to be present in notification.user
        const user: User | undefined = (notification as any).user;
        if (!user) {
            console.error('No user data provided in notification');
            return;
        }
        // TODO: Replace with actual push provider logic
        console.log('PushConsumer: Sending push notification to', user, ':', notification);
    },
    { connection }
); 