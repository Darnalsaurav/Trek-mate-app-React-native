import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { setUnreadCount } from '../utils/notificationStore';

const NotificationsScreen = ({ navigation }) => {
    useEffect(() => {
        // Mark as read when screen is viewed
        setUnreadCount(0);
    }, []);

    const notifications = [
        {
            id: '1',
            title: 'Welcome to TrekMate family!',
            message: 'Start exploring beautiful destinations and finding trek mates.',
            time: 'Just now',
            icon: 'heart',
            color: '#FF6B6B',
        },
    ];

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
                <View style={{ width: 40 }} /> {/* Spacer for centering title */}
            </View>

            <FlatList
                data={notifications}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.notificationItem} activeOpacity={0.7}>
                        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                            <Ionicons name={item.icon} size={24} color={item.color} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.notificationTitle}>{item.title}</Text>
                            <Text style={styles.notificationMessage}>{item.message}</Text>
                            <Text style={styles.notificationTime}>{item.time}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={80} color="#ddd" />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
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
    listContent: {
        padding: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
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
    notificationTitle: {
        fontSize: 16,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        fontFamily: 'Syne-Regular',
        color: '#666',
        marginBottom: 6,
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
});

export default NotificationsScreen;
