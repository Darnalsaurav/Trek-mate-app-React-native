import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.logoContainer}>
                <View style={styles.brandText}>
                    <Text style={styles.trek}>Trek</Text>
                    <Text style={styles.mate}>MATE</Text>
                </View>
                <View style={styles.taglineBorder}>
                    <Text style={styles.tagline}>ADVENTURE AWAITS</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C3D3E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    brandText: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trek: {
        fontSize: 64,
        fontFamily: 'Syne-ExtraBold',
        color: '#fff',
    },
    mate: {
        fontSize: 64,
        fontFamily: 'Syne-Bold',
        color: 'rgba(255,255,255,0.6)',
        marginLeft: 4,
    },
    taglineBorder: {
        marginTop: 10,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 20,
    },
    tagline: {
        fontSize: 12,
        fontFamily: 'Syne-Bold',
        color: '#fff',
        letterSpacing: 4,
    },
});

export default SplashScreen;

