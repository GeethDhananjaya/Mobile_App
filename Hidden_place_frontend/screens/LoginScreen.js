import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { globalStyles, COLORS } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Alert } from 'react-native';

// ─── Inline SVG-style icon components (replace with react-native-vector-icons) ─
const MailIcon   = () => <Text style={{ fontSize: 16, color: COLORS.textMuted }}>✉</Text>;
const LockIcon   = () => <Text style={{ fontSize: 16, color: COLORS.textMuted }}>🔒</Text>;
const EyeIcon    = ({ open }) => <Text style={{ fontSize: 15, color: COLORS.textMuted }}>{open ? '👁' : '◌'}</Text>;
const CheckIcon  = () => <Text style={{ fontSize: 11, fontWeight: '900', color: COLORS.textDark }}>✓</Text>;
const GoogleIcon = () => <Text style={{ fontSize: 17, fontWeight: '800', color: '#EA4335' }}>G</Text>;
const AppleIcon  = () => <Text style={{ fontSize: 18, color: COLORS.textWhite }}></Text>;

// ─── Background: Pinterest forest/nature image you provided ────────────────
const BG = { uri: 'https://i.pinimg.com/564x/e6/de/01/e6de011ecc8974e3b5d4babc8e7f3dfb.jpg' };

export default function LoginScreen({ navigation }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);

  // ── Entrance animations ──
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnScale  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1,  duration: 700, delay: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0,  duration: 700, delay: 150, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, friction: 4 }).start();

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (!email.trim() || !email.includes('@')) e.email = 'Please enter a valid email';
    if (password.length < 6)                   e.password = 'Password must be 6+ characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user info
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        navigation.replace('Home');
      } else {
        setErrors({ general: data.message || 'Invalid email or password' });
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Could not connect to the server. Please check your internet and make sure the server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.screenRoot}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Background Image ─────────────────────────────────── */}
      <ImageBackground
        source={BG}
        style={globalStyles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark scrim for readability */}
        <View style={globalStyles.overlay} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={globalStyles.authScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >

              {/* ── Animated wrapper ─────────────────────────── */}
              <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                {/* ── Brand / Logo ─────────────────────────────── */}
                <View style={globalStyles.brandWrapper}>
                  <Text style={globalStyles.appName}>Hidden Places</Text>
                  <Text style={globalStyles.appTagline}>Elevate your world</Text>
                </View>

                {/* ── Glass Card ───────────────────────────────── */}
                {/*
                  For true blur, wrap the card contents inside:
                    import { BlurView } from 'expo-blur';
                    <BlurView intensity={22} tint="dark" style={globalStyles.card}>
                  and remove backgroundColor from globalStyles.card.
                  We use a plain View here for maximum compatibility.
                */}
                <View style={globalStyles.card}>
                  <Text style={globalStyles.title}>Welcome Back</Text>
                  <Text style={globalStyles.subtitle}>Sign in to your account</Text>

                  {/* ── Email Field ────────────────────────────── */}
                  <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.fieldLabel}>Email Address</Text>
                    <View style={[
                      globalStyles.inputRow,
                      emailFocused && globalStyles.inputRowFocused,
                      errors.email  && globalStyles.inputRowError,
                    ]}>
                      <View style={globalStyles.inputIcon}><MailIcon /></View>
                      <TextInput
                        style={globalStyles.input}
                        placeholder="hello@example.com"
                        placeholderTextColor={COLORS.textMuted}
                        value={email}
                        onChangeText={v => { setEmail(v); setErrors(p => ({ ...p, email: null })); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                      />
                    </View>
                    {errors.email ? <Text style={globalStyles.errorText}>{errors.email}</Text> : null}
                  </View>

                  {/* ── Password Field ─────────────────────────── */}
                  <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.fieldLabel}>Password</Text>
                    <View style={[
                      globalStyles.inputRow,
                      passFocused   && globalStyles.inputRowFocused,
                      errors.password && globalStyles.inputRowError,
                    ]}>
                      <View style={globalStyles.inputIcon}><LockIcon /></View>
                      <TextInput
                        style={globalStyles.input}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.textMuted}
                        value={password}
                        onChangeText={v => { setPassword(v); setErrors(p => ({ ...p, password: null })); }}
                        secureTextEntry={!showPass}
                        onFocus={() => setPassFocused(true)}
                        onBlur={() => setPassFocused(false)}
                      />
                      <TouchableOpacity
                        style={globalStyles.eyeButton}
                        onPress={() => setShowPass(!showPass)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <EyeIcon open={showPass} />
                      </TouchableOpacity>
                    </View>
                    {errors.password ? <Text style={globalStyles.errorText}>{errors.password}</Text> : null}
                  </View>

                  {/* ── Remember + Forgot ──────────────────────── */}
                  <View style={globalStyles.rowBetween}>
                    <TouchableOpacity
                      style={globalStyles.checkRow}
                      onPress={() => setRemember(!remember)}
                      activeOpacity={0.7}
                    >
                      <View style={[globalStyles.checkbox, remember && globalStyles.checkboxActive]}>
                        {remember && <CheckIcon />}
                      </View>
                      <Text style={globalStyles.checkLabel}>Remember me</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                      <Text style={globalStyles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* ── Login Button ───────────────────────────── */}
                  <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                    <TouchableOpacity
                      style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
                      onPress={handleLogin}
                      onPressIn={onPressIn}
                      onPressOut={onPressOut}
                      activeOpacity={1}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={COLORS.textDark} />
                      ) : (
                        <Text style={globalStyles.buttonText}>Sign In</Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>

                  {/* ── Divider ────────────────────────────────── */}
                  <View style={globalStyles.divider}>
                    <View style={globalStyles.dividerLine} />
                    <Text style={globalStyles.dividerLabel}>or continue with</Text>
                    <View style={globalStyles.dividerLine} />
                  </View>

                  {/* ── Social Buttons ─────────────────────────── */}
                  <View style={globalStyles.socialRow}>
                    <TouchableOpacity style={globalStyles.socialBtn} activeOpacity={0.75}>
                      <GoogleIcon />
                    </TouchableOpacity>
                    <TouchableOpacity style={globalStyles.socialBtn} activeOpacity={0.75}>
                      <AppleIcon />
                    </TouchableOpacity>
                  </View>

                </View>
                {/* ── End Card ─── */}

                {/* ── Register Link ────────────────────────────── */}
                <View style={globalStyles.footer}>
                  <Text style={globalStyles.footerText}>Don't have an account?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={globalStyles.linkText}>Register</Text>
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
