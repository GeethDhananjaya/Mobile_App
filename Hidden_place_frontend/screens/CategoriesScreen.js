import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, StatusBar, FlatList } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CategoriesScreen({ navigation }) {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('📍'); // Default emoji
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/categories`);
            const data = await res.json();
            if (res.ok) setCategories(data);
        } catch (error) { Alert.alert('Error', 'Failed to load categories'); }
        finally { setFetching(false); }
    };

    const addCategory = async () => {
        if (!name) return;
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/categories`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ name, icon })
            });

            if (res.ok) {
                setName('');
                setIcon('📍');
                fetchCategories();
            } else {
                Alert.alert('Error', 'Failed to add category');
            }
        } catch (error) { Alert.alert('Network Error', 'Connection failed'); }
        finally { setLoading(false); }
    };

    const deleteCategory = async (id) => {
        const token = await AsyncStorage.getItem('userToken');
        try {
            const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchCategories();
        } catch (error) { Alert.alert('Error', 'Delete failed'); }
    };

    return (
        <View style={globalStyles.screenRoot}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage}>
                <View style={globalStyles.overlay} />
                <View style={{ flex: 1, padding: 24, paddingTop: 60 }}>
                    
                    <Text style={globalStyles.title}>Manage Categories</Text>
                    <Text style={globalStyles.subtitle}>Environmental Tags for Destinations</Text>

                    <View style={[globalStyles.card, { paddingVertical: 15, marginBottom: 20 }]}>
                         <View style={{flexDirection:'row', gap: 10, alignItems:'center'}}>
                            <View style={[globalStyles.inputRow, {width: 60, justifyContent:'center'}]}>
                                <TextInput style={globalStyles.input} placeholder="Icon" value={icon} onChangeText={setIcon} maxLength={2} />
                            </View>
                            <View style={[globalStyles.inputRow, {flex: 1}]}>
                                <TextInput style={globalStyles.input} placeholder="New Category Name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
                            </View>
                            <TouchableOpacity 
                                style={[globalStyles.button, {width: 52, height: 52, borderRadius: 14, shadowColor:'transparent'}]} 
                                onPress={addCategory}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color={COLORS.textDark} /> : <Text style={{fontSize: 24, fontWeight:'700', color: COLORS.textDark}}>+</Text>}
                            </TouchableOpacity>
                         </View>
                    </View>

                    {fetching ? (
                        <ActivityIndicator color={COLORS.accent} />
                    ) : (
                        <FlatList
                            data={categories}
                            renderItem={({ item }) => (
                                <View style={{ flexDirection:'row', backgroundColor: COLORS.glassCardDark, padding: 15, borderRadius: 16, marginBottom: 10, alignItems:'center', justifyContent: 'space-between', borderLeftWidth: 4, borderColor: COLORS.accent }}>
                                    <View style={{flexDirection:'row', gap: 12, alignItems:'center'}}>
                                        <Text style={{fontSize: 20}}>{item.icon}</Text>
                                        <Text style={{color: COLORS.white, fontWeight: '700'}}>{item.name}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => deleteCategory(item._id)}>
                                        <Text style={{color: COLORS.error}}>Remove ×</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            keyExtractor={item => item._id}
                            showsVerticalScrollIndicator={false}
                        />
                    )}

                    <TouchableOpacity style={globalStyles.buttonGhost} onPress={() => navigation.goBack()}>
                        <Text style={globalStyles.buttonGhostText}>← Back to Home</Text>
                    </TouchableOpacity>

                </View>
            </ImageBackground>
        </View>
    );
}
