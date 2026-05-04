import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, ScrollView, TouchableOpacity, StatusBar, Linking, StyleSheet, Platform, TextInput, ActivityIndicator, Alert } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GuideDetailsScreen({ route, navigation }) {
    const { guide } = route.params;
    const [user, setUser] = useState(null);
    const [guideReviews, setGuideReviews] = useState([]);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) setUser(JSON.parse(userData));
        };
        loadUser();
        fetchGuideReviews();
    }, []);

    const fetchGuideReviews = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/guide-reviews/${guide._id}`);
            if (res.ok) setGuideReviews(await res.json());
        } catch (e) {}
    };

    const handlePostGuideReview = async () => {
        if (!userComment.trim()) {
            Alert.alert('Empty Review', 'Please write a comment before posting your review.');
            return;
        }
        setSubmittingReview(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_BASE_URL}/guide-reviews`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ guide: guide._id, rating: userRating, comment: userComment.trim() })
            });
            if (res.ok) {
                setUserComment('');
                setUserRating(5);
                fetchGuideReviews();
                Alert.alert('Review Posted', 'Thank you for your feedback!');
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to post review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const isAdmin = user?.role === 'admin';
    const isOwner = user && (user._id === guide.creator?._id || user._id === guide.creator);
    const canManage = isOwner || isAdmin;

    const handleRemoveGuide = () => {
        Alert.alert(
            isAdmin ? 'Remove Guide Profile?' : 'Leave Guide Role?',
            isAdmin ? 'As an admin, you are removing this professional profile.' : 'Your professional profile will be deleted and your account will return to Traveller status.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: isAdmin ? 'Remove' : 'Confirm Leave', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            const res = await fetch(`${API_BASE_URL}/guides/${guide._id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                                if (isOwner) {
                                    // Update local user data if it's the owner leaving
                                    const updatedUser = { ...user, role: 'traveller' };
                                    await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
                                }
                                Alert.alert('Success', isAdmin ? 'Guide profile removed.' : 'You are no longer a Guide.');
                                navigation.navigate('Home');
                            }
                        } catch (e) {
                            Alert.alert('Error', 'Failed to remove guide profile');
                        }
                    }
                }
            ]
        );
    };

    const handleContact = () => {
        const email = guide.creator?.email || guide.contact;
        const subject = `Booking Inquiry: ${guide.name} via Hidden Gems`;
        const body = `Hi ${guide.name}, I found your profile on Hidden Gems and I'm interested in your guide services. Could you provide more information?`;
        
        // Check if guide.contact is a phone number or email
        if (guide.contact.includes('@')) {
            Linking.openURL(`mailto:${guide.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        } else {
            // Assume it's a phone number for WhatsApp
            const whatsappUrl = `whatsapp://send?phone=${guide.contact.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(body)}`;
            Linking.canOpenURL(whatsappUrl).then(supported => {
                if (supported) {
                    Linking.openURL(whatsappUrl);
                } else {
                    Linking.openURL(`tel:${guide.contact}`);
                }
            });
        }
    };

    return (
        <View style={globalStyles.screenRoot}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ImageBackground source={BG_IMAGE} style={globalStyles.backgroundImage}>
                <View style={globalStyles.overlay} />
                
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    <View style={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 50 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <TouchableOpacity 
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }} 
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={{ color: COLORS.white, fontWeight: '600' }}>← Back</Text>
                            </TouchableOpacity>

                            {canManage && (
                                <View style={{ flexDirection:'row', gap: 10 }}>
                                    <TouchableOpacity 
                                        style={{ backgroundColor: COLORS.error, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, opacity: 0.8 }}
                                        onPress={handleRemoveGuide}
                                    >
                                        <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 11 }}>{isAdmin ? 'Remove Guide ×' : 'Leave Role ×'}</Text>
                                    </TouchableOpacity>
                                    {isOwner && (
                                        <TouchableOpacity 
                                            style={{ backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}
                                            onPress={() => navigation.navigate('RegisterGuide', { guide: guide })}
                                        >
                                            <Text style={{ color: COLORS.textDark, fontWeight: '700', fontSize: 11 }}>Edit Profile ✎</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>

                        <View style={styles.header}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{guide.name.charAt(0).toUpperCase()}</Text>
                            </View>
                            <Text style={styles.guideName}>{guide.name}</Text>
                            <Text style={styles.ratesText}>{guide.rates}</Text>
                        </View>

                        <View style={globalStyles.card}>
                            <Text style={styles.sectionTitle}>About Me</Text>
                            <Text style={styles.bioText}>{guide.bio}</Text>

                            <View style={styles.infoRow}>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>EXPERIENCE</Text>
                                    <Text style={styles.infoValue}>{guide.experience || 'N/A'}</Text>
                                </View>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>LANGUAGES</Text>
                                    <Text style={styles.infoValue}>{guide.languages?.join(', ') || 'N/A'}</Text>
                                </View>
                            </View>

                            <View style={styles.contactSection}>
                                <Text style={styles.sectionTitle}>Contact Information</Text>
                                <View style={styles.contactItem}>
                                    <Text style={styles.contactLabel}>DIRECT CONTACT</Text>
                                    <Text style={styles.contactValue}>{guide.contact}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Guide Reviews Section */}
                    <View style={{ paddingHorizontal: 24, marginTop: 40 }}>
                        <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '800', marginBottom: 20 }}>Traveller Reviews</Text>
                        
                        {!isOwner && user && user.role === 'traveller' && (
                            <View style={[globalStyles.card, { marginBottom: 25, borderColor: COLORS.accent, borderWidth: 0.5 }]}>
                                <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 13, marginBottom: 15 }}>Rate this Guide</Text>
                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                                            <Text style={{ fontSize: 24, color: star <= userRating ? COLORS.accent : COLORS.textMuted }}>★</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={[globalStyles.inputRow, { height: 80, alignItems: 'flex-start', paddingVertical: 10 }]}>
                                    <TextInput 
                                        style={globalStyles.input} 
                                        placeholder="Tell us about your experience..." 
                                        placeholderTextColor={COLORS.textMuted}
                                        multiline
                                        value={userComment}
                                        onChangeText={setUserComment}
                                    />
                                </View>
                                <TouchableOpacity 
                                    style={[globalStyles.button, { marginTop: 15, height: 40 }]} 
                                    onPress={handlePostGuideReview}
                                    disabled={submittingReview}
                                >
                                    {submittingReview ? <ActivityIndicator color={COLORS.textDark} /> : <Text style={[globalStyles.buttonText, { fontSize: 13 }]}>Post Review</Text>}
                                </TouchableOpacity>
                            </View>
                        )}

                        {guideReviews.length === 0 ? (
                            <View style={{ padding: 30, alignItems: 'center', backgroundColor: COLORS.glass1, borderRadius: 20 }}>
                                <Text style={{ color: COLORS.textMuted }}>No reviews yet. Be the first!</Text>
                            </View>
                        ) : (
                            guideReviews.map(rev => (
                                <View key={rev._id} style={{ backgroundColor: COLORS.glassCardDark, padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: COLORS.white, fontWeight: '700' }}>{rev.user?.name}</Text>
                                        <Text style={{ color: COLORS.accent, fontSize: 12 }}>{'★'.repeat(rev.rating)}</Text>
                                    </View>
                                    <Text style={{ color: COLORS.textSoft, fontSize: 13, marginTop: 8 }}>{rev.comment}</Text>
                                    <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 10 }}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>

                {/* Fixed Contact Button at the Bottom */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                        <Text style={styles.contactButtonText}>Contact Guide</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '800',
        color: COLORS.textDark,
    },
    guideName: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.white,
        textAlign: 'center',
    },
    ratesText: {
        fontSize: 18,
        color: COLORS.accent,
        fontWeight: '600',
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: 10,
        letterSpacing: 1,
    },
    bioText: {
        fontSize: 15,
        color: COLORS.textSoft,
        lineHeight: 24,
        marginBottom: 25,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 25,
    },
    infoBox: {
        flex: 1,
        backgroundColor: COLORS.glass1,
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border1,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.textMuted,
        marginBottom: 5,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.accent,
    },
    contactSection: {
        borderTopWidth: 1,
        borderColor: COLORS.border1,
        paddingTop: 20,
    },
    contactItem: {
        marginTop: 5,
    },
    contactLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.textMuted,
    },
    contactValue: {
        fontSize: 16,
        color: COLORS.white,
        marginTop: 2,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        backgroundColor: 'transparent',
    },
    contactButton: {
        backgroundColor: COLORS.accent,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 8,
    },
    contactButtonText: {
        color: COLORS.textDark,
        fontSize: 18,
        fontWeight: '800',
    },
});
