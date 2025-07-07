import { Worker, Job } from 'bullmq';
import { whatsappQueue } from '../queues/whatsappQueue.js';
import { Notification, User } from '../models/index.js';
import { connection } from '../queues/redisConnection.js';

export const whatsappConsumer = new Worker<Notification>(
    whatsappQueue.name,
    async (job: Job<Notification>) => {
        const notification = job.data;
        // Expect user data to be present in notification.user
        const user: User | undefined = (notification as any).user;
        if (!user) {
            console.error('No user data provided in notification');
            return;
        }
        // TODO: Replace with actual WhatsApp/SMS provider logic
        console.log('WhatsAppConsumer: Sending WhatsApp/SMS notification to', user, ':', notification);
    },
    { connection }
); 