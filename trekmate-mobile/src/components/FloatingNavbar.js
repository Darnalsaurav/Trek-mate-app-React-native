import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FloatingNavbar = ({ state, navigation }) => {
    // Get the current active route name from the navigator state
    const activeRouteName = state?.routes[state.index]?.name || 'Home';

    // Animation value for tab switching
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [keyboardVisible, setKeyboardVisible] = React.useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        // Trigger a subtle fade-in when the active route changes
        fadeAnim.setValue(0.6);
        Animated.spring(fadeAnim, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, [activeRouteName]);

    if (keyboardVisible) return null;

    const tabs = [
        { name: 'Home', icon: 'home', iconOutline: 'home-outline' },
        { name: 'ExploreTab', icon: 'compass', iconOutline: 'compass-outline' },
        { name: 'PlanTrip', icon: 'add', iconOutline: 'add' },
        { name: 'MessagesTab', icon: 'chatbubble', iconOutline: 'chatbubble-outline' },
        { name: 'Profile', icon: 'person', iconOutline: 'person-outline' },
    ];

    const handlePress = (routeName) => {
        const event = navigation.emit({
            type: 'tabPress',
            target: routeName,
            canPreventDefault: true,
        });

        if (!event.defaultPrevented) {
            navigation.navigate(routeName);
        }
    };

    return (
        <View style={styles.floatingNavContainer}>
            <Animated.View style={[styles.floatingNav, { opacity: fadeAnim }]}>
                {tabs.map((tab) => {
                    const isActive = activeRouteName === tab.name;
                    // Scale animation for the "hover" effect
                    const scaleValue = useRef(new Animated.Value(isActive ? 1.2 : 1)).current;

                    useEffect(() => {
                        Animated.spring(scaleValue, {
                            toValue: isActive ? 1.2 : 1,
                            friction: 4,
                            useNativeDriver: true,
                        }).start();
                    }, [isActive]);

                    return (
                        <TouchableOpacity
                            key={tab.name}
                            style={styles.navItem}
                            activeOpacity={0.8}
                            onPress={() => handlePress(tab.name)}
                        >
                            <Animated.View style={{ transform: [{ scale: scaleValue }], alignItems: 'center' }}>
                                <Ionicons
                                    name={isActive ? tab.icon : tab.iconOutline}
                                    size={28}
                                    color={isActive ? '#fff' : 'rgba(255,255,255,0.45)'}
                                />
                                {isActive && <View style={styles.activeDot} />}
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    floatingNavContainer: {
        position: 'absolute',
        bottom: 35, // Consistent bottom offset
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 25,
        zIndex: 1000, // Ensure it's always on top
    },
    floatingNav: {
        flexDirection: 'row',
        backgroundColor: '#1C3D3E',
        borderRadius: 35,
        height: 75,
        width: '100%',
        maxWidth: 400, // Handle larger screens
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 15,
        shadowColor: '#1C3D3E',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 12,
    },
    navItem: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#fff',
        marginTop: 4,
    },
});


export default FloatingNavbar;


