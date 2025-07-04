import { Worker, Job } from 'bullmq';
import { mainQueue } from '../queues/mainQueue.js';
import { emailQueue } from '../queues/emailQueue.js';
import { whatsappQueue } from '../queues/whatsappQueue.js';
import { pushQueue } from '../queues/pushQueue.js';
import { Notification, User } from '../models/index.js';
import axios from 'axios';
import { connection } from '../queues/redisConnection.js';

const USER_PREF_WEBHOOK = 'http://localhost:4000/user-preferences'; // Placeholder

export const mainConsumer = new Worker<Notification>(
    mainQueue.name,
    async (job: Job<Notification>) => {
        const notification = job.data;
        // Fetch user preferences from webhook
        let user: User;
        try {
            // const response = await axios.get(`${USER_PREF_WEBHOOK}?userId=${notification.userId}`);
            // user = response.data;
            user = {
                id: notification.userId,
                name: 'Test User',
                email: 'test@example.com',
                preferences: {
                    channels: ['email'],
                    doNotDisturb: false
                }
            };
        } catch (err) {
            console.error('Failed to fetch user preferences:', err);
            throw err;
        }
        // Decide channel(s) based on preferences
        for (const channel of user.preferences.channels) {
            if (channel === 'email') {
                await emailQueue.add('email', notification);
            } else if (channel === 'sms') {
                // TODO: Implement SMS queue/consumer. Using whatsappQueue as placeholder.
                await whatsappQueue.add('sms', notification);
            } else if (channel === 'push') {
                await pushQueue.add('push', notification);
            }
        }
    },
    { connection }
); 