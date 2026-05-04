import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'; // 🚨 Look! We imported the image picker!
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import { ImageBackground, StatusBar, TouchableWithoutFeedback, Keyboard } from 'react-native';

export default function AddPlaceScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [category, setCategory] = useState('');
  const [safety, setSafety] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        if (res.ok) setCategories(await res.json());
      } catch (e) { }
    };
    fetchCats();
  }, []);

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

  const handleAddPlace = async () => {
    if (!title || !description || !location) {
      Alert.alert('Hold up!', 'Please fill in the title, description, and location.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Session Expired', 'You need to be logged in to add a place.');
        navigation.navigate('Login');
        return;
      }

      // 1. First, create the Place (without the image for now)
      const placeResponse = await fetch(`${API_BASE_URL}/places`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          location,
          imageUrl: '',
          category: category || null,
          safetyLevel: safety
        }),
      });

      // 🔍 SAFELY read JSON
      let placeData;
      const responseText = await placeResponse.text();
      try {
        placeData = JSON.parse(responseText);
      } catch (e) {
        console.error('Server returned non-JSON:', responseText);
        Alert.alert('Server Error', 'The server returned an invalid response. Check the backend logs.');
        return;
      }

      if (!placeResponse.ok) {
        Alert.alert('Error', placeData.message || 'Could not add the place.');
        return;
      }

      const placeId = placeData.place._id;

      // 2. If an image is selected, upload it to the media route
      if (imageUri) {
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'upload.jpg';
        const extension = filename.split('.').pop() || 'jpg';

        // 🚨 ALWAYS append text fields BEFORE the file for Multer!
        formData.append('place', placeId);
        formData.append('type', 'image');

        formData.append('media', {
          uri: imageUri, // Simpler URI works better in modern React Native
          name: filename,
          type: `image/${extension === 'png' ? 'png' : 'jpeg'}`,
        });

        const uploadResponse = await fetch(`${API_BASE_URL}/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        // 🔍 SAFELY read upload JSON
        const uploadText = await uploadResponse.text();
        let uploadData;
        try {
          uploadData = JSON.parse(uploadText);
        } catch (e) {
          console.error('Upload Error Response:', uploadText);
          Alert.alert('Upload Failed', 'The image upload failed. Check backend logs.');
          return;
        }

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

          Alert.alert('Success! ', 'Hidden Place and Media saved successfully!');
          navigation.goBack();
        } else {
          Alert.alert('Partially Saved', 'The place was added, but the photo upload failed: ' + (uploadData.message || 'Unknown error'));
        }
      } else {
        // No image to upload, just the place
        Alert.alert('Success! ', 'Hidden Place added successfully!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Add Place Error:', error);
      Alert.alert('Network Error', 'Could not save. Check your connection or server.');
    } finally {
      setLoading(false);
    }
  };

  const focused = (f) => ({ onFocus: () => setFocusedField(f), onBlur: () => setFocusedField(null) });
  const rowStyle = (f) => [
    globalStyles.inputRow,
    focusedField === f && globalStyles.inputRowFocused,
  ];

  return (
    <View style={globalStyles.screenRoot}>
      <StatusBar barStyle="light-content" translucent />

      <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage} resizeMode="cover">
        <View style={[globalStyles.overlay, { zIndex: -1 }]} pointerEvents="none" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[globalStyles.authScrollContent, { justifyContent: 'flex-start' }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Brand */}
            <View style={globalStyles.brandWrapper}>
              <Text style={globalStyles.appName}>Hidden Places</Text>
              <Text style={globalStyles.appTagline}>Share your discoveries</Text>
            </View>

            {/* Card - zIndex ensures this is on top of everything! */}
            <View style={[globalStyles.card, { zIndex: 100 }]}>
              <Text style={globalStyles.title}>Add New Place</Text>
              <Text style={globalStyles.subtitle}>Tell the world about your secret discovery</Text>

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
                onPress={handleAddPlace}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textDark} />
                ) : (
                  <Text style={globalStyles.buttonText}>Publish Place </Text>
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
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}
