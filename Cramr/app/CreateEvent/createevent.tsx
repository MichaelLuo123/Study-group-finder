import Slider from '@/components/Slider';
import { useUser } from '@/contexts/UserContext';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FollowersDropdown from '../../components/FollowersDropdown';
import { Colors } from '../../constants/Colors';

const CreateEventScreen = () => {
  // Predefined study session tags
  const studyTags = [
    'Pomodoro',
    'Music',
    'Quiet',
    'Group Study',
    'Flash Cards',
    'Note Taking',
    'Reading',
    'Research',
    'Exam Prep',
    'Discussion',
    'Problem Sets',
    'Collaborative'
  ];

  // State for theme
  const {isDarkMode, toggleDarkMode} = useUser();
  
  // Consistent color usage from Colors.ts
  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.light.background;
  const textColor = isDarkMode ? Colors.dark.text : Colors.light.text;
  const textInputColor = isDarkMode ? Colors.dark.textInput : Colors.light.textInput;
  const placeholderColor = isDarkMode ? Colors.dark.placeholderText : Colors.light.placeholderText;

  // Other state variables
  const [isOnline, setIsOnline] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [studyRoom, setStudyRoom] = useState('');
  const [classField, setClassField] = useState('');
  const [date, setDate] = useState(new Date());
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Changed from tags string to selectedTags array
  const [capacity, setCapacity] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState('addEvent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user: loggedInUser } = useUser();

  // Theme object using consistent Colors.ts values
  const theme = {
    backgroundColor: backgroundColor,
    textColor: textColor,
    inputBackground: textInputColor,
    placeholderColor: placeholderColor,
    rsvpBackground: '#5CAEF1',
    rsvpText: '#ffffff',
    cardBackground: isDarkMode ? '#2d2d2d' : '#ffffff',
    navBackground: isDarkMode ? '#2d2d2d' : '#ffffff',
    navBorder: isDarkMode ? '#4a5568' : '#e0e0e0',
  };

  // Function to handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter an event description');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Error', 'Please enter an event location');
      return;
    }

    if (!classField.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }

    if (!capacity || isNaN(Number(capacity)) || Number(capacity) <= 0) {
      Alert.alert('Error', 'Please enter a valid capacity (must be a positive number)');
      return;
    }

    setIsSubmitting(true);

    // Check if user is logged in before creating event
    if (!loggedInUser?.id) {
      Alert.alert('Error', 'You must be logged in to create an event');
      return;
    }

    const eventData = {
      title,
      description,
      location,
      class: classField,
      date: date.toISOString(),
      tags: selectedTags, // Now using selectedTags array directly
      capacity: Number(capacity),
      invitePeople: selectedFriends,
      creator_id: loggedInUser.id,
    };
    console.log('Event Data:', eventData);
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          class: eventData.class,
          date: eventData.date,
          tags: eventData.tags,
          capacity: eventData.capacity,
          invitePeople: eventData.invitePeople,
          creator_id: eventData.creator_id,
        })
      });
  
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Event created!');
        // Clear form after successful creation
        setTitle('');
        setDescription('');
        setLocation('');
        setClassField('');
        setSelectedTags([]); // Clear selected tags
        setCapacity('');
        setSelectedFriends([]);
        setDate(new Date());
        // Navigate back to home after successful creation
        router.push('/(tabs)');
        return data;
      } else {
        Alert.alert('Error', data.error || 'Failed to create event');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigation = (page: string) => {
    if (currentPage !== page) {
      setCurrentPage(page);
      if (page === 'listView') {
        router.push('/listView');
      } else if (page === 'map') {
        router.push('/Map/map');
      } else if (page === 'addEvent') {

      } else if (page === 'bookmarks') {
        router.push('/Saved/Saved');
      } else       if (page === 'profile') {
        router.push('/Profile/Internal');
      }
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
      setDate(newDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { backgroundColor: backgroundColor }]}>
          {/* Header */}
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={require('../../assets/images/cramr_logo.png')} style={[styles.logoContainer]} />
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.headerText, { color: textColor, marginTop: 20, marginBottom: 20 }]}>Create Event</Text>
          </View>

          <Text style={[styles.subheaderText, { color: textColor, marginBottom: 5 }]}> Name </Text>
          <TextInput
            placeholder="Enter name of event."
            placeholderTextColor={placeholderColor}
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { color: textColor, backgroundColor: textInputColor }]}
          />

          <Text style={[styles.subheaderText, { color: textColor, marginBottom: 10 }]}> Tags </Text>
          <View style={styles.tagsContainer}>
            {studyTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  {
                    borderColor: selectedTags.includes(tag) ? textColor : 'transparent',
                    backgroundColor: textInputColor
                  }
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    {
                      color: textColor
                    }
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={[styles.subheaderText, { color: textColor, marginBottom: 5 }]}> Class </Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', width: 130}}>
            <TextInput
            placeholder="CSE"
            placeholderTextColor={placeholderColor}
            value={classField}
            onChangeText={setClassField}
            style={[styles.input, { color: textColor, backgroundColor: textInputColor, width: 75 }]}
            />
            <TextInput
            placeholder="100"
            placeholderTextColor={placeholderColor}
            value={classField}
            onChangeText={setClassField}
            style={[styles.input, { color: textColor, backgroundColor: textInputColor, width: 50 }]}
            />
          </View>

          <Text style={[styles.subheaderText, { color: textColor, marginBottom: 5 }]}> Capacity </Text>
          <View style={{ flexDirection: "row", justifyContent: 'space-between', alignItems: 'center', width: 100 }}>
            <TextInput
              placeholder="5"
              placeholderTextColor={placeholderColor}
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
              style={[styles.input, { color: textColor, backgroundColor: textInputColor, width: 50 }]}
            />
            <Text style={[styles.normalText, { color: textColor, marginLeft: 5, marginBottom: 13 }]}> people </Text>
          </View>

          <Text style={[styles.subheaderText, { color: textColor, marginBottom: 5 }]}> Location </Text>
          <Slider
            leftLabel='In-Person'
            rightLabel='Online  '
            onChangeSlider={setIsOnline}
            width={210}
            lightMode={!isDarkMode}
            style={{ marginBottom: 10 }}
          />
          {isOnline === false && (
            <>
              <TextInput
                placeholder="Enter address."
                placeholderTextColor={placeholderColor}
                value={location}
                onChangeText={setLocation}
                style={[styles.input, { color: textColor, backgroundColor: textInputColor }]}
              />
              <TextInput
                placeholder="Enter study room."
                placeholderTextColor={placeholderColor}
                value={studyRoom}
                onChangeText={setStudyRoom}
                style={[styles.input, { color: textColor, backgroundColor: textInputColor, width: 150 }]}
              />
            </>
          )}
          {isOnline === true && (
            <TextInput
              placeholder="Enter link to virtual study room."
              placeholderTextColor={placeholderColor}
              value={location}
              onChangeText={setLocation}
              style={[styles.input, { color: textColor, backgroundColor: textInputColor }]}
            />
          )}

          {/* Date/Time Picker */}
          <Text style={[styles.subheaderText, { color: textColor, marginBottom: 5 }]}> Date & Time </Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.dateTimeButton, { backgroundColor: textInputColor, borderWidth: 0 }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={textColor} />
              <Text style={[styles.normalText, { color: textColor }]}>
                {formatDate(date)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateTimeButton, { backgroundColor: textInputColor, borderWidth: 0 }]}
              onPress={() => {
                setShowTimePicker(true);
                setTimeout(() => {
                  // This timeout helps with timing issues
                }, 100);
              }}
            >
              <Ionicons name="time-outline" size={20} color={textColor} />
              <Text style={[styles.normalText, { color: textColor }]}>
                {formatTime(date)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Invite People Dropdown */}
          <Text style={[styles.subheaderText, { color: textColor, marginBottom: 5 }]}> People </Text>
          <FollowersDropdown
            selectedFriends={selectedFriends}
            onFriendsChange={setSelectedFriends}
            theme={theme}
            isDarkMode={isDarkMode}
          />

          <Text style={[styles.subheaderText, { color: textColor, marginBottom: 5 }]}> Description </Text>
          <TextInput
            placeholder="Enter description."
            placeholderTextColor={placeholderColor}
            value={description}
            onChangeText={setDescription}
            multiline
            style={[styles.input, styles.textArea, { color: textColor, backgroundColor: textInputColor }]}
          />
          
          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: '#5CAEF1' }]}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.subheaderText, { color: textColor}]}>
                  Creating...
                </Text>
              </View>
            ) : (
              <Text style={[styles.subheaderText, { color: textColor }]}>
                Create
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, { backgroundColor: theme.navBackground, borderTopColor: theme.navBorder }]}> 
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleNavigation('listView')}
        >
          <MaterialCommunityIcons 
            name="clipboard-list-outline" 
            size={24} 
            color={textColor} 
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
            color={textColor} 
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
            color={textColor} 
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
            color={textColor} 
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
            color={textColor} 
          />
          {currentPage === 'profile' && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Text
  headerText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  subheaderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  subheaderBoldText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  normalText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  normalBoldText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },

  container: {
    flex: 1,
  },
  logoContainer: {
    height: 27,
    width: 120,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, // Space for navbar
  },
  content: {
    padding: 20,
  },
  input: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  // New tag styles
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
  },
  submitButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#5CAEF1',
    alignItems: 'center',
    justifyContent: 'center',
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
    zIndex: 1001, 
  },
  navButton: {
    alignItems: 'center',
    padding: 8,
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

export default CreateEventScreen;