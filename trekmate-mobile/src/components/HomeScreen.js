import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../config/firebase';
import { onSnapshot, doc } from 'firebase/firestore';
import { getUnreadCount, subscribeToNotifications, setUnreadCount } from '../utils/notificationStore';
import { getPlannedTrips, subscribeToPlannedTrips } from '../utils/destinationStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const DestinationCard = ({ destination, navigation }) => (
    <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('DestinationDetail', { destination })}
    >
        <Image
            source={{ uri: destination.image }}
            style={styles.cardImage}
        />
        <View style={styles.cardOverlay}>
            <View style={styles.cardInfoPill}>
                <View style={styles.cardTextContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{destination.name}</Text>
                    <Text style={styles.cardLocation} numberOfLines={1}>{destination.location}</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
    const [userName, setUserName] = useState(
        auth.currentUser?.displayName ||
        auth.currentUser?.email?.split('@')[0] ||
        'User'
    );
    const [profileImage, setProfileImage] = useState(auth.currentUser?.photoURL);
    const [unreadCount, setUnreadCountState] = useState(getUnreadCount());
    const [plannedTrips, setPlannedTrips] = useState(getPlannedTrips());
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const unsubscribe = subscribeToNotifications((count) => {
            setUnreadCountState(count);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToPlannedTrips((trips) => {
            setPlannedTrips([...trips]);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const checkFirstTime = async () => {
            try {
                const hasSeenWelcome = await AsyncStorage.getItem('has_seen_welcome');
                if (!hasSeenWelcome) {
                    setUnreadCount(1);
                    await AsyncStorage.setItem('has_seen_welcome', 'true');
                }
            } catch (error) {
                console.log('Error checking first time:', error);
            }
        };
        checkFirstTime();
    }, []);


    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        // Listen for real-time changes to the user's profile in Firestore
        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.data();
                setUserName(userData.displayName || user.displayName || user.email?.split('@')[0] || 'User');
                setProfileImage(userData.photoURL || user.photoURL);
            }
        }, (error) => {
            console.log('Error listening to user profile:', error);
        });

        return unsubscribe;
    }, []);

    const recommendedDestinations = [
        {
            id: 1,
            name: 'TILICHO LAKE',
            location: 'Manang District',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            description: 'Tilicho Lake is situated at an altitude of 4,919 meters in the Annapurna range of the Himalayas. It is often called the highest lake in the world for its size. The trek offers stunning views of Annapurna II, Annapurna III, and Gangapurna.',
            distance: '15km',
            duration: '14hrs',
            elevation: '4919m'
        },
        {
            id: 2,
            name: 'KHUMAI DADA',
            location: 'Pokhara District',
            image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            description: 'Khumai Dada is a hidden gem in the Machhapuchhre region. This short yet rewarding trek provides a closer look at the iconic Fish Tail mountain and offers a panoramic view of the Pokhara valley.',
            distance: '8km',
            duration: '8hrs',
            elevation: '3245m'
        },
        {
            id: 3,
            name: 'EVEREST VIEW',
            location: 'Solukhumbu District',
            image: 'https://images.unsplash.com/photo-1571769267292-c07c8eadb1c3?w=800&q=80',
            description: 'The Everest View trek is perfect for those who want to see the world\'s highest peak without the grueling climb to Base Camp. It passes through Sherpa villages and provides breathtaking vistas of Everest, Lhotse, and Ama Dablam.',
            distance: '12km',
            duration: '10hrs',
            elevation: '3880m'
        }
    ];

    const filteredRecommended = recommendedDestinations.filter(dest =>
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPlanned = plannedTrips.filter(trek =>
        trek.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trek.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const noResults = searchQuery.length > 0 && filteredRecommended.length === 0 && filteredPlanned.length === 0;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <View style={styles.profileRow}>
                                <View style={styles.avatarBorder}>
                                    <Image
                                        source={profileImage ? { uri: profileImage } : { uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                                        style={styles.avatar}
                                    />
                                </View>
                                <View style={styles.welcomeContainer}>
                                    <Text style={styles.welcomeTitle}>WELCOME BACK</Text>
                                    <Text style={styles.userName}>{userName}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.notificationBtn}
                                onPress={() => navigation.navigate('Notifications')}
                            >
                                <Ionicons name="notifications-outline" size={30} color="#1C3D3E" />
                                {unreadCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{unreadCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={24} color="#1C3D3E" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search the destination"
                                placeholderTextColor="#999"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color="#999" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {noResults ? (
                        <View style={styles.noResultsContainer}>
                            <Ionicons name="search-outline" size={60} color="#ccc" />
                            <Text style={styles.noResultsText}>Trek not available</Text>
                            <Text style={styles.noResultsSubtext}>Try searching for something else</Text>
                        </View>
                    ) : (
                        <>
                            {/* Recommended Section */}
                            {filteredRecommended.length > 0 && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>Recommended for you</Text>
                                        <TouchableOpacity>
                                            <Text style={styles.seeAll}>See All</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.cardList}
                                    >
                                        {filteredRecommended.map((dest) => (
                                            <DestinationCard key={dest.id} destination={dest} navigation={navigation} />
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* Upcoming Treks Section */}
                            {(filteredPlanned.length > 0 || (searchQuery === '' && plannedTrips.length === 0)) && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>Upcoming treks</Text>
                                    </View>
                                    {plannedTrips.length === 0 ? (
                                        <View style={styles.emptyUpcoming}>
                                            <Ionicons name="calendar-outline" size={36} color="#ccc" />
                                            <Text style={styles.emptyUpcomingText}>No upcoming treks yet.{"\n"}Plan one to see it here!</Text>
                                        </View>
                                    ) : filteredPlanned.length > 0 ? (
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.cardList}
                                        >
                                            {filteredPlanned.map((trek) => (
                                                <DestinationCard key={trek.id} destination={trek} navigation={navigation} />
                                            ))}
                                        </ScrollView>
                                    ) : null}
                                </View>
                            )}
                        </>
                    )}

                    {/* Padding for Floating Nav */}
                    <View style={{ height: 120 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 10,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarBorder: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 2,
        borderColor: '#1C3D3E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatar: {
        width: 78,
        height: 78,
        borderRadius: 39,
        resizeMode: 'cover',
    },
    welcomeContainer: {
        justifyContent: 'center',
    },
    welcomeTitle: {
        fontSize: 15,
        fontFamily: 'Syne-Bold',
        color: '#000',
        textTransform: 'uppercase',
    },
    userName: {
        fontSize: 18,
        fontFamily: 'Syne-Bold',
        color: '#4B5D5E',
        marginTop: -2,
    },
    notificationBtn: {
        padding: 5,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 25,
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
    section: {
        marginBottom: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Syne-Bold',
        color: '#000',
    },
    seeAll: {
        fontSize: 14,
        fontFamily: 'Syne-Bold',
        color: '#4B5D5E',
    },
    cardList: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    card: {
        width: width * 0.44,
        height: 240,
        marginRight: 15,
        borderRadius: 40,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    cardInfoPill: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 12,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    cardTextContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 12,
        fontFamily: 'Syne-Bold',
        color: '#000',
        textAlign: 'center',
    },
    cardLocation: {
        fontSize: 10,
        fontFamily: 'Syne-Regular',
        color: '#666',
        textAlign: 'center',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#FF3B30',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Syne-Bold',
        lineHeight: 12,
    },
    emptyUpcoming: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#f9f9f9',
        marginHorizontal: 25,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
        borderStyle: 'dashed',
    },
    emptyUpcomingText: {
        fontSize: 13,
        fontFamily: 'Syne-Regular',
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 18,
    },
    noResultsContainer: {
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    noResultsText: {
        fontSize: 18,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
        marginTop: 15,
    },
    noResultsSubtext: {
        fontSize: 14,
        fontFamily: 'Syne-Regular',
        color: '#999',
        marginTop: 5,
    },
});

export default HomeScreen;
