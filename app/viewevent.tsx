import React, { useRef, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// used to manage dark mode, rsvp status, comment input, selects theme colors based on dark mode status
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
      // use to send to backend later on
      console.log('Posting comment:', comment);
      setComment('');
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;
  // header box 
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
      >
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
            <TouchableOpacity style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.textColor }]}>×</Text>
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.settingsButton}>
                <Text style={[styles.settingsIcon, { color: theme.textColor }]}>⚙</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
                <View style={[styles.avatar, { backgroundColor: theme.avatarBackground }]}>
                  <Text style={styles.avatarText}>👤</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Event Info */}
          <View style={styles.eventInfo}>
            <Text style={[styles.eventTitle, { color: theme.textColor }]}>View Event Title</Text>
            <View style={styles.locationContainer}>
              <Text style={[styles.locationIcon, { color: theme.textColor }]}>📍</Text>
              <Text style={[styles.locationText, { color: theme.textColor }]}>
                Event Location
              </Text>
            </View>
          </View>

          {/* Labels */}
          <View style={styles.labelsContainer}>
            {['Label', 'Label', 'Label', 'Label', 'Label', 'Label'].map((label, index) => (
              <View
                key={index}
                style={[styles.labelChip, { backgroundColor: theme.labelBackground }]}
              >
                <Text style={[styles.labelIcon, { color: theme.textColor }]}>⭐</Text>
                <Text style={[styles.labelText, { color: theme.textColor }]}>{label}</Text>
              </View>
            ))}
          </View>

          {/* RSVP Section */}
          <View style={styles.rsvpSection}>
            <View style={styles.rsvpLeft}>
              <View style={[styles.avatar, { backgroundColor: theme.avatarBackground }]}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <Text style={[styles.username, { color: theme.textColor }]}>Username</Text>
            </View>
            <View style={styles.rsvpRight}>
              <View style={styles.rsvpRightContent}>
                <Text style={[styles.attendeeCount, { color: theme.textColor }]}>
                  7 people are going
                </Text>
                <TouchableOpacity
                  style={[
                    styles.rsvpButton,
                    {
                      backgroundColor: isRSVPed
                        ? theme.rsvpActiveBackground
                        : theme.rsvpBackground,
                    },
                  ]}
                  onPress={handleRSVP}
                >
                  <Text
                    style={{
                      color: isRSVPed ? theme.rsvpActiveText : theme.rsvpText,
                      fontWeight: '600',
                    }}
                  >
                    {isRSVPed ? 'Going' : 'RSVP'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Attendees */}
          <View style={styles.attendeesContainer}>
            <View style={styles.attendeeAvatars}>
              {[1, 2, 3].map((_, index) => (
                <View
                  key={index}
                  style={[styles.attendeeAvatar, { backgroundColor: theme.avatarBackground }]}
                >
                  <Text style={styles.avatarText}>👤</Text>
                </View>
              ))}
              <View style={[styles.moreAttendees, { backgroundColor: theme.labelBackground }]}>
                <Text style={[styles.moreAttendeesText, { color: theme.textColor }]}>+4</Text>
              </View>
            </View>
          </View>

          {/* Comments */}
          <View style={styles.commentsSection}>
            {[1, 2].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.commentCard,
                  {
                    backgroundColor: theme.commentBackground,
                    borderColor: theme.commentBorder,
                    borderWidth: isDarkMode ? 0 : 1,
                  },
                ]}
              >
                <View style={styles.commentHeader}>
                  <View style={[styles.avatar, { backgroundColor: theme.avatarBackground }]}>
                    <Text style={styles.avatarText}>👤</Text>
                  </View>
                  <Text style={[styles.commentUsername, { color: theme.textColor }]}>
                    Username{index + 1}
                  </Text>
                </View>
                <Text style={[styles.commentText, { color: theme.textColor }]}>[comment]</Text>
              </View>
            ))}
          </View>

          {/* Post Comment */}
          <View style={styles.postCommentSection}>
            <TextInput
              style={[
                styles.postCommentInput,
                {
                  backgroundColor: theme.commentBackground,
                  borderColor: theme.commentBorder,
                  borderWidth: isDarkMode ? 0 : 1,
                  color: theme.textColor,
                },
              ]}
              value={comment}
              onChangeText={setComment}
              placeholder="Add a comment..."
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
              multiline
              returnKeyType="default"
              onSubmitEditing={handlePostComment}
              blurOnSubmit={false}
              ref={commentInputRef}
              textAlignVertical="top"
              scrollEnabled={false}
            />
            
            {/* Post Button */}
            <TouchableOpacity
              style={[styles.postButton, { backgroundColor: theme.rsvpActiveBackground }]}
              onPress={handlePostComment}
            >
              <Text style={[styles.postButtonText, { color: theme.rsvpActiveText }]}>
                Post
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
    paddingBottom: 120, // Increased bottom padding for keyboard space
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    marginRight: 8,
  },
  settingsIcon: {
    fontSize: 20,
  },
  themeToggle: {
    padding: 4,
  },
  eventInfo: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'stretch', 
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 16
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  locationText: {
    fontSize: 16,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  labelIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rsvpSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rsvpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  rsvpRight: {
    alignItems: 'flex-end',
  },
  rsvpRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeCount: {
    fontSize: 14,
    marginRight: 8,
  },
  rsvpButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  attendeesContainer: {
    marginBottom: 20,
  },
  attendeeAvatars: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  attendeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: -8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAttendees: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: -8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAttendeesText: {
    fontSize: 12,
    fontWeight: '600',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
  },
  commentsSection: {
    marginBottom: 12,
  },
  commentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  postCommentSection: {
    marginBottom: 20, // Reduced bottom margin
  },
  postCommentInput: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 14,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  postButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

const lightTheme = {
  backgroundColor: '#f5f5f5',
  headerBackground: '#e8d7f0',
  textColor: '#000000',
  labelBackground: '#ffffff',
  rsvpBackground: '#ffffff',
  rsvpText: '#000000',
  rsvpActiveBackground: '#007AFF',
  rsvpActiveText: '#ffffff',
  commentBackground: '#ffffff',
  avatarBackground: '#cccccc',
  commentBorder: '#e0e0e0',
};

const darkTheme = {
  backgroundColor: '#1a1a1a',
  headerBackground: '#1e3a8a',
  textColor: '#ffffff',
  labelBackground: '#2d3748',
  rsvpBackground: '#2d3748',
  rsvpText: '#ffffff',
  rsvpActiveBackground: '#007AFF',
  rsvpActiveText: '#ffffff',
  commentBackground: '#2d3748',
  avatarBackground: '#4a5568',
  commentBorder: 'transparent',
};

export default EventViewScreen;