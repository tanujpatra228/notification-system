export interface User {
    id: string;
    name: string;
    email: string;
    phone: string; // Added for SMS notifications
    preferences: NotificationPreferences;
}

export interface NotificationPreferences {
    channels: NotificationChannel[];
    doNotDisturb?: boolean;
    // Add more preference fields as needed
}

export type NotificationChannel = 'email' | 'sms' | 'push'; 