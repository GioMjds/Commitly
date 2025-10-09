import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useEffect, useRef, useState } from "react";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const useNotifications = () => {
    const [expoPushToken, setExpoPushToken] = useState<string>("");
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    useEffect(() => {
        registerForPushNotificationsAsync().then((token) =>
            setExpoPushToken(token || "")
        );

        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                console.log("Notification received:", notification);
            });

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener((response) => {
                console.log("Notification response:", response);
            });

        return () => {
            Notifications.removeNotificationSubscription(
                notificationListener.current
            );
            Notifications.removeNotificationSubscription(
                responseListener.current
            );
        };
    }, []);

    return {
        expoPushToken,
        sendLocalNotification: async (title: string, body: string) => {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: { data: "goes here" },
                },
                trigger: { seconds: 1 },
            });
        },
    };
};

async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
        console.log("Must use physical device for Push Notifications");
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return null;
    }

    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        
        if (!projectId) {
            console.log("Project ID not found");
            return null;
        }

        const token = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#7C3AED",
            });
        }

        return token.data;
    } catch (error) {
        console.error("Error getting push token:", error);
        return null;
    }
}