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
import { auth } from '../config/firebase';
import { getUnreadCount, subscribeToNotifications, setUnreadCount } from '../utils/notificationStore';
import { getPlannedTrips, subscribeToPlannedTrips } from '../utils/destinationStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const [userName, setUserName] = useState(
        auth.currentUser?.displayName ||
        auth.currentUser?.email?.split('@')[0] ||
        'User'
    );
    const [profileImage, setProfileImage] = useState(auth.currentUser?.photoURL);
    const [unreadCount, setUnreadCountState] = useState(getUnreadCount());
    const [plannedTrips, setPlannedTrips] = useState(getPlannedTrips());

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
        if (user) {
            // Force a reload to catch the displayName or photoURL if it was just set
            user.reload().then(() => {
                const updatedUser = auth.currentUser;
                setUserName(updatedUser?.displayName || updatedUser?.email?.split('@')[0] || 'User');
                setProfileImage(updatedUser?.photoURL);
            }).catch(err => console.log('Error reloading user:', err));
        }
    }, [navigation]); // Reload when navigating (e.g., coming back from Profile)

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

    const upcomingTreks = [
        {
            id: 4,
            name: 'LANGTANG VALLEY',
            location: 'Rasuwa District',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            description: 'Known as the valley of glaciers, Langtang offers a rich cultural experience with its Tamang heritage and spectacular mountain scenery. It is one of the most accessible trekking regions from Kathmandu.',
            distance: '18km',
            duration: '16hrs',
            elevation: '3870m'
        },
        {
            id: 5,
            name: 'ANNAPURNA BASE CAMP',
            location: 'Pokhara District',
            image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80',
            description: 'ABC Trek is one of the most popular treks in Nepal. It leads you into a natural amphitheater of towering peaks including Annapurna I, the world\'s tenth highest mountain.',
            distance: '22km',
            duration: '20hrs',
            elevation: '4130m'
        },
        {
            id: 6,
            name: 'MANASLU CIRCUIT',
            location: 'Gorkha District',
            image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80',
            description: 'The Manaslu Circuit is a restricted area trek that skirts the world\'s eighth highest mountain. It offers raw mountain beauty and a deep dive into the Tibetan-style culture of the Upper Gorkha region.',
            distance: '25km',
            duration: '24hrs',
            elevation: '5106m'
        }
    ];

    const DestinationCard = ({ destination }) => (
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
                    <Text style={styles.cardTitle}>{destination.name}</Text>
                    <Text style={styles.cardLocation}>{destination.location}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

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
                            />
                        </View>
                    </View>

                    {/* Recommended Section */}
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
                            {recommendedDestinations.map((dest) => (
                                <DestinationCard key={dest.id} destination={dest} />
                            ))}
                        </ScrollView>
                    </View>

                    {/* Upcoming Treks Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Upcoming treks</Text>
                        </View>
                        {plannedTrips.length === 0 ? (
                            <View style={styles.emptyUpcoming}>
                                <Ionicons name="calendar-outline" size={36} color="#ccc" />
                                <Text style={styles.emptyUpcomingText}>No upcoming treks yet.{'
'}Plan one to see it here!</Text>
                            </View>
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.cardList}
                            >
                                {plannedTrips.map((trek) => (
                                    <DestinationCard key={trek.id} destination={trek} />
                                ))}
                            </ScrollView>
                        )}
                    </View>

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
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 15,
        paddingVertical: 8,
        paddingHorizontal: 12,
        width: '100%',
        alignItems: 'center',
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
});

export default HomeScreen;
