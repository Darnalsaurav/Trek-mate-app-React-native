import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_KEY = '324f963df87a4c0772a769677392ca41';

const WeatherBadge = ({ location, trekName, id, size = 'small' }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setWeather(null); // Reset state to prevent stale data display

        const fetchWeather = async () => {
            try {
                // 1. Clean the location/trek name
                const district = (location || '').replace(/\s*District\s*/i, '').trim();
                const trek = (trekName || '').trim();

                const cleanSearch = (name) => {
                    return name.replace(/\s*(Base Camp|BC|Trek|Circuit|Valley|Lake|Himal|Peak|Mount|Mt)\s*/gi, ' ').trim();
                };

                // 2. Build search strategies (matching WeatherScreen logic)
                const strategies = [
                    trek,
                    `${trek},NP`,
                    cleanSearch(trek),
                    district,
                    `${district},NP`,
                    'Kathmandu,NP'
                ].filter(s => s && s.length > 2);

                const uniqueStrategies = [...new Set(strategies)];
                let finalData = null;

                // 3. Try each strategy via Geocoding
                for (const query of uniqueStrategies) {
                    try {
                        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`;
                        const geoRes = await fetch(geoUrl);
                        const geoData = await geoRes.json();

                        if (geoData && geoData.length > 0) {
                            const { lat, lon } = geoData[0];
                            // Add cache buster (_cb) to ensure real-time data
                            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&_cb=${Date.now()}`;
                            const res = await fetch(weatherUrl);
                            const data = await res.json();

                            if (data && data.cod === 200) {
                                finalData = data;
                                break;
                            }
                        }
                    } catch (e) {
                        console.log(`[WeatherBadge] Query "${query}" failed:`, e.message);
                    }
                }

                // 4. Final attempt: Direct search if geocoding failed
                if (!finalData) {
                    try {
                        const fallbackQuery = district || trek || 'Kathmandu';
                        const directUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(fallbackQuery + ',NP')}&appid=${API_KEY}&units=metric&_cb=${Date.now()}`;
                        const res = await fetch(directUrl);
                        const data = await res.json();
                        if (data && data.cod === 200) finalData = data;
                    } catch (e) { }
                }

                if (isMounted && finalData) {
                    setWeather({
                        temp: Math.round(finalData.main.temp),
                        icon: owmToIonicon(finalData.weather[0].icon),
                    });
                }
            } catch (error) {
                console.log('[WeatherBadge] General error:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchWeather();
        return () => { isMounted = false; };
    }, [location, trekName, id]);

    const owmToIonicon = (code) => {
        const map = {
            '01d': 'sunny', '01n': 'moon',
            '02d': 'partly-sunny', '02n': 'cloudy-night',
            '03d': 'cloud', '03n': 'cloud',
            '04d': 'cloudy', '04n': 'cloudy',
            '09d': 'rainy', '09n': 'rainy',
            '10d': 'rainy', '10n': 'rainy',
            '11d': 'thunderstorm', '11n': 'thunderstorm',
            '13d': 'snow', '13n': 'snow',
            '50d': 'water', '50n': 'water',
        };
        return map[code] || 'partly-sunny';
    };

    if (loading) return null;
    if (!weather) return null;

    if (size === 'large') {
        return (
            <View style={styles.largeContainer}>
                <Ionicons name={weather.icon} size={24} color="#1C3D3E" />
                <Text style={styles.largeTemp}>{weather.temp}°C</Text>
                <View style={styles.liveIndicator}>
                    <View style={styles.dot} />
                    <Text style={styles.liveText}>LIVE</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.smallContainer}>
            <Ionicons name={weather.icon} size={14} color="white" />
            <Text style={styles.smallTemp}>{weather.temp}°</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    smallContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(28, 61, 62, 0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    smallTemp: {
        color: 'white',
        fontSize: 11,
        fontFamily: 'Syne-Bold',
    },
    largeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 15,
        gap: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    largeTemp: {
        fontSize: 16,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E1F5E1',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 4,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#22C55E',
        marginRight: 4,
    },
    liveText: {
        fontSize: 8,
        fontFamily: 'Syne-Bold',
        color: '#166534',
    }
});

export default WeatherBadge;
