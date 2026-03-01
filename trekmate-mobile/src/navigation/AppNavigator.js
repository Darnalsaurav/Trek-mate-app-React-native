import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

// Import Screens
import SplashScreen from '../components/SplashScreen';
import LoginScreen from '../components/LoginScreen';
import SignUpScreen from '../components/SignUpScreen';
import HomeScreen from '../components/HomeScreen';
import ExploreScreen from '../components/ExploreScreen';
import MessagesScreen from '../components/MessagesScreen';
import ProfileScreen from '../components/ProfileScreen';
import PlanTripScreen from '../components/PlanTripScreen';
import OnboardingScreen from '../components/OnboardingScreen';
import DestinationDetail from '../components/DestinationDetail';
import ChatScreen from '../components/ChatScreen';
import MapScreen from '../components/MapScreen';
import FloatingNavbar from '../components/FloatingNavbar';
import NotificationsScreen from '../components/NotificationsScreen';
import WeatherScreen from '../components/WeatherScreen';
import MyTripsScreen from '../components/MyTripsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for the main screens
function MainTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <FloatingNavbar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="ExploreTab" component={ExploreScreen} />
            <Tab.Screen name="PlanTrip" component={PlanTripScreen} />
            <Tab.Screen name="MessagesTab" component={MessagesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// Main Navigation
export default function AppNavigator() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Show splash for 6 seconds
        const splashTimer = setTimeout(() => {
            setShowSplash(false);
        }, 6000);

        // Listen to auth state
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => {
            clearTimeout(splashTimer);
            unsubscribe();
        };
    }, []);

    if (showSplash) {
        return <SplashScreen />;
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2ecc71" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                    fullScreenGestureEnabled: true,
                }}
            >
                {user ? (
                    // Authenticated Stack
                    <Stack.Group>
                        <Stack.Screen
                            name="MainTabs"
                            component={MainTabs}
                            options={{ gestureEnabled: false }}
                        />
                        <Stack.Screen
                            name="DestinationDetail"
                            component={DestinationDetail}
                            options={{ gestureEnabled: false }}
                        />
                        <Stack.Screen name="Chat" component={ChatScreen} />
                        <Stack.Screen name="Map" component={MapScreen} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} />
                        <Stack.Screen name="Weather" component={WeatherScreen} />
                        <Stack.Screen
                            name="MyTrips"
                            component={MyTripsScreen}
                            options={{ gestureEnabled: false }}
                        />
                    </Stack.Group>
                ) : (
                    // Unauthenticated Stack
                    <Stack.Group>
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}


