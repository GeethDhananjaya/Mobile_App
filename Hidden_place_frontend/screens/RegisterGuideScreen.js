import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, ImageBackground, StatusBar, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterGuideScreen({ navigation, route }) {
    const editingGuide = route.params?.guide;
    
    const [name, setName] = useState(editingGuide?.name || '');
    const [bio, setBio] = useState(editingGuide?.bio || '');
    const [languages, setLanguages] = useState(editingGuide?.languages?.join(', ') || '');
    const [rates, setRates] = useState(editingGuide?.rates || '');
    const [contact, setContact] = useState(editingGuide?.contact || '');
    const [experience, setExperience] = useState(editingGuide?.experience || '');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async () => {
        if (!name || !bio || !rates || !contact || !experience) {
            Alert.alert('Incomplete Profile', 'Please provide all details including experience');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const url = editingGuide ? `${API_BASE_URL}/guides/${editingGuide._id}` : `${API_BASE_URL}/guides`;
            const method = editingGuide ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    name, bio, languages: languages.split(',').map(l => l.trim()), experience, rates, contact 
                })
            });

            if (res.ok) {
                Alert.alert(editingGuide ? 'Profile Updated!' : 'Profile Registered!', 'Your professional bio is now live.');
                navigation.goBack();
            } else {
                Alert.alert('Error', `Failed to ${editingGuide ? 'update' : 'register'} guide profile`);
            }
        } catch (error) {
            Alert.alert('Network Error', 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (f) => [globalStyles.inputRow, focusedField === f && globalStyles.inputRowFocused];

    return (
        <View style={globalStyles.screenRoot}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage}>
                <View style={globalStyles.overlay} />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView contentContainerStyle={globalStyles.authScrollContent}>
                            
                            <View style={globalStyles.brandWrapper}>
                                <Text style={globalStyles.appName}>Global Presence</Text>
                                <Text style={globalStyles.appTagline}>Join our network of experienced local guides</Text>
                            </View>

                            <View style={globalStyles.card}>
                                <Text style={globalStyles.title}>Register as a Guide</Text>
                                <Text style={globalStyles.subtitle}>Professional details for booking</Text>

                                <View style={globalStyles.inputGroup}>
                                    <Text style={globalStyles.fieldLabel}>Full Name</Text>
                                    <View style={inputStyle('name')}>
                                        <TextInput style={globalStyles.input} placeholder="e.g., John Doe" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} />
                                    </View>
                                </View>

                                <View style={globalStyles.inputGroup}>
                                    <Text style={globalStyles.fieldLabel}>Profile Bio</Text>
                                    <View style={[inputStyle('bio'), {height: 80, alignItems:'flex-start', paddingVertical: 10}]}>
                                        <TextInput style={globalStyles.input} placeholder="Tell us about yourself..." placeholderTextColor={COLORS.textMuted} multiline value={bio} onChangeText={setBio} onFocus={() => setFocusedField('bio')} onBlur={() => setFocusedField(null)} />
                                    </View>
                                </View>

                                <View style={globalStyles.inputGroup}>
                                    <Text style={globalStyles.fieldLabel}>Languages (comma-separated)</Text>
                                    <View style={inputStyle('languages')}>
                                        <TextInput style={globalStyles.input} placeholder="English, sinhala, tamil" placeholderTextColor={COLORS.textMuted} value={languages} onChangeText={setLanguages} onFocus={() => setFocusedField('languages')} onBlur={() => setFocusedField(null)} />
                                    </View>
                                </View>

                                <View style={globalStyles.inputGroup}>
                                    <Text style={globalStyles.fieldLabel}>Rates & Contact</Text>
                                    <View style={{flexDirection:'row', gap: 10}}>
                                        <View style={[inputStyle('experience'), {flex: 1}]}>
                                            <TextInput style={globalStyles.input} placeholder="Exp: 5 years" placeholderTextColor={COLORS.textMuted} value={experience} onChangeText={setExperience} onFocus={() => setFocusedField('experience')} onBlur={() => setFocusedField(null)} />
                                        </View>
                                        <View style={[inputStyle('rates'), {flex: 1}]}>
                                            <TextInput style={globalStyles.input} placeholder="e.g., $40/day" placeholderTextColor={COLORS.textMuted} value={rates} onChangeText={setRates} onFocus={() => setFocusedField('rates')} onBlur={() => setFocusedField(null)} />
                                        </View>
                                    </View>
                                </View>

                                <View style={globalStyles.inputGroup}>
                                    <View style={inputStyle('contact')}>
                                        <TextInput style={globalStyles.input} placeholder="WhatsApp/Phone Number" placeholderTextColor={COLORS.textMuted} value={contact} onChangeText={setContact} onFocus={() => setFocusedField('contact')} onBlur={() => setFocusedField(null)} />
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    style={[globalStyles.button, loading && globalStyles.buttonDisabled]} 
                                    onPress={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color={COLORS.textDark} /> : <Text style={globalStyles.buttonText}>{editingGuide ? 'Update Profile' : 'Register Bio ✦'}</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity style={[globalStyles.buttonGhost, { marginBottom: 40 }]} onPress={() => navigation.goBack()}>
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
