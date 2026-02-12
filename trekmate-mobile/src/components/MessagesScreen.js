import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MessagesScreen = ({ navigation }) => {
    const [chats, setChats] = useState([
        {
            id: '1',
            name: 'Gaurav',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
            lastMessage: 'Are we still going to Everest Base Camp?',
            time: '2m ago',
            unread: 2,
            isOnline: true
        },
        {
            id: '2',
            name: 'Saurav',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
            lastMessage: 'I found a great guide for our trip!',
            time: '1h ago',
            unread: 0,
            isOnline: false
        },
        {
            id: '3',
            name: 'Anjali',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
            lastMessage: 'Can you send me the packing list?',
            time: 'Yesterday',
            unread: 0,
            isOnline: true
        }
    ]);

    const renderChatItem = ({ item }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('Chat', { chatUser: item })}
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                {item.isOnline ? <View style={styles.onlineIndicator} /> : null}
            </View>

            <View style={styles.chatInfo}>
                <View style={styles.chatHeaderRow}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <Text style={styles.chatTime}>{item.time}</Text>
                </View>
                <View style={styles.chatPreviewRow}>
                    <Text
                        style={[styles.previewText, item.unread > 0 ? styles.unreadText : null]}
                        numberOfLines={1}
                    >
                        {item.lastMessage}
                    </Text>
                    {item.unread > 0 ? (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{item.unread}</Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="create-outline" size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={24} color="#1C3D3E" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search messages..."
                        style={styles.searchInput}
                        placeholderTextColor="#999"
                    />
                </View>
            </View>

            {/* List */}
            <FlatList
                data={chats}
                renderItem={renderChatItem}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Syne-ExtraBold',
        color: '#1C3D3E',
        alignItems: 'center',
    },
    iconBtn: {
        padding: 4,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECECEC',
        borderRadius: 30,
        paddingHorizontal: 20,
        height: 60,
        borderWidth: 2,
        borderColor: '#1C3D3E',
    },
    searchIcon: {
        marginRight: 15,
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
        fontFamily: 'Syne-Regular',
        color: '#000',
    },
    listContent: {
        paddingHorizontal: 20,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#1C3D3E',
        borderWidth: 3,
        borderColor: 'white',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 16,
    },
    chatHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    chatName: {
        fontSize: 18,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
    },
    chatTime: {
        fontSize: 14,
        fontFamily: 'Syne-Regular',
        color: '#666',
    },
    chatPreviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    previewText: {
        fontSize: 15,
        fontFamily: 'Syne-Regular',
        color: '#666',
        flex: 1,
        marginRight: 8,
    },
    unreadText: {
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
    },
    unreadBadge: {
        backgroundColor: '#1C3D3E',
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    unreadBadgeText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Syne-Bold',
    },
});

export default MessagesScreen;
