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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Modal, FlatList as RNFlatList } from 'react-native';
import { db, auth } from '../config/firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    where,
    doc,
    getDoc,
    updateDoc
} from 'firebase/firestore';
import { getChatId } from '../utils/chatUtils';

const ChatScreen = ({ route, navigation }) => {
    const { chatUser } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showMembers, setShowMembers] = useState(false);
    const [groupMembers, setGroupMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        if (!chatUser || !auth.currentUser) return;

        const chatId = chatUser.isGroup ? chatUser.id : getChatId(auth.currentUser.uid, chatUser.id);
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

    const fetchMembers = async () => {
        if (!chatUser.isGroup) return;
        setLoadingMembers(true);
        setShowMembers(true);

        try {
            const groupRef = doc(db, 'groups', chatUser.id);
            const groupSnap = await getDoc(groupRef);

            if (groupSnap.exists()) {
                const memberUids = groupSnap.data().members || [];
                const memberData = [];

                // Fetch profiles for all UIDs
                for (const uid of memberUids) {
                    const userSnap = await getDoc(doc(db, 'users', uid));
                    if (userSnap.exists()) {
                        memberData.push({ id: uid, ...userSnap.data() });
                    }
                }
                setGroupMembers(memberData);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !auth.currentUser || !chatUser) return;

        const chatId = chatUser.isGroup ? chatUser.id : getChatId(auth.currentUser.uid, chatUser.id);
        const textToSend = newMessage;

        setNewMessage('');

        try {
            await addDoc(collection(db, "messages"), {
                text: textToSend,
                createdAt: serverTimestamp(),
                senderId: auth.currentUser.uid,
                receiverId: chatUser.id,
                chatId: chatId,
                senderName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Unknown'
            });

            // Update group/chat room metadata
            if (chatUser.isGroup) {
                const groupRef = doc(db, 'groups', chatId);
                await updateDoc(groupRef, {
                    lastMessage: textToSend,
                    lastMessageTime: serverTimestamp()
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setNewMessage(textToSend);
        }
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = item.senderId === auth.currentUser?.uid;
        return (
            <View style={[styles.messageRow, isMyMessage ? styles.sentRow : styles.receivedRow]}>
                <View style={[styles.messageContent, isMyMessage ? styles.sentContent : styles.receivedContent]}>
                    {!isMyMessage && chatUser.isGroup && (
                        <Text style={styles.senderLabel}>{item.senderName}</Text>
                    )}
                    <View style={[styles.messageBubble, isMyMessage ? styles.sentBubble : styles.receivedBubble]}>
                        <Text style={[styles.messageText, isMyMessage ? styles.sentText : styles.receivedText]}>
                            {item.text}
                        </Text>
                        <Text style={[styles.timestamp, isMyMessage ? styles.sentTimestamp : styles.receivedTimestamp]}>
                            {item.createdAt instanceof Date ? item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </Text>
                    </View>
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
                    <TouchableOpacity
                        style={styles.headerInfo}
                        onPress={fetchMembers}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={{ uri: chatUser.avatar || 'https://via.placeholder.com/40' }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.headerName}>{chatUser.name}</Text>
                            <Text style={styles.statusText}>Tap to see members</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.moreBtn} onPress={fetchMembers}>
                        <Ionicons name="people-outline" size={24} color="#1C3D3E" />
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

                {/* Members Modal */}
                <Modal
                    visible={showMembers}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowMembers(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Trekkers Joined</Text>
                                <TouchableOpacity onPress={() => setShowMembers(false)}>
                                    <Ionicons name="close" size={24} color="#1C3D3E" />
                                </TouchableOpacity>
                            </View>

                            {loadingMembers ? (
                                <View style={styles.loadingContainer}>
                                    <Text style={styles.loadingText}>Fetching trekkers...</Text>
                                </View>
                            ) : (
                                <RNFlatList
                                    data={groupMembers}
                                    keyExtractor={item => item.id}
                                    renderItem={({ item }) => (
                                        <View style={styles.memberItem}>
                                            <Image
                                                source={{ uri: item.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                                                style={styles.memberAvatar}
                                            />
                                            <View>
                                                <Text style={styles.memberName}>{item.displayName || item.email?.split('@')[0] || 'Trekker'}</Text>
                                                <Text style={styles.memberEmail}>{item.email}</Text>
                                            </View>
                                        </View>
                                    )}
                                    ListEmptyComponent={() => (
                                        <Text style={styles.emptyText}>Only you have joined yet.</Text>
                                    )}
                                    contentContainerStyle={styles.memberList}
                                />
                            )}
                        </View>
                    </View>
                </Modal>
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
    messageContent: {
        maxWidth: '75%',
    },
    sentContent: {
        alignItems: 'flex-end',
    },
    receivedContent: {
        alignItems: 'flex-start',
    },
    messageBubble: {
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
    senderLabel: {
        fontSize: 10,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
        marginBottom: 2,
        marginLeft: 4,
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '70%',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
    },
    memberList: {
        paddingBottom: 20,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    memberName: {
        fontSize: 16,
        fontFamily: 'Syne-Bold',
        color: '#111827',
    },
    memberEmail: {
        fontSize: 12,
        fontFamily: 'Syne-Regular',
        color: '#6b7280',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: 'Syne-Regular',
        color: '#1C3D3E',
    },
    emptyText: {
        textAlign: 'center',
        fontFamily: 'Syne-Regular',
        color: '#666',
        marginTop: 20,
    },
});

export default ChatScreen;
