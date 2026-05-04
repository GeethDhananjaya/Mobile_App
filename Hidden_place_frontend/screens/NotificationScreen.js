import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, StatusBar, Dimensions } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationScreen({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setNotifications(data);
                // Mark as read immediately when viewed
                await fetch(`${API_BASE_URL}/notifications/read`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePress = (item) => {
        if (item.type === 'NEW_PLACE' && item.relatedId) {
            navigation.navigate('PlaceDetails', { placeId: item.relatedId });
        } else if (item.type === 'NEW_REVIEW' || item.type === 'NEW_GUIDE_REGISTER') {
            navigation.navigate('ManageGuides');
        } else if (item.type === 'NEW_COMMENT' && item.relatedId) {
            navigation.navigate('PlaceDetails', { placeId: item.relatedId });
        } else {
            // General fallback
            Alert.alert(item.title, item.message);
        }
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity 
                style={[globalStyles.card, { padding: 15, marginBottom: 10, backgroundColor: item.isRead ? COLORS.glass1 : 'rgba(232, 184, 75, 0.15)' }]}
                onPress={() => handlePress(item)}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.glass2, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 18 }}>
                            {item.type === 'NEW_PLACE' ? '🗺️' : 
                             item.type === 'NEW_REVIEW' ? '⭐' : 
                             item.type === 'NEW_COMMENT' ? '💬' : '🔔'}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[globalStyles.title, { fontSize: 14, marginBottom: 2 }]}>{item.title}</Text>
                        <Text style={globalStyles.subtitle}>{item.message}</Text>
                    </View>
                    {!item.isRead && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error }} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={globalStyles.screenRoot}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage}>
                <View style={globalStyles.overlay} />
                <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity 
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={{ color: COLORS.white, fontWeight: '600' }}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold' }}>Notifications</Text>
                    <View style={{ width: 60 }} />
                </View>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={COLORS.accent} />
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 50 }}
                        ListEmptyComponent={<Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 50 }}>No new notifications.</Text>}
                    />
                )}
            </ImageBackground>
        </View>
    );
}
