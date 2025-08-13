import { Colors } from '@/constants/Colors';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useUser(); 
  
  const backgroundColor = isDarkMode ? Colors.dark.background : Colors.light.background;
  const textColor = isDarkMode ? Colors.dark.text : Colors.light.text;
  const buttonBackgroundColor = isDarkMode ? Colors.dark.textInput : Colors.light.textInput;

  const navigationItems = [
    { title: 'Sign in', route: '/Login/Loginscreen' },
    { title: 'Sign up', route: '/SignUp/signupscreen' },
    { title: 'Sign up success', route: '/SignUp/signupsuccess' },
    { title: 'Sign up fail', route: '/signupfail' },
    { title: '2-Factor Authentication', route: '/Login/2fapage' },
    { title: 'Home/List', route: '/listView' },
    { title: 'Event List Page', route: '/listView/eventList' },
    { title: 'Map', route: '/Map/map' },
    { title: 'View event', route: '/ViewEvent/viewevent' },
    { title: 'Create event', route: '/CreateEvent/createevent' },
    { title: 'Saved/RSVP Events', route: '/Saved/Saved' },
    { title: 'Profile Page (Internal)', route: '/Profile/Internal' },
    { title: 'Settings', route: '/Settings/SettingsFrontPage' },
    { title: 'Profile Page (External)', route: '/Profile/External' },
    { title: 'Follow Page', route: '/Follow/follow' },
  ];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>
          Navigation
        </Text>
      </View>
      
      {/* Navigation Buttons */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {navigationItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.button, { backgroundColor: buttonBackgroundColor }]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: textColor }]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  button: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
});