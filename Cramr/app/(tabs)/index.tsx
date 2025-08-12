import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background);
  const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text);
  const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput);

  const navigationItems = [
    { title: 'Sign in', route: '/Login/Loginscreen' },
    { title: 'Sign up', route: '/SignUp/signupscreen' },
    { title: 'Sign up success*', route: '/SignUp/signupsuccess' },
    { title: 'Sign up fail*', route: '/signupfail' },
    { title: '2-Factor Authentication', route: '/Login/2fapage' },

    { title: 'Home/List*', route: '/listView' },
    { title: 'Event List Page*', route: '/listView/eventList' },
    { title: 'Map*', route: '/Map/map' },
    { title: 'View event*', route: '/ViewEvent/viewevent' },
    { title: 'Create event', route: '/CreateEvent/createevent' },

    { title: 'Saved/RSVP Events', route: '/Saved/Saved' },
    
    { title: 'Profile Page (Internal)', route: '/Profile/Internal' },
    { title: 'Settings', route: '/Settings/SettingsFrontPage' },
    { title: 'Profile Page (External)', route: '/Profile/External' },
    { title: 'Follow Page*', route: '/Follow/follow' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>

      <View style={styles.linksContainer}>
        {navigationItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.linkItem, { backgroundColor: textInputColor }]}
            onPress={() => router.push(item.route)}
          >
            <Text style={[styles.linkText, { color: textColor }]}>
              {item.title}
            </Text>
            <ArrowRight size={20} color={textColor} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    height: 1000
  },
  subtitleText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    opacity: 0.7,
  },
  linksContainer: {
    gap: 12,
    paddingBottom: 40,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    
    // Shadow for Android
    elevation: 2,
    // Shadow for iOS
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  linkText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
});