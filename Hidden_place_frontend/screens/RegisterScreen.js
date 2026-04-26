import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ImageBackground, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView, Animated, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import { ActivityIndicator, Alert } from 'react-native';

const getStrength = (pw) => {
  if (!pw) return { level: 0, label: '', color: COLORS.textMuted };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '',          color: COLORS.textMuted  },
    { label: 'Weak',      color: COLORS.error      },
    { label: 'Fair',      color: '#F0C040'          },
    { label: 'Good',      color: COLORS.accent      },
    { label: 'Strong',    color: COLORS.success     },
  ];
  return { level: score, ...map[score] };
};

export default function RegisterScreen({ navigation }) {
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [showCf,     setShowCf]     = useState(false);
  const [agreed,     setAgreed]     = useState(false);
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [role, setRole] = useState('traveller');
  const [bio, setBio] = useState('');
  const strength = getStrength(password);

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
    if (!name.trim())               e.name     = 'Please enter your full name';
    if (!email.includes('@'))       e.email    = 'Enter a valid email address';
    if (password.length < 8)        e.password = 'Password must be at least 8 characters';
    if (confirm !== password)       e.confirm  = 'Passwords do not match';
    if (!agreed)                    e.terms    = 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: email.trim(), password, role, bio }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Registration Successful', data.message);
        navigation.navigate('Login');
      } else {
        setErrors({ general: data.message || 'Registration failed' });
        Alert.alert('Registration Failed', data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const focused = (f)  => ({ onFocus: () => setFocusedField(f), onBlur: () => setFocusedField(null) });
  const rowStyle = (f, hasErr) => [
    globalStyles.inputRow,
    focusedField === f && globalStyles.inputRowFocused,
    hasErr && globalStyles.inputRowError,
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

                <View style={globalStyles.brandWrapper}>
                  <Text style={globalStyles.appName}>Hidden Places</Text>
                  <Text style={globalStyles.appTagline}>Elevate your world</Text>
                </View>

                <View style={globalStyles.card}>
                  <Text style={globalStyles.title}>Create Account</Text>
                  <Text style={globalStyles.subtitle}>Select your journey type to begin</Text>

                  {/* Role selection */}
                  <View style={[globalStyles.inputGroup, {marginBottom: 25}]}>
                    <Text style={[globalStyles.fieldLabel, {marginBottom: 10}]}>Join as</Text>
                    <View style={{ flexDirection:'row', gap: 10 }}>
                        {['traveller', 'guide'].map(r => (
                            <TouchableOpacity 
                                key={r} 
                                style={[globalStyles.catChip, role === r && globalStyles.catChipActive, {flex: 1, alignItems:'center'}]}
                                onPress={() => setRole(r)}
                            >
                                <Text style={{ color: role === r ? COLORS.textDark : COLORS.white, fontWeight:'700' }}>
                                    {r === 'traveller' ? '🌎 Traveller' : '🛡 Local Guide'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                  </View>

                  <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.fieldLabel}>Full Name</Text>
                    <View style={rowStyle('name', errors.name)}>
                      <Text style={globalStyles.inputIcon}>👤</Text>
                      <TextInput
                        style={globalStyles.input}
                        placeholder="Your full name"
                        placeholderTextColor={COLORS.textMuted}
                        value={name}
                        onChangeText={v => { setName(v); setErrors(p => ({ ...p, name: null })); }}
                        autoCapitalize="words"
                        {...focused('name')}
                      />
                    </View>
                    {errors.name && <Text style={globalStyles.errorText}>{errors.name}</Text>}
                  </View>

                  <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.fieldLabel}>Email Address</Text>
                    <View style={rowStyle('email', errors.email)}>
                      <Text style={globalStyles.inputIcon}>✉</Text>
                      <TextInput
                        style={globalStyles.input}
                        placeholder="traveller@example.com"
                        placeholderTextColor={COLORS.textMuted}
                        value={email}
                        onChangeText={v => { setEmail(v); setErrors(p => ({ ...p, email: null })); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        {...focused('email')}
                      />
                    </View>
                    {errors.email && <Text style={globalStyles.errorText}>{errors.email}</Text>}
                  </View>

                  {role === 'guide' && (
                    <View style={globalStyles.inputGroup}>
                       <Text style={globalStyles.fieldLabel}>Guide Bio / Expertise</Text>
                       <View style={[rowStyle('bio'), {height: 80}]}>
                          <TextInput
                            style={[globalStyles.input, {textAlignVertical:'top', paddingTop: 10}]}
                            placeholder="Tell us about your local knowledge..."
                            placeholderTextColor={COLORS.textMuted}
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            {...focused('bio')}
                          />
                       </View>
                    </View>
                  )}


                  <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.fieldLabel}>Password</Text>
                    <View style={rowStyle('password', errors.password)}>
                      <Text style={globalStyles.inputIcon}>🔒</Text>
                      <TextInput
                        style={globalStyles.input}
                        placeholder="Create a strong password"
                        placeholderTextColor={COLORS.textMuted}
                        value={password}
                        onChangeText={v => { setPassword(v); setErrors(p => ({ ...p, password: null })); }}
                        secureTextEntry={!showPw}
                        {...focused('password')}
                      />
                      <TouchableOpacity style={globalStyles.eyeBtn} onPress={() => setShowPw(!showPw)}>
                        <Text style={{ fontSize: 15, color: COLORS.textMuted }}>{showPw ? '👁' : '◌'}</Text>
                      </TouchableOpacity>
                    </View>
                    {password.length > 0 && (
                      <>
                        <View style={globalStyles.strengthRow}>
                          {[1,2,3,4].map(i => (
                            <View key={i} style={[globalStyles.strengthBar, i <= strength.level && { backgroundColor: strength.color }]} />
                          ))}
                        </View>
                        <Text style={[globalStyles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                      </>
                    )}
                    {errors.password && <Text style={globalStyles.errorText}>{errors.password}</Text>}
                  </View>

                  <View style={globalStyles.inputGroup}>
                    <Text style={globalStyles.fieldLabel}>Confirm Password</Text>
                    <View style={rowStyle('confirm', errors.confirm)}>
                      <Text style={globalStyles.inputIcon}>🔒</Text>
                      <TextInput
                        style={globalStyles.input}
                        placeholder="Re-enter your password"
                        placeholderTextColor={COLORS.textMuted}
                        value={confirm}
                        onChangeText={v => { setConfirm(v); setErrors(p => ({ ...p, confirm: null })); }}
                        secureTextEntry={!showCf}
                        {...focused('confirm')}
                      />
                      <TouchableOpacity style={globalStyles.eyeBtn} onPress={() => setShowCf(!showCf)}>
                        <Text style={{ fontSize: 15, color: COLORS.textMuted }}>{showCf ? '👁' : '◌'}</Text>
                      </TouchableOpacity>
                    </View>
                    {errors.confirm && <Text style={globalStyles.errorText}>{errors.confirm}</Text>}
                  </View>

                  <View style={globalStyles.termsRow}>
                    <TouchableOpacity
                      style={[globalStyles.checkbox, agreed && globalStyles.checkboxActive]}
                      onPress={() => { setAgreed(!agreed); setErrors(p => ({ ...p, terms: null })); }}
                    >
                      {agreed && <Text style={{ fontSize: 11, fontWeight: '900', color: COLORS.textDark }}>✓</Text>}
                    </TouchableOpacity>
                    <Text style={globalStyles.termsText}>
                      I agree to the <Text style={globalStyles.termsLink}>Terms</Text> and <Text style={globalStyles.termsLink}>Privacy</Text>
                    </Text>
                  </View>
                  {errors.terms && <Text style={[globalStyles.errorText, { marginTop: -10, marginBottom: 10 }]}>{errors.terms}</Text>}

                  <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                    <TouchableOpacity
                      style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
                      onPress={handleRegister}
                      onPressIn={onPI}
                      onPressOut={onPO}
                      activeOpacity={1}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={COLORS.textDark} />
                      ) : (
                        <Text style={globalStyles.buttonText}>
                            {role === 'guide' ? 'Register as Guide 🛡' : 'Create Account'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>

                  <View style={globalStyles.divider}>
                    <View style={globalStyles.dividerLine} />
                    <Text style={globalStyles.dividerLabel}>or sign up with</Text>
                    <View style={globalStyles.dividerLine} />
                  </View>

                  <View style={globalStyles.socialRow}>
                    <TouchableOpacity style={globalStyles.socialBtn}>
                      <Text style={{ fontSize: 17, fontWeight: '800', color: '#EA4335' }}>G</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={globalStyles.footer}>
                  <Text style={globalStyles.footerText}>Already have an account?</Text>
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
