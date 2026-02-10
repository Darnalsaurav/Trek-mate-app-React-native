import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Linking,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const MapScreen = ({ navigation }) => {
    // Everest Base Camp Coordinates
    const initialRegion = {
        latitude: 28.0072,
        longitude: 86.8522,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    const handleGetDirections = () => {
        const destination = "Mount+Everest+Base+Camp";
        const url = Platform.select({
            ios: `maps:0,0?q=${destination}`,
            android: `geo:0,0?q=${destination}`,
        });

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
            }
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            >
                <Marker
                    coordinate={{ latitude: 28.0072, longitude: 86.8522 }}
                    title="Everest Base Camp"
                    description="Solukhumbu, Nepal"
                />
            </MapView>

            <SafeAreaView style={styles.headerLayer}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Ionicons name="chevron-back" size={28} color="#1C3D3E" />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Overlay Info Card */}
            <View style={styles.overlayCard}>
                <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Everest Base Camp</Text>
                    <Text style={styles.infoSubtitle}>Solukhumbu, Nepal</Text>
                </View>
                <TouchableOpacity
                    style={styles.directionBtn}
                    onPress={handleGetDirections}
                >
                    <Text style={styles.directionBtnText}>Get Directions</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    headerLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        elevation: 5,
    },
    overlayCard: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#1C3D3E',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F3F4F4',
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 20,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
        marginBottom: 4,
    },
    infoSubtitle: {
        fontSize: 14,
        fontFamily: 'Syne-Regular',
        color: '#666',
    },
    directionBtn: {
        backgroundColor: '#1C3D3E',
        borderRadius: 15,
        paddingVertical: 14,
        paddingHorizontal: 20,
        shadowColor: '#1C3D3E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    directionBtnText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Syne-Bold',
    },
});

export default MapScreen;

