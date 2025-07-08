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
        let user: User | undefined = (notification as any).user;
        let resolvedChannels: string[] | undefined = user?.preferences?.channels || channels;
        let error: string | null = null;

        // 1. Prioritize channels if provided
        if (!resolvedChannels || resolvedChannels.length === 0) {
            // 2. Otherwise, try to fetch from userPrefWebhook
            if (userPrefWebhook) {
                try {
                    const response = await axios.get(userPrefWebhook, { params: { userId: notification.userId } });
                    user = response.data;
                    resolvedChannels = user?.preferences?.channels;
                } catch (err) {
                    error = 'Failed to fetch user preferences: ' + (err instanceof Error ? err.message : String(err));
                }
            } else {
                error = 'No channels or userPrefWebhook provided';
            }
        }

        // 2. Check doNotDisturb before dispatching
        if (user && user.preferences && user.preferences.doNotDisturb) {
            const errorMsg = `User ${user.id} has Do Not Disturb enabled. Skipping notification.`;
            console.log(errorMsg);
            if (errorWebhook) {
                await axios.post(errorWebhook, { error: errorMsg, notification });
            }
            return;
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
        const queuedChannels: string[] = [];
        for (const channel of resolvedChannels) {
            switch (channel) {
                case 'email':
                    await emailQueue.add('email', notification);
                    queuedChannels.push('email');
                    break;
                case 'sms':
                    await smsQueue.add('sms', notification);
                    queuedChannels.push('sms');
                    break;
                case 'push':
                    await pushQueue.add('push', notification);
                    queuedChannels.push('push');
                    break;
                case 'whatsapp':
                    await whatsappQueue.add('whatsapp', notification);
                    queuedChannels.push('whatsapp');
                    break;
                // Optionally, handle unknown channels here
                default:
                    // You may want to log or handle unsupported channels
                    break;
            }
        }

        // 5. Success callback
        if (successWebhook) {
            await axios.post(successWebhook, { notification, channels: resolvedChannels });
        }
    },
    { connection }
); 