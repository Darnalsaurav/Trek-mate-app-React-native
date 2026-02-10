import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const formatErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'This email is already registered.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            default:
                return 'Failed to create account. Please try again.';
        }
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (name) {
                await updateProfile(user, {
                    displayName: name,
                });
            }
        } catch (error) {
            console.error('Registration Error:', error);
            setError(formatErrorMessage(error.code));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Hero Image Section with Curve */}
                <View style={styles.curveWrapper}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../../assets/mountain_new.png')}
                            style={styles.image}
                        />
                    </View>
                </View>

                {/* Form Content */}
                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Sign Up</Text>
                        <Text style={styles.subtitle}>
                            Create an account to start your adventure
                        </Text>
                    </View>

                    {/* Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Saurav Darnal"
                                placeholderTextColor="#999"
                                autoCapitalize="words"
                                color="#1C3D3E"
                            />
                        </View>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="trekmate@gmail.com"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                color="#1C3D3E"
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, { paddingRight: 50 }]}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="********"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                color="#1C3D3E"
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#1C3D3E"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={[styles.signupButton, loading ? styles.signupButtonDisabled : null]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.signupButtonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginLink}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    curveWrapper: {
        width: width,
        height: height * 0.35,
        overflow: 'hidden',
    },
    imageContainer: {
        width: width * 1.8,
        height: height * 0.5,
        position: 'absolute',
        top: -height * 0.1,
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
        backgroundColor: '#fff',
        paddingHorizontal: 30,
        paddingTop: 30,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontFamily: 'Syne-ExtraBold',
        color: '#1C3D3E',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Syne-Regular',
        color: '#666',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
        marginBottom: 8,
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: 'Syne-Regular',
        backgroundColor: '#f9f9f9',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    errorText: {
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 14,
        fontFamily: 'Syne-Bold',
    },
    signupButton: {
        backgroundColor: '#1C3D3E',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        marginVertical: 20,
        shadowColor: '#1C3D3E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    signupButtonDisabled: {
        opacity: 0.7,
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Syne-Bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    loginText: {
        color: '#666',
        fontSize: 15,
        fontFamily: 'Syne-Regular',
    },
    loginLink: {
        color: '#1C3D3E',
        fontSize: 15,
        fontFamily: 'Syne-Bold',
        textDecorationLine: 'underline',
    },
});

export default SignUpScreen;

