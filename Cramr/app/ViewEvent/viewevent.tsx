import { useUser } from '@/contexts/UserContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bookmark, BookOpen, Calendar, Clock, Info, Laptop, MapPin, Send, Users } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Linking,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors } from '../../constants/Colors';

interface Event {
  id: string;
  title: string;
  bannerColor: number;
  description: string;
  location?: string | null;
  study_room?: string | null;
  virtual_room_link?: string | null;
  class: string;
  event_format: string;
  date_and_time: Date;
  creator_id: string;
  creator_profile_picture: string;
  created_at: string;
  event_type: string;
  status: string;
  capacity: number;
  tags: string[];
  is_online?: boolean;
}

interface RSVP {
  user_id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  status: string;
}

const EventViewScreen = () => {
  const { isDarkMode, user } = useUser();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { user: loggedInUser, updateUserData } = useUser();

  // Colors
  const backgroundColor = !isDarkMode ? Colors.light.background : Colors.dark.background;
  const textColor = !isDarkMode ? Colors.light.text : Colors.dark.text;
  const textInputColor = !isDarkMode ? Colors.light.textInput : Colors.dark.textInput;
  const bannerColors = Colors.bannerColors;
  const placeholderTextColor = !isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText;
  const cancelButtonColor = !isDarkMode ? Colors.light.cancelButton : Colors.dark.cancelButton;

  const userId = user?.id;
  const [comment, setComment] = useState('');
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  
  // Add refresh state
  const [refreshing, setRefreshing] = useState(false);

  const formatDate = (dateAndTime: Date | string | null) => {
    if (!dateAndTime) return 'Invalid date';
    try {
      const date = new Date(dateAndTime);
      if (isNaN(date.getTime())) return 'Invalid date';
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      return `${month}/${day}/${year}`;
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (dateAndTime: Date | string | null) => {
    if (!dateAndTime) return 'Select Time';
    try {
      const date = new Date(dateAndTime);
      if (isNaN(date.getTime())) return 'Select Time';
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const minutesStr = minutes.toString().padStart(2, '0');
      return `${hour12}:${minutesStr} ${ampm}`;
    } catch {
      return 'Select Time';
    }
  };

  // -------- Fetch Event --------
  const fetchEvent = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const [bannerColor, setBannerColor] = useState<string | null>(null);

  useEffect(() => {
      const fetchBannerColor = async () => {
        if (!event?.creator_id) return;
        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${event.creator_id}`);
          if (response.ok) {
            const data = await response.json();
            setBannerColor(bannerColors[data.banner_color] || null);
          } else {
            setBannerColor(null);
          }
        } catch (error) {
          console.error('Error fetching banner color:', error);
          setBannerColor(null);
        }
      };
      fetchBannerColor();
    }, [bannerColors, event?.creator_id]);
    
  const [isOwner, setIsOwner] = useState(false);

  const checkIfOwner = () => {
    if (event?.creator_id === loggedInUser?.id) {
      setIsOwner(true);
    }
  };

  useEffect(() => {
    checkIfOwner();
  }, [event, loggedInUser]);

  const fetchRSVPs = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvps`);
      if (res.ok) {
        const data = await res.json();
        setRsvps(data.rsvps || []);
      }
    } catch {}
  };

  const fetchComments = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {}
  };

  // -------- RSVP and Save status --------
  const fetchUserStatuses = async () => {
    if (!eventId || !userId) return;
    try {
      // Fetch RSVP status
      const rsvpRes = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd?user_id=${userId}`);
      if (rsvpRes.ok) {
        const rsvpData = await rsvpRes.json();
        setIsRSVPed(Boolean(rsvpData.rsvp?.status === 'accepted'));
      }

      // Fetch save status
      const saveRes = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${eventId}`);
      if (saveRes.ok) {
        const saveData = await saveRes.json();
        setIsSaved(Boolean(saveData.is_saved));
      }
    } catch (error) {
      console.error('Error fetching user statuses:', error);
    }
  };

  // -------- Refresh function --------
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchEvent(),
        fetchRSVPs(), 
        fetchComments(),
        fetchUserStatuses()
      ]);
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [eventId, userId]);

  // -------- Comment Handling --------
  const addComment = async () => {
    if (!comment.trim() || !userId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, content: comment.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setComment('');
      }
    } catch {}
  };

  const deleteComment = async (commentId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch {}
  };

  // -------- RSVP / Save --------
  const toggleRSVP = async () => {
    if (busy || !eventId || !userId) return;
    setBusy(true);
    try {
      if (isRSVPed) {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });
        setIsRSVPed(false);
      } else {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, status: 'accepted' }),
        });
        setIsRSVPed(true);
      }
      await fetchEvent();
      await fetchRSVPs();
    } catch {
    } finally {
      setBusy(false);
    }
  };

  const toggleSave = async () => {
    if (busy || !eventId || !userId) return;
    setBusy(true);
    try {
      if (isSaved) {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${eventId}`, {
          method: 'DELETE',
        });
        setIsSaved(false);
      } else {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: eventId }),
        });
        setIsSaved(true);
      }
    } catch {
    } finally {
      setBusy(false);
    }
  };

  // -------- Effects --------
  useEffect(() => {
    fetchEvent();
    fetchRSVPs();
    fetchComments();
  }, [eventId]);

  useEffect(() => {
    fetchUserStatuses();
  }, [eventId, userId]);

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayedRSVPs = rsvps.slice(0, 6);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.scrollContent} 
        enableOnAndroid 
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5CAEF1']} // Android
            tintColor={'#5CAEF1'} // iOS
          />
        }
      >
        <View style={styles.content}>
          <ArrowLeft size={24} color={textColor} onPress={() => router.back()} style={{ marginBottom: 15 }} />

          <View style={[styles.eventCard, { backgroundColor: textInputColor }]}>
            <View style={[styles.eventHeader, { backgroundColor: bannerColor || textInputColor}]}>
              <Text style={[styles.eventTitle, { color: textColor }]}>{event.title}</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/Profile/External', params: { userId: event.creator_id } })}>
                <Image source={{ uri: event.creator_profile_picture }} style={styles.ownerAvatar ? styles.ownerAvatar : require('../../assets/images/default_profile.jpg')} />
              </TouchableOpacity>
            </View>

            <View style={styles.eventContent}>
              {event.tags && event.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {event.tags.slice(0, 3).map((tag, i) => (
                    <View key={i} style={[styles.tag, { borderColor: textColor }]}>
                      <Text style={[styles.tagText, { color: textColor }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <BookOpen size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>{event.class}</Text>
                </View>

                {/* Updated location handling to match EventCollapsible */}
                {event.event_format === 'In Person' && (
                  <View style={styles.detailRow}>
                    <MapPin size={20} color={textColor} />
                    <Text style={[styles.detailText, { color: textColor }]}>
                      {event.location}
                      {event.study_room && event.study_room}
                    </Text>
                  </View>
                )}

                {/* Added online event handling like EventCollapsible */}
                {event.event_format === 'Online' && (
                  <View style={styles.detailRow}>
                    <Laptop size={20} color={textColor} />
                    <TouchableOpacity
                      onPress={() =>
                        event.virtual_room_link
                          ? Linking.openURL(
                              event.virtual_room_link.startsWith('http://') || event.virtual_room_link.startsWith('https://')
                                ? event.virtual_room_link
                                : `http://${event.virtual_room_link}`
                            )
                          : null
                      }
                    >
                      <Text style={[styles.detailText, { color: textColor }]}>{event.virtual_room_link}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Calendar size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>{formatDate(event.date_and_time)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>{formatTime(event.date_and_time)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Users size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>
                    {rsvps.length}/{event.capacity}
                  </Text>
                </View>

                <View style={styles.avatarsContainer}>
                  {displayedRSVPs.map((r, i) => (
                    <View key={i} style={styles.rsvpAvatar}>
                      <TouchableOpacity onPress={() => router.push({ pathname: '/Profile/External', params: { userId: r.user_id } })}>
                        <Image
                          source={r.profile_picture_url ? { uri: r.profile_picture_url } : require('../../assets/images/default_profile.jpg')}
                          style={styles.avatarImage}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              {event.description && (
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Info size={20} color={textColor} />
                    <Text style={[styles.infoText, { color: textColor }]}>{event.description}</Text>
                  </View>
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {isOwner && (
                <TouchableOpacity onPress={() => router.push({ pathname: '/CreateEvent/EditEvent', params: { eventId } })} style={styles.editButton}>
                  <Text style={[styles.editButtonText, { color: textColor }]}>Edit</Text>
                </TouchableOpacity>
                )}

                {!isOwner && (
                  <>
                    {(rsvps.length < event.capacity || isRSVPed) &&(
                      <>
                      <TouchableOpacity onPress={toggleRSVP} disabled={busy} style={[styles.rsvpButton, { backgroundColor: isRSVPed ? cancelButtonColor : '#5CAEF1' }]}>
                        <Text style={[styles.rsvpButtonText, { color: textColor }]}>{isRSVPed ? 'RSVPed' : 'RSVP'}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={toggleSave}>
                        <Bookmark color={textColor} size={25} fill={isSaved ? textColor : 'none'} style={styles.saveButtonContainer} />
                      </TouchableOpacity>
                      </>
                    )}
                    {!(rsvps.length < event.capacity || isRSVPed) && (
                      <TouchableOpacity onPress={toggleSave}>
                        <Bookmark color={textColor} size={25} fill={isSaved ? textColor : 'none'} style={[styles.saveButtonContainer, {marginTop: -20, marginLeft: 290, marginBottom: 10}]} />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>

          <Text style={[styles.studyMaterialsTitle, { color: textColor }]}>Study Materials</Text>
          <View style={styles.materialsContainer}>
            <TouchableOpacity style={[styles.addMaterialCard, { borderColor: textColor }]}>
              <Text style={[styles.addMaterialPlus, { color: textColor }]}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentsSection}>
            <Text style={[styles.commentsTitle, { color: textColor }]}>Comments ({comments.length})</Text>

            {comments.map(c => (
              <View key={c.id} style={[styles.commentItem, { backgroundColor: textInputColor, borderRadius: 10, padding: 10}]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TouchableOpacity onPress={() => router.push({ pathname: '/Profile/External', params: { userId: c.user_id } })}>
                    <Image
                      source={c.profile_picture_url ? { uri: c.profile_picture_url } : require('../../assets/images/default_profile.jpg')}
                      style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                    />
                  </TouchableOpacity>
                  <View style={{ flex: 1 ,}}>
                    <Text style={{ color: textColor, fontFamily: 'Poppins-SemiBold' }}>{c.full_name || c.username}</Text>
                    <Text style={{ color: placeholderTextColor, fontFamily: 'Poppins-Regular', fontSize: 12 }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {c.user_id === userId && (
                    <TouchableOpacity onPress={() => deleteComment(c.id)} style={{ padding: 4 }}>
                      <Text style={{ color: '#E36062', fontSize: 18 }}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={{ color: textColor, fontFamily: 'Poppins-Regular', lineHeight: 20, marginLeft: 40 }}>
                  {c.content}
                </Text>
              </View>
            ))}

            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 }}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: textInputColor, color: textColor }]}
                placeholder="Add a comment..."
                placeholderTextColor={placeholderTextColor}
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <TouchableOpacity onPress={addComment} disabled={!comment.trim()}>
                <View style={{ padding: 10, opacity: comment.trim() ? 1 : 0.5, marginTop: -45}}>
                  <Send size={20} color={comment.trim() ? '#5CAEF1' : placeholderTextColor} strokeWidth={2} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default EventViewScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, fontFamily: 'Poppins-Regular' },
  scrollContent: { flexGrow: 1 },
  content: { padding: 20},
  eventCard: {
    borderRadius: 10,
    marginBottom: 5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10,},
  eventTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', flex: 1 },
  ownerAvatar: { width: 35, height: 35, borderRadius: 50 },
  eventContent: { padding: 16},
  tagsRow: { flexDirection: 'row', marginBottom: 16 },
  tag: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8 },
  tagText: { fontSize: 14, fontFamily: 'Poppins-Regular' },
  detailsContainer: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { fontSize: 14, fontFamily: 'Poppins-Regular', marginLeft: 8, flex: 1 },
  avatarsContainer: { flexDirection: 'row', marginLeft: 30 },
  rsvpAvatar: { marginRight: 5 },
  avatarImage: { width: 30, height: 30, borderRadius: 50 },
  infoSection: { marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoText: { fontSize: 14, fontFamily: 'Poppins-Regular', marginLeft: 8, flex: 1, lineHeight: 20 },
  rsvpButton: { padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 0, marginRight: 15, flex: 1 },
  editButton: { padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 0, flex: 1, backgroundColor: '#5CAEF1' },
  rsvpButtonText: { fontSize: 16, fontFamily: 'Poppins-Regular' },
  editButtonText: { fontSize: 16, fontFamily: 'Poppins-Regular' },
  saveButtonContainer: { top: 10 },
  studyMaterialsTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 15, marginTop: 20 },
  materialsContainer: { flexDirection: 'row', marginBottom: 20 },
  addMaterialCard: { width: 60, height: 60, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  commentInput: { flex: 1, borderRadius: 10, padding: 15, marginRight: -40, maxHeight: 100, fontSize: 14, fontFamily: 'Poppins-Regular' },
  commentItem: { marginBottom: 5,},
  commentsTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginBottom: 10 },
  addMaterialPlus: { fontSize: 24 }
});