import React from 'react';
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
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const recommendedDestinations = [
        {
            id: 1,
            name: 'Tilicho lake',
            location: 'Manang District',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
        },
        {
            id: 2,
            name: 'Khumai Dada',
            location: 'Pokhara District',
            image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80'
        },
        {
            id: 3,
            name: 'Everest View',
            location: 'Solukhumbu District',
            image: 'https://images.unsplash.com/photo-1571769267292-c07c8eadb1c3?w=800&q=80'
        }
    ];

    const upcomingTreks = [
        {
            id: 1,
            name: 'Langtang',
            location: 'Rasuwa District',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
        },
        {
            id: 2,
            name: 'Annapurna Base camp',
            location: 'Pokhara District',
            image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80'
        },
        {
            id: 3,
            name: 'Manaslu Circuit',
            location: 'Gorkha District',
            image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80'
        }
    ];

    const DestinationCard = ({ destination }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
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
                                        source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80' }}
                                        style={styles.avatar}
                                    />
                                </View>
                                <View style={styles.welcomeContainer}>
                                    <Text style={styles.welcomeTitle}>WELCOME BACK</Text>
                                    <Text style={styles.userName}>Saurav Darnal</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.notificationBtn}>
                                <Ionicons name="notifications-outline" size={30} color="#1C3D3E" />
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
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.cardList}
                        >
                            {upcomingTreks.map((trek) => (
                                <DestinationCard key={trek.id} destination={trek} />
                            ))}
                        </ScrollView>
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
});

export default HomeScreen;
