import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { getChatId } from '../utils/chatUtils';

const ChatScreen = ({ route, navigation }) => {
    const { chatUser } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef(null);

    useEffect(() => {
        if (!chatUser || !auth.currentUser) return;

        const chatId = getChatId(auth.currentUser.uid, chatUser.id);
        if (!chatId) return;

        const q = query(
            collection(db, "messages"),
            where("chatId", "==", chatId),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
                };
            });
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [chatUser]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !auth.currentUser || !chatUser) return;

        const chatId = getChatId(auth.currentUser.uid, chatUser.id);
        const textToSend = newMessage;

        setNewMessage('');

        try {
            await addDoc(collection(db, "messages"), {
                text: textToSend,
                createdAt: serverTimestamp(),
                senderId: auth.currentUser.uid,
                receiverId: chatUser.id,
                chatId: chatId,
                senderName: auth.currentUser.displayName || 'Unknown'
            });
        } catch (error) {
            console.error("Error sending message:", error);
            setNewMessage(textToSend);
        }
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = item.senderId === auth.currentUser?.uid;
        return (
            <View style={[styles.messageRow, isMyMessage ? styles.sentRow : styles.receivedRow]}>
                <View style={[styles.messageBubble, isMyMessage ? styles.sentBubble : styles.receivedBubble]}>
                    <Text style={[styles.messageText, isMyMessage ? styles.sentText : styles.receivedText]}>
                        {item.text}
                    </Text>
                    <Text style={[styles.timestamp, isMyMessage ? styles.sentTimestamp : styles.receivedTimestamp]}>
                        {item.createdAt instanceof Date ? item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color="#374151" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Image
                            source={{ uri: chatUser.avatar || 'https://via.placeholder.com/40' }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.headerName}>{chatUser.name}</Text>
                            {chatUser.isOnline ? <Text style={styles.statusText}>Online</Text> : null}
                        </View>
                    </View>
                    <TouchableOpacity style={styles.moreBtn}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#1C3D3E" />
                    </TouchableOpacity>
                </View>

                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesContainer}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {/* Input Area */}
                <View style={styles.inputArea}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="image-outline" size={24} color="#6b7280" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline={true}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !newMessage.trim() ? styles.sendBtnDisabled : null]}
                        onPress={handleSendMessage}
                        disabled={!newMessage.trim()}
                    >
                        <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        backgroundColor: 'white',
    },
    backBtn: {
        padding: 4,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerName: {
        fontSize: 16,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Syne-Regular',
        color: '#1C3D3E',
        opacity: 0.7,
    },
    moreBtn: {
        padding: 4,
    },
    messagesContainer: {
        padding: 16,
        paddingBottom: 24,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 16,
        width: '100%',
    },
    sentRow: {
        justifyContent: 'flex-end',
    },
    receivedRow: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '75%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    sentBubble: {
        backgroundColor: '#1C3D3E',
        borderBottomRightRadius: 4,
    },
    receivedBubble: {
        backgroundColor: '#f3f4f6',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: 'Syne-Regular',
    },
    sentText: {
        color: 'white',
    },
    receivedText: {
        color: '#1C3D3E',
    },
    timestamp: {
        fontSize: 10,
        fontFamily: 'Syne-Regular',
        marginTop: 4,
    },
    sentTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'right',
    },
    receivedTimestamp: {
        color: '#9ca3af',
        textAlign: 'right',
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        backgroundColor: 'white',
    },
    iconBtn: {
        padding: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginHorizontal: 8,
        fontSize: 15,
        fontFamily: 'Syne-Regular',
        maxHeight: 100,
        color: '#1C3D3E',
    },
    sendBtn: {
        backgroundColor: '#1C3D3E',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1C3D3E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    sendBtnDisabled: {
        backgroundColor: '#9ca3af',
        elevation: 0,
    },
});

export default ChatScreen;
