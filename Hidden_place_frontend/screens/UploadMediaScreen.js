import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, StatusBar, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function UploadMediaScreen({ route, navigation }) {
    const { placeId } = route.params;
    const [mediaUri, setMediaUri] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setMediaUri(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!mediaUri) {
            Alert.alert('No Media', 'Please select a photo first');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            
            const formData = new FormData();
            formData.append('place', placeId);
            formData.append('caption', caption);
            formData.append('type', 'image');
            
            // Extract filename and type from URI
            const uriParts = mediaUri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            
            formData.append('media', {
                uri: mediaUri,
                name: `photo.${fileType}`,
                type: `image/${fileType}`
            });

            const res = await fetch(`${API_BASE_URL}/media/upload`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                },
                body: formData
            });

            if (res.ok) {
                Alert.alert('Success!', 'Your contribution has been added to the gallery.');
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to upload media');
            }
        } catch (error) {
            Alert.alert('Network Error', 'Check your connection');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={globalStyles.screenRoot}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage}>
                <View style={globalStyles.overlay} />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView contentContainerStyle={globalStyles.authScrollContent}>
                            
                            <View style={globalStyles.brandWrapper}>
                                <Text style={globalStyles.appName}>Visual Evidence</Text>
                                <Text style={globalStyles.appTagline}>Upload photos of this hidden place for the community</Text>
                            </View>

                            <View style={globalStyles.card}>
                                <Text style={globalStyles.title}>Upload Photo</Text>
                                <Text style={globalStyles.subtitle}>Show the world what you found</Text>

                                {/* Media Selection */}
                                <TouchableOpacity 
                                    style={[globalStyles.inputRow, {height: 180, justifyContent:'center', borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.accentBorder, backgroundColor: COLORS.glass1, overflow: 'hidden'}]} 
                                    onPress={pickImage}
                                >
                                    {mediaUri ? (
                                        <Image source={{ uri: mediaUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                    ) : (
                                        <View style={{alignItems:'center'}}>
                                            <Text style={{fontSize: 40}}>📸</Text>
                                            <Text style={{color: COLORS.accent, fontWeight: '700', marginTop: 10}}>Tap to Select From Gallery</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* Caption Entry */}
                                <View style={[globalStyles.inputGroup, {marginTop: 20}]}>
                                    <Text style={globalStyles.fieldLabel}>Caption (Optional)</Text>
                                    <View style={[globalStyles.inputRow, focusedField === 'caption' && globalStyles.inputRowFocused]}>
                                        <TextInput
                                            style={globalStyles.input}
                                            placeholder="Write a short description..."
                                            placeholderTextColor={COLORS.textMuted}
                                            value={caption}
                                            onChangeText={setCaption}
                                            onFocus={() => setFocusedField('caption')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    style={[globalStyles.button, loading && globalStyles.buttonDisabled, { marginTop: 20 }]} 
                                    onPress={handleUpload}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color={COLORS.textDark} /> : <Text style={globalStyles.buttonText}>Upload Photo ✺</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity style={globalStyles.buttonGhost} onPress={() => navigation.goBack()}>
                                    <Text style={globalStyles.buttonGhostText}>← Cancel</Text>
                                </TouchableOpacity>

                            </View>
                        </ScrollView>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
}
