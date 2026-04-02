import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { db, auth } from '../config/firebase';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    where,
    serverTimestamp,
    doc,
    updateDoc,
    getDocs,
    writeBatch,
} from 'firebase/firestore';

// ─── In-memory listeners for badge count ───────────────────────────────────
let unreadCount = 0;
let listeners = [];

export const getUnreadCount = () => unreadCount;

export const setUnreadCount = (count) => {
    unreadCount = count;
    listeners.forEach(listener => listener(unreadCount));
};

export const subscribeToNotifications = (listener) => {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
};

// ─── Expo Push Notification Setup ──────────────────────────────────────────

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Register for push notifications and return the Expo push token.
 * Saves the token to Firestore under the user's document.
 */
export async function registerForPushNotifications() {
    let token = null;

    // Push notifications only work on physical devices
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
    }

    // Get Expo push token
    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId
            ?? Constants.easConfig?.projectId;

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
        });
        token = tokenData.data;
        console.log('📱 Push token:', token);
    } catch (error) {
        console.log('Error getting push token:', error);
        // Fallback: try without projectId for Expo Go
        try {
            const tokenData = await Notifications.getExpoPushTokenAsync();
            token = tokenData.data;
            console.log('📱 Push token (fallback):', token);
        } catch (fallbackError) {
            console.log('Push token fallback also failed:', fallbackError);
        }
    }

    // Android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('trek-updates', {
            name: 'Trek Updates',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#1C3D3E',
            sound: 'default',
        });
    }

    // Save token to Firestore for the current user
    if (token && auth.currentUser) {
        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                pushToken: token,
                tokenUpdatedAt: serverTimestamp(),
            });
        } catch (error) {
            // If user doc doesn't exist yet, we'll catch this silently
            console.log('Could not save push token to Firestore:', error.message);
        }
    }

    return token;
}

// ─── Send Local Push Notification ──────────────────────────────────────────

/**
 * Send a local push notification to the device immediately.
 */
export async function sendLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: 'default',
        },
        trigger: null, // null = send immediately
    });
}

// ─── Firestore In-App Notifications ────────────────────────────────────────

/**
 * Create a notification for a specific user in Firestore.
 */
export const createNotification = async (userId, notification) => {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            title: notification.title,
            message: notification.message,
            icon: notification.icon || 'notifications',
            color: notification.color || '#1C3D3E',
            read: false,
            trekId: notification.trekId || null,
            trekName: notification.trekName || null,
            type: notification.type || 'general',
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

/**
 * Create a notification for ALL users (broadcast).
 * Used when a trek is accepted and everyone should know.
 */
export const broadcastNotification = async (notification) => {
    try {
        // Get all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const batch = writeBatch(db);

        usersSnapshot.docs.forEach((userDoc) => {
            const notifRef = doc(collection(db, 'notifications'));
            batch.set(notifRef, {
                userId: userDoc.id,
                title: notification.title,
                message: notification.message,
                icon: notification.icon || 'trail-sign',
                color: notification.color || '#10B981',
                read: false,
                trekId: notification.trekId || null,
                trekName: notification.trekName || null,
                type: notification.type || 'trek_approved',
                createdAt: serverTimestamp(),
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error broadcasting notification:', error);
    }
};

/**
 * Send push notification to all users with push tokens.
 * Uses Expo's push notification service.
 */
export const sendPushToAllUsers = async (title, body, data = {}) => {
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const pushTokens = [];

        usersSnapshot.docs.forEach((userDoc) => {
            const userData = userDoc.data();
            if (userData.pushToken && userDoc.id !== auth.currentUser?.uid) {
                pushTokens.push(userData.pushToken);
            }
        });

        if (pushTokens.length === 0) return;

        // Send via Expo push notification service
        const messages = pushTokens.map(token => ({
            to: token,
            sound: 'default',
            title,
            body,
            data,
        }));

        // Batch send (Expo allows up to 100 per request)
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });

        console.log(`📤 Sent push to ${pushTokens.length} devices`);
    } catch (error) {
        console.error('Error sending push notifications:', error);
    }
};

/**
 * Subscribe to current user's in-app notifications from Firestore.
 */
export const subscribeToUserNotifications = (callback) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        callback([]);
        return () => {};
    }

    const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            time: formatTime(doc.data().createdAt),
        }));

        // Update unread count
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);

        callback(notifs);
    });
};

/**
 * Mark all notifications as read for the current user.
 */
export const markAllAsRead = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const snapshot = await getDocs(q);
        const batch = writeBatch(db);

        snapshot.docs.forEach((docSnap) => {
            batch.update(docSnap.ref, { read: true });
        });

        await batch.commit();
        setUnreadCount(0);
    } catch (error) {
        console.error('Error marking notifications as read:', error);
    }
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatTime(timestamp) {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
