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
import { signInWithEmailAndPassword } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Login Error:', error);
            setError('Invalid email or password.');
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
                        <Text style={styles.title}>Log In</Text>
                        <Text style={styles.subtitle}>
                            Hi! welcome back, you've been missed
                        </Text>
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
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading ? styles.loginButtonDisabled : null]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Log In</Text>
                        )}
                    </TouchableOpacity>

                    {/* Sign Up Link */}
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>
                            Don't have an account?{' '}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('SignUp')}
                        >
                            <Text style={styles.signupLink}>Sign up</Text>
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
        height: height * 0.4,
        overflow: 'hidden',
    },
    imageContainer: {
        width: width * 1.8,
        height: height * 0.55,
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
        marginBottom: 32,
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
        marginBottom: 20,
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
        color: '#1C3D3E',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    forgotPasswordText: {
        color: '#1C3D3E',
        fontSize: 14,
        fontFamily: 'Syne-Bold',
    },
    errorText: {
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 14,
        fontFamily: 'Syne-Bold',
    },
    loginButton: {
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
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Syne-Bold',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    signupText: {
        color: '#666',
        fontSize: 15,
        fontFamily: 'Syne-Regular',
    },
    signupLink: {
        color: '#1C3D3E',
        fontSize: 15,
        fontFamily: 'Syne-Bold',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;

