import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, StatusBar, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ navigation }) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
            const parsed = JSON.parse(data);
            setUser(parsed);
            setName(parsed.name);
            setBio(parsed.bio || '');
            setProfileImageUrl(parsed.profileImageUrl || null);
        }
    };

    const handleUpdate = async () => {
        if (!name.trim()) return Alert.alert('Error', 'Name is required');
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name: name.trim(),
                    bio: bio.trim(),
                    password: password || undefined
                })
            });
            const data = await res.json();
            if (res.ok) {
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));
                setUser(data.user);
                Alert.alert('Success ✨', 'Profile updated successfully');
                setPassword('');
                setIsEditing(false);
            }
        } catch (error) { Alert.alert('Error', 'Update failed'); }
        finally { setLoading(false); }
    };

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Continue?', [
            { text: 'Cancel' },
            {
                text: 'Sign Out', style: 'destructive', onPress: async () => {
                    await AsyncStorage.multiRemove(['userToken', 'userData']);
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                }
            }
        ]);
    };

    return (
        <View style={globalStyles.screenRoot}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage}>
                <View style={globalStyles.overlay} />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView contentContainerStyle={globalStyles.authScrollContent}>

                            <View style={[globalStyles.brandWrapper, { marginTop: 60 }]}>
                                <Text style={globalStyles.appName}>{name}</Text>
                                <View style={{ backgroundColor: COLORS.glass1, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, marginTop: 10 }}>
                                    <Text style={{ color: COLORS.accent, fontSize: 10, fontWeight: '700' }}>{user?.role?.toUpperCase()}</Text>
                                </View>

                                {user?.role === 'guide' && (
                                    <TouchableOpacity 
                                        style={{ marginTop: 15, backgroundColor: COLORS.accent, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12 }} 
                                        onPress={() => navigation.navigate('RegisterGuide')}
                                    >
                                        <Text style={{ color: COLORS.textDark, fontWeight: '800', fontSize: 12 }}>Register Guide Profile 🛡️</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={globalStyles.card}>
                                {!isEditing ? (
                                    <>
                                        <Text style={globalStyles.title}>Account Info</Text>
                                        <View style={{ gap: 15, marginTop: 10 }}>
                                            <View>
                                                <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: '700' }}>EMAIL ADDRESS</Text>
                                                <Text style={{ color: COLORS.white, fontSize: 16, marginTop: 4 }}>{user?.email}</Text>
                                            </View>
                                            <View>
                                                <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: '700' }}>ABOUT ME</Text>
                                                <Text style={{ color: COLORS.textSoft, fontSize: 14, marginTop: 4, lineHeight: 20 }}>
                                                    {user?.bio || 'No bio shared yet.'}
                                                </Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity style={[globalStyles.button, { marginTop: 30 }]} onPress={() => setIsEditing(true)}>
                                            <Text style={globalStyles.buttonText}>Update Your Profile ✎</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={globalStyles.title}>Edit Profile</Text>

                                        <View style={globalStyles.inputGroup}>
                                            <Text style={globalStyles.fieldLabel}>Display Name</Text>
                                            <View style={[globalStyles.inputRow, focusedField === 'name' && globalStyles.inputRowFocused]}>
                                                <TextInput style={globalStyles.input} value={name} onChangeText={setName} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} />
                                            </View>
                                        </View>

                                        <View style={globalStyles.inputGroup}>
                                            <Text style={globalStyles.fieldLabel}>About Me (Bio)</Text>
                                            <View style={[globalStyles.inputRow, { height: 80 }, focusedField === 'bio' && globalStyles.inputRowFocused]}>
                                                <TextInput
                                                    style={[globalStyles.input, { textAlignVertical: 'top', paddingTop: 10 }]}
                                                    value={bio}
                                                    onChangeText={setBio}
                                                    multiline
                                                    onFocus={() => setFocusedField('bio')}
                                                    onBlur={() => setFocusedField(null)}
                                                />
                                            </View>
                                        </View>

                                        <View style={globalStyles.inputGroup}>
                                            <Text style={globalStyles.fieldLabel}>New Password (Optional)</Text>
                                            <View style={[globalStyles.inputRow, focusedField === 'pass' && globalStyles.inputRowFocused]}>
                                                <TextInput style={globalStyles.input} placeholder="********" secureTextEntry value={password} onChangeText={setPassword} onFocus={() => setFocusedField('pass')} onBlur={() => setFocusedField(null)} />
                                            </View>
                                        </View>

                                        <TouchableOpacity style={[globalStyles.button, loading && globalStyles.buttonDisabled]} onPress={handleUpdate} disabled={loading}>
                                            {loading ? <ActivityIndicator color={COLORS.textDark} /> : <Text style={globalStyles.buttonText}>Save Changes </Text>}
                                        </TouchableOpacity>

                                        <TouchableOpacity style={globalStyles.buttonGhost} onPress={() => { setIsEditing(false); setPassword(''); }}>
                                            <Text style={globalStyles.buttonGhostText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                <TouchableOpacity style={[globalStyles.buttonGhost, { marginTop: 10 }]} onPress={() => navigation.goBack()}>
                                    <Text style={globalStyles.buttonGhostText}>← Back to Home</Text>
                                </TouchableOpacity>

                                <View style={{ borderTopWidth: 1, borderColor: COLORS.border1, marginTop: 40, paddingTop: 30 }}>
                                    <TouchableOpacity style={[globalStyles.button, { backgroundColor: '#FF6B6B22', shadowColor: 'transparent' }]} onPress={handleSignOut}>
                                        <Text style={{ color: COLORS.error, fontWeight: '700' }}>Sign Out ⏻</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </ScrollView>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
}
