import { Queue } from 'bullmq';
import { NotificationJob } from '../models/index.js';
import { connection } from './redisConnection.js';

export const mainQueue = new Queue<NotificationJob>('mainQueue', { connection }); 