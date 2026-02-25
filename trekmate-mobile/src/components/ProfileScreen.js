import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, storage, db } from '../config/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
    const user = auth.currentUser;
    const [uploading, setUploading] = useState(false);
    const [profileImage, setProfileImage] = useState(user?.photoURL);
    const [bio, setBio] = useState('Passionate about peaks and peace. 🏔️');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState('');

    React.useEffect(() => {
        loadBio();
    }, []);

    const loadBio = async () => {
        try {
            const savedBio = await AsyncStorage.getItem(`bio_${user.uid}`);
            if (savedBio) setBio(savedBio);
        } catch (error) {
            console.log('Error loading bio:', error);
        }
    };

    const handleSaveBio = async () => {
        try {
            await AsyncStorage.setItem(`bio_${user.uid}`, tempBio);
            setBio(tempBio);
            setIsEditingBio(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to save bio');
        }
    };

    const startEditingBio = () => {
        setTempBio(bio);
        setIsEditingBio(true);
    };

    const handleSignOut = async () => {
        try {
            // Mark user as offline before signing out
            if (user) {
                await updateDoc(doc(db, 'users', user.uid), {
                    isOnline: false,
                    lastSeen: new Date()
                });
            }
            await signOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        setUploading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `profiles/${user.uid}`);

            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            await updateProfile(user, {
                photoURL: downloadURL
            });

            setProfileImage(downloadURL);
            Alert.alert('Success', 'Profile picture updated!');
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>
            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
                <View style={styles.profileSection}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={uploading}>
                        <View style={styles.avatar}>
                            {uploading ? (
                                <ActivityIndicator color="#1C3D3E" size="large" />
                            ) : profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                            ) : (
                                <Ionicons name="person" size={60} color="#1C3D3E" />
                            )}
                        </View>
                        <View style={styles.editBadge}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.name}>{user?.displayName || user?.email?.split('@')[0] || 'User'}</Text>
                    <Text style={styles.email}>{user?.email || 'Not logged in'}</Text>

                    {/* Bio Section */}
                    <View style={styles.bioSection}>
                        {isEditingBio ? (
                            <View style={styles.editBioContainer}>
                                <TextInput
                                    style={styles.bioInput}
                                    value={tempBio}
                                    onChangeText={setTempBio}
                                    placeholder="Tell us about your trekking journey..."
                                    multiline
                                    maxLength={100}
                                    autoFocus
                                />
                                <View style={styles.editBioButtons}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditingBio(false)}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBio}>
                                        <Text style={styles.saveText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.bioDisplay} onPress={startEditingBio}>
                                <Text style={styles.bioText}>{bio}</Text>
                                <Ionicons name="pencil" size={14} color="#1C3D3E" style={styles.bioEditIcon} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Stats Section */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Treks Done</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </View>
                    </View>
                </View>

                {/* Account Menu Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.menuHeader}>Account Settings</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIconContainer, { backgroundColor: '#F1F8E8' }]}>
                            <Ionicons name="map-outline" size={22} color="#1C3D3E" />
                        </View>
                        <Text style={styles.menuText}>My Trips</Text>
                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>
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
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3F4F4',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1C3D3E',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#1C3D3E',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
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
    bioSection: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    bioDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    bioText: {
        fontSize: 14,
        fontFamily: 'Syne-Regular',
        color: '#1C3D3E',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    bioEditIcon: {
        marginLeft: 8,
        opacity: 0.6,
    },
    editBioContainer: {
        width: '100%',
        paddingHorizontal: 20,
    },
    bioInput: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        padding: 12,
        fontFamily: 'Syne-Regular',
        fontSize: 14,
        color: '#1C3D3E',
        minHeight: 60,
        textAlignVertical: 'top',
        backgroundColor: '#F9F9F9',
    },
    editBioButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        gap: 15,
    },
    saveBtn: {
        backgroundColor: '#1C3D3E',
        paddingVertical: 6,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    saveText: {
        color: '#fff',
        fontFamily: 'Syne-Bold',
        fontSize: 12,
    },
    cancelBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    cancelText: {
        color: '#666',
        fontFamily: 'Syne-Regular',
        fontSize: 12,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 30,
        backgroundColor: '#f9f9f9',
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 10,
        width: '100%',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Syne-Regular',
        color: '#666',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: '#DDD',
        alignSelf: 'center',
    },
    menuSection: {
        paddingHorizontal: 30,
        marginTop: 10,
    },
    menuHeader: {
        fontSize: 18,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Syne-Bold',
        color: '#444',
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
