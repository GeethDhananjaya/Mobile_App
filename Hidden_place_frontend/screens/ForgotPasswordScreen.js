import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, ImageBackground, StatusBar,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailFocused, setEmailFocused] = useState(false);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, delay: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, delay: 150, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, friction: 4 }).start();

  const validate = () => {
    const e = {};
    if (!email.trim() || !email.includes('@')) e.email = 'Please enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success! 🎉', 'Check your email inbox for the reset link.');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Could not send reset link.');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Network Error', 'Could not connect to the server. Please check your internet and make sure the server is reachable.');
    } finally {
      setLoading(false);
    }
  };

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
              <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                {/* Brand */}
                <View style={globalStyles.brandWrapper}>
                  <Text style={globalStyles.appName}>Hidden Places</Text>
                  <Text style={globalStyles.appTagline}>Elevate your world</Text>
                </View>

                {/* Card */}
                <View style={globalStyles.card}>
                  <Text style={globalStyles.title}>Reset Password</Text>
                  <Text style={globalStyles.subtitle}>
                    Enter your email and we'll send you a link to reset your password.
                  </Text>

                  {/* Email Field */}
                  <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.fieldLabel}>Email Address</Text>
                    <View style={[
                      globalStyles.inputRow,
                      emailFocused && globalStyles.inputRowFocused,
                      errors.email && globalStyles.inputRowError,
                    ]}>
                      <Text style={globalStyles.inputIcon}>✉</Text>
                      <TextInput
                        style={globalStyles.input}
                        placeholder="hello@example.com"
                        placeholderTextColor={COLORS.textMuted}
                        value={email}
                        onChangeText={v => { setEmail(v); setErrors(p => ({ ...p, email: null })); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                      />
                    </View>
                    {errors.email ? <Text style={globalStyles.errorText}>{errors.email}</Text> : null}
                  </View>

                  {/* Send Button */}
                  <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                    <TouchableOpacity
                      style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
                      onPress={handleResetPassword}
                      onPressIn={onPressIn}
                      onPressOut={onPressOut}
                      activeOpacity={1}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={COLORS.textDark} />
                      ) : (
                        <Text style={globalStyles.buttonText}>Send Reset Link</Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Back to Login */}
                  <TouchableOpacity
                    style={globalStyles.buttonGhost}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={globalStyles.buttonGhostText}>← Back to Login</Text>
                  </TouchableOpacity>

                </View>

              </Animated.View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}