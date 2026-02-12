import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Image,
    Alert,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { addDestination } from '../utils/destinationStore';

const PlanTripScreen = ({ navigation }) => {
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your gallery to upload images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const isFormValid = destination.trim() !== '' && startDate.trim() !== '' && endDate.trim() !== '';

    const handleConfirmTrip = () => {
        if (!isFormValid) {
            Alert.alert('Missing Fields', 'Please fill in the destination and dates to plan your trek.');
            return;
        }

        addDestination({
            name: destination,
            location: 'Planned Trek',
            image: image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        });

        Alert.alert('Success!', 'Your trek has been planned and added to Explore.', [
            { text: 'OK', onPress: () => navigation.navigate('ExploreTab') }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={28} color="#1C3D3E" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>PLAN YOUR TREK</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: 120 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View>
                                {/* Destination Input */}
                                <View style={styles.inputSection}>
                                    <Text style={styles.label}>Where to go?</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="location-outline" size={22} color="#1C3D3E" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={destination}
                                            onChangeText={setDestination}
                                            placeholder="E.g. Annapurna Base Camp"
                                            placeholderTextColor="#999"
                                        />
                                    </View>
                                </View>

                                {/* Date Inputs */}
                                <View style={styles.dateRow}>
                                    <View style={[styles.inputSection, { flex: 1, marginRight: 10 }]}>
                                        <Text style={styles.label}>Start Date</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="calendar-outline" size={20} color="#1C3D3E" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                value={startDate}
                                                onChangeText={setStartDate}
                                                placeholder="DD/MM/YY"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                    </View>
                                    <View style={[styles.inputSection, { flex: 1, marginLeft: 10 }]}>
                                        <Text style={styles.label}>End Date</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="calendar-outline" size={20} color="#1C3D3E" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                value={endDate}
                                                onChangeText={setEndDate}
                                                placeholder="DD/MM/YY"
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Image Selection */}
                                <View style={styles.inputSection}>
                                    <Text style={styles.label}>Trek Cover Image</Text>
                                    <TouchableOpacity
                                        style={[styles.imagePicker, image ? styles.imagePickerActive : null]}
                                        onPress={pickImage}
                                        activeOpacity={0.7}
                                    >
                                        {image ? (
                                            <Image source={{ uri: image }} style={styles.previewImage} />
                                        ) : (
                                            <View style={styles.placeholderContainer}>
                                                <View style={styles.iconCircle}>
                                                    <Ionicons name="camera-outline" size={30} color="#1C3D3E" />
                                                </View>
                                                <Text style={styles.imagePickerText}>Select an awesome photo</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                {/* Submit Button */}
                                <TouchableOpacity
                                    style={[styles.confirmButton, !isFormValid && styles.confirmButtonDisabled]}
                                    onPress={handleConfirmTrip}
                                    activeOpacity={0.8}
                                    disabled={!isFormValid}
                                >
                                    <Text style={styles.confirmButtonText}>Confirm My Trip</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Syne-ExtraBold',
        color: '#1C3D3E',
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
    },
    inputSection: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F4',
        borderRadius: 15,
        paddingHorizontal: 15,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 18,
        fontSize: 16,
        fontFamily: 'Syne-Regular',
        color: '#1C3D3E',
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    imagePicker: {
        height: 200,
        borderRadius: 20,
        backgroundColor: '#F3F4F4',
        borderWidth: 2,
        borderColor: '#1C3D3E',
        borderStyle: 'dashed',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePickerActive: {
        borderStyle: 'solid',
        borderWidth: 0,
    },
    placeholderContainer: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    imagePickerText: {
        fontSize: 14,
        fontFamily: 'Syne-Bold',
        color: '#1C3D3E',
        opacity: 0.6,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    confirmButton: {
        backgroundColor: '#1C3D3E',
        borderRadius: 15,
        padding: 22,
        alignItems: 'center',
        shadowColor: '#1C3D3E',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        marginTop: 10,
    },
    confirmButtonDisabled: {
        opacity: 0.5,
        elevation: 0,
        shadowOpacity: 0,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Syne-Bold',
    },
});

export default PlanTripScreen;

