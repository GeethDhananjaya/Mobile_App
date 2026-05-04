import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, StatusBar, FlatList, Modal, StyleSheet, ScrollView } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CategoriesScreen({ navigation }) {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('📍');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState([]);
    const [popularCategories, setPopularCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [user, setUser] = useState(null);
    
    // Modal states for editing
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        initData();
    }, []);

    const initData = async () => {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) setUser(JSON.parse(userData));
        fetchCategories();
        fetchPopular();
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/categories`);
            const data = await res.json();
            if (res.ok) setCategories(data);
        } catch (error) { Alert.alert('Error', 'Failed to load categories'); }
        finally { setFetching(false); }
    };

    const fetchPopular = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/categories/popular`);
            const data = await res.json();
            if (res.ok) setPopularCategories(data);
        } catch (error) {}
    };

    const addCategory = async () => {
        if (!name || !description) {
            Alert.alert('Incomplete', 'Name and description are required');
            return;
        }
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/categories`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ name, icon, description })
            });

            if (res.ok) {
                setName('');
                setIcon('📍');
                setDescription('');
                fetchCategories();
                Alert.alert('Success', 'Category added!');
            } else {
                Alert.alert('Error', 'Failed to add category');
            }
        } catch (error) { Alert.alert('Network Error', 'Connection failed'); }
        finally { setLoading(false); }
    };

    const handleUpdate = async () => {
        if (!editingCategory.name || !editingCategory.description) return;
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/categories/${editingCategory._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(editingCategory)
            });
            if (res.ok) {
                setEditModalVisible(false);
                fetchCategories();
                Alert.alert('Success', 'Category updated!');
            }
        } catch (error) { Alert.alert('Error', 'Update failed'); }
        finally { setLoading(false); }
    };

    const deleteCategory = async (id) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to remove this category?', [
            { text: 'Cancel' },
            { text: 'Delete', style:'destructive', onPress: async () => {
                const token = await AsyncStorage.getItem('userToken');
                try {
                    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) fetchCategories();
                } catch (error) { Alert.alert('Error', 'Delete failed'); }
            }}
        ]);
    };

    const startEdit = (item) => {
        setEditingCategory(item);
        setEditModalVisible(true);
    };

    const renderCategoryItem = ({ item }) => (
        <View style={styles.catCard}>
            <View style={{flexDirection:'row', gap: 12, alignItems:'center', flex: 1}}>
                <Text style={{fontSize: 24}}>{item.icon}</Text>
                <View style={{flex: 1}}>
                    <Text style={{color: COLORS.white, fontWeight: '700', fontSize: 16}}>{item.name}</Text>
                    {item.description && <Text numberOfLines={1} style={{color: COLORS.textMuted, fontSize: 12}}>{item.description}</Text>}
                </View>
            </View>
            {isAdmin && (
                <View style={{flexDirection:'row', gap: 15}}>
                    <TouchableOpacity onPress={() => startEdit(item)}>
                        <Text style={{color: COLORS.accent}}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteCategory(item._id)}>
                        <Text style={{color: COLORS.error}}>×</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={globalStyles.screenRoot}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage}>
                <View style={globalStyles.overlay} />
                <View style={{ flex: 1, padding: 24, paddingTop: 60 }}>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={globalStyles.title} numberOfLines={1}>{isAdmin ? 'Manage Categories' : 'Destinations'}</Text>
                            <Text style={globalStyles.subtitle} numberOfLines={1}>Explore world by experience</Text>
                        </View>
                        <TouchableOpacity 
                            style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginTop: 5 }} 
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={{ color: COLORS.white, fontWeight: '600', fontSize: 12 }}>← Back</Text>
                        </TouchableOpacity>
                    </View>

                    {isAdmin && (
                        <View style={[globalStyles.card, { marginTop: 20 }]}>
                            <Text style={{color: COLORS.white, fontWeight:'700', marginBottom: 10}}>Create New Category</Text>
                            <View style={{flexDirection:'row', gap: 10, alignItems:'center'}}>
                                <View style={[globalStyles.inputRow, {width: 60, justifyContent:'center'}]}>
                                    <TextInput style={globalStyles.input} placeholder="Icon" value={icon} onChangeText={setIcon} maxLength={2} />
                                </View>
                                <View style={[globalStyles.inputRow, {flex: 1}]}>
                                    <TextInput style={globalStyles.input} placeholder="Category Name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
                                </View>
                            </View>
                            <View style={[globalStyles.inputRow, {marginTop: 10, height: 60}]}>
                                <TextInput 
                                    style={globalStyles.input} 
                                    placeholder="Brief description..." 
                                    placeholderTextColor={COLORS.textMuted} 
                                    multiline 
                                    value={description} 
                                    onChangeText={setDescription} 
                                />
                            </View>
                            <TouchableOpacity 
                                style={[globalStyles.button, {marginTop: 15, height: 48}]} 
                                onPress={addCategory}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color={COLORS.textDark} /> : <Text style={globalStyles.buttonText}>Add Category ✦</Text>}
                            </TouchableOpacity>
                        </View>
                    )}

                    {!fetching && popularCategories.length > 0 && !isAdmin && (
                        <View style={{marginTop: 20}}>
                            <Text style={{color: COLORS.accent, fontWeight:'800', fontSize: 12, letterSpacing: 1, marginBottom: 15}}>POPULAR CATEGORIES</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 10}}>
                                {popularCategories.map(p => (
                                    <TouchableOpacity key={p._id} style={styles.popChip} onPress={() => navigation.navigate('Home', { activeCat: p._id })}>
                                        <Text style={{fontSize: 20}}>{p.icon}</Text>
                                        <Text style={{color: COLORS.white, fontWeight:'600', marginLeft: 8}}>{p.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <Text style={{color: COLORS.white, fontWeight:'800', fontSize: 12, letterSpacing: 1, marginTop: 25, marginBottom: 15}}>ALL CATEGORIES</Text>
                    {fetching ? (
                        <ActivityIndicator color={COLORS.accent} style={{marginTop: 50}} />
                    ) : (
                        <FlatList
                            data={categories}
                            renderItem={renderCategoryItem}
                            keyExtractor={item => item._id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{paddingBottom: 40}}
                        />
                    )}

                </View>

                {/* Edit Modal */}
                <Modal visible={isEditModalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Update Category</Text>
                            {editingCategory && (
                                <View>
                                    <View style={globalStyles.inputGroup}>
                                        <Text style={globalStyles.fieldLabel}>Name & Icon</Text>
                                        <View style={{flexDirection:'row', gap: 10}}>
                                            <View style={[globalStyles.inputRow, {width: 60}]}>
                                                <TextInput style={globalStyles.input} value={editingCategory.icon} onChangeText={(v) => setEditingCategory({...editingCategory, icon: v})} maxLength={2} />
                                            </View>
                                            <View style={[globalStyles.inputRow, {flex: 1}]}>
                                                <TextInput style={globalStyles.input} value={editingCategory.name} onChangeText={(v) => setEditingCategory({...editingCategory, name: v})} />
                                            </View>
                                        </View>
                                    </View>
                                    <View style={globalStyles.inputGroup}>
                                        <Text style={globalStyles.fieldLabel}>Description</Text>
                                        <View style={[globalStyles.inputRow, {height: 80, alignItems:'flex-start', paddingVertical: 10}]}>
                                            <TextInput style={globalStyles.input} multiline value={editingCategory.description} onChangeText={(v) => setEditingCategory({...editingCategory, description: v})} />
                                        </View>
                                    </View>
                                    
                                    <TouchableOpacity style={[globalStyles.button, {marginTop: 20}]} onPress={handleUpdate} disabled={loading}>
                                        {loading ? <ActivityIndicator color={COLORS.textDark} /> : <Text style={globalStyles.buttonText}>Save Changes</Text>}
                                    </TouchableOpacity>
                                    <TouchableOpacity style={globalStyles.buttonGhost} onPress={() => setEditModalVisible(false)}>
                                        <Text style={globalStyles.buttonGhostText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>

            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    catCard: {
        flexDirection:'row', 
        backgroundColor: COLORS.glassCardDark, 
        padding: 16, 
        borderRadius: 20, 
        marginBottom: 12, 
        alignItems:'center', 
        justifyContent: 'space-between', 
        borderWidth: 1, 
        borderColor: COLORS.border1
    },
    popChip: {
        flexDirection:'row', 
        alignItems:'center', 
        backgroundColor: COLORS.glass1, 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        borderRadius: 16, 
        marginRight: 10, 
        borderWidth: 1, 
        borderColor: COLORS.border1
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 24
    },
    modalContent: {
        backgroundColor: COLORS.glassCardDark,
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border1
    },
    modalTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 20,
        textAlign: 'center'
    }
});
