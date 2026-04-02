import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    Modal,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebase';
import { isAdminUser, TREK_STATUS } from '../config/admin';
import {
    subscribeToPendingTreks,
    subscribeToAllTreks,
    acceptTrek,
    rejectTrek,
} from '../utils/destinationStore';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
    [TREK_STATUS.PENDING]: {
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        icon: 'time-outline',
        label: 'Pending',
    },
    [TREK_STATUS.ACCEPTED]: {
        color: '#10B981',
        bgColor: '#D1FAE5',
        icon: 'checkmark-circle-outline',
        label: 'Accepted',
    },
    [TREK_STATUS.REJECTED]: {
        color: '#EF4444',
        bgColor: '#FEE2E2',
        icon: 'close-circle-outline',
        label: 'Rejected',
    },
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG[TREK_STATUS.PENDING];
    return (
        <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon} size={14} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
    );
};

const AdminDashboard = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingTreks, setPendingTreks] = useState([]);
    const [allTreks, setAllTreks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedTrek, setSelectedTrek] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0));

    // Security check — redirect if not admin
    useEffect(() => {
        if (!isAdminUser(auth.currentUser)) {
            Alert.alert('Access Denied', 'You do not have permission to access this page.');
            navigation.goBack();
        }
    }, []);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        const unsub1 = subscribeToPendingTreks((data) => {
            setPendingTreks(data);
            setLoading(false);
        });
        const unsub2 = subscribeToAllTreks((data) => {
            setAllTreks(data);
        });
        return () => {
            unsub1();
            unsub2();
        };
    }, []);

    const handleAccept = async (trek) => {
        Alert.alert(
            'Accept Trek',
            `Are you sure you want to approve "${trek.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept',
                    style: 'default',
                    onPress: async () => {
                        setActionLoading(trek.id);
                        try {
                            await acceptTrek(trek.id, trek.linkedDestinationId);
                            Alert.alert('✅ Accepted', `"${trek.name}" is now live and visible to all users.`);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to accept trek.');
                        } finally {
                            setActionLoading(null);
                        }
                    },
                },
            ]
        );
    };

    const openRejectModal = (trek) => {
        setSelectedTrek(trek);
        setRejectionReason('');
        setRejectModalVisible(true);
    };

    const handleReject = async () => {
        if (!selectedTrek) return;
        setActionLoading(selectedTrek.id);
        setRejectModalVisible(false);
        try {
            await rejectTrek(selectedTrek.id, selectedTrek.linkedDestinationId, rejectionReason);
            Alert.alert('❌ Rejected', `"${selectedTrek.name}" has been rejected.`);
        } catch (error) {
            Alert.alert('Error', 'Failed to reject trek.');
        } finally {
            setActionLoading(null);
            setSelectedTrek(null);
            setRejectionReason('');
        }
    };

    const displayTreks = activeTab === 'pending'
        ? pendingTreks
        : activeTab === 'accepted'
            ? allTreks.filter(t => t.approvalStatus === TREK_STATUS.ACCEPTED)
            : activeTab === 'rejected'
                ? allTreks.filter(t => t.approvalStatus === TREK_STATUS.REJECTED)
                : allTreks;

    const pendingCount = pendingTreks.length;
    const acceptedCount = allTreks.filter(t => t.approvalStatus === TREK_STATUS.ACCEPTED).length;
    const rejectedCount = allTreks.filter(t => t.approvalStatus === TREK_STATUS.REJECTED).length;

    const renderTrekCard = (trek) => {
        const isProcessing = actionLoading === trek.id;
        const isPending = trek.approvalStatus === TREK_STATUS.PENDING;

        return (
            <Animated.View key={trek.id} style={[styles.trekCard, { opacity: fadeAnim }]}>
                {/* Trek Image */}
                <View style={styles.cardImageContainer}>
                    <Image
                        source={{ uri: trek.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' }}
                        style={styles.cardImage}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.cardGradient}
                    />
                    <StatusBadge status={trek.approvalStatus} />
                </View>

                {/* Trek Info */}
                <View style={styles.cardContent}>
                    <Text style={styles.trekName}>{trek.name}</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        <Text style={styles.infoText}>{trek.location}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={14} color="#666" />
                        <Text style={styles.infoText}>
                            {trek.createdByName || 'Unknown User'}
                        </Text>
                    </View>
                    {trek.startDate && (
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={14} color="#666" />
                            <Text style={styles.infoText}>
                                {trek.startDate} → {trek.endDate}
                            </Text>
                        </View>
                    )}

                    {/* Rejection reason (if rejected) */}
                    {trek.approvalStatus === TREK_STATUS.REJECTED && trek.rejectionReason && (
                        <View style={styles.rejectionBox}>
                            <Ionicons name="alert-circle" size={14} color="#EF4444" />
                            <Text style={styles.rejectionText}>{trek.rejectionReason}</Text>
                        </View>
                    )}

                    {/* Action Buttons (only for pending) */}
                    {isPending && (
                        <View style={styles.actionRow}>
                            {isProcessing ? (
                                <ActivityIndicator size="small" color="#1C3D3E" />
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={styles.acceptBtn}
                                        onPress={() => handleAccept(trek)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                                        <Text style={styles.acceptBtnText}>Accept</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.rejectBtn}
                                        onPress={() => openRejectModal(trek)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="close-circle" size={18} color="#EF4444" />
                                        <Text style={styles.rejectBtnText}>Reject</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                </View>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#1C3D3E" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>ADMIN PANEL</Text>
                    <Text style={styles.headerSubtitle}>Trek Approvals</Text>
                </View>
                <View style={styles.adminBadge}>
                    <Ionicons name="shield-checkmark" size={22} color="#10B981" />
                </View>
            </View>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <View style={[styles.statPill, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.statCount, { color: '#F59E0B' }]}>{pendingCount}</Text>
                    <Text style={[styles.statLabel, { color: '#B45309' }]}>Pending</Text>
                </View>
                <View style={[styles.statPill, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.statCount, { color: '#10B981' }]}>{acceptedCount}</Text>
                    <Text style={[styles.statLabel, { color: '#047857' }]}>Accepted</Text>
                </View>
                <View style={[styles.statPill, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.statCount, { color: '#EF4444' }]}>{rejectedCount}</Text>
                    <Text style={[styles.statLabel, { color: '#B91C1C' }]}>Rejected</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                {[
                    { key: 'pending', label: 'Pending', count: pendingCount },
                    { key: 'accepted', label: 'Accepted', count: acceptedCount },
                    { key: 'rejected', label: 'Rejected', count: rejectedCount },
                    { key: 'all', label: 'All', count: allTreks.length },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                        {tab.count > 0 && (
                            <View style={[
                                styles.tabBadge,
                                activeTab === tab.key && styles.activeTabBadge,
                            ]}>
                                <Text style={[
                                    styles.tabBadgeText,
                                    activeTab === tab.key && styles.activeTabBadgeText,
                                ]}>
                                    {tab.count}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#1C3D3E" />
                    <Text style={styles.loadingText}>Loading treks...</Text>
                </View>
            ) : displayTreks.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons
                        name={activeTab === 'pending' ? 'checkmark-done-circle-outline' : 'document-outline'}
                        size={60}
                        color="#ccc"
                    />
                    <Text style={styles.emptyTitle}>
                        {activeTab === 'pending' ? 'All caught up!' : `No ${activeTab} treks`}
                    </Text>
                    <Text style={styles.emptySubtext}>
                        {activeTab === 'pending'
                            ? 'There are no treks waiting for review.'
                            : `No treks with "${activeTab}" status found.`}
                    </Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {displayTreks.map(renderTrekCard)}
                </ScrollView>
            )}

            {/* Rejection Modal */}
            <Modal
                visible={rejectModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setRejectModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconCircle}>
                                <Ionicons name="alert-circle" size={30} color="#EF4444" />
                            </View>
                            <Text style={styles.modalTitle}>Reject Trek</Text>
                            <Text style={styles.modalSubtitle}>
                                {selectedTrek?.name}
                            </Text>
                        </View>

                        <Text style={styles.modalLabel}>Rejection Reason / Feedback</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            placeholder="E.g. Trek route is unsafe during monsoon, missing information..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setRejectModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalRejectBtn}
                                onPress={handleReject}
                            >
                                <Ionicons name="close-circle" size={18} color="#fff" />
                                <Text style={styles.modalRejectText}>Reject Trek</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: 10,
        backgroundColor: '#fff',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Syne-ExtraBold',
        color: '#1C3D3E',
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: 'Syne-Regular',
        color: '#666',
        marginTop: 2,
    },
    adminBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#D1FAE5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    statPill: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
    },
    statCount: {
        fontSize: 22,
        fontFamily: 'Syne-ExtraBold',
    },
    statLabel: {
        fontSize: 11,
        fontFamily: 'Syne-Bold',
        marginTop: 2,
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        gap: 6,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F3F4F4',
        gap: 4,
    },
    activeTab: {
        backgroundColor: '#1C3D3E',
    },
    tabText: {
        fontSize: 12,
        fontFamily: 'Syne-Bold',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
    },
    tabBadge: {
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    activeTabBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    tabBadgeText: {
        fontSize: 10,
        fontFamily: 'Syne-Bold',
        color: '#666',
    },
    activeTabBadgeText: {
        color: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 10,
        fontFamily: 'Syne-Regular',
        color: '#666',
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: 'Syne-Regular',
        color: '#999',
        textAlign: 'center',
        marginTop: 5,
    },
    // ─── Trek Card ──────────────────────────────
    trekCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    cardImageContainer: {
        height: 160,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cardGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Syne-Bold',
    },
    cardContent: {
        padding: 16,
    },
    trekName: {
        fontSize: 18,
        fontFamily: 'Syne-ExtraBold',
        color: '#1C3D3E',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        fontFamily: 'Syne-Regular',
        color: '#666',
    },
    rejectionBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FEE2E2',
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        gap: 6,
    },
    rejectionText: {
        flex: 1,
        fontSize: 12,
        fontFamily: 'Syne-Regular',
        color: '#B91C1C',
        lineHeight: 18,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    acceptBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    acceptBtnText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Syne-Bold',
    },
    rejectBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEE2E2',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    rejectBtnText: {
        color: '#EF4444',
        fontSize: 14,
        fontFamily: 'Syne-Bold',
    },
    // ─── Modal ──────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 25,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 25,
        width: '100%',
        maxWidth: 400,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Syne-ExtraBold',
        color: '#1C3D3E',
    },
    modalSubtitle: {
        fontSize: 14,
        fontFamily: 'Syne-Bold',
        color: '#666',
        marginTop: 4,
    },
    modalLabel: {
        fontSize: 14,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
        marginBottom: 8,
    },
    modalInput: {
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        padding: 14,
        fontFamily: 'Syne-Regular',
        fontSize: 14,
        color: '#1C3D3E',
        minHeight: 100,
        backgroundColor: '#F9FAFB',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#F3F4F4',
    },
    modalCancelText: {
        fontFamily: 'Syne-Bold',
        color: '#666',
        fontSize: 14,
    },
    modalRejectBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        gap: 6,
    },
    modalRejectText: {
        fontFamily: 'Syne-Bold',
        color: '#fff',
        fontSize: 14,
    },
});

export default AdminDashboard;
