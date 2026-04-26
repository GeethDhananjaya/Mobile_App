import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, ImageBackground, StatusBar, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddReviewScreen({ route, navigation }) {
    const { placeId } = route.params;
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async () => {
        if (!comment.trim()) {
            Alert.alert('Empty Review', 'Please tell others what you think!');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ place: placeId, rating, comment })
            });

            if (res.ok) {
                Alert.alert('Review Posted!', 'Thank you for sharing your feedback.');
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to post review');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Network Error', 'Connection lost');
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
                                <Text style={globalStyles.appName}>Sharing is Caring</Text>
                                <Text style={globalStyles.appTagline}>Help others discover hidden gems</Text>
                            </View>

                            <View style={globalStyles.card}>
                                <Text style={globalStyles.title}>Rate this place</Text>
                                <Text style={globalStyles.subtitle}>How was your experience? Give a star rating and comment.</Text>

                                {/* Star Rating */}
                                <View style={{ flexDirection:'row', justifyContent:'center', gap: 15, marginBottom: 30 }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                            <Text style={{ fontSize: 32, color: star <= rating ? COLORS.accent : COLORS.textMuted }}>★</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Comment Entry */}
                                <View style={globalStyles.inputGroup}>
                                    <Text style={globalStyles.fieldLabel}>Your Comment</Text>
                                    <View style={[globalStyles.inputRow, { height: 120, alignItems:'flex-start', paddingVertical: 12 }, focusedField === 'comment' && globalStyles.inputRowFocused]}>
                                        <TextInput
                                            style={[globalStyles.input, { textAlignVertical: 'top' }]}
                                            placeholder="Write your review here..."
                                            placeholderTextColor={COLORS.textMuted}
                                            value={comment}
                                            onChangeText={setComment}
                                            multiline
                                            onFocus={() => setFocusedField('comment')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    style={[globalStyles.button, loading && globalStyles.buttonDisabled, { marginTop: 20 }]} 
                                    onPress={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color={COLORS.textDark} /> : <Text style={globalStyles.buttonText}>Post Review ✦</Text>}
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
