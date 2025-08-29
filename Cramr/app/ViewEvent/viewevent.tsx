import { useUser } from '@/contexts/UserContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Bookmark, BookOpen, Calendar, Clock, Info, MapPin, Send, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  bannerColor: number;
  description: string;
  location: string;
  class: string;
  date: string;
  time: string;
  creator_id: string;
  creator_profile_picture: string;
  created_at: string;
  event_type: string;
  status: string;
  capacity: number;
  tags: string[];
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

  // Colors
  const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background);
  const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text);
  const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput);
  const bannerColors = Colors.bannerColors;
  const placeholderTextColor = (!isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText);

  const userId = user?.id;
  const [comment, setComment] = useState('');
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // --- normalize helpers ---
  const splitDateTime = (dt: any): { date?: string; time?: string } => {
    if (!dt) return {};
    const d = new Date(dt);
    if (!isNaN(d.getTime())) {
      return {
        date: d.toLocaleDateString(),
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
    // try plain split for "YYYY-MM-DD HH:mm" or "YYYY-MM-DDTHH:mm:ssZ"
    const str = String(dt);
    const parts = str.split(/[T ]/);
    if (parts.length >= 2) {
      return { date: parts[0], time: parts[1].slice(0, 5) };
    }
    return { date: str };
  };

  const normalizeEvent = (raw: any): Event => {
    const { date, time } = (() => {
      const d = raw.date ?? raw.event_date;
      const t = raw.time ?? raw.event_time ?? raw.start_time;
      if (d || t) return { date: d, time: t };
      return splitDateTime(raw.date_and_time ?? raw.dateAndTime ?? raw.starts_at ?? raw.start_at);
    })();

    return {
      id: String(raw.id),
      title: String(raw.title ?? 'Untitled'),
      bannerColor: Number(raw.bannerColor ?? raw.banner_color ?? 1),
      description: String(raw.description ?? ''),
      location: String(raw.location ?? raw.study_room ?? raw.venue ?? '—'),
      class: String(raw.class ?? raw.subject ?? raw.course ?? '—'),
      date: date ? String(date) : '—',
      time: time ? String(time) : '—',
      creator_id: String(raw.creator_id ?? ''),
      creator_profile_picture: String(
        raw.creator_profile_picture ?? raw.owner_profile ?? raw.owner_avatar ?? ''
      ),
      created_at: String(raw.created_at ?? ''),
      event_type: String(raw.event_type ?? ''),
      status: String(raw.status ?? ''),
      capacity: Number(raw.capacity ?? 0),
      tags: Array.isArray(raw.tags) ? raw.tags : [],
    };
  };

  // -------- Fetch Event --------
  const fetchEvent = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(normalizeEvent(data));
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRSVPs = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvps`);
      if (res.ok) {
        const data = await res.json();
        setRsvps(data.rsvps || []);
      }
    } catch (error) {
    }
  };

  const fetchComments = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
    }
  };

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
    } catch (error) {
    }
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
    } catch (error) {
    }
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
    } catch (err) {
      console.error('RSVP toggle error:', err);
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
    } catch (err) {
      console.error('Save toggle error:', err);
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
    if (!eventId || !userId) return;
    fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd?user_id=${userId}`)
      .then(res => res.json())
      .then(data => setIsRSVPed(Boolean(data.rsvp?.status === 'accepted')))
      .catch(() => {});

    fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${eventId}`)
      .then(res => res.json())
      .then(data => setIsSaved(Boolean(data.is_saved)))
      .catch(() => {});
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
      >
        <View style={styles.content}>
          {/* Back Button */}
          <ArrowLeft
            size={24}
            color={textColor}
            onPress={() => router.back()}
            style={{ marginBottom: 15 }}
          />

          {/* Event Card */}
          <View style={[styles.eventCard, { backgroundColor: textInputColor }]}>
            <View style={[styles.eventHeader, { backgroundColor: bannerColors[event.bannerColor || 1] }]}>
              <Text style={[styles.eventTitle, { color: textColor }]}>{event.title}</Text>
              {!!event.creator_profile_picture && (
                <Image source={{ uri: event.creator_profile_picture }} style={styles.ownerAvatar} />
              )}
            </View>

            <View style={styles.eventContent}>
              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {event.tags.slice(0, 3).map((tag, i) => (
                    <View key={i} style={[styles.tag, { borderColor: textColor }]}>
                      <Text style={[styles.tagText, { color: textColor }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Event Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <BookOpen size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>{event.class}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MapPin size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>{event.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>{event.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>{event.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Users size={20} color={textColor} />
                  <Text style={[styles.detailText, { color: textColor }]}>
                    {rsvps.length}/{event.capacity}
                  </Text>
                </View>

                {/* RSVP Avatars */}
                <View style={styles.avatarsContainer}>
                  {displayedRSVPs.map((r, i) => (
                    <View key={i} style={styles.rsvpAvatar}>
                      <Image
                        source={r.profile_picture_url ? { uri: r.profile_picture_url } : require('../../assets/images/default_profile.jpg')}
                        style={styles.avatarImage}
                      />
                    </View>
                  ))}
                </View>
              </View>

              {/* Info Section */}
              {event.description && (
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Info size={20} color={textColor} />
                    <Text style={[styles.infoText, { color: textColor }]}>{event.description}</Text>
                  </View>
                </View>
              )}

              {/* RSVP + Save Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  onPress={toggleRSVP}
                  disabled={busy}
                  style={[styles.rsvpButton, { backgroundColor: isRSVPed ? '#e0e0e0' : '#5CAEF1' }]}
                >
                  <Text style={[styles.rsvpButtonText, { color: textColor }]}>
                    {isRSVPed ? 'RSVPed' : 'RSVP'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleSave}>
                  <Bookmark
                    color={textColor}
                    size={25}
                    fill={isSaved ? textColor : 'none'}
                    style={styles.saveButtonContainer}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Study Materials (placeholder) */}
          <Text style={[styles.studyMaterialsTitle, { color: textColor }]}>Study Materials</Text>
          <View style={styles.materialsContainer}>
            <TouchableOpacity style={[styles.addMaterialCard, { borderColor: textColor }]}>
              <Text style={[styles.addMaterialPlus, { color: textColor }]}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Comments */}
          <View style={styles.commentsSection}>
            <Text style={[styles.commentsTitle, { color: textColor }]}>
              Comments ({comments.length})
            </Text>

            {comments.map(c => (
              <View key={c.id} style={[styles.commentItem, { borderBottomColor: placeholderTextColor }]}>
                <View style={styles.commentHeader}>
                  <Image
                    source={c.profile_picture_url ? { uri: c.profile_picture_url } : require('../../assets/images/default_profile.jpg')}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentInfo}>
                    <View style={styles.commentAuthorRow}>
                      <Text style={[styles.commentAuthor, { color: textColor }]}>{c.full_name || c.username}</Text>
                      {c.is_event_owner && (
                        <View style={styles.eventOwnerTag}>
                          <Text style={styles.eventOwnerTagText}>Event Owner</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.commentTime, { color: placeholderTextColor }]}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {c.user_id === userId && (
                    <TouchableOpacity onPress={() => deleteComment(c.id)} style={styles.deleteButton}>
                      <Text style={[styles.deleteButtonText, { color: '#ff4444' }]}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.commentContent, { color: textColor }]}>{c.content}</Text>
              </View>
            ))}

            {/* Add Comment */}
            <View style={styles.addCommentContainer}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: textInputColor, color: textColor }]}
                placeholder="Add a comment..."
                placeholderTextColor={placeholderTextColor}
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <TouchableOpacity onPress={addComment} disabled={!comment.trim()}>
                <View style={[styles.sendButton, !comment.trim() && styles.sendButtonDisabled]}>
                  <Send size={20} color={comment.trim() ? "#5CAEF1" : placeholderTextColor} strokeWidth={2} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, fontFamily: 'Poppins-Regular' },
  scrollContent: { flexGrow: 1 },
  content: { padding: 16 },
  eventCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  eventTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', flex: 1 },
  ownerAvatar: { width: 32, height: 32, borderRadius: 16 },
  eventContent: { padding: 16 },
  tagsRow: { flexDirection: 'row', marginBottom: 16 },
  tag: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8 },
  tagText: { fontSize: 14, fontFamily: 'Poppins-Regular' },
  detailsContainer: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { fontSize: 14, fontFamily: 'Poppins-Regular', marginLeft: 8, flex: 1 },
  avatarsContainer: { flexDirection: 'row', marginLeft: 30 },
  rsvpAvatar: { marginRight: 5 },
  avatarImage: { width: 25, height: 25, borderRadius: 12 },
  infoSection: { marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoText: { fontSize: 14, fontFamily: 'Poppins-Regular', marginLeft: 8, flex: 1, lineHeight: 20 },
  rsvpButton: { paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10, marginRight: 15, flex: 1 },
  rsvpButtonText: { fontSize: 16, fontFamily: 'Poppins-Regular' },
  saveButtonContainer: { top: 10 },
  studyMaterialsTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', marginBottom: 15, marginTop: 20 },
  materialsContainer: { flexDirection: 'row', marginBottom: 20 },
  addMaterialCard: { width: 60, height: 60, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  addMaterialPlus: { fontSize: 30, fontFamily: 'Poppins-Bold' },
  commentsSection: { marginTop: 10 },
  commentsTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', marginBottom: 15 },
  commentItem: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  commentInfo: { flex: 1 },
  commentAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commentAuthor: { fontSize: 14, fontFamily: 'Poppins-SemiBold' },
  eventOwnerTag: { backgroundColor: '#5CAEF1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  eventOwnerTagText: { fontSize: 10, fontFamily: 'Poppins-Medium', color: '#fff' },
  commentTime: { fontSize: 12, fontFamily: 'Poppins-Regular' },
  commentContent: { fontSize: 14, fontFamily: 'Poppins-Regular', lineHeight: 20, marginLeft: 40 },
  deleteButton: { padding: 4 },
  deleteButtonText: { fontSize: 18, fontFamily: 'Poppins-Bold' },
  addCommentContainer: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 },
  commentInput: { flex: 1, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, marginRight: -40, maxHeight: 100, fontSize: 14, fontFamily: 'Poppins-Regular' },
  sendButton: { padding: 8 },
  sendButtonDisabled: { opacity: 0.5 },
});

export default EventViewScreen;
