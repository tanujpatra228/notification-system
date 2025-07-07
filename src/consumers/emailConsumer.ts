import { Worker, Job } from 'bullmq';
import { emailQueue } from '../queues/emailQueue.js';
import { Notification, User } from '../models/index.js';
import { connection } from '../queues/redisConnection.js';
import { OutlookProvider } from '../providers/OutlookProvider.js';

const outlookProvider = new OutlookProvider();

// --- Rate Limiting and Debounce Logic ---
const EMAILS_PER_MINUTE = 30; // Conservative for Outlook SMTP
const EMAILS_PER_DAY = 2000; // Outlook external recipient limit
let sentThisMinute = 0;
let sentThisDay = 0;
let minuteWindowStart = Date.now();
let dayWindowStart = Date.now();
const emailSendQueue: Array<() => void> = [];

function processEmailQueue() {
    const now = Date.now();
    // Reset minute window
    if (now - minuteWindowStart > 60 * 1000) {
        sentThisMinute = 0;
        minuteWindowStart = now;
    }
    // Reset day window
    if (now - dayWindowStart > 24 * 60 * 60 * 1000) {
        sentThisDay = 0;
        dayWindowStart = now;
    }
    while (sentThisMinute < EMAILS_PER_MINUTE && sentThisDay < EMAILS_PER_DAY && emailSendQueue.length > 0) {
        const sendFn = emailSendQueue.shift();
        if (sendFn) {
            sentThisMinute++;
            sentThisDay++;
            sendFn();
        }
    }
    setTimeout(processEmailQueue, 1000); // Check every second
}
processEmailQueue();

export const emailConsumer = new Worker<Notification>(
    emailQueue.name,
    async (job: Job<Notification>) => {
        const notification = job.data;
        const user: User | undefined = (notification as any).user;
        if (!user) {
            console.error('No user data provided in notification');
            return;
        }
        // Debounce/throttle: push to queue
        await new Promise<void>(resolve => {
            emailSendQueue.push(async () => {
                await outlookProvider.sendNotification(notification, user);
                resolve();
            });
        });
    },
    { connection }
); 