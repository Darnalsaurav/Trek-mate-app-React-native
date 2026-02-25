import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DestinationDetail = ({ route, navigation }) => {
    const { destination } = route.params || {};

    const defaultDestination = {
        name: 'EVEREST BASE CAMP',
        location: 'Solukhumbu district',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        description: 'The Everest Base Camp (EBC) Trek is a classic high-altitude trek in Nepal that takes you into the heart of the Himalayas to the base of the world\'s highest peak, Mount Everest (8,848 m).'
    };

    const currentDestination = destination || defaultDestination;

    const trekStats = [
        { label: 'Distance', value: currentDestination.distance || '10km' },
        { label: 'Duration', value: currentDestination.duration || '12hrs' },
        { label: 'Elevation', value: currentDestination.elevation || '5360m' }
    ];

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* Hero section */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: currentDestination.image }}
                        style={styles.heroImage}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.heroGradient}
                    />
                    <SafeAreaView style={styles.headerControls}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backBtn}
                        >
                            <Ionicons name="chevron-back" size={28} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{currentDestination.name}</Text>
                        <TouchableOpacity style={styles.shareBtn}>
                            <Ionicons name="share-outline" size={24} color="white" />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    <View style={styles.locationTitleRow}>
                        <Ionicons name="location" size={20} color="#1C3D3E" />
                        <Text style={styles.destinationName}>{currentDestination.name}</Text>
                    </View>
                    <Text style={styles.destinationLocation}>{currentDestination.location}</Text>

                    {/* Stats Bar */}
                    <View style={styles.statsBar}>
                        {trekStats.map((stat, index) => (
                            <React.Fragment key={stat.label}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>{stat.label}</Text>
                                    <Text style={styles.statValue}>{stat.value}</Text>
                                </View>
                                {index < trekStats.length - 1 ? <View style={styles.statDivider} /> : null}
                            </React.Fragment>
                        ))}
                    </View>

                    {/* Description */}
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.description}>
                        {currentDestination.description || defaultDestination.description}
                    </Text>

                    {/* Action Buttons: Map & Weather */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('Map', { destination: currentDestination })}
                        >
                            <LinearGradient
                                colors={['#1C3D3E', '#2D5A5C']}
                                style={styles.actionGradient}
                            >
                                <Ionicons name="map-outline" size={24} color="white" />
                                <Text style={styles.actionBtnText}>View Map</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('Weather', { destination: currentDestination })}
                        >
                            <LinearGradient
                                colors={['#1C3D3E', '#2D5A5C']}
                                style={styles.actionGradient}
                            >
                                <Ionicons name="cloud-outline" size={24} color="white" />
                                <Text style={styles.actionBtnText}>Weather</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Join Button */}
                    <TouchableOpacity style={styles.joinBtn}>
                        <Text style={styles.joinBtnText}>Join Trip</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    heroContainer: {
        height: 350,
        width: '100%',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    headerControls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Syne-Bold',
    },
    shareBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32,
        padding: 24,
        paddingBottom: 40,
    },
    locationTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    destinationName: {
        fontSize: 24,
        fontFamily: 'Syne-Bold',
        color: '#111827',
        marginLeft: 8,
    },
    destinationLocation: {
        fontSize: 14,
        fontFamily: 'Syne-Regular',
        color: '#6b7280',
        marginLeft: 28,
        marginBottom: 24,
    },
    statsBar: {
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Syne-Regular',
        color: '#9ca3af',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontFamily: 'Syne-Bold',
        color: '#111827',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#e5e7eb',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Syne-Bold',
        color: '#111827',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        fontFamily: 'Syne-Regular',
        color: '#4b5563',
        marginBottom: 24,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    actionBtn: {
        flex: 1,
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 15,
        gap: 8,
    },
    actionBtnText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Syne-Bold',
    },
    joinBtn: {
        backgroundColor: '#1C3D3E',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#1C3D3E',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 8,
    },
    joinBtnText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Syne-Bold',
    },
});

export default DestinationDetail;
