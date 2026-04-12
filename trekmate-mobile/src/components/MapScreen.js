import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Platform,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { TrailService } from '../utils/trailService';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ route, navigation }) => {
    const { destination: destinationData } = route.params || {};
    
    const [userLocation, setUserLocation] = useState(null);
    const [trailCoords, setTrailCoords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTracking, setIsTracking] = useState(false);
    const [offPath, setOffPath] = useState(false);

    const mapRef = useRef(null);
    const locationSubscription = useRef(null);

    // Basic center point (improved geocoding handles the rest)
    const center = { latitude: 28.0072, longitude: 86.8522 };

    useEffect(() => {
        loadTrailData();
        startTracking();
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    const loadTrailData = async () => {
        setIsLoading(true);
        try {
            // 1. Resolve Center Coordinates
            let targetCoords = null;

            // Check if coordinates already exist in destinationData
            if (destinationData?.latitude && destinationData?.longitude) {
                targetCoords = { latitude: destinationData.latitude, longitude: destinationData.longitude };
            } 
            // Fallback to hardcoded known values or Geocoding
            else if (destinationData?.name === 'KHUMAI DADA') targetCoords = { latitude: 28.3789, longitude: 83.9211 };
            else if (destinationData?.name === 'TILICHO LAKE') targetCoords = { latitude: 28.6833, longitude: 83.8500 };
            else {
                // Dynamic Geocoding using Nominatim (OSM)
                try {
                    const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationData?.name || 'Nepal Peaks')}`);
                    
                    if (!geoResponse.ok) {
                        console.warn('Geocoding service returned error status:', geoResponse.status);
                        return null;
                    }

                    const geoData = await geoResponse.json();
                    if (geoData && geoData.length > 0) {
                        targetCoords = {
                            latitude: parseFloat(geoData[0].lat),
                            longitude: parseFloat(geoData[0].lon)
                        };
                    }
                } catch (e) {
                    console.log('Geocoding failed, using Everest fallback');
                }
            }

            // Final fallback
            const finalCenter = targetCoords || { latitude: 28.0072, longitude: 86.8522 };

            // 2. Load Trail Route
            const trail = await TrailService.getRouteForLocation(
                destinationData?.name || 'Trek',
                finalCenter
            );
            
            if (trail && trail.coordinates) {
                setTrailCoords(trail.coordinates);
                // Center map on the trail
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        ...finalCenter,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Error loading trail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const startTracking = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Location access is required for navigation.');
            return;
        }

        setIsTracking(true);
        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                distanceInterval: 10,
            },
            (location) => {
                const newCoords = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                };
                setUserLocation(newCoords);
                checkTrailStatus(newCoords);
            }
        );
    };

    const stopTracking = () => {
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
        setIsTracking(false);
    };

    const checkTrailStatus = (coords) => {
        if (trailCoords.length === 0) return;

        let minDistance = Infinity;
        let nearestIndex = -1;

        trailCoords.forEach((p, index) => {
            const dist = TrailService.getDistanceFromLatLonInKm(
                coords.latitude, coords.longitude,
                p.latitude, p.longitude
            );
            if (dist < minDistance) {
                minDistance = dist;
                nearestIndex = index;
            }
        });

        if (minDistance > 0.1) {
            setOffPath(true);
        } else {
            setOffPath(false);
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    ...center,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                provider={PROVIDER_GOOGLE}
                mapType={Platform.OS === 'android' ? "none" : "standard"}
                showsUserLocation={true}
                followsUserLocation={isTracking}
            >
                <UrlTile
                    urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                />

                {trailCoords.length > 0 && (
                    <Polyline
                        coordinates={trailCoords}
                        strokeColor="#FF0000"
                        strokeWidth={6}
                    />
                )}

                <Marker
                    coordinate={center}
                    title={destinationData?.name || "Target"}
                >
                    <View style={styles.targetIcon}>
                        <Ionicons name="flag" size={20} color="white" />
                    </View>
                </Marker>
            </MapView>

            <SafeAreaView style={styles.headerLayer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={28} color="#1C3D3E" />
                    </TouchableOpacity>
                    
                    {offPath && (
                        <View style={styles.warningPill}>
                            <Ionicons name="warning" size={16} color="white" />
                            <Text style={styles.warningText}>OFF TRAIL</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>

            {/* Bottom Controls */}
            <View style={styles.bottomSheet}>
                <View style={styles.btnRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, isTracking ? styles.stopBtn : styles.startBtn]}
                        onPress={isTracking ? stopTracking : startTracking}
                    >
                        <Ionicons name={isTracking ? "pause" : "navigate"} size={24} color="white" />
                        <Text style={styles.btnText}>{isTracking ? "Stop Nav" : "Start Tracking"}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#1C3D3E" />
                    <Text style={styles.loadingText}>Fetching Trail Route...</Text>
                </View>
            )}
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        elevation: 5,
    },
    warningPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF3B30',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginLeft: 12,
        gap: 6,
    },
    warningText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Syne-Bold',
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    startBtn: {
        backgroundColor: '#1C3D3E',
    },
    stopBtn: {
        backgroundColor: '#4B5D5E',
    },
    btnText: {
        color: 'white',
        fontSize: 15,
        fontFamily: 'Syne-Bold',
    },
    targetIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1C3D3E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
    },
});

export default MapScreen;
