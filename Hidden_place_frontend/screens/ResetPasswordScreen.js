import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, ImageBackground, StatusBar,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';

export default function ResetPasswordScreen({ navigation }) {
  const [token,       setToken]       = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [errors,      setErrors]      = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Entrance animation
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(36)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 650, delay: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 650, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const btnScale = useRef(new Animated.Value(1)).current;
  const onPI = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPO = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, friction: 4 }).start();

  const validate = () => {
    const e = {};
    if (!token.trim())          e.token    = 'Please paste the token from your email';
    if (newPassword.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReset = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/reset-password/${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Auto-navigate after 2 seconds
        setTimeout(() => navigation.navigate('Login'), 2000);
      } else {
        setErrors({ token: data.message || 'Invalid or expired token.' });
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to the server. Please check your internet and make sure the server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  const focused   = (f) => ({ onFocus: () => setFocusedField(f), onBlur: () => setFocusedField(null) });
  const rowStyle  = (f, hasErr) => [
    globalStyles.inputRow,
    focusedField === f && globalStyles.inputRowFocused,
    hasErr && globalStyles.inputRowError,
    success && f === 'password' && globalStyles.inputRowSuccess,
  ];

  return (
    <View style={globalStyles.screenRoot}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage} resizeMode="cover">
        <View style={globalStyles.overlay} />

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={globalStyles.authScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                {/* Brand */}
                <View style={globalStyles.brandWrapper}>
                  <View style={globalStyles.brandBadge}>
                    <Text style={globalStyles.brandBadgeText}>✦</Text>
                  </View>
                  <Text style={globalStyles.appName}>Hidden Places</Text>

                  <Text style={globalStyles.appTagline}>Elevate your world</Text>
                </View>

                {/* Card */}
                <View style={globalStyles.card}>

                  <Text style={globalStyles.title}>New Password</Text>
                  <Text style={globalStyles.subtitle}>
                    Paste the reset token from your email, then set a new password.
                  </Text>

                  {/* Info Banner */}
                  {!success && (
                    <View style={globalStyles.infoBanner}>
                      <Text style={{ fontSize: 15 }}>📧</Text>
                      <Text style={globalStyles.infoBannerText}>
                        Check your inbox for a password reset email containing your unique token.
                      </Text>
                    </View>
                  )}

                  {/* Success Banner */}
                  {success && (
                    <View style={globalStyles.successBanner}>
                      <Text style={{ fontSize: 16 }}>✅</Text>
                      <Text style={globalStyles.successBannerText}>
                        Password updated! Redirecting to login...
                      </Text>
                    </View>
                  )}

                  {/* Token Field */}
                  <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.fieldLabel}>Reset Token</Text>
                    <View style={rowStyle('token', errors.token)}>
                      <Text style={globalStyles.inputIcon}>🔑</Text>
                      <TextInput
                        style={globalStyles.input}
                        placeholder="Paste your reset token"
                        placeholderTextColor={COLORS.textMuted}
                        value={token}
                        onChangeText={v => { setToken(v); setErrors(p => ({ ...p, token: null })); }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!success}
                        {...focused('token')}
                      />
                      {token.length > 0 && (
                        <TouchableOpacity onPress={() => setToken('')} style={globalStyles.eyeBtn}>
                          <Text style={{ fontSize: 13, color: COLORS.textMuted }}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {errors.token && <Text style={globalStyles.errorText}>{errors.token}</Text>}
                  </View>

                  {/* New Password Field */}
                  <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.fieldLabel}>New Password</Text>
                    <View style={rowStyle('password', errors.password)}>
                      <Text style={globalStyles.inputIcon}>🔒</Text>
                      <TextInput
                        style={globalStyles.input}
                        placeholder="Enter your new password"
                        placeholderTextColor={COLORS.textMuted}
                        value={newPassword}
                        onChangeText={v => { setNewPassword(v); setErrors(p => ({ ...p, password: null })); }}
                        secureTextEntry={!showPw}
                        editable={!success}
                        {...focused('password')}
                      />
                      <TouchableOpacity style={globalStyles.eyeBtn} onPress={() => setShowPw(!showPw)}>
                        <Text style={{ fontSize: 15, color: COLORS.textMuted }}>{showPw ? '👁' : '◌'}</Text>
                      </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={globalStyles.errorText}>{errors.password}</Text>}
                  </View>

                  {/* Password requirements hint */}
                  <View style={{ marginBottom: 20, gap: 4 }}>
                    {[
                      { rule: newPassword.length >= 6,          label: 'At least 6 characters'       },
                      { rule: /[A-Z]/.test(newPassword),        label: 'One uppercase letter'         },
                      { rule: /[0-9]/.test(newPassword),        label: 'One number'                   },
                    ].map(({ rule, label }) => (
                      <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 11, color: rule ? COLORS.success : COLORS.textMuted }}>
                          {rule ? '✓' : '○'}
                        </Text>
                        <Text style={{ fontSize: 11, color: rule ? COLORS.success : COLORS.textMuted }}>
                          {label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Submit button */}
                  <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                    <TouchableOpacity
                      style={[globalStyles.button, (loading || success) && globalStyles.buttonDisabled]}
                      onPress={handleReset}
                      onPressIn={onPI}
                      onPressOut={onPO}
                      activeOpacity={1}
                      disabled={loading || success}
                    >
                      {loading
                        ? <ActivityIndicator color={COLORS.textDark} />
                        : <Text style={globalStyles.buttonText}>
                            {success ? 'Password Updated ✓' : 'Update Password'}
                          </Text>
                      }
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Cancel */}
                  <TouchableOpacity
                    style={globalStyles.buttonGhost}
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={globalStyles.buttonGhostText}>← Cancel & Go to Login</Text>
                  </TouchableOpacity>

                </View>

                {/* Footer */}
                <View style={globalStyles.footer}>
                  <Text style={globalStyles.footerText}>Remember your password?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={globalStyles.linkText}>Sign In</Text>
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
