import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

const ProfileScreen = () => {
    const user = auth.currentUser;

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>
            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={60} color="#1C3D3E" />
                    </View>
                    <Text style={styles.name}>{user?.displayName || 'Saurav Darnal'}</Text>
                    <Text style={styles.email}>{user?.email || 'saurav@trekmate.com'}</Text>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: 'Syne-ExtraBold',
        color: '#1C3D3E',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3F4F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#1C3D3E',
    },
    name: {
        fontSize: 24,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        fontFamily: 'Syne-Regular',
        color: '#666',
    },
    logoutButton: {
        backgroundColor: '#1C3D3E',
        marginHorizontal: 30,
        marginTop: 40,
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#1C3D3E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoutText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Syne-Bold',
    },
});

export default ProfileScreen;
