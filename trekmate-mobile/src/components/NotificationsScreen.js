import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
    subscribeToUserNotifications,
    markAllAsRead,
    setUnreadCount,
} from '../utils/notificationStore';

const NOTIF_TYPE_CONFIG = {
    trek_submitted: { fallbackIcon: 'document-text', fallbackColor: '#F59E0B' },
    trek_accepted: { fallbackIcon: 'checkmark-circle', fallbackColor: '#10B981' },
    trek_approved: { fallbackIcon: 'trail-sign', fallbackColor: '#1C3D3E' },
    trek_rejected: { fallbackIcon: 'close-circle', fallbackColor: '#EF4444' },
    general: { fallbackIcon: 'notifications', fallbackColor: '#6366F1' },
};

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mark all as read when viewing
        markAllAsRead();

        const unsubscribe = subscribeToUserNotifications((notifs) => {
            setNotifications(notifs);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const getIconName = (item) => {
        const validIcons = [
            'heart', 'checkmark-circle', 'close-circle', 'trail-sign',
            'document-text', 'notifications', 'alert-circle', 'time',
            'map', 'navigate', 'person', 'star',
        ];
        if (item.icon && validIcons.includes(item.icon)) return item.icon;
        const config = NOTIF_TYPE_CONFIG[item.type];
        return config?.fallbackIcon || 'notifications';
    };

    const getColor = (item) => {
        if (item.color) return item.color;
        const config = NOTIF_TYPE_CONFIG[item.type];
        return config?.fallbackColor || '#1C3D3E';
    };

    const renderNotification = ({ item }) => {
        const iconName = getIconName(item);
        const color = getColor(item);
        const isUnread = !item.read;

        return (
            <TouchableOpacity
                style={[styles.notificationItem, isUnread && styles.unreadItem]}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={iconName} size={24} color={color} />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.notificationTitle, isUnread && styles.unreadTitle]}>
                            {item.title}
                        </Text>
                        {isUnread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    <Text style={styles.notificationTime}>{item.time}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={28} color="#1C3D3E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1C3D3E" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={80} color="#ddd" />
                            <Text style={styles.emptyText}>No notifications yet</Text>
                            <Text style={styles.emptySubtext}>
                                You'll receive notifications when treks are approved or updated.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        alignItems: 'center',
    },
    unreadItem: {
        backgroundColor: '#F0FDF4',
        borderLeftWidth: 3,
        borderLeftColor: '#10B981',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    notificationTitle: {
        fontSize: 15,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
        marginBottom: 4,
        flex: 1,
    },
    unreadTitle: {
        fontFamily: 'Syne-ExtraBold',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 13,
        fontFamily: 'Syne-Regular',
        color: '#666',
        marginBottom: 6,
        lineHeight: 18,
    },
    notificationTime: {
        fontSize: 12,
        fontFamily: 'Syne-Regular',
        color: '#999',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'Syne-Bold',
        color: '#999',
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 13,
        fontFamily: 'Syne-Regular',
        color: '#bbb',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
});

export default NotificationsScreen;
