import { Worker, Job } from 'bullmq';
import { mainQueue } from '../queues/mainQueue.js';
import { emailQueue } from '../queues/emailQueue.js';
import { whatsappQueue } from '../queues/whatsappQueue.js';
import { pushQueue } from '../queues/pushQueue.js';
import { Notification, User } from '../models/index.js';
import axios from 'axios';
import { connection } from '../queues/redisConnection.js';
import { smsQueue } from '../queues/smsQueue.js';

interface NotificationJob {
    notification: Notification;
    channels?: string[];
    userPrefWebhook?: string;
    errorWebhook?: string;
    successWebhook?: string;
}

export const mainConsumer = new Worker<NotificationJob>(
    mainQueue.name,
    async (job: Job<NotificationJob>) => {
        const { notification, channels, userPrefWebhook, errorWebhook, successWebhook } = job.data;
        let resolvedChannels: string[] | undefined = channels;
        let error: string | null = null;

        // 1. Prioritize channels if provided
        if (!resolvedChannels || resolvedChannels.length === 0) {
            // 2. Otherwise, try to fetch from userPrefWebhook
            if (userPrefWebhook) {
                try {
                    const response = await axios.get(userPrefWebhook, { params: { userId: notification.userId } });
                    const user: User = response.data;
                    resolvedChannels = user.preferences.channels;
                } catch (err) {
                    error = 'Failed to fetch user preferences: ' + (err instanceof Error ? err.message : String(err));
                }
            } else {
                error = 'No channels or userPrefWebhook provided';
            }
        }

        // 3. Error handling
        if (error || !resolvedChannels || resolvedChannels.length === 0) {
            if (errorWebhook) {
                await axios.post(errorWebhook, { error, notification });
            } else if (successWebhook) {
                await axios.post(successWebhook, { notification });
            } else {
                console.error(error || 'No channels resolved');
            }
            return;
        }

        // 4. Dispatch notifications
        for (const channel of resolvedChannels) {
            if (channel === 'email') {
                await emailQueue.add('email', notification);
            } else if (channel === 'sms') {
                await smsQueue.add('sms', notification);
            } else if (channel === 'push') {
                await pushQueue.add('push', notification);
            } else if (channel === 'whatsapp') {
                await whatsappQueue.add('whatsapp', notification);
            }
        }

        // 5. Success callback
        if (successWebhook) {
            await axios.post(successWebhook, { notification, channels: resolvedChannels });
        }
    },
    { connection }
); 