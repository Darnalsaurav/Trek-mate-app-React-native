import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const API_KEY = '324f963df87a4c0772a769677392ca41';

// Map OWM icon codes → Ionicons names
const owmIconToIonicon = (code) => {
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

// Static fallback data per district (real approximate seasonal values for Nepal)
const DISTRICT_FALLBACK = {
    'Manang': { temp: 4, feelsLike: 1, condition: 'Clear', description: 'Clear Sky', wind: 12, humidity: 38, icon: 'sunny' },
    'Pokhara': { temp: 18, feelsLike: 16, condition: 'Clouds', description: 'Partly Cloudy', wind: 8, humidity: 62, icon: 'partly-sunny' },
    'Solukhumbu': { temp: -2, feelsLike: -6, condition: 'Snow', description: 'Light Snow', wind: 20, humidity: 45, icon: 'snow' },
    'Rasuwa': { temp: 8, feelsLike: 5, condition: 'Clouds', description: 'Overcast', wind: 10, humidity: 70, icon: 'cloudy' },
    'Gorkha': { temp: 14, feelsLike: 12, condition: 'Clear', description: 'Clear Sky', wind: 7, humidity: 55, icon: 'sunny' },
    'Kathmandu': { temp: 16, feelsLike: 14, condition: 'Clouds', description: 'Partly Cloudy', wind: 9, humidity: 60, icon: 'partly-sunny' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getFallbackForecast = (base) => {
    const today = new Date();
    return Array.from({ length: 5 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i + 1);
        const variation = Math.round((Math.random() - 0.5) * 6);
        return {
            day: DAYS[d.getDay()],
            temp: base.temp + variation,
            icon: base.icon,
        };
    });
};

const WeatherScreen = ({ route, navigation }) => {
    const { destination } = route.params || {};
    const [current, setCurrent] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            setCurrent(null);
            setForecast([]);
            let loadedFromAPI = false;

            try {
                const districtName = (destination?.location || 'Kathmandu')
                    .replace(/\s*District\s*/i, '')
                    .trim();

                const usedCity = districtName || 'Kathmandu';
                const trekName = (destination?.name || '').trim();

                console.log(`[Weather] Fetching for: "${trekName}" in "${usedCity}"`);

                const cleanSearch = (name) => {
                    return name.replace(/\s*(Base Camp|BC|Trek|Circuit|Valley|Lake|Himal|Peak|Mount|Mt)\s*/gi, ' ').trim();
                };

                const searchStrategies = [
                    trekName,
                    `${trekName},NP`,
                    cleanSearch(trekName),
                    usedCity,
                    `${usedCity},NP`
                ].filter(s => s && s.length > 2);

                const uniqueStrategies = [...new Set(searchStrategies)];
                let finalData = null;

                // Search Strategy Loop
                for (const strategy of uniqueStrategies) {
                    try {
                        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(strategy)}&limit=1&appid=${API_KEY}`;
                        const geoRes = await fetch(geoUrl);
                        const geoData = await geoRes.json();

                        if (geoData && geoData.length > 0) {
                            const { lat, lon } = geoData[0];
                            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&_cb=${Date.now()}`;
                            const weatherRes = await fetch(weatherUrl);
                            const data = await weatherRes.json();
                            if (data && Number(data.cod) === 200) {
                                finalData = data;
                                break;
                            }
                        }
                    } catch (e) {
                        console.log(`[Weather] Strategy "${strategy}" failed:`, e.message);
                    }
                }

                // Direct Search Fallback
                if (!finalData) {
                    try {
                        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(usedCity + ',NP')}&appid=${API_KEY}&units=metric&_cb=${Date.now()}`);
                        const data = await res.json();
                        if (data && Number(data.cod) === 200) finalData = data;
                    } catch (e) { }
                }

                if (isMounted && finalData && Number(finalData.cod) === 200) {
                    setCurrent({
                        temp: Math.round(finalData.main.temp),
                        feelsLike: Math.round(finalData.main.feels_like),
                        condition: finalData.weather[0].main,
                        description: finalData.weather[0].description.replace(/\b\w/g, c => c.toUpperCase()),
                        wind: Math.round(finalData.wind.speed * 3.6),
                        humidity: finalData.main.humidity,
                        icon: owmIconToIonicon(finalData.weather[0].icon),
                        city: finalData.name,
                    });
                    loadedFromAPI = true;
                    setIsLive(true);

                    // Forecast
                    const fController = new AbortController();
                    const fTimeoutId = setTimeout(() => fController.abort(), 8000);
                    try {
                        const fRes = await fetch(
                            `https://api.openweathermap.org/data/2.5/forecast?lat=${finalData.coord.lat}&lon=${finalData.coord.lon}&appid=${API_KEY}&units=metric`,
                            { signal: fController.signal }
                        );
                        const fData = await fRes.json();
                        if (String(fData.cod) === '200') {
                            const daily = fData.list
                                .filter(item => item.dt_txt.includes('12:00:00'))
                                .slice(0, 5)
                                .map(item => ({
                                    day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
                                    temp: Math.round(item.main.temp),
                                    icon: owmIconToIonicon(item.weather[0].icon),
                                }));
                            setForecast(daily);
                        }
                    } catch (_) { } finally {
                        clearTimeout(fTimeoutId);
                    }
                }

                // Use static fallback if API failed or returned nothing
                if (isMounted && !loadedFromAPI) {
                    const fallback = DISTRICT_FALLBACK[usedCity] || DISTRICT_FALLBACK['Kathmandu'];
                    setCurrent({ ...fallback, city: usedCity });
                    setForecast(getFallbackForecast(fallback));
                    setIsLive(false);
                }
            } catch (error) {
                console.error('[Weather] Fatal load error:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();
        return () => { isMounted = false; };
    }, [destination]);

    // ─── Loading ─────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#1C3D3E', '#2D5A5C']} style={StyleSheet.absoluteFill} />
                <View style={[styles.loadingHeader, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.loadingText}>Fetching conditions…</Text>
                </View>
            </View>
        );
    }

    // ─── Main UI ─────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#0D2B2C', '#1C3D3E', '#2D5A5C']}
                style={StyleSheet.absoluteFill}
            />

            <View style={{ flex: 1 }}>
                {/* Header — always positioned correctly using safe area insets */}
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Weather</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Hero block */}
                    <View style={styles.heroBlock}>
                        <Text style={styles.placeName}>{destination?.name || 'Destination'}</Text>
                        <View style={styles.cityRow}>
                            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.5)" />
                            <Text style={styles.nearestCity}>{current.city}</Text>
                            {!isLive && (
                                <View style={styles.offlineBadge}>
                                    <Text style={styles.offlineBadgeText}>Estimated</Text>
                                </View>
                            )}
                            {isLive && (
                                <View style={styles.liveBadge}>
                                    <View style={styles.liveDot} />
                                    <Text style={styles.liveBadgeText}>Live</Text>
                                </View>
                            )}
                        </View>

                        <Ionicons
                            name={current.icon + '-outline'}
                            size={90}
                            color="rgba(255,255,255,0.9)"
                            style={{ marginVertical: 18 }}
                        />

                        <Text style={styles.tempBig}>{current.temp}°C</Text>
                        <Text style={styles.conditionMain}>{current.description}</Text>
                        <Text style={styles.feelsLike}>Feels like {current.feelsLike}°C</Text>
                    </View>

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Ionicons name="speedometer-outline" size={22} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.statValue}>{current.wind} km/h</Text>
                            <Text style={styles.statLabel}>Wind</Text>
                        </View>
                        <View style={styles.statSep} />
                        <View style={styles.statCard}>
                            <Ionicons name="water-outline" size={22} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.statValue}>{current.humidity}%</Text>
                            <Text style={styles.statLabel}>Humidity</Text>
                        </View>
                    </View>

                    {/* 5-day forecast */}
                    {forecast.length > 0 && (
                        <View style={styles.forecastSection}>
                            <Text style={styles.sectionTitle}>5-Day Forecast</Text>
                            {forecast.map((item, i) => (
                                <View key={i} style={styles.forecastRow}>
                                    <Text style={styles.forecastDay}>{item.day}</Text>
                                    <Ionicons name={item.icon + '-outline'} size={24} color="rgba(255,255,255,0.85)" />
                                    <Text style={styles.forecastTemp}>{item.temp}°</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {!isLive && (
                        <Text style={styles.disclaimer}>
                            ⚠ Live data unavailable. Showing seasonal estimates. Data will update once the API key is activated.
                        </Text>
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    loadingHeader: { paddingHorizontal: 16, paddingBottom: 8 },
    loadingText: { color: 'rgba(255,255,255,0.8)', marginTop: 12, fontFamily: 'Syne-Regular', fontSize: 15 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: 'white', fontSize: 18, fontFamily: 'Syne-Bold' },

    heroBlock: { alignItems: 'center', paddingTop: 20, paddingBottom: 10 },
    placeName: { fontSize: 26, fontFamily: 'Syne-ExtraBold', color: 'white' },
    cityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    nearestCity: { fontSize: 12, fontFamily: 'Syne-Regular', color: 'rgba(255,255,255,0.5)' },
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34,197,94,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginLeft: 6, gap: 4 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
    liveBadgeText: { fontSize: 10, fontFamily: 'Syne-Bold', color: '#22c55e' },
    offlineBadge: { backgroundColor: 'rgba(251,191,36,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginLeft: 6 },
    offlineBadgeText: { fontSize: 10, fontFamily: 'Syne-Bold', color: '#fbbf24' },

    tempBig: { fontSize: 80, fontFamily: 'Syne-Bold', color: 'white', lineHeight: 88 },
    conditionMain: { fontSize: 20, fontFamily: 'Syne-Regular', color: 'rgba(255,255,255,0.85)' },
    feelsLike: { fontSize: 13, fontFamily: 'Syne-Regular', color: 'rgba(255,255,255,0.5)', marginTop: 4 },

    statsRow: { flexDirection: 'row', marginHorizontal: 24, marginVertical: 24, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 20, alignItems: 'center', justifyContent: 'space-around' },
    statCard: { alignItems: 'center' },
    statValue: { fontSize: 16, fontFamily: 'Syne-Bold', color: 'white', marginTop: 6 },
    statLabel: { fontSize: 12, fontFamily: 'Syne-Regular', color: 'rgba(255,255,255,0.55)', marginTop: 2 },
    statSep: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.12)' },

    forecastSection: { paddingHorizontal: 24 },
    sectionTitle: { fontSize: 17, fontFamily: 'Syne-Bold', color: 'white', marginBottom: 14 },
    forecastRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 10 },
    forecastDay: { fontSize: 15, fontFamily: 'Syne-Bold', color: 'white', width: 50 },
    forecastTemp: { fontSize: 15, fontFamily: 'Syne-Bold', color: 'white', width: 42, textAlign: 'right' },

    disclaimer: { textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Syne-Regular', paddingHorizontal: 30, marginTop: 16 },
});

export default WeatherScreen;
