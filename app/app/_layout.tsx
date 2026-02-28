import { Stack } from 'expo-router';
import './global.css';
import { StatusBar } from "expo-status-bar";
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext'; 

import * as Notifications from "expo-notifications";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <StatusBar hidden={true} />
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="SignupScreen" />
            <Stack.Screen name="OTPRequestScreen" />
            <Stack.Screen name="OTPPasswordResetScreen" />
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        </Stack>
        </NotificationProvider>
    <Toast />
    </AuthProvider>
  );
}
