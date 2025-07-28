import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
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
  rsvping_ids: string[];
}

const EventViewScreen = () => {
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [comment, setComment] = useState('');
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const eventId = '72ccc433-dbcf-48ad-84b8-5c4d53d0c6c6'; // Hardcoded for now, or get from route.params
  const commentInputRef = useRef<TextInput>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState('eventView');

  const handleNavigation = (page: string) => {
    if (currentPage !== page) {
      setCurrentPage(page);
      if (page === 'listView') {
        router.push('/listView');
      }
    }
  };

//mock event for testing purposes
  const mockEvent: Event = {
    id: '6dcba350-62b0-4e08-b54f-19331dbc79eb',
    title: 'CS101 Study Group',
    description: 'Study group for CS101: Introduction to Computer Science',
    location: 'Sun God Lounge, Price Center East',
    date_and_time: '2025-09-15T10:00:00Z',
    creator_id: '37bd4d1a-fd0e-4f43-8fd5-d3d436da39e2',
    created_at: '2025-08-01T12:00:00Z',
    event_type: 'In-person',
    status: 'active',
    capacity: 30,
    tags: ['CS101', 'Computer Science', 'Quiet'],
    invited_ids: [
      'id1', 'id2', 'id3', 'id4', 'id5', 'id6', 'id7', 'id8', 'id9', 'id10'
    ], // all invited
    rsvping_ids: [
      'id1', 'id2', 'id3', 'id4', 'id5', 'id6', 'id7'
    ], // those who RSVP'd
    invited_count: 10,
    accepted_ids: [],
    accepted_count: 0,
    declined_ids: [],
    declined_count: 0,
  };
  // useEffect(() => {
  //   console.log('Fetching event data...');
  //   fetch(`http://10.1.1.97:3000/events/${eventId}`) //REPLACE IP WITH YOUR IP
  //     .then(res => res.json())
  //     .then(data => {
  //       setEvent(data);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.log('Error:', error);
  //       setLoading(false);
  //   });
  useEffect(() => {
    if (!process.env.EXPO_PUBLIC_BACKEND_URL) {
      console.error('Backend URL not configured');
      setLoading(false);
      return;
    }

    fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}`)
      .then(res => res.json())
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch event:', error);
        setLoading(false);
      });
  }, [eventId]); 

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleRSVP = () => {
    setIsRSVPed(!isRSVPed);
  };

  const handlePostComment = () => {
    if (comment.trim()) {
      console.log('Posting comment:', comment);
      setComment('');
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  if (loading) return <ActivityIndicator />;
  if (!event) return <Text>Event not found</Text>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 30 : 100}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableAutomaticScroll={true}
        enableResetScrollToCoords={false}
        keyboardOpeningTime={100}
        extraHeight={Platform.OS === 'android' ? 100 : 30}
        keyboardDismissMode="interactive"
        scrollEnabled={true} // Enable scrolling while typing
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton}>
              <Text style={[styles.backText, { color: theme.textColor }]}>←</Text>
            </TouchableOpacity>
            <View />
          </View>

          {/* Main Event Card */}
          <View style={[styles.eventCard, { backgroundColor: theme.cardBackground }]}>
            {/* Event Header */}
            <View style={[styles.eventHeader, { backgroundColor: theme.eventHeaderBackground }]}>
              <Text style={[styles.eventTitle, { color: theme.textColor }]}>
                {event?.title || "No Title"}
              </Text>
              <TouchableOpacity onPress={toggleTheme} style={styles.profileButton}>
                <View style={[styles.profileIcon, { backgroundColor: theme.profileBackground }]}>
                  <Text style={styles.profileEmoji}>👤</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Event Labels */}
            <View style={styles.labelsContainer}>
              {(event?.tags || []).map((tag, index) => (
                <View
                  key={index}
                  style={[styles.label, { backgroundColor: theme.labelBackground }]}
                >
                  <Text style={[styles.labelText, { color: theme.labelTextColor }]}> {tag} </Text>
                </View>
              ))}
            </View>

            {/* Event Details */}
            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailIcon, { color: theme.textColor }]}>📚</Text>
                <Text style={[styles.detailText, { color: theme.textColor }]}> {event?.tags?.[0] || "No Course"} </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailIcon, { color: theme.textColor }]}>📍</Text>
                <Text style={[styles.detailText, { color: theme.textColor }]}> {event?.location || "No Location"} </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailIcon, { color: theme.textColor }]}>📅</Text>
                <Text style={[styles.detailText, { color: theme.textColor }]}> {event?.date_and_time ? new Date(event.date_and_time).toLocaleDateString() : "No Date"} </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailIcon, { color: theme.textColor }]}>🕐</Text>
                <Text style={[styles.detailText, { color: theme.textColor }]}> {event?.date_and_time ? new Date(event.date_and_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'America/Los_Angeles' }) : "No Time"} </Text>
              </View>
            </View>

            {/* Attendees Info */}
            <View style={styles.attendeesSection}>
              <View style={styles.attendeesRow}>
                <Text style={[styles.attendeesIcon, { color: theme.textColor }]}>👥</Text>
                <Text style={[styles.attendeesCount, { color: theme.textColor }]}>
                  {event?.accepted_count ?? 0}/{event?.capacity ?? 0} people going
                </Text>
                <View style={styles.avatarsContainer}>
                  {Array.from({ length: Math.min(event?.accepted_count ?? 0, 7) }, (_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.avatar,
                        { 
                          backgroundColor: theme.avatarBackground,
                          marginLeft: index > 0 ? -8 : 0
                        }
                      ]}
                    >
                      <Text style={styles.avatarText}>👤</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={[styles.descriptionText, { color: theme.textColor }]}>
                {event?.description || "No Description"}
              </Text>
            </View>

            {/* RSVP Section */}
            <View style={styles.rsvpSection}>
              <TouchableOpacity
                onPress={handleRSVP}
                style={[
                  styles.rsvpButton,
                  {
                    backgroundColor: isRSVPed ? theme.rsvpActiveBackground : theme.rsvpBackground,
                  }
                ]}
              >
                <Text
                  style={[
                    styles.rsvpButtonText,
                    {
                      color: isRSVPed ? theme.rsvpActiveText : theme.rsvpText,
                    }
                  ]}
                >
                  {isRSVPed ? 'GOING' : 'RSVP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={[styles.commentsTitle, { color: theme.textColor }]}>
              2 Comments
            </Text>
            
            <ScrollView 
              style={styles.commentsScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              contentContainerStyle={styles.commentsContentContainer}
            >
              {/* Comment 1 */}
              <View style={[styles.comment, { backgroundColor: theme.commentBackground }]}>
                <View style={styles.commentHeader}>
                  <View style={[styles.commentAvatar, { backgroundColor: theme.avatarBackground }]}>
                    <Text style={styles.commentAvatarText}>👤</Text>
                  </View>
                  <Text style={[styles.commentUsername, { color: theme.textColor }]}>
                    Username
                  </Text>
                </View>
                <Text style={[styles.commentText, { color: theme.textColor }]}>
                  Sample comment text here!
                </Text>
              </View>

              {/* Comment 2 */}
              <View style={[styles.comment, { backgroundColor: theme.commentBackground }]}>
                <View style={styles.commentHeader}>
                  <View style={[styles.commentAvatar, { backgroundColor: theme.avatarBackground }]}>
                    <Text style={styles.commentAvatarText}>👤</Text>
                  </View>
                  <Text style={[styles.commentUsername, { color: theme.textColor }]}>
                    Username
                  </Text>
                </View>
                <Text style={[styles.commentText, { color: theme.textColor }]}>
                  Another sample comment.
                </Text>
              </View>

              {/* Add more sample comments to demonstrate scrolling */}
              {[3, 4, 5, 6, 7, 8].map((index) => (
                <View key={index} style={[styles.comment, { backgroundColor: theme.commentBackground }]}>
                  <View style={styles.commentHeader}>
                    <View style={[styles.commentAvatar, { backgroundColor: theme.avatarBackground }]}>
                      <Text style={styles.commentAvatarText}>👤</Text>
                    </View>
                    <Text style={[styles.commentUsername, { color: theme.textColor }]}>
                      User {index}
                    </Text>
                  </View>
                  <Text style={[styles.commentText, { color: theme.textColor }]}>
                    This is comment number {index}. Adding more comments to demonstrate the scrolling functionality.
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Add Comment Section */}
          <View style={styles.addCommentSection}>
            <View style={[styles.commentInputContainer, { backgroundColor: theme.inputBackground }]}>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Add a comment..."
                placeholderTextColor={theme.placeholderColor}
                style={[styles.commentInput, { color: theme.textColor }]}
                multiline
                returnKeyType="default"
                onSubmitEditing={handlePostComment}
                ref={commentInputRef}
                textAlignVertical="top"
                scrollEnabled={false}
              />
              <TouchableOpacity
                onPress={handlePostComment}
                style={[styles.sendButton, { backgroundColor: theme.sendButtonBackground }]}
              >
                <Text style={[styles.sendButtonText, { color: theme.sendButtonText }]}>
                  →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Bottom Navigation Icons - Fixed at bottom */}
      <View style={[styles.bottomNav, { backgroundColor: theme.navBackground, borderTopColor: theme.navBorder }]}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleNavigation('listView')}
        >
          <MaterialCommunityIcons 
            name="clipboard-list-outline" 
            size={24} 
            color={isDarkMode ? "#ffffff" : "#000000"} 
          />
          {currentPage === 'listView' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleNavigation('map')}
        >
          <Ionicons 
            name="map-outline" 
            size={24} 
            color={isDarkMode ? "#ffffff" : "#000000"} 
          />
          {currentPage === 'map' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleNavigation('addEvent')}
        >
          <Feather 
            name="plus-square" 
            size={24} 
            color={isDarkMode ? "#ffffff" : "#000000"} 
          />
          {currentPage === 'addEvent' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleNavigation('bookmarks')}
        >
          <Feather 
            name="bookmark" 
            size={24} 
            color={isDarkMode ? "#ffffff" : "#000000"} 
          />
          {currentPage === 'bookmarks' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleNavigation('profile')}
        >
          <Ionicons 
            name="person-circle-outline" 
            size={24} 
            color={isDarkMode ? "#ffffff" : "#000000"} 
          />
          {currentPage === 'profile' && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, 
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventCard: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 4,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: {
    fontSize: 14,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 4,
    marginTop: 10, 
  },
  label: {
    paddingHorizontal: 14, 
    paddingVertical: 6,   
    borderRadius: 20,      
    marginRight: 8,
    marginBottom: 6,
    backgroundColor: '#e0e7ff',
    borderWidth: 1,
    borderColor: '#a5b4fc',   
  },
  labelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3730a3',
  },
  eventDetails: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
  },
  attendeesSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  attendeesCount: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
  },
  avatarsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarText: {
    fontSize: 10,
  },
  descriptionSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  rsvpSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  rsvpButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  rsvpButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentsSection: {
    marginBottom: 16,
  },
  commentsScrollView: {
    maxHeight: 200,
  },
  commentsContentContainer: {
    paddingBottom: 8,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  comment: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  commentAvatarText: {
    fontSize: 14,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 16,
  },
  addCommentSection: {
    marginBottom: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  commentInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    backgroundColor: 'transparent',
    minHeight: 44,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12, 
  },
  navButton: {
    alignItems: 'center',
    padding: 8,
  },
  navIcon: {
    fontSize: 24,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5caef1', 
    position: 'absolute',
    bottom: -5, 
  },
});

const lightTheme = {
  backgroundColor: '#f8f9fa',
  cardBackground: '#ffffff',
  eventHeaderBackground: '#e8d5d5',
  textColor: '#000000',
  labelBackground: '#ffffff',
  labelTextColor: '#666666',
  rsvpBackground: '#007AFF',
  rsvpText: '#ffffff',
  rsvpActiveBackground: '#007AFF',
  rsvpActiveText: '#ffffff',
  commentBackground: '#f0f0f0',
  avatarBackground: '#cccccc',
  profileBackground: '#e8d5d5',
  inputBackground: '#ffffff',
  placeholderColor: '#999999',
  sendButtonBackground: '#007AFF',
  sendButtonText: '#ffffff',
  navBackground: '#ffffff',
  navBorder: '#e0e0e0',
};

const darkTheme = {
  backgroundColor: '#1a1a1a',
  cardBackground: '#2d2d2d',
  eventHeaderBackground: '#374151',
  textColor: '#ffffff',
  labelBackground: '#374151',
  labelTextColor: '#d1d5db',
  rsvpBackground: '#007AFF',
  rsvpText: '#ffffff',
  rsvpActiveBackground: '#007AFF',
  rsvpActiveText: '#ffffff',
  commentBackground: '#374151',
  avatarBackground: '#4a5568',
  profileBackground: '#374151',
  inputBackground: '#374151',
  placeholderColor: '#9ca3af',
  sendButtonBackground: '#007AFF',
  sendButtonText: '#ffffff',
  navBackground: '#2d2d2d',
  navBorder: '#4a5568',
};


export default EventViewScreen;