import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, StatusBar, FlatList } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyTripsScreen({ navigation }) {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/trips/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setTrips(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load your trips');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
       const token = await AsyncStorage.getItem('userToken');
       try {
           const res = await fetch(`${API_BASE_URL}/trips/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
           });
           if (res.ok) fetchTrips();
       } catch (error) { Alert.alert('Error', 'Update failed'); }
    }

    const cancelTrip = async (id) => {
        Alert.alert('Cancel Trip', 'Are you sure?', [
            { text: 'No' },
            { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
                const token = await AsyncStorage.getItem('userToken');
                const res = await fetch(`${API_BASE_URL}/trips/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) fetchTrips();
            }}
        ]);
    };

    const renderTrip = ({ item }) => (
        <TouchableOpacity 
            style={{ backgroundColor: COLORS.glassCardDark, padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border1 }}
            onPress={() => navigation.navigate('TripDetails', { tripId: item._id })}
        >
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '700' }}>#{item.status.toUpperCase()}</Text>
                <TouchableOpacity onPress={() => cancelTrip(item._id)}>
                    <Text style={{ color: COLORS.error, fontSize: 13 }}>Cancel ×</Text>
                </TouchableOpacity>
            </View>
            <Text style={{ color: COLORS.white, fontSize: 20, fontWeight:'700', marginTop: 5 }}>{item.title}</Text>
            {item.startDate && (
                 <Text style={{ color: COLORS.textSoft, fontSize: 11, marginTop: 4 }}>
                   📅 {new Date(item.startDate).toLocaleDateString()} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}
                 </Text>
            )}
            <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 4 }}>{item.places.length} Hidden destinations selected</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
                {item.places.map(p => (
                    <Image key={p._id} source={{ uri: p.imageUrl }} style={{ width: 80, height: 60, borderRadius: 10, marginRight: 10 }} />
                ))}
            </ScrollView>

            <View style={{flexDirection:'row', gap: 10, marginTop: 20}}>
                {item.status === 'Planned' ? (
                <TouchableOpacity 
                    style={[globalStyles.button, { flex: 1, height: 40, backgroundColor: COLORS.successSurf, shadowColor: 'transparent' }]}
                    onPress={() => updateStatus(item._id, 'Completed')}
                >
                    <Text style={{ color: COLORS.success, fontWeight: '700', fontSize: 12 }}>Mark Completed ✓</Text>
                </TouchableOpacity> ) : (
                <View style={[globalStyles.button, { flex: 1, height: 40, backgroundColor: COLORS.glass2, shadowColor: 'transparent' }]}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Completed</Text>
                </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={globalStyles.screenRoot}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage}>
                <View style={globalStyles.overlay} />
                
                <View style={{ padding: 24, paddingTop: 60, flex: 1 }}>
                    <View style={globalStyles.rowBetween}>
                       <View>
                         <Text style={globalStyles.title}>Trip Planner</Text>
                         <Text style={globalStyles.subtitle}>Your hidden gem adventures</Text>
                       </View>
                       <TouchableOpacity 
                         style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.accent, justifyContent:'center', alignItems:'center' }}
                         onPress={() => navigation.navigate('CreateTrip')}
                       >
                         <Text style={{ fontSize: 20, color: COLORS.textDark }}>+</Text>
                       </TouchableOpacity>
                    </View>

                    {loading ? (
                      <ActivityIndicator color={COLORS.accent} />
                    ) : (
                      <FlatList
                        data={trips}
                        renderItem={renderTrip}
                        keyExtractor={item => item._id}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<Text style={{color: COLORS.textMuted, textAlign:'center'}}>No trip plans created yet</Text>}
                      />
                    )}
                </View>

                {/* Back to Home Button */}
                <TouchableOpacity style={globalStyles.buttonGhost} onPress={() => navigation.goBack()}>
                    <Text style={globalStyles.buttonGhostText}>← Back to Home</Text>
                </TouchableOpacity>

            </ImageBackground>
        </View>
    );
}
