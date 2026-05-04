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
    const [rates, setRates] = useState(editingGuide?.rates?.replace(' LKR', '') || '');
    const [contact, setContact] = useState(editingGuide?.contact || '');
    const [startedYear, setStartedYear] = useState(editingGuide?.experience?.replace('Started ', '') || '2024');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [isYearModalVisible, setYearModalVisible] = useState(false);

    const years = Array.from({ length: 41 }, (_, i) => (2024 - i).toString());

    const handleSubmit = async () => {
        // 1. Basic Field Validation
        if (!name || !bio || !rates || !contact || !startedYear) {
            Alert.alert('Incomplete Profile', 'Please provide all details including your start year.');
            return;
        }

        // 2. Phone Number Validation (10 digits)
        const phoneClean = contact.replace(/[^0-9]/g, '');
        if (phoneClean.length !== 10) {
            Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
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
                    name, 
                    bio, 
                    languages: languages.split(',').map(l => l.trim()), 
                    experience: `Started ${startedYear}`, 
                    rates: `${rates} LKR`, 
                    contact: phoneClean 
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
                                <Text style={globalStyles.appName}>Hidden Gems SL</Text>
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
                                        <TextInput style={globalStyles.input} placeholder="English, Sinhala, Tamil" placeholderTextColor={COLORS.textMuted} value={languages} onChangeText={setLanguages} onFocus={() => setFocusedField('languages')} onBlur={() => setFocusedField(null)} />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={[globalStyles.inputGroup, { flex: 1 }]}>
                                        <Text style={globalStyles.fieldLabel}>Started At (Year)</Text>
                                        <TouchableOpacity 
                                            style={inputStyle('startedYear')}
                                            onPress={() => setYearModalVisible(true)}
                                        >
                                            <Text style={globalStyles.inputIcon}>📅</Text>
                                            <Text style={{ color: COLORS.white, flex: 1 }}>{startedYear}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <View style={[globalStyles.inputGroup, { flex: 1 }]}>
                                        <Text style={globalStyles.fieldLabel}>Rate (LKR/hr)</Text>
                                        <View style={inputStyle('rates')}>
                                            <Text style={globalStyles.inputIcon}>💰</Text>
                                            <TextInput style={globalStyles.input} placeholder="e.g. 1500" keyboardType="numeric" placeholderTextColor={COLORS.textMuted} value={rates} onChangeText={setRates} onFocus={() => setFocusedField('rates')} onBlur={() => setFocusedField(null)} />
                                        </View>
                                    </View>
                                </View>

                                <View style={globalStyles.inputGroup}>
                                    <Text style={globalStyles.fieldLabel}>Contact Number (Mobile)</Text>
                                    <View style={inputStyle('contact')}>
                                        <Text style={globalStyles.inputIcon}>📞</Text>
                                        <TextInput style={globalStyles.input} placeholder="0771234567" keyboardType="phone-pad" maxLength={10} placeholderTextColor={COLORS.textMuted} value={contact} onChangeText={setContact} onFocus={() => setFocusedField('contact')} onBlur={() => setFocusedField(null)} />
                                    </View>
                                </View>

                                <TouchableOpacity style={[globalStyles.button, loading && globalStyles.buttonDisabled, { marginTop: 10 }]} onPress={handleSubmit} disabled={loading}>
                                    {loading ? <ActivityIndicator color={COLORS.textDark} /> : <Text style={globalStyles.buttonText}>{editingGuide ? 'Update Profile' : 'Register Profile'}</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity style={[globalStyles.buttonGhost, { marginBottom: 20 }]} onPress={() => navigation.goBack()}>
                                    <Text style={globalStyles.buttonGhostText}>Cancel</Text>
                                </TouchableOpacity>

                                {/* Year Selector Modal */}
                                {isYearModalVisible && (
                                    <View style={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.85)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 1000
                                    }}>
                                        <View style={[globalStyles.card, { maxHeight: 400, width: '90%' }]}>
                                            <Text style={globalStyles.title}>Select Year</Text>
                                            <ScrollView style={{ marginTop: 10 }}>
                                                {years.map(y => (
                                                    <TouchableOpacity 
                                                        key={y} 
                                                        style={{ paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border1 }}
                                                        onPress={() => {
                                                            setStartedYear(y);
                                                            setYearModalVisible(false);
                                                        }}
                                                    >
                                                        <Text style={{ color: COLORS.white, fontSize: 18, textAlign: 'center' }}>{y}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                            <TouchableOpacity 
                                                style={[globalStyles.buttonGhost, { marginTop: 15 }]} 
                                                onPress={() => setYearModalVisible(false)}
                                            >
                                                <Text style={globalStyles.buttonGhostText}>Close</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>

                            </View>
                        </ScrollView>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
}
