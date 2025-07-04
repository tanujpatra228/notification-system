import { Router, Request, Response } from 'express';
import { mainQueue } from '../queues/mainQueue.js';
import { Notification } from '../models/index.js';

const router = Router();

router.post('/notify', async (req: Request, res: Response) => {
    // In a real app, validate and parse req.body properly
    const notification: Notification = req.body.notification;
    try {
        await mainQueue.add('notification', notification);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router; 