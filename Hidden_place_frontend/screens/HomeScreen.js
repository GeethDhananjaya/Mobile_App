import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ImageBackground, ScrollView, TouchableOpacity, Animated, StatusBar, Dimensions, Alert, ActivityIndicator, Image, TextInput, FlatList } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CARD_W = Dimensions.get('window').width * 0.65;

const NAV_TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'guides', label: 'Guides', icon: '👥' },
  { id: 'add', label: 'Add', icon: '➕' },
  { id: 'trips', label: 'Trips', icon: '🔖' },
  { id: 'settings', label: 'Setup', icon: '⚙️' },
];

const useFadeSlide = (delay = 0) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(22)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 580, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 580, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

export default function HomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('home');
  const [activeCat, setActiveCat] = useState('all');
  const [user, setUser] = useState(null);
  const [places, setPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsed = JSON.parse(data);
        setUser(parsed);
      }
    };
    loadUserInfo();
    initData();
  }, []);

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchCategories(), fetchPlaces()]);
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await res.json();
      if (res.ok) setCategories([{ _id: 'all', name: 'All', icon: '🌎' }, ...data]);
    } catch (e) { console.error(e); }
  };

  const fetchPlaces = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/places`);
      const data = await response.json();
      if (response.ok) setPlaces(data);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const filteredPlaces = places.filter(p => {
    const isCatMatch = activeCat === 'all' || p.category?._id === activeCat || p.category === activeCat;
    const isSearchMatch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return isCatMatch && isSearchMatch;
  });

  const a0 = useFadeSlide(0);
  const a1 = useFadeSlide(100);
  const a2 = useFadeSlide(200);
  const a3 = useFadeSlide(300);

  const tabs = NAV_TABS.map(t => {
    if (t.id === 'add' && user?.role === 'admin') {
      return { id: 'manage', label: 'Manage', icon: '🛡️' };
    }
    return t;
  });

  const handleTabPress = (id) => {
    if (id === 'add') {
      navigation.navigate('AddPlace');
    } else if (id === 'manage') {
      navigation.navigate('ManageGuides');
    } else if (id === 'guides') {
      navigation.navigate('GuidesList');
    } else if (id === 'trips') {
      navigation.navigate('MyTrips');
    } else if (id === 'settings') {
      navigation.navigate('Categories');
    } else {
      setActiveTab(id);
    }
  };

  return (
    <View style={globalStyles.screenRoot}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage}>
        <View style={globalStyles.overlay} />

        <FlatList
          data={filteredPlaces}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <Animated.View style={[globalStyles.header, a0, { marginTop: 40 }]}>
                <View>
                  <Text style={globalStyles.headerGreet}>Discover Hidden Places</Text>
                  <Text style={globalStyles.headerName}>{user ? user.name : 'Explorer'}</Text>
                </View>
                <TouchableOpacity style={globalStyles.avatar} onPress={() => navigation.navigate('Profile')}>
                  <Text style={globalStyles.avatarText}>
                    {user ? user.name.substring(0, 2).toUpperCase() : 'EX'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={[globalStyles.searchBar, a1]}>
                <TextInput 
                  style={{ flex: 1, color: COLORS.white, fontSize: 13, height: '100%' }}
                  placeholder="Search for secret destinations..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <View style={globalStyles.filterBtn}>
                  <Text style={globalStyles.filterIcon}>🔍</Text>
                </View>
              </Animated.View>

              <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} style={a2} contentContainerStyle={globalStyles.catScroll}>
                {categories.map(c => (
                  <TouchableOpacity key={c._id} style={[globalStyles.catChip, activeCat === c._id && globalStyles.catChipActive]} onPress={() => setActiveCat(c._id)}>
                    <Text style={{ color: activeCat === c._id ? COLORS.textDark : COLORS.white }}>{c.icon} {c.name}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.ScrollView>

              <Animated.View style={[globalStyles.sectionHeader, a3]}>
                <Text style={globalStyles.sectionTitle}>Secret Hidden Destinations</Text>
                <TouchableOpacity onPress={initData}><Text style={{ color: COLORS.accent }}>Refresh Feed</Text></TouchableOpacity>
              </Animated.View>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={{ 
                backgroundColor: COLORS.glassCardDark, borderRadius: 24, marginBottom: 20, marginHorizontal: 22, overflow: 'hidden', 
                borderWidth: 1, borderColor: COLORS.border1, elevation: 5 
              }} 
              onPress={() => navigation.navigate('PlaceDetails', { placeId: item._id })}
            >
              <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 220 }} />
              <View style={{ padding: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: COLORS.white, fontSize: 20, fontWeight: '700' }}>{item.title}</Text>
                  <View style={{ backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                    <Text style={{ color: COLORS.textDark, fontSize: 10, fontWeight: '800' }}>{item.category?.name || 'Hidden Gem'}</Text>
                  </View>
                </View>
                <Text style={{ color: COLORS.textSoft, fontSize: 13, marginTop: 5 }}>📍 {item.location}</Text>
                <Text numberOfLines={2} style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 12, lineHeight: 18 }}>
                  {item.description}
                </Text>
                
                <View style={{ flexDirection: 'row', marginTop: 15, alignItems: 'center', gap: 15 }}>
                  <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: '700' }}>Read More →</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>By {item.creator?.name || 'Local Guide'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color={COLORS.accent} style={{ marginTop: 50 }} />
            ) : (
              <View style={{ height: 200, backgroundColor: COLORS.glass1, borderRadius: 22, marginHorizontal: 22, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: COLORS.textMuted }}>No places found. Try another category!</Text>
              </View>
            )
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        <View style={globalStyles.bottomNav}>
          {tabs.map(t => (
            <TouchableOpacity key={t.id} style={globalStyles.navTab} onPress={() => handleTabPress(t.id)}>
              <Text style={[globalStyles.navIcon, activeTab === t.id && globalStyles.navIconActive]}>{t.icon}</Text>
              <Text style={[globalStyles.navLabel, activeTab === t.id && { color: COLORS.accent }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ImageBackground>
    </View>
  );
}