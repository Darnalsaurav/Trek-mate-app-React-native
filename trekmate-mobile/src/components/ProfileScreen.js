import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    TextInput,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, storage, db } from '../config/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscribeToMyTrips } from '../utils/destinationStore';

const ProfileScreen = ({ navigation }) => {
    const user = auth.currentUser;
    const [uploading, setUploading] = useState(false);
    const [profileImage, setProfileImage] = useState(user?.photoURL || null);
    const [bio, setBio] = useState('Happy Trekking! 🏔️');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState('');
    const [myTrips, setMyTrips] = useState([]);

    useEffect(() => {
        const unsubscribe = subscribeToMyTrips((data) => {
            setMyTrips(data);
        });
        return unsubscribe;
    }, []);

    React.useEffect(() => {
        loadBio();
    }, []);

    const loadBio = async () => {
        try {
            const savedBio = await AsyncStorage.getItem(`bio_${user.uid} `);
            if (savedBio) setBio(savedBio);
        } catch (error) {
            console.log('Error loading bio:', error);
        }
    };

    const handleSaveBio = async () => {
        try {
            await AsyncStorage.setItem(`bio_${user.uid} `, tempBio);
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
                // Use setDoc with merge: true instead of updateDoc to ensure it doesn't fail if document is missing
                await setDoc(doc(db, 'users', user.uid), {
                    isOnline: false,
                    lastSeen: new Date()
                }, { merge: true });
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
        console.log('[Cloudinary] Starting upload for:', uri);

        try {
            // 1. Prepare FormData
            const data = new FormData();

            // Extract extension for a cleaner filename
            const ext = uri.split('.').pop();
            const filename = `photo.${ext}`;

            data.append('file', {
                uri,
                type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
                name: filename,
            });

            data.append('upload_preset', 'trek_mate_profile');
            data.append('cloud_name', 'deh4kppsk');

            // 2. Execute Fetch
            const response = await fetch('https://api.cloudinary.com/v1_1/deh4kppsk/image/upload', {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json',
                },
            });

            const result = await response.json();
            console.log('[Cloudinary] Result:', result);

            if (!response.ok) {
                throw new Error(result.error?.message || 'Cloudinary upload failed');
            }

            const downloadURL = result.secure_url;

            // 3. Update Profile & Database
            await updateProfile(user, { photoURL: downloadURL });
            await updateDoc(doc(db, 'users', user.uid), {
                photoURL: downloadURL,
                lastProfileUpdate: new Date()
            });

            setProfileImage(downloadURL);
            Alert.alert('Success', 'Profile picture updated! ✨');
        } catch (error) {
            console.error('[Cloudinary] Error:', error);
            Alert.alert('Upload Failed',
                `Error: ${error.message}\n\n1. Check your internet.\n2. Verify "trek_mate_profile" is an UNSIGNED preset in Cloudinary dashboard.`
            );
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
                            <Text style={styles.statNumber}>{myTrips.length}</Text>
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

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('MyTrips')}
                    >
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
        fontSize: 24,
        fontFamily: 'Syne-ExtraBold',
        color: '#1C3D3E',
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'center',
        paddingTop: 30,
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
    },
    seeAllText: {
        fontSize: 14,
        fontFamily: 'Syne-Bold',
        color: '#666',
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
