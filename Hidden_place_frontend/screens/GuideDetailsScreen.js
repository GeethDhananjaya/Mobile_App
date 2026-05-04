import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, ScrollView, TouchableOpacity, StatusBar, Linking, StyleSheet, Platform } from 'react-native';
import { globalStyles, COLORS, BG_IMAGE } from '../styles/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GuideDetailsScreen({ route, navigation }) {
    const { guide } = route.params;
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) setUser(JSON.parse(userData));
        };
        loadUser();
    }, []);

    const isOwner = user && (user._id === guide.creator?._id || user._id === guide.creator);

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
                    <View style={{ padding: 24, paddingTop: 60 }}>
                        <View style={globalStyles.rowBetween}>
                            <TouchableOpacity style={globalStyles.buttonGhost} onPress={() => navigation.goBack()}>
                                <Text style={globalStyles.buttonGhostText}>← Back</Text>
                            </TouchableOpacity>

                            {isOwner && (
                                <TouchableOpacity 
                                    style={{ backgroundColor: COLORS.accent, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 }}
                                    onPress={() => navigation.navigate('RegisterGuide', { guide: guide })}
                                >
                                    <Text style={{ color: COLORS.textDark, fontWeight: '700', fontSize: 12 }}>Edit Profile ✎</Text>
                                </TouchableOpacity>
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
