import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, StatusBar, ScrollView, Platform } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ManageGuidesScreen({ navigation }) {
    const [pendingGuides, setPendingGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingGuides();
    }, []);

    const fetchPendingGuides = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/auth/admin/guides-pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPendingGuides(await res.json());
            } else {
                const data = await res.json();
                Alert.alert('Error', data.message || 'Failed to load pending guides');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Network error while fetching guides');
        } finally {
            setLoading(false);
        }
    };

    const approveGuide = async (id) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/auth/admin/guides-approve/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                const isPartial = data.message.includes('email notification failed');
                Alert.alert(
                    isPartial ? 'Approved with Warning' : 'Success', 
                    data.message || 'Local Guide has been approved!'
                );
                fetchPendingGuides();
            } else {
                Alert.alert('Error', data.message || 'Could not approve guide');
            }
        } catch (e) {
            Alert.alert('Error', 'Network error: ' + e.message);
        }
    };

    const rejectGuide = async (id) => {
        Alert.alert('Confirm Rejection', 'Are you sure you want to reject this application?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Reject', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('userToken');
                        const res = await fetch(`${API_BASE_URL}/auth/admin/guides-reject/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                            Alert.alert('Rejected', 'Application has been removed.');
                            fetchPendingGuides();
                        }
                    } catch (e) {
                        Alert.alert('Error', 'Failed to reject application');
                    }
                }
            }
        ]);
    };

    return (
        <View style={globalStyles.screenRoot}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage}>
                <View style={globalStyles.overlay} />
                
                <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: 60, paddingHorizontal: 24, paddingBottom: 40 }}>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.glass2, justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                            <Text style={{ color: COLORS.white, fontSize: 20 }}>←</Text>
                        </TouchableOpacity>
                        <View>
                            <Text style={[globalStyles.title, { marginBottom: 0 }]}>Manage Guides</Text>
                            <Text style={globalStyles.subtitle}>Review pending guide applications</Text>
                        </View>
                    </View>

                    {loading ? (
                        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 50 }} />
                    ) : (                        <View style={{ gap: 16 }}>
                            {pendingGuides.map(g => (
                                <TouchableOpacity 
                                    key={g._id} 
                                    style={globalStyles.card}
                                    onPress={() => navigation.navigate('GuideDetails', { guide: g })}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '700' }}>{g.name}</Text>
                                            <Text style={{ color: COLORS.accent, fontSize: 13, marginTop: 2 }}>{g.creator?.email || 'N/A'}</Text>
                                        </View>
                                        <View style={{ backgroundColor: COLORS.glass1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                                            <Text style={{ color: COLORS.textMuted, fontSize: 9, fontWeight: '800' }}>PENDING</Text>
                                        </View>
                                    </View>
                                    
                                    <View style={{ marginTop: 15, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                                        <Text style={{ color: COLORS.textSoft, fontSize: 13, fontStyle: 'italic' }}>
                                            {g.bio || g.creator?.bio || 'No bio provided.'}
                                        </Text>
                                        <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 10 }}>
                                            Experience: {g.experience} • Rate: {g.rates}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                                        <TouchableOpacity 
                                            onPress={() => approveGuide(g._id)} 
                                            style={[globalStyles.button, { flex: 1, height: 40, backgroundColor: COLORS.successSurf, shadowColor: 'transparent', borderColor: COLORS.success, borderWidth: 1 }]}
                                        >
                                            <Text style={{ color: COLORS.success, fontWeight: '700', fontSize: 13 }}>Approve ✓</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            onPress={() => rejectGuide(g._id)} 
                                            style={[globalStyles.button, { flex: 1, height: 40, backgroundColor: 'rgba(255,107,107,0.14)', shadowColor: 'transparent', borderColor: COLORS.error, borderWidth: 1 }]}
                                        >
                                            <Text style={{ color: COLORS.error, fontWeight: '700', fontSize: 13 }}>Reject ✖</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ))}

                            {pendingGuides.length === 0 && (
                                <View style={{ alignItems: 'center', marginTop: 100 }}>
                                    <Text style={{ fontSize: 40, marginBottom: 15 }}>🛡️</Text>
                                    <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '700' }}>All Caught Up!</Text>
                                    <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>No pending guide registrations.</Text>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            </ImageBackground>
        </View>
    );
}
