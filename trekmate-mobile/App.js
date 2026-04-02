import React, { useCallback, useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import {
  Syne_400Regular,
  Syne_500Medium,
  Syne_600SemiBold,
  Syne_700Bold,
  Syne_800ExtraBold
} from '@expo-google-fonts/syne';
import AppNavigator from './src/navigation/AppNavigator';
import { View } from 'react-native';
import { registerForPushNotifications, subscribeToUserNotifications } from './src/utils/notificationStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          Syne_400Regular,
          Syne_500Medium,
          Syne_600SemiBold,
          Syne_700Bold,
          Syne_800ExtraBold,
          'Syne-Regular': Syne_400Regular,
          'Syne-Medium': Syne_500Medium,
          'Syne-Bold': Syne_700Bold,
          'Syne-ExtraBold': Syne_800ExtraBold,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Register push notifications when user logs in and handle global notifications
  useEffect(() => {
    let unsubNotifs = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        registerForPushNotifications();
        
        // Global listener for notifications to update unread count
        if (unsubNotifs) unsubNotifs();
        unsubNotifs = subscribeToUserNotifications(() => {
          // Success callback — we don't need the data for anything
          // global, it automatically updates setUnreadCount.
        });
      } else {
        if (unsubNotifs) unsubNotifs();
      }
    });

    // Listen for incoming notifications while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification.request.content.title);
    });

    // Listen for user tapping on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response.notification.request.content.data);
    });

    return () => {
      unsubAuth();
      if (unsubNotifs) unsubNotifs();
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar style="dark" />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

