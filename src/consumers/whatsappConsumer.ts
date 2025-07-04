import { Worker, Job } from 'bullmq';
import { whatsappQueue } from '../queues/whatsappQueue.js';
import { Notification } from '../models/index.js';
import { connection } from '../queues/redisConnection.js';

export const whatsappConsumer = new Worker<Notification>(
    whatsappQueue.name,
    async (job: Job<Notification>) => {
        const notification = job.data;
        // Simulate 3 seconds delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        // TODO: Replace with actual WhatsApp/SMS provider logic
        console.log('WhatsAppConsumer: Sending WhatsApp/SMS notification:', notification);
    },
    { connection }
); 