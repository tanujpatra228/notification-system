import { Provider } from '../models/Provider.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import nodemailer from 'nodemailer';

const outlookUser = process.env.OUTLOOK_USER_EMAIL;
const outlookPass = process.env.OUTLOOK_USER_PASS;
const outlookHost = process.env.OUTLOOK_HOST;
const outlookPort = process.env.OUTLOOK_PORT ? parseInt(process.env.OUTLOOK_PORT) : 587;

if (!outlookUser || !outlookPass || !outlookHost || !outlookPort) {
    console.error('Missing required Outlook environment variables:', {
        outlookUser: !!outlookUser,
        outlookPass: !!outlookPass,
        outlookHost: !!outlookHost,
        outlookPort: !!outlookPort
    });
    throw new Error('Missing required Outlook environment variables');
}

const transporter = nodemailer.createTransport({
    host: outlookHost,
    port: outlookPort,
    secure: outlookPort === 465, // true for 465, false for other ports
    auth: {
        user: outlookUser,
        pass: outlookPass
    }
});

export class OutlookProvider implements Provider {
    name = 'email';

    async sendNotification(notification: Notification, user: User): Promise<boolean> {
        if (!user.email) {
            console.error('User does not have an email address');
            return false;
        }
        try {
            const subject = (notification as any).subject || 'Notification';
            const info = await transporter.sendMail({
                from: outlookUser,
                to: user.email,
                subject,
                text: notification.message
            });
            console.log('OutlookProvider: Email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('OutlookProvider: Failed to send email:', error);
            return false;
        }
    }
} 