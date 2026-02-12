import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Animated,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Begin Your Adventure',
        subtitle: 'Connect with like-minded trekkers\nand explore breathtaking trails together.',
        image: require('../../assets/mountain_new.png'),
    },
    {
        id: '2',
        title: 'Find your Mates',
        subtitle: 'Connect with fellow adventurers\nand make lasting friendships on the trail.',
        image: require('../../assets/mountain_new.png'),
    },
    {
        id: '3',
        title: 'Smart Trip Planning',
        subtitle: 'Effortlessly organize your routes\nand track every step of your journey.',
        image: require('../../assets/mountain_new.png'),
    },
    {
        id: '4',
        title: 'Discover New Paths',
        subtitle: 'Unlock amazing hidden trails\nand plan your next adventure.',
        image: require('../../assets/mountain_new.png'),
    },
];

const OnboardingScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollToNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            navigation.navigate('Login');
        }
    };

    const skip = () => {
        navigation.navigate('Login');
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.slide}>
                <View style={styles.curveWrapper}>
                    <View style={styles.imageContainer}>
                        <Image source={item.image} style={styles.image} />
                    </View>
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                </View>
            </View>
        );
    };

    const Paginator = () => {
        return (
            <View style={styles.pagination}>
                {SLIDES.map((_, i) => {
                    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [10, 24, 10],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    const backgroundColor = scrollX.interpolate({
                        inputRange,
                        outputRange: ['#D1D5DB', '#1C3D3E', '#D1D5DB'],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            style={[
                                styles.dot,
                                { width: dotWidth, opacity, backgroundColor },
                            ]}
                            key={i.toString()}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" transparent backgroundColor="transparent" />
            <View style={{ flex: 3 }}>
                <FlatList
                    data={SLIDES}
                    renderItem={renderItem}
                    horizontal
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    scrollEventThrottle={32}
                    ref={slidesRef}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            <View style={styles.footer}>
                <Paginator />

                <View style={styles.navigationContainer}>
                    <TouchableOpacity style={styles.skipButton} onPress={skip}>
                        <Text style={styles.skipButtonText}>SKIP</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.nextButton}
                        onPress={scrollToNext}
                    >
                        <LinearGradient
                            colors={['#1C3D3E', '#2D5A5C']}
                            style={styles.nextButtonGradient}
                        >
                            <Ionicons
                                name={currentIndex === SLIDES.length - 1 ? "checkmark" : "arrow-forward"}
                                size={28}
                                color="#fff"
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    slide: {
        width,
        flex: 1,
    },
    curveWrapper: {
        width: width,
        height: height * 0.55,
        overflow: 'hidden',
    },
    imageContainer: {
        width: width * 1.8,
        height: height * 0.7,
        position: 'absolute',
        top: -height * 0.15,
        alignSelf: 'center',
        borderBottomLeftRadius: width * 0.9,
        borderBottomRightRadius: width * 0.9,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    image: {
        width: width,
        height: '100%',
        alignSelf: 'center',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 40,
        paddingTop: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontFamily: 'Syne-ExtraBold',
        color: '#1C3D3E',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Syne-Regular',
        color: '#000',
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingBottom: 50,
    },
    pagination: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        height: 10,
        borderRadius: 5,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 20,
    },
    skipButton: {
        paddingVertical: 10,
    },
    skipButtonText: {
        fontSize: 18,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
    },
    nextButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        shadowColor: '#1C3D3E',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    nextButtonGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default OnboardingScreen;
