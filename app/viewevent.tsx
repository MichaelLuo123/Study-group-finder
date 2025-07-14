import React, { useRef, useState } from 'react';
import {
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

const EventViewScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [comment, setComment] = useState('');
  const [isRSVPed, setIsRSVPed] = useState(false);
  const commentInputRef = useRef<TextInput>(null);

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
                Event Title
              </Text>
              <TouchableOpacity onPress={toggleTheme} style={styles.profileButton}>
                <View style={[styles.profileIcon, { backgroundColor: theme.profileBackground }]}>
                  <Text style={styles.profileEmoji}>👤</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Event Labels */}
            <View style={styles.labelsContainer}>
              {['Label', 'Label', 'Label'].map((label, index) => (
                <View
                  key={index}
                  style={[styles.label, { backgroundColor: theme.labelBackground }]}
                >
                  <Text style={[styles.labelText, { color: theme.labelTextColor }]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Event Details */}
            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailIcon, { color: theme.textColor }]}>📚</Text>
                <Text style={[styles.detailText, { color: theme.textColor }]}>Course Code</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailIcon, { color: theme.textColor }]}>📍</Text>
                <Text style={[styles.detailText, { color: theme.textColor }]}>Event Location</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailIcon, { color: theme.textColor }]}>📅</Text>
                <Text style={[styles.detailText, { color: theme.textColor }]}>Event Date</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailIcon, { color: theme.textColor }]}>🕐</Text>
                <Text style={[styles.detailText, { color: theme.textColor }]}>Event Time</Text>
              </View>
            </View>

            {/* Attendees Info */}
            <View style={styles.attendeesSection}>
              <View style={styles.attendeesRow}>
                <Text style={[styles.attendeesIcon, { color: theme.textColor }]}>👥</Text>
                <Text style={[styles.attendeesCount, { color: theme.textColor }]}>7/8</Text>
                <View style={styles.avatarsContainer}>
                  {[1, 2, 3, 4, 5, 6, 7].map((_, index) => (
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
                Event description goes here. This is a placeholder for the event details.
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
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>📚</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>🌍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>📊</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>👤</Text>
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
    paddingBottom: 80, // Space for navbar
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
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 12, // Account for home indicator on iOS
  },
  navButton: {
    alignItems: 'center',
    padding: 8,
  },
  navIcon: {
    fontSize: 24,
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