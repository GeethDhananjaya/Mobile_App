import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, ImageBackground, StatusBar, FlatList, Image, Modal } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateTripScreen({ navigation, route }) {
    const editingTrip = route.params?.trip;
    
    const [title, setTitle] = useState(editingTrip?.title || '');
    const [allPlaces, setAllPlaces] = useState([]);
    const [selectedPlaces, setSelectedPlaces] = useState(editingTrip?.places?.map(p => p._id || p) || []);
    const [startDate, setStartDate] = useState(editingTrip?.startDate ? new Date(editingTrip.startDate).toISOString().split('T')[0] : '');
    const [endDate, setEndDate] = useState(editingTrip?.endDate ? new Date(editingTrip.endDate).toISOString().split('T')[0] : '');
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [placesLoading, setPlacesLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    // Custom Calendar Logic attributes
    const [activeDateType, setActiveDateType] = useState(null); // 'start' or 'end'
    const [viewDate, setViewDate] = useState(new Date());

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ["S", "M", "T", "W", "T", "F", "S"];

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const changeMonth = (offset) => {
        const nextDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(nextDate);
    };

    const handleDateSelect = (day) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const dateString = selected.toISOString().split('T')[0];
        
        if (activeDateType === 'start') {
            setStartDate(dateString);
            setShowStart(false);
        } else {
            if (startDate && selected < new Date(startDate)) {
                Alert.alert("Invalid Date", "End date cannot be before start date");
                return;
            }
            setEndDate(dateString);
            setShowEnd(false);
        }
    };

    const CalendarModal = ({ visible, onClose, title }) => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysCount = getDaysInMonth(month, year);
        const firstDay = getFirstDayOfMonth(month, year);
        
        const grid = [];
        for (let i = 0; i < firstDay; i++) grid.push(null);
        for (let i = 1; i <= daysCount; i++) grid.push(i);

        return (
            <Modal visible={visible} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <View style={[globalStyles.card, { padding: 20, width: '100%', elevation: 25 }]}>
                        <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 20, color: COLORS.accent }]}>{title}</Text>
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 10 }}><Text style={{ color: COLORS.white, fontSize: 18 }}>◀</Text></TouchableOpacity>
                            <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 16 }}>{months[month]} {year}</Text>
                            <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 10 }}><Text style={{ color: COLORS.white, fontSize: 18 }}>▶</Text></TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {days.map((d, i) => (
                                <Text key={i} style={{ width: '14.28%', textAlign: 'center', color: COLORS.textMuted, fontSize: 11, fontWeight:'700', marginBottom: 15 }}>{d}</Text>
                            ))}
                            {grid.map((day, i) => (
                                <TouchableOpacity 
                                    key={i} 
                                    disabled={!day}
                                    onPress={() => day && handleDateSelect(day)}
                                    style={{ 
                                        width: '14.28%', height: 42, justifyContent: 'center', alignItems: 'center',
                                        borderRadius: 10, backgroundColor: day ? 'rgba(255,255,255,0.06)' : 'transparent',
                                        marginBottom: 6, borderWidth: 0.5, borderColor: day ? 'rgba(255,255,255,0.1)' : 'transparent'
                                    }}
                                >
                                    <Text style={{ color: day ? COLORS.white : 'transparent', fontWeight: day ? '600' : '400' }}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={[globalStyles.button, { marginTop: 25 }]} onPress={onClose}>
                            <Text style={globalStyles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    useEffect(() => {
        fetchPlaces();
    }, []);

    const fetchPlaces = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/places`);
            const data = await res.json();
            if (res.ok) setAllPlaces(data);
        } catch (error) { Alert.alert('Error', 'Failed to load destinations'); }
        finally { setPlacesLoading(false); }
    };

    const toggleSelection = (id) => {
        if (selectedPlaces.includes(id)) {
            setSelectedPlaces(selectedPlaces.filter(pId => pId !== id));
        } else {
            setSelectedPlaces([...selectedPlaces, id]);
        }
    };

    const handleSubmit = async () => {
        if (!title || selectedPlaces.length === 0) {
            Alert.alert('Incomplete Trip', 'Please add a title and select some places');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for comparison
        const tripStart = new Date(startDate);
        const tripEnd = new Date(endDate);

        if (tripStart < today) {
            Alert.alert('Invalid Date', 'The trip start date cannot be in the past.');
            return;
        }

        if (tripEnd < tripStart) {
            Alert.alert('Invalid Date', 'The trip end date must be after the start date.');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const url = editingTrip ? `${API_BASE_URL}/trips/${editingTrip._id}` : `${API_BASE_URL}/trips`;
            const method = editingTrip ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    title, places: selectedPlaces, startDate, endDate
                })
            });

            if (res.ok) {
                Alert.alert(editingTrip ? 'Trip Updated!' : 'Trip Created!', 'Enjoy your journey');
                navigation.navigate('MyTrips');
            } else {
                const errorData = await res.json();
                Alert.alert('Submission Failed', errorData.message || 'Server returned an error');
            }
        } catch (error) {
            Alert.alert('Network Error', 'Could not connect to server. Please check your internet.');
        } finally {
            setLoading(false);
        }
    };

    const renderPlaceItem = ({ item }) => (
        <TouchableOpacity 
            style={{ 
                flex: 1, marginHorizontal: 8, marginBottom: 16, backgroundColor: COLORS.glass2, borderRadius: 16, borderWidth: 1, 
                borderColor: selectedPlaces.includes(item._id) ? COLORS.accent : COLORS.border1, overflow: 'hidden' 
            }}
            onPress={() => toggleSelection(item._id)}
        >
            <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 100 }} />
            <View style={{ padding: 10 }}>
                <Text numberOfLines={1} style={{ color: COLORS.white, fontSize: 13, fontWeight: '700' }}>{item.title}</Text>
                <Text style={{ color: selectedPlaces.includes(item._id) ? COLORS.accent : COLORS.textMuted, fontSize: 11 }}>
                    {selectedPlaces.includes(item._id) ? 'Selected ✓' : 'Tap to add'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={globalStyles.screenRoot}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage}>
                <View style={globalStyles.overlay} />
                <View style={{ flex: 1, padding: 24, paddingTop: 60 }}>
                    
                    <View style={globalStyles.brandWrapper}>
                        <Text style={globalStyles.appName}>Plan Adventure</Text>
                        <Text style={globalStyles.appTagline}>Select hidden gems and group them into a single journey</Text>
                    </View>

                    <View style={[globalStyles.card, { flex: 1 }]}>
                        <Text style={globalStyles.fieldLabel}>Trip Title</Text>
                        <View style={[globalStyles.inputRow, { marginBottom: 20 }]}>
                            <TextInput 
                                style={globalStyles.input} 
                                placeholder="e.g., Weekend Hidden Waterfall Tour" 
                                placeholderTextColor={COLORS.textMuted} 
                                value={title} 
                                onChangeText={setTitle} 
                            />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={globalStyles.fieldLabel}>Start Date</Text>
                                <TouchableOpacity 
                                    style={globalStyles.inputRow} 
                                    onPress={() => { setActiveDateType('start'); setShowStart(true); }}
                                >
                                    <Text style={{ color: startDate ? COLORS.white : COLORS.textMuted, flex: 1, paddingVertical: 12 }}>
                                        {startDate || 'Select Date'}
                                    </Text>
                                    <Text style={{ fontSize: 16 }}>📅</Text>
                                </TouchableOpacity>
                                <CalendarModal 
                                    visible={showStart} 
                                    onClose={() => setShowStart(false)} 
                                    title="Start Date" 
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={globalStyles.fieldLabel}>End Date</Text>
                                <TouchableOpacity 
                                    style={globalStyles.inputRow} 
                                    onPress={() => { setActiveDateType('end'); setShowEnd(true); }}
                                >
                                    <Text style={{ color: endDate ? COLORS.white : COLORS.textMuted, flex: 1, paddingVertical: 12 }}>
                                        {endDate || 'Select Date'}
                                    </Text>
                                    <Text style={{ fontSize: 16 }}>📅</Text>
                                </TouchableOpacity>
                                <CalendarModal 
                                    visible={showEnd} 
                                    onClose={() => setShowEnd(false)} 
                                    title="End Date" 
                                />
                            </View>
                        </View>

                        <Text style={globalStyles.fieldLabel}>Hidden Gems to Visit ({selectedPlaces.length} selected)</Text>
                        
                        {placesLoading ? (
                             <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />
                        ) : (
                            <FlatList
                                data={allPlaces}
                                renderItem={renderPlaceItem}
                                keyExtractor={item => item._id}
                                numColumns={2}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingVertical: 10 }}
                                ListEmptyComponent={<Text style={{color: COLORS.textMuted, textAlign:'center'}}>No places found to add</Text>}
                            />
                        )}

                        <TouchableOpacity 
                            style={[globalStyles.button, (loading || selectedPlaces.length === 0) && globalStyles.buttonDisabled]} 
                            onPress={handleSubmit}
                            disabled={loading || selectedPlaces.length === 0}
                        >
                            {loading ? <ActivityIndicator color={COLORS.textDark} /> : <Text style={globalStyles.buttonText}>Save Trip Plan ✺</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={globalStyles.buttonGhost} onPress={() => navigation.goBack()}>
                            <Text style={globalStyles.buttonGhostText}>← Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}
