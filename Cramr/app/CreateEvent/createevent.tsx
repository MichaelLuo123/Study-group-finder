import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FriendsDropdown from '../../components/FriendsDropdown';

const CreateEventScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [classField, setClassField] = useState('');
  const [date, setDate] = useState(new Date());
  const [tags, setTags] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState('addEvent');
  const router = useRouter();

  // Date picker state
  const [dateInput, setDateInput] = useState(date.toLocaleDateString());
  const [timeInput, setTimeInput] = useState(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const handleSubmit = async () => {
    const eventData = {
      title,
      description,
      location,
      class: classField,
      date: date.toISOString(),
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      capacity: Number(capacity),
      invitePeople: selectedFriends,
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
        setTags('');
        setCapacity('');
        setSelectedFriends([]);
        setDate(new Date());
        setDateInput(new Date().toLocaleDateString());
        setTimeInput(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        // Navigate back to home after successful creation
        router.push('/(tabs)');
        return data;
      } else {
        Alert.alert('Error', data.error || 'Failed to create event');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleNavigation = (page: string) => {
    if (currentPage !== page) {
      setCurrentPage(page);
      if (page === 'listView') {
        router.push('/listView');
      } else if (page === 'map') {
        router.push('/Map/map');
      } else if (page === 'addEvent') {
        // Already on addEvent page, no navigation needed
      } else if (page === 'bookmarks') {
        // router.push('/bookmarks');
      } else if (page === 'profile') {
        router.push('/Settings/SettingsFrontPage');
      }
    }
  };

  const updateDateFromInputs = () => {
    try {
      const dateParts = dateInput.split('/');
      const timeParts = timeInput.split(':');
      
      if (dateParts.length === 3 && timeParts.length === 2) {
        const month = parseInt(dateParts[0]) - 1; // Month is 0-indexed
        const day = parseInt(dateParts[1]);
        const year = parseInt(dateParts[2]);
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        
        // Validate the inputs
        if (month >= 0 && month <= 11 && 
            day >= 1 && day <= 31 && 
            year >= 2024 && year <= 2030 &&
            hour >= 0 && hour <= 23 &&
            minute >= 0 && minute <= 59) {
          
          const newDate = new Date(year, month, day, hour, minute);
          
          // Check if the date is valid (handles edge cases like Feb 30)
          if (!isNaN(newDate.getTime()) && 
              newDate.getMonth() === month && 
              newDate.getDate() === day) {
            setDate(newDate);
          }
        }
      }
    } catch (error) {
      console.log('Invalid date/time format');
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={[styles.backText, { color: theme.textColor }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.textColor }]}>Create Event</Text>
            <TouchableOpacity onPress={toggleTheme} style={styles.profileButton}>
              <View style={[styles.profileIcon, { backgroundColor: theme.profileBackground }]}>
                <Ionicons 
                  name={isDarkMode ? "sunny" : "moon"} 
                  size={20} 
                  color={isDarkMode ? "#fff" : "#000"} 
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: theme.cardBackground }]}>
            <TextInput
              placeholder="Event Title"
              placeholderTextColor={theme.placeholderColor}
              value={title}
              onChangeText={setTitle}
              style={[styles.input, { color: theme.textColor, backgroundColor: theme.inputBackground }]}
            />
            <TextInput
              placeholder="Description"
              placeholderTextColor={theme.placeholderColor}
              value={description}
              onChangeText={setDescription}
              multiline
              style={[styles.input, styles.textArea, { color: theme.textColor, backgroundColor: theme.inputBackground }]}
            />
            <TextInput
              placeholder="Location"
              placeholderTextColor={theme.placeholderColor}
              value={location}
              onChangeText={setLocation}
              style={[styles.input, { color: theme.textColor, backgroundColor: theme.inputBackground }]}
            />
            <TextInput
              placeholder="Class"
              placeholderTextColor={theme.placeholderColor}
              value={classField}
              onChangeText={setClassField}
              style={[styles.input, { color: theme.textColor, backgroundColor: theme.inputBackground }]}
            />
            <TextInput
              placeholder="Tags (comma separated)"
              placeholderTextColor={theme.placeholderColor}
              value={tags}
              onChangeText={setTags}
              style={[styles.input, { color: theme.textColor, backgroundColor: theme.inputBackground }]}
            />
            <TextInput
              placeholder="Capacity"
              placeholderTextColor={theme.placeholderColor}
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
              style={[styles.input, { color: theme.textColor, backgroundColor: theme.inputBackground }]}
            />
            
            {/* Invite People Dropdown */}
             <FriendsDropdown
               selectedFriends={selectedFriends}
               onFriendsChange={setSelectedFriends}
               placeholder="Select friends to invite"
               theme={theme}
             />
            
            {/* Date/Time Inputs */}
            <View style={styles.dateTimeContainer}>
              <Text style={[styles.dateTimeLabel, { color: theme.textColor }]}>Date & Time</Text>
              
              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeInputContainer}>
                  <Text style={[styles.dateTimeInputLabel, { color: theme.textColor }]}>Date (MM/DD/YYYY)</Text>
                  <TextInput
                    placeholder="12/25/2024"
                    placeholderTextColor={theme.placeholderColor}
                    value={dateInput}
                    onChangeText={(text) => {
                      setDateInput(text);
                      updateDateFromInputs();
                    }}
                    style={[styles.input, styles.dateTimeInput, { color: theme.textColor, backgroundColor: theme.inputBackground }]}
                  />
                </View>
                
                <View style={styles.dateTimeInputContainer}>
                  <Text style={[styles.dateTimeInputLabel, { color: theme.textColor }]}>Time (HH:MM)</Text>
                  <TextInput
                    placeholder="14:30"
                    placeholderTextColor={theme.placeholderColor}
                    value={timeInput}
                    onChangeText={(text) => {
                      setTimeInput(text);
                      updateDateFromInputs();
                    }}
                    style={[styles.input, styles.dateTimeInput, { color: theme.textColor, backgroundColor: theme.inputBackground }]}
                  />
                </View>
              </View>
              
              <Text style={[styles.selectedDateTime, { color: theme.textColor }]}>
                Selected: {date.toLocaleString()}
              </Text>
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, { backgroundColor: theme.rsvpBackground }]}
            >
              <Text style={[styles.submitButtonText, { color: theme.rsvpText }]}>
                Create Event
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Bottom Navigation Bar - Same as Map */}
      <View style={[styles.bottomNav, { backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff', borderTopColor: isDarkMode ? '#4a5568' : '#e0e0e0' }]}> 
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

const pickerSelectStyles = (theme: any) => ({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: theme.textColor,
    backgroundColor: theme.inputBackground,
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: theme.textColor,
    backgroundColor: theme.inputBackground,
    paddingRight: 30,
  },
});

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
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
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
  formCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    marginBottom: 16,
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateTimeInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateTimeInputLabel: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  dateTimeInput: {
    textAlign: 'center',
  },
  selectedDateTime: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
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

const lightTheme = {
  backgroundColor: '#f8f9fa',
  cardBackground: '#ffffff',
  textColor: '#000000',
  inputBackground: '#ffffff',
  placeholderColor: '#999999',
  rsvpBackground: '#007AFF',
  rsvpText: '#ffffff',
  profileBackground: '#e8d5d5',
  navBackground: '#ffffff',
  navBorder: '#e0e0e0',
};

const darkTheme = {
  backgroundColor: '#1a1a1a',
  cardBackground: '#2d2d2d',
  textColor: '#ffffff',
  inputBackground: '#374151',
  placeholderColor: '#9ca3af',
  rsvpBackground: '#007AFF',
  rsvpText: '#ffffff',
  profileBackground: '#374151',
  navBackground: '#2d2d2d',
  navBorder: '#4a5568',
};

export default CreateEventScreen;