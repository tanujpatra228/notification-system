import { Queue } from 'bullmq';
import { Notification } from '../models/index.js';
import { connection } from './redisConnection.js';

export const mainQueue = new Queue<Notification>('mainQueue', { connection }); 