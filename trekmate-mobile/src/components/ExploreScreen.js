import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDestinations, subscribeToDestinations } from '../utils/destinationStore';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const ExploreScreen = ({ navigation }) => {
    const [destinations, setDestinations] = useState(getDestinations());

    useEffect(() => {
        const unsubscribe = subscribeToDestinations((newData) => {
            setDestinations(newData);
        });
        return unsubscribe;
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>EXPLORE</Text>
            </View>

            {/* Search Bar - Matching Home */}
          
            {/* Destination Cards */}
            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
                <View style={styles.cardsContainer}>
                    {destinations.map((destination) => (
                        <TouchableOpacity
                            key={destination.id}
                            style={styles.card}
                            activeOpacity={0.9}
                        >
                            <Image
                                source={{ uri: destination.image }}
                                style={styles.cardImage}
                            />
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.8)']}
                                style={styles.cardGradient}
                            />
                            <View style={styles.cardLabel}>
                                <Text style={styles.cardName}>{destination.name}</Text>
                                <Text style={styles.cardLocation}>{destination.location}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Syne-ExtraBold',
        color: '#1C3D3E',
        textAlign: 'center',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
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
    content: {
        flex: 1,
    },
    cardsContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    card: {
        height: 240,
        borderRadius: 30,
        marginBottom: 20,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cardGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
    },
    cardLabel: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    cardName: {
        fontSize: 18,
        fontFamily: 'Syne-Bold',
        color: '#fff',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    cardLocation: {
        fontSize: 16,
        fontFamily: 'Syne-Regular',
        color: '#fff',
        opacity: 0.9,
    },
});

export default ExploreScreen;
