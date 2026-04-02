import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { subscribeToMyTrips } from '../utils/destinationStore';
import { TREK_STATUS } from '../config/admin';

const STATUS_CONFIG = {
    [TREK_STATUS.PENDING]: {
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        solidBg: '#FEF3C7',
        icon: 'time-outline',
        label: 'Pending Review',
    },
    [TREK_STATUS.ACCEPTED]: {
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.15)',
        solidBg: '#D1FAE5',
        icon: 'checkmark-circle',
        label: 'Approved ✓',
    },
    [TREK_STATUS.REJECTED]: {
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        solidBg: '#FEE2E2',
        icon: 'close-circle',
        label: 'Rejected',
    },
};

const MyTripsScreen = ({ navigation }) => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToMyTrips((data) => {
            setTrips(data);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const renderStatusBadge = (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG[TREK_STATUS.PENDING];
        return (
            <View style={[styles.approvalBadge, { backgroundColor: config.solidBg }]}>
                <Ionicons name={config.icon} size={13} color={config.color} />
                <Text style={[styles.approvalText, { color: config.color }]}>
                    {config.label}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#1C3D3E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>MY TRIPS</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#1C3D3E" />
                </View>
            ) : trips.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="map-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>You haven't planned any trips yet.</Text>
                    <TouchableOpacity
                        style={styles.planBtn}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'PlanTrip' })}
                    >
                        <Text style={styles.planBtnText}>Plan Your Trek</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Status Legend */}
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                            <Text style={styles.legendText}>Pending</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                            <Text style={styles.legendText}>Approved</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                            <Text style={styles.legendText}>Rejected</Text>
                        </View>
                    </View>

                    <View style={styles.cardsContainer}>
                        {trips.map((trip) => {
                            const statusConfig = STATUS_CONFIG[trip.approvalStatus] || STATUS_CONFIG[TREK_STATUS.PENDING];
                            return (
                                <TouchableOpacity
                                    key={trip.id}
                                    style={[
                                        styles.card,
                                        { borderLeftWidth: 4, borderLeftColor: statusConfig.color },
                                    ]}
                                    activeOpacity={0.9}
                                    onPress={() => navigation.navigate('DestinationDetail', { destination: trip })}
                                >
                                    <Image
                                        source={{ uri: trip.image }}
                                        style={styles.cardImage}
                                    />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                                        style={styles.cardGradient}
                                    />

                                    {/* Status Badge on image */}
                                    <View style={styles.statusOverlay}>
                                        {renderStatusBadge(trip.approvalStatus)}
                                    </View>

                                    <View style={styles.cardLabel}>
                                        <View style={styles.titleRow}>
                                            <Text style={styles.cardName}>{trip.name}</Text>
                                            <View style={styles.dateBadge}>
                                                <Ionicons name="calendar-outline" size={12} color="white" />
                                                <Text style={styles.dateText}>{trip.startDate}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.cardLocation}>{trip.location}</Text>
                                    </View>

                                    {/* Rejection Reason Banner */}
                                    {trip.approvalStatus === TREK_STATUS.REJECTED && trip.rejectionReason && (
                                        <View style={styles.rejectionBanner}>
                                            <Ionicons name="alert-circle" size={14} color="#EF4444" />
                                            <Text style={styles.rejectionText} numberOfLines={2}>
                                                {trip.rejectionReason}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
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
        paddingBottom: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Syne-ExtraBold',
        color: '#1C3D3E',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Syne-Regular',
        color: '#666',
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    planBtn: {
        backgroundColor: '#1C3D3E',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 12,
    },
    planBtnText: {
        color: '#fff',
        fontFamily: 'Syne-Bold',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        fontFamily: 'Syne-Regular',
        color: '#666',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    cardsContainer: {
        gap: 20,
    },
    card: {
        height: 200,
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: '#f3f3f3',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
    },
    statusOverlay: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    approvalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
    },
    approvalText: {
        fontSize: 11,
        fontFamily: 'Syne-Bold',
    },
    cardLabel: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardName: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Syne-ExtraBold',
    },
    cardLocation: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontFamily: 'Syne-Bold',
    },
    dateBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    dateText: {
        color: '#fff',
        fontSize: 11,
        fontFamily: 'Syne-Bold',
    },
    rejectionBanner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(254, 226, 226, 0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 6,
    },
    rejectionText: {
        flex: 1,
        fontSize: 11,
        fontFamily: 'Syne-Regular',
        color: '#B91C1C',
    },
});

export default MyTripsScreen;
