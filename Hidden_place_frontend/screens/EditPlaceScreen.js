import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image, Linking, ImageBackground, StatusBar, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';

export default function EditPlaceScreen({ route, navigation }) {
  const { placeId } = route.params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [category, setCategory] = useState('');
  const [safety, setSafety] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, placeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/places/${placeId}`)
        ]);

        if (catRes.ok) setCategories(await catRes.json());
        if (placeRes.ok) {
          const placeData = await placeRes.json();
          setTitle(placeData.title);
          setDescription(placeData.description);
          setLocation(placeData.location);
          setImageUri(placeData.imageUrl);
          setCategory(placeData.category?._id || '');
          setSafety(placeData.safetyLevel || 'Medium');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [placeId]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpdatePlace = async () => {
    if (!title || !description || !location) {
      Alert.alert('Hold up!', 'Please fill in the title, description, and location.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // 1. Update the textual data first
      const placeResponse = await fetch(`${API_BASE_URL}/places/${placeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          location,
          category: category || null,
          safetyLevel: safety
        }),
      });

      const placeData = await placeResponse.json();
      if (!placeResponse.ok) {
        Alert.alert('Error', placeData.message || 'Could not update the place.');
        return;
      }

      // 2. If a NEW image was selected (it will be a file:// URI), upload it
      if (imageUri && imageUri.startsWith('file')) {
        const formData = new FormData();
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('media', {
          uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
          name: filename,
          type,
        });
        formData.append('place', placeId);
        formData.append('type', 'image');

        const uploadResponse = await fetch(`${API_BASE_URL}/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (uploadResponse.ok) {
          // 3. Update the place document with the final server URL
          const finalUrl = `${API_BASE_URL.replace('/api', '')}${uploadData.media.url}`;
          
          await fetch(`${API_BASE_URL}/places/${placeId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ imageUrl: finalUrl }),
          });
        }
      } else if (imageUri === null) {
        // 3. User explicitly removed the photo
        await fetch(`${API_BASE_URL}/places/${placeId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ imageUrl: '' }),
        });
      }

      Alert.alert('Updated! ✨', 'Place and Media updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Update Error:', error);
      Alert.alert('Network Error', 'Could not save changes.');
    } finally {
      setLoading(false);
    }
  };

  const focused = (f) => ({ onFocus: () => setFocusedField(f), onBlur: () => setFocusedField(null) });
  const rowStyle = (f) => [
    globalStyles.inputRow,
    focusedField === f && globalStyles.inputRowFocused,
  ];

  if (fetching) {
    return (
      <View style={[globalStyles.screenRoot, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={globalStyles.screenRoot}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage} resizeMode="cover">
        <View style={globalStyles.overlay} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={globalStyles.authScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Brand */}
              <View style={globalStyles.brandWrapper}>
                <Text style={globalStyles.appName}>Hidden Gems SL</Text>
                <Text style={globalStyles.appTagline}>Modify your discovery</Text>
              </View>

              {/* Card */}
              <View style={globalStyles.card}>
                <Text style={globalStyles.title}>Edit Place</Text>
                <Text style={globalStyles.subtitle}>Update the details of your secret discovery</Text>

                {/* Title */}
                <View style={globalStyles.inputGroup}>
                  <Text style={globalStyles.fieldLabel}>Place Title</Text>
                  <View style={rowStyle('title')}>
                    <Text style={globalStyles.inputIcon}>⛲</Text>
                    <TextInput
                      style={globalStyles.input}
                      placeholder="e.g. Hidden Waterfall"
                      placeholderTextColor={COLORS.textMuted}
                      value={title}
                      onChangeText={setTitle}
                      {...focused('title')}
                    />
                  </View>
                </View>

                {/* Description */}
                <View style={globalStyles.inputGroup}>
                  <Text style={globalStyles.fieldLabel}>Description</Text>
                  <View style={[rowStyle('desc'), { height: 100 }]}>
                    <TextInput
                      style={[globalStyles.input, { textAlignVertical: 'top', paddingTop: 14 }]}
                      placeholder="The story about this place..."
                      placeholderTextColor={COLORS.textMuted}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={4}
                      {...focused('desc')}
                    />
                  </View>
                </View>

                {/* Location */}
                <View style={globalStyles.inputGroup}>
                  <Text style={globalStyles.fieldLabel}>Exact Location</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={[globalStyles.inputRow, focusedField === 'location' && globalStyles.inputRowFocused, { flex: 1 }]}>
                      <Text style={globalStyles.inputIcon}>📍</Text>
                      <TextInput
                        style={globalStyles.input}
                        placeholder="e.g. Ella, Sri Lanka"
                        placeholderTextColor={COLORS.textMuted}
                        value={location}
                        onChangeText={setLocation}
                        onFocus={() => setFocusedField('location')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                    <TouchableOpacity
                      style={[globalStyles.button, { width: 60, height: 54, borderRadius: 16, backgroundColor: COLORS.glass1, shadowColor: 'transparent' }]}
                      onPress={() => Linking.openURL('https://www.google.com/maps')}
                    >
                      <Text style={{ fontSize: 20 }}>🗺</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category selection */}
                <View style={globalStyles.inputGroup}>
                  <Text style={globalStyles.fieldLabel}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 5 }}>
                    {categories.map(c => (
                      <TouchableOpacity
                        key={c._id}
                        style={[globalStyles.catChip, category === c._id && globalStyles.catChipActive, { marginRight: 8 }]}
                        onPress={() => setCategory(c._id)}
                      >
                        <Text style={{ color: category === c._id ? COLORS.textDark : COLORS.white }}>{c.icon} {c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Safety selection */}
                <View style={globalStyles.inputGroup}>
                  <Text style={globalStyles.fieldLabel}>Safety Level</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                    {['High', 'Medium', 'Low'].map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[globalStyles.catChip, safety === s && globalStyles.catChipActive, { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }]}
                        onPress={() => setSafety(s)}
                      >
                        <Text
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          style={{ color: safety === s ? COLORS.textDark : COLORS.white, fontSize: 13 }}
                        >
                          {s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Photo */}
                <View style={globalStyles.inputGroup}>
                  <Text style={globalStyles.fieldLabel}>Photo</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={[globalStyles.inputRow, { flex: 1, justifyContent: 'center' }]}
                      onPress={pickImage}
                    >
                      <Text style={{ color: COLORS.accent, fontWeight: '700' }}>
                        {imageUri ? 'Change Photo' : 'Select from Gallery '}
                      </Text>
                    </TouchableOpacity>

                    {imageUri && (
                        <TouchableOpacity
                            style={[globalStyles.button, { width: 60, height: 54, borderRadius: 16, backgroundColor: 'rgba(255,107,107,0.14)', shadowColor: 'transparent', borderColor: COLORS.error, borderWidth: 1 }]}
                            onPress={() => setImageUri(null)}
                        >
                            <Text style={{ fontSize: 20 }}>🗑</Text>
                        </TouchableOpacity>
                    )}
                  </View>
                </View>

                {imageUri && (
                  <View style={{ marginBottom: 20 }}>
                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: 160, borderRadius: 14 }} />
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
                  onPress={handleUpdatePlace}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.textDark} />
                  ) : (
                    <Text style={globalStyles.buttonText}>Save Changes </Text>
                  )}
                </TouchableOpacity>

                {/* Cancel */}
                <TouchableOpacity
                  style={globalStyles.buttonGhost}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={globalStyles.buttonGhostText}>← Cancel</Text>
                </TouchableOpacity>

              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}
