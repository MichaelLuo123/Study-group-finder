import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
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
  const { isDarkMode, toggleDarkMode, user } = useUser();
  // Colors
  const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background)
  const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text)
  const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput)
  const bannerColors = Colors.bannerColors
  const placeholderTextColor = (!isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText)

  const userId = user?.id; // Use logged-in user's ID
  const [comment, setComment] = useState('');
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const eventId = '3272c557-e2c8-451b-8114-e9b2d5269d0a';
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState('eventView');
  const [busy, setBusy] = useState(false);

  // Theme colors
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const textInputColor = isDarkMode ? '#2a2a2a' : '#f5f5f5';
  const placeholderTextColor = isDarkMode ? '#888888' : '#666666';
  const rsvpedButtonColor = isDarkMode ? '#4CAF50' : '#4CAF50';
  const bannerColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

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
      } else {
        console.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
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
      } else {
        console.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchRSVPs();
    fetchComments();
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
  
  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayedRSVPs = rsvps.slice(0, 6);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <ArrowLeft 
            size={24} 
            color={textColor}
            onPress={() => router.back()}
            style={{marginBottom: 15}}
          />
          {/* Event Card */}
          <View style={[styles.eventCard, { backgroundColor: textInputColor }]}>
            {/* Event Header with colored banner */}
            <View style={[styles.eventHeader, { backgroundColor: bannerColors[event.bannerColor || 1] }]}>
              <Text style={[styles.eventTitle, {color: textColor}]}>{event.title}</Text>
              <Image source={{ uri: event.creator_profile_picture }} style={styles.ownerAvatar} />
            </View>

            <View style={styles.eventContent}>
              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  <View style={styles.tagsContainer}>
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <View key={index} style={[styles.tag, { borderColor: textColor }]}>
                        <Text style={[styles.tagText, { color: textColor }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
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
                  {displayedRSVPs.map((rsvp, index) => (
                    <View key={index} style={styles.rsvpAvatar}>
                      {rsvp.profile_picture_url ? (
                        <Image source={{ uri: rsvp.profile_picture_url }} style={styles.avatarImage} />
                      ) : (
                        <Image source={require('../../assets/images/default_profile.jpg')} style={styles.avatarImage} />
                      )}
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

              {/* RSVP Button */}
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableOpacity
                  onPress={toggleRSVP}
                  disabled={busy}
                  style={[
                    styles.rsvpButton,
                    { backgroundColor: isRSVPed ? rsvpedButtonColor : '#5CAEF1'}
                  ]}
                >
                  <Text style={[styles.rsvpButtonText, {color: textColor}]}>
                    {isRSVPed ? 'RSVPed' : 'RSVP'}
                  </Text>
                </TouchableOpacity>

                {/* Save Button */}
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

          <View style={{height: 1, backgroundColor: placeholderTextColor, marginVertical: 5}}></View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={[styles.commentsTitle, { color: textColor }]}>
              Comments ({comments.length})
            </Text>

            {/* Comments List */}
            {comments.map((comment) => (
              <View key={comment.id} style={[styles.commentItem, {borderBottomColor: placeholderTextColor,}]}>
                <View style={styles.commentHeader}>
                  <Image 
                    source={comment.profile_picture_url ? 
                      { uri: comment.profile_picture_url } : 
                      require('../../assets/images/default_profile.jpg')
                    }
                    style={styles.commentAvatar} 
                  />
                  <View style={styles.commentInfo}>
                    <View style={styles.commentAuthorRow}>
                      <Text style={[styles.commentAuthor, { color: textColor }]}>
                        {comment.full_name || comment.username}
                      </Text>
                      {comment.is_event_owner && (
                        <View style={styles.eventOwnerTag}>
                          <Text style={styles.eventOwnerTagText}>Event Owner</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.commentTime, { color: placeholderTextColor }]}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {comment.user_id === userId && (
                    <TouchableOpacity 
                      onPress={() => deleteComment(comment.id)}
                      style={styles.deleteButton}
                    >
                      <Text style={[styles.deleteButtonText, { color: '#ff4444' }]}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.commentContent, { color: textColor }]}>
                  {comment.content}
                </Text>
              </View>
            ))}

            {/* Add Comment */}
            <View style={styles.addCommentContainer}>
              <TextInput
                style={[styles.commentInput, { 
                  backgroundColor: textInputColor,
                  color: textColor 
                }]}
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
    borderRadius: 10,
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
    fontSize: 14,
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
    marginLeft: 30,
  },
  rsvpAvatar: {
    marginRight: 5,
  },
  avatarImage: {
    width: 25,
    height: 25,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
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
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginRight: 15,
    flex: 1,
  },
  rsvpButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  saveButtonContainer: {
    alignContent: 'center',
    top: 10
  },
  commentsSection: {
    marginTop: 10,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 15,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: -40,
    maxHeight: 100,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#666666',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  eventOwnerTag: {
    backgroundColor: '#5CAEF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  eventOwnerTagText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  commentTime: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  commentContent: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    marginLeft: 40,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
});

export default EventViewScreen;