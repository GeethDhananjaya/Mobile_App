import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function TripDetailsScreen({ route, navigation }) {
    const { tripId } = route.params;
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTripDetails();
    }, [tripId]);

    const fetchTripDetails = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setTrip(data);
            } else {
                Alert.alert('Error', data.message || 'Failed to load trip details');
            }
        } catch (error) {
            Alert.alert('Error', 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <View style={[globalStyles.screenRoot, { justifyContent: 'center' }]}>
            <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
    );

    if (!trip) return (
        <View style={globalStyles.screenRoot}>
            <Text style={{ color: COLORS.white, textAlign: 'center', marginTop: 100 }}>Trip not found</Text>
        </View>
    );

    return (
        <View style={globalStyles.screenRoot}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage}>
                <View style={globalStyles.overlay} />
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ padding: 24, paddingTop: 60 }}>
                        <TouchableOpacity 
                            style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.glass2, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={{ color: COLORS.white, fontSize: 20 }}>←</Text>
                        </TouchableOpacity>

                        <Text style={[globalStyles.title, { fontSize: 28 }]}>{trip.title}</Text>
                        
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            <View style={{ backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 }}>
                                <Text style={{ color: COLORS.textDark, fontSize: 10, fontWeight: '800' }}>{trip.status.toUpperCase()}</Text>
                            </View>
                            <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                                {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'N/A'} - {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'N/A'}
                            </Text>
                        </View>

                        <View style={{ marginTop: 30 }}>
                            <Text style={globalStyles.sectionTitle}>Destinations to Visit</Text>
                            {trip.places.map((place, index) => (
                                <TouchableOpacity 
                                    key={place._id} 
                                    style={{ backgroundColor: COLORS.glassCardDark, borderRadius: 20, marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border1 }}
                                    onPress={() => navigation.navigate('PlaceDetails', { placeId: place._id })}
                                >
                                    <ImageBackground source={{ uri: place.imageUrl }} style={{ width: '100%', height: 150 }}>
                                        <View style={{ position: 'absolute', top: 15, left: 15, width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: COLORS.textDark, fontWeight: '800' }}>{index + 1}</Text>
                                        </View>
                                    </ImageBackground>
                                    <View style={{ padding: 15 }}>
                                        <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '700' }}>{place.title}</Text>
                                        <Text style={{ color: COLORS.textSoft, fontSize: 13, marginTop: 5 }}>📍 {place.location}</Text>
                                        <Text numberOfLines={2} style={{ color: COLORS.textSoft, fontSize: 12, marginTop: 10, lineHeight: 18 }}>{place.description}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </ImageBackground>
        </View>
    );
}
