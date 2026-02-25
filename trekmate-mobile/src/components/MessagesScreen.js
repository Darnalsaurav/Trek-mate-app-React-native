import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const MessagesScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!auth.currentUser) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'users'),
            where('uid', '!=', auth.currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userList = snapshot.docs.map(doc => {
                const data = doc.data();
                const email = data.email || '';
                return {
                    id: doc.id,
                    ...data,
                    name: data.displayName || (email ? email.split('@')[0] : 'Unknown Trekker'),
                    email: email,
                    avatar: data.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                    lastMessage: 'Tap to start chatting!',
                    time: '',
                    unread: 0,
                };
            });
            setUsers(userList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredUsers = users.filter(user => {
        const name = user.name || '';
        const email = user.email || '';
        const queryVal = searchQuery.toLowerCase();
        return name.toLowerCase().includes(queryVal) || email.toLowerCase().includes(queryVal);
    });

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
                        {searchQuery ? item.email : item.lastMessage}
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

    if (!auth.currentUser) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontFamily: 'Syne-Regular', color: '#1C3D3E' }}>Please log in to see messages.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="create-outline" size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={24} color="#1C3D3E" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search messages..."
                        style={styles.searchInput}
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#1C3D3E" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderChatItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
                    ListEmptyComponent={() => (
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ fontFamily: 'Syne-Regular', color: '#666' }}>No users found</Text>
                        </View>
                    )}
                />
            )}
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
