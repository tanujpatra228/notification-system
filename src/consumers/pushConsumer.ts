import { Worker, Job } from 'bullmq';
import { pushQueue } from '../queues/pushQueue.js';
import { Notification } from '../models';
import { connection } from '../queues/redisConnection.js';

export const pushConsumer = new Worker<Notification>(
    pushQueue.name,
    async (job: Job<Notification>) => {
        const notification = job.data;
        // Simulate 5 miliseconds delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // TODO: Replace with actual push provider logic
        console.log('PushConsumer: Sending push notification:', notification);
    },
    { connection }
); 