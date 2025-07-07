import { Router, Request, Response } from 'express';
import { mainQueue } from '../queues/mainQueue.js';
import { Notification, NotificationJob } from '../models/index.js';

const router = Router();

router.post('/notify', async (req: Request, res: Response) => {
    // In a real app, validate and parse req.body properly
    const job: NotificationJob = req.body;
    try {
        await mainQueue.add('notification', job);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router; 