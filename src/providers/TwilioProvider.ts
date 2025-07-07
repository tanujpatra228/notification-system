import { Provider } from '../models/Provider.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromPhone) {
    console.error('Missing required Twilio environment variables:', {
        accountSid: !!accountSid,
        authToken: !!authToken,
        fromPhone: !!fromPhone
    });
    throw new Error('Missing required Twilio environment variables');
}

const client = twilio(accountSid, authToken);

export class TwilioProvider implements Provider {
    name = 'sms';

    async sendNotification(notification: Notification, user: User): Promise<boolean> {
        if (!user.phone) {
            console.error('User does not have a phone number');
            return false;
        }
        try {
            await client.messages.create({
                body: notification.message,
                from: fromPhone,
                to: user.phone
            });
            return true;
        } catch (error) {
            console.error('Twilio SMS send error:', error);
            return false;
        }
    }
} 