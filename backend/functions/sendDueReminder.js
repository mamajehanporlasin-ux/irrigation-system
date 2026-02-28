import { Expo } from 'expo-server-sdk';
import Device from '../models/device.model.js';
import User from '../models/user.model.js';

const expo = new Expo();

export const sendDueReminders = async () => {
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const endOfDay = new Date().setHours(23, 59, 59, 999);

    try {
        const devices = await Device.find({
            $or: [
                { field1CropAlertDate: { $gte: startOfDay, $lte: endOfDay } },
                { field2CropAlertDate: { $gte: startOfDay, $lte: endOfDay } }
            ]
        }).populate('owner');

        if (devices.length === 0){
            console.log("No Devices with alerts for today.");
            return
        }  

        let messages = [];
        for (let device of devices) {
            const token = device.owner?.expoPushNotificationToken;

            if (!Expo.isExpoPushToken(token)) {
                console.error(`Invalid token for user: ${device.owner?.emailAddress}`);
                continue;
            }

            messages.push({
                to: token,
                sound: 'default',
                title: 'Smart Rice Paddies',
                body: `One Paddy of the Device: ${device.deviceID} is in due for today`,
                data: { deviceID: device.deviceID },
                priority: 'high'
            });
        }

        let chunks = expo.chunkPushNotifications(messages);
        for (let chunk of chunks) {
            try {
                let tickets = await expo.sendPushNotificationsAsync(chunk);
                console.log("Notifications sent. Tickets:", tickets);
            } catch (error) {
                console.error("Error sending chunk:", error);
            }
        }
    } catch (err) {
        console.error("Database or Network Error:", err);
    }
};