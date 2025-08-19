import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date_and_time: string;
  creator_id: string;
  created_at: string;
  event_type: string;
  status: string;
  capacity: number;
  tags: string[];
  invited_ids: string[];
  invited_count: number;
  accepted_ids: string[];
  accepted_count: number;
  declined_ids: string[];
  declined_count: number;
}

interface Comment {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  comment: string;
  created_at: string;
}

interface RSVP {
  user_id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  status: string;
}

const EventViewScreen = () => {
  const userId = '2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5';
  const { isDarkMode, toggleDarkMode } = useUser();
  const [comment, setComment] = useState('');
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const eventId = '3272c557-e2c8-451b-8114-e9b2d5269d0a';
  const commentInputRef = useRef<TextInput>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState('eventView');
  const [busy, setBusy] = useState(false);

  const handleNavigation = (page: string) => {
    if (currentPage !== page) {
      setCurrentPage(page);
      if (page === 'listView') router.push('/listView');
      if (page === 'profile') router.push('/Profile/Internal');
    }
  };

  const fetchEvent = async () => {
    if (!process.env.EXPO_PUBLIC_BACKEND_URL) {
      console.error('Backend URL not configured');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}`);
      const data = await res.json();
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const fetchRSVPs = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvps`);
      if (res.ok) {
        const data = await res.json();
        setRsvps(data.rsvps || []);
      }
    } catch (error) {
      console.error('Failed to fetch RSVPs:', error);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchComments();
    fetchRSVPs();
  }, [eventId]);

  useEffect(() => {
    if (!process.env.EXPO_PUBLIC_BACKEND_URL) return;

    fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd?user_id=${userId}`)
      .then(res => res.json())
      .then(data => setIsRSVPed(Boolean(data.rsvp?.status === 'accepted')))
      .catch(console.error);

    fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${eventId}`)
      .then(res => res.json())
      .then(data => setIsSaved(Boolean(data.is_saved)))
      .catch(console.error);
  }, [eventId, userId]);

  const toggleRSVP = async () => {
    if (busy) return;
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
    if (busy) return;
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

  const submitComment = async () => {
    if (!comment.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          comment: comment.trim() 
        }),
      });
      if (res.ok) {
        setComment('');
        await fetchComments();
      }
    } catch (err) {
      console.error('Comment submission error:', err);
    } finally {
      setBusy(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const startTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    // Add 2 hours for end time (you can adjust this logic)
    const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);
    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${startTime} - ${endTime}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#87CEEB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.textColor }]}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayedRSVPs = rsvps.slice(0, 6);
  const remainingCount = Math.max(0, event.accepted_count - 6);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Event Card */}
          <View style={[styles.eventCard, { backgroundColor: theme.cardBackground }]}>
            {/* Event Header with colored banner */}
            <View style={[styles.eventHeader, { backgroundColor: '#d4a5a5' }]}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerAvatarText}>👤</Text>
              </View>
            </View>

            <View style={styles.eventContent}>
              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  <View style={styles.tagsContainer}>
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <View key={index} style={[styles.tag, { borderColor: theme.textColor }]}>
                        <Text style={[styles.tagText, { color: theme.textColor }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity onPress={toggleSave}>
                    <Ionicons
                      name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={24}
                      color={theme.textColor}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Event Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Ionicons name="book-outline" size={20} color={theme.textColor} />
                  <Text style={[styles.detailText, { color: theme.textColor }]}>{event.event_type.replace('_', ' ')}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={20} color={theme.textColor} />
                  <Text style={[styles.detailText, { color: theme.textColor }]}>{event.location}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={20} color={theme.textColor} />
                  <Text style={[styles.detailText, { color: theme.textColor }]}>{formatDate(event.date_and_time)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={20} color={theme.textColor} />
                  <Text style={[styles.detailText, { color: theme.textColor }]}>{formatTime(event.date_and_time)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={20} color={theme.textColor} />
                  <Text style={[styles.detailText, { color: theme.textColor }]}>
                    {event.accepted_count}/{event.capacity}
                  </Text>
                  
                  {/* RSVP Avatars */}
                  <View style={styles.avatarsContainer}>
                    {displayedRSVPs.map((rsvp, index) => (
                      <View key={index} style={styles.rsvpAvatar}>
                        {rsvp.profile_picture_url ? (
                          <Image source={{ uri: rsvp.profile_picture_url }} style={styles.avatarImage} />
                        ) : (
                          <View style={[styles.avatarPlaceholder, { backgroundColor: '#FFD700' }]}>
                            <Text style={styles.avatarText}>
                              {getInitials(rsvp.full_name || rsvp.username)}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                    {remainingCount > 0 && (
                      <View style={[styles.avatarPlaceholder, { backgroundColor: '#ccc' }]}>
                        <Text style={styles.avatarText}>+{remainingCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Info Section */}
              {event.description && (
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.textColor} />
                    <Text style={[styles.infoText, { color: theme.textColor }]}>{event.description}</Text>
                  </View>
                </View>
              )}

              {/* RSVP Button */}
              <TouchableOpacity
                onPress={toggleRSVP}
                disabled={busy}
                style={[
                  styles.rsvpButton,
                  { backgroundColor: isRSVPed ? '#4CAF50' : '#87CEEB' }
                ]}
              >
                {busy ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.rsvpButtonText}>
                    {isRSVPed ? 'RSVP' : 'RSVP'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButtonContainer} onPress={toggleSave}>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={theme.textColor}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={[styles.commentsTitle, { color: theme.textColor }]}>
              {comments.length} Comments
            </Text>

            {comments.map((commentItem, index) => (
              <View key={index} style={[styles.commentItem, { backgroundColor: 
                index % 2 === 0 ? '#c4b57a' : '#7a9c7a' 
              }]}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatar}>
                    {commentItem.profile_picture_url ? (
                      <Image source={{ uri: commentItem.profile_picture_url }} style={styles.commentAvatarImage} />
                    ) : (
                      <View style={[styles.commentAvatarPlaceholder, { backgroundColor: '#FFD700' }]}>
                        <Text style={styles.commentAvatarText}>
                          {getInitials(commentItem.full_name || commentItem.username)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.commentUsername}>
                    {commentItem.full_name || commentItem.username}
                  </Text>
                </View>
                <Text style={styles.commentText}>{commentItem.comment}</Text>
              </View>
            ))}

            {/* Add Comment */}
            <View style={styles.addCommentContainer}>
              <TextInput
                ref={commentInputRef}
                style={[styles.commentInput, { 
                  backgroundColor: theme.inputBackground,
                  color: theme.textColor 
                }]}
                placeholder="Add a comment..."
                placeholderTextColor={theme.placeholderColor}
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <TouchableOpacity 
                onPress={submitComment}
                disabled={!comment.trim() || busy}
                style={[styles.sendButton, { opacity: comment.trim() ? 1 : 0.5 }]}
              >
                <Ionicons name="send" size={20} color="#87CEEB" />
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
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorText: { 
    fontSize: 18,
    fontFamily: 'Poppins-Regular'
  },
  scrollContent: { 
    flexGrow: 1 
  },
  content: { 
    padding: 16 
  },
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    flex: 1,
  },
  ownerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {
    fontSize: 16,
  },
  eventContent: {
    padding: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
    flex: 1,
  },
  avatarsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  rsvpAvatar: {
    marginLeft: -4,
  },
  avatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  rsvpButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rsvpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  saveButtonContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  commentsSection: {
    marginTop: 8,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
  commentItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAvatar: {
    marginRight: 8,
  },
  commentAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  commentAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  commentUsername: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
    lineHeight: 18,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  sendButton: {
    padding: 8,
  },
});

const lightTheme = {
  backgroundColor: '#f5f5f5',
  cardBackground: '#ffffff',
  textColor: '#000000',
  inputBackground: '#f0f0f0',
  placeholderColor: '#999999',
};

const darkTheme = {
  backgroundColor: '#1a1a1a',
  cardBackground: '#2d2d2d',
  textColor: '#ffffff',
  inputBackground: '#3a3a3a',
  placeholderColor: '#cccccc',
};

export default EventViewScreen;