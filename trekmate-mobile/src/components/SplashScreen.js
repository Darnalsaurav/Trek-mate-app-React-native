import React from 'react';
import { View, Image, StyleSheet, StatusBar, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1C3D3E" />
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/splash_logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
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
        width: width * 0.7,
        height: width * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
});

export default SplashScreen;

