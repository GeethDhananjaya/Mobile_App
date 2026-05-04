import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, StatusBar, Dimensions, TextInput, Linking, Platform } from 'react-native';
import { globalStyles, COLORS, SCREEN } from '../styles/globalStyles';
import { API_BASE_URL } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function PlaceDetailsScreen({ route, navigation }) {
  const { placeId } = route.params;
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [canDelete, setCanDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchPlaceData();
  }, [placeId]);

  const fetchPlaceData = async () => {
    setLoading(true);
    try {
      const uData = await AsyncStorage.getItem('userData');
      const curr = JSON.parse(uData);
      setCurrentUser(curr);

      const [pRes, rRes, gRes, cRes] = await Promise.all([
        fetch(`${API_BASE_URL}/places/${placeId}`),
        fetch(`${API_BASE_URL}/reviews/${placeId}`),
        fetch(`${API_BASE_URL}/media/${placeId}`),
        fetch(`${API_BASE_URL}/comments/${placeId}`)
      ]);

      if (pRes.ok) {
        const pData = await pRes.json();
        setPlace(pData);
        if (curr && (curr._id === pData.creator?._id || curr.role === 'admin')) {
            setCanDelete(true);
        }
      }
      if (rRes.ok) setReviews(await rRes.json());
      if (gRes.ok) setGallery(await gRes.json());
      if (cRes.ok) setComments(await cRes.json());

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    if (!place?.location) return;
    const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
    const url = scheme + encodeURIComponent(place.location);
    Linking.openURL(url);
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    const token = await AsyncStorage.getItem('userToken');
    try {
       const url = editingCommentId ? `${API_BASE_URL}/comments/${editingCommentId}` : `${API_BASE_URL}/comments`;
       const method = editingCommentId ? 'PUT' : 'POST';
       
       const res = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ place: placeId, text: commentText.trim() })
       });
       if (res.ok) {
           setCommentText('');
           setEditingCommentId(null);
           fetchPlaceData();
       } else {
           const errorData = await res.json();
           Alert.alert('Comment Error', errorData.message || 'Failed to save comment');
       }
    } catch (e) {
       Alert.alert('Error', 'Network connection issue');
    }
  };

  const startEditComment = (comment) => {
    setCommentText(comment.text);
    setEditingCommentId(comment._id);
  };

  const cancelEditComment = () => {
    setCommentText('');
    setEditingCommentId(null);
  };

  const handleArchive = async () => {
    Alert.alert('Remove Content', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          const token = await AsyncStorage.getItem('userToken');
          const res = await fetch(`${API_BASE_URL}/places/${placeId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            Alert.alert('Removed', 'This post has been deleted.');
            navigation.goBack();
          }
        }
      }
    ]);
  };

  const deleteComment = async (id) => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchPlaceData();
    } catch (e) {}
  };

  if (loading) return <View style={[globalStyles.screenRoot, {justifyContent:'center'}]}><ActivityIndicator color={COLORS.accent} size="large" /></View>;
  if (!place) return <View style={[globalStyles.screenRoot, {justifyContent:'center'}]}><Text style={{color: COLORS.white, textAlign:'center'}}>Not found</Text></View>;

  const isAdmin = currentUser?.role === 'admin';
  const isOwner = currentUser?._id === place.creator?._id;

  return (
    <View style={globalStyles.screenRoot}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        
        <ImageBackground source={{ uri: place.imageUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' }} style={{ width, height: 420 }}>
          <View style={[globalStyles.overlay, {backgroundColor: 'rgba(0,0,0,0.2)'}]} />
          <TouchableOpacity style={{ position:'absolute', top: 50, left: 24, width: 44, height: 44, borderRadius: 22, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' }} onPress={() => navigation.goBack()}>
            <Text style={{color: COLORS.white, fontSize: 20}}>←</Text>
          </TouchableOpacity>
          <View style={{ position:'absolute', bottom: 30, left: 24, right: 24 }}>
            <Text style={[globalStyles.title, {fontSize: 32}]}>{place.title}</Text>
            <View style={{ flexDirection:'row', alignItems:'center', gap: 8, marginTop: 4 }}>
              <Text style={{ color: COLORS.textSoft, fontSize: 13 }}>📍 {place.location} • By {place.creator?.name}</Text>
              {place.creator?.role === 'guide' && (
                <View style={{ backgroundColor: COLORS.successSurf, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ color: COLORS.success, fontSize: 9, fontWeight: '700' }}>🛡 GUIDE</Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                <TouchableOpacity 
                   style={[globalStyles.button, { height: 40, flex: 1, backgroundColor: COLORS.accent, shadowColor: 'transparent' }]}
                   onPress={handleNavigate}
                >
                   <Text style={{ color: COLORS.textDark, fontWeight: '700', fontSize: 13 }}>Navigate 🛣️</Text>
                </TouchableOpacity>

                {place.creator?.role === 'guide' && (
                    <TouchableOpacity 
                       style={[globalStyles.button, { height: 40, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }]}
                       onPress={() => Linking.openURL(`mailto:${place.creator.email}?subject=Tour Inquiry: ${place.title}`)}
                    >
                       <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 13 }}>Book Guide ✉</Text>
                    </TouchableOpacity>
                )}
            </View>
          </View>
        </ImageBackground>

        <View style={{ padding: 24, marginTop: -20, backgroundColor: COLORS.glassCardDark, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
          
          <View style={{ flexDirection:'row', justifyContent:'space-around', paddingVertical: 15, borderBottomWidth: 1, borderColor: COLORS.border1, marginBottom: 20 }}>
            <View style={{alignItems:'center'}}><Text style={{color: COLORS.accent, fontWeight:'700'}}>{place.safetyLevel || 'Medium'}</Text><Text style={{color: COLORS.textMuted, fontSize: 10}}>SAFETY</Text></View>
            <View style={{alignItems:'center'}}><Text style={{color: COLORS.accent, fontWeight:'700'}}>{reviews.length}</Text><Text style={{color: COLORS.textMuted, fontSize: 10}}>REVIEWS</Text></View>
            <View style={{alignItems:'center'}}><Text style={{color: COLORS.accent, fontWeight:'700'}}>{place.category?.name || 'Nature'}</Text><Text style={{color: COLORS.textMuted, fontSize: 10}}>CATEGORY</Text></View>
          </View>

          <Text style={[globalStyles.fieldLabel, {marginBottom: 10}]}>About this place</Text>
          <Text style={{ color: COLORS.textSoft, lineHeight: 22, marginBottom: 25 }}>{place.description}</Text>

          <View style={{ marginBottom: 25 }}>
             <Text style={globalStyles.sectionTitle}>Discussion ({comments.length})</Text>
             <View style={{ flexDirection:'row', gap: 10, marginTop: 15, marginBottom: 10 }}>
                <View style={[globalStyles.inputRow, { flex: 1, height: 44, backgroundColor: COLORS.glass1, paddingHorizontal: 15 }]}>
                   <TextInput style={{ color: COLORS.white, flex: 1 }} placeholder={editingCommentId ? "Edit your comment..." : "Write a comment..."} placeholderTextColor={COLORS.textMuted} value={commentText} onChangeText={setCommentText} />
                </View>
                <TouchableOpacity style={[globalStyles.button, { width: 60, height: 44, borderRadius: 12, shadowColor: 'transparent', backgroundColor: COLORS.accent }]} onPress={handlePostComment}>
                   <Text style={{ color: COLORS.textDark, fontWeight: '700' }}>{editingCommentId ? 'Save' : 'Post'}</Text>
                </TouchableOpacity>
                {editingCommentId && (
                  <TouchableOpacity style={{ justifyContent:'center' }} onPress={cancelEditComment}>
                    <Text style={{ color: COLORS.textMuted }}>Cancel</Text>
                  </TouchableOpacity>
                )}
             </View>

             {comments.map((c) => (
                <View key={c._id} style={{ marginBottom: 12, borderLeftWidth: 2, borderColor: COLORS.accent, paddingLeft: 12 }}>
                   <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                      <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 13 }}>{c.user?.name}</Text>
                      <View style={{ flexDirection:'row', gap: 10 }}>
                        {(currentUser?._id === c.user?._id) && (
                          <TouchableOpacity onPress={() => startEditComment(c)}><Text style={{ color: COLORS.accent, fontSize: 10 }}>Edit</Text></TouchableOpacity>
                        )}
                        {(isAdmin || currentUser?._id === c.user?._id) && (
                          <TouchableOpacity onPress={() => deleteComment(c._id)}><Text style={{ color: COLORS.error, fontSize: 10 }}>Remove</Text></TouchableOpacity>
                        )}
                      </View>
                   </View>
                   <Text style={{ color: COLORS.textSoft, fontSize: 13, marginTop: 2 }}>{c.text}</Text>
                </View>
             ))}
          </View>

          <View style={{ marginBottom: 25 }}>
             <View style={globalStyles.rowBetween}><Text style={globalStyles.sectionTitle}>Gallery</Text>
               <TouchableOpacity onPress={() => navigation.navigate('UploadMedia', { placeId: place._id })}><Text style={{ color: COLORS.accent }}>+ Add Photo</Text></TouchableOpacity>
             </View>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
               {gallery.map((img) => (<Image key={img._id} source={{ uri: img.url.startsWith('/') ? `${API_BASE_URL.replace('/api', '')}${img.url}` : img.url }} style={{ width: 140, height: 100, borderRadius: 12, marginRight: 10 }} />))}
               {gallery.length === 0 && <Text style={{color: COLORS.textMuted}}>No photos yet</Text>}
             </ScrollView>
          </View>

          <View style={{ marginBottom: 25 }}>
            <View style={globalStyles.rowBetween}><Text style={globalStyles.sectionTitle}>Community Rating</Text>
               <TouchableOpacity onPress={() => navigation.navigate('AddReview', { placeId: place._id })}><Text style={{ color: COLORS.accent }}>Write Review</Text></TouchableOpacity>
            </View>
            {reviews.map((rev) => (
              <View key={rev._id} style={{ backgroundColor: COLORS.glass1, padding: 15, borderRadius: 16, marginTop: 10 }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between' }}><Text style={{ color: COLORS.white, fontWeight:'600' }}>{rev.user?.name}</Text><Text style={{ color: COLORS.accent }}>★ {rev.rating}</Text></View>
                <Text style={{ color: COLORS.textSoft, fontSize: 13, marginTop: 5 }}>{rev.comment}</Text>
              </View>
            ))}
          </View>

          {(isOwner || isAdmin) && (
            <View>
              <TouchableOpacity style={[globalStyles.button, { backgroundColor: COLORS.glass2, shadowColor: 'transparent', marginBottom: 12 }]} onPress={() => navigation.navigate('EditPlace', { placeId: place._id })}><Text style={globalStyles.buttonText}>Edit Details ✎</Text></TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, { backgroundColor: '#FF6B6B22', shadowColor: 'transparent' }]} onPress={handleArchive}><Text style={{ color: COLORS.error, fontWeight:'700' }}>Delete This Post 🗑</Text></TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
