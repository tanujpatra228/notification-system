import { Queue } from 'bullmq';
import { connection } from './redisConnection.js';

export const smsQueue = new Queue('sms', { connection }); 