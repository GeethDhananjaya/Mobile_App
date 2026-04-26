import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, StatusBar, FlatList, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';

export default function GuidesListScreen({ navigation }) {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    fetchGuides();
  }, []);

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) setUser(JSON.parse(data));
    } catch (e) {}
  };

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/guides`);
      const data = await res.json();
      if (res.ok) setGuides(data);
    } catch (error) {
       Alert.alert('Error', 'Failed to load guides');
    } finally {
      setLoading(false);
    }
  };

  const renderGuide = ({ item }) => (
    <TouchableOpacity 
      style={{ backgroundColor: COLORS.glassCardDark, padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border1 }}
      onPress={() => navigation.navigate('GuideDetails', { guide: item })}
    >
      <View style={{ flexDirection:'row', gap: 15 }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.accent, justifyContent:'center', alignItems:'center' }}>
          <Text style={{ fontSize: 24, color: COLORS.textDark }}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.white, fontSize: 18, fontWeight:'700' }}>{item.name}</Text>
          <View style={{flexDirection:'row', gap: 8, alignItems:'center'}}>
            <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '700' }}>{item.rates}</Text>
            {item.experience && (
              <>
                <View style={{width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted}} />
                <Text style={{ color: COLORS.textSoft, fontSize: 13 }}>{item.experience}</Text>
              </>
            )}
          </View>
          <Text style={{ color: COLORS.textSoft, fontSize: 11, marginTop: 4 }}>{item.languages?.join(', ')}</Text>
        </View>
      </View>
      <Text style={{ color: COLORS.textSoft, fontSize: 13, marginTop: 15 }} numberOfLines={2}>{item.bio}</Text>
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
                 <Text style={globalStyles.title}>Local Guides</Text>
                 <Text style={globalStyles.subtitle}>Expert guidance for your journey</Text>
               </View>

               {/* 🛡 Register Button for Guides */}
               {user?.role === 'guide' && (
                 <TouchableOpacity 
                   style={[globalStyles.catChipActive, { paddingHorizontal: 12, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }]} 
                   onPress={() => navigation.navigate('RegisterGuide')}
                 >
                   <Text style={{ color: COLORS.textDark, fontWeight: '700', fontSize: 12 }}>Join +</Text>
                 </TouchableOpacity>
               )}
            </View>

            {loading ? (
              <ActivityIndicator color={COLORS.accent} />
            ) : (
              <FlatList
                data={guides}
                renderItem={renderGuide}
                keyExtractor={item => item._id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={{color: COLORS.textMuted, textAlign:'center'}}>No guides available yet</Text>}
              />
            )}
        </View>

        {/* Home Back Button */}
        <TouchableOpacity style={globalStyles.buttonGhost} onPress={() => navigation.goBack()}>
            <Text style={globalStyles.buttonGhostText}>← Back to Home</Text>
        </TouchableOpacity>

      </ImageBackground>
    </View>
  );
}
