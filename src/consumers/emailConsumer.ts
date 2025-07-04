import { Worker, Job } from 'bullmq';
import { emailQueue } from '../queues/emailQueue.js';
import { Notification } from '../models/index.js';
import { connection } from '../queues/redisConnection.js';

export const emailConsumer = new Worker<Notification>(
    emailQueue.name,
    async (job: Job<Notification>) => {
        const notification = job.data;
        // Simulate 5 seconds delay
        await new Promise(resolve => setTimeout(resolve, 5000));
        // TODO: Replace with actual email provider logic
        console.log('EmailConsumer: Sending email notification:', notification);
    },
    { connection }
); 