import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

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
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
       <ThemedView style={{ marginVertical: 20, gap: 10 }}>
        <Button title="Go to Signup Fail" onPress={() => router.push('/signupfail')} />
        <Button title="Go to Signup Success" onPress={() => router.push('/SignUp/signupsuccess')} />
        <Button title="Go to View Event Page" onPress={() => router.push('/ViewEvent/viewevent')} />
        <Button title="Go to Signup Page" onPress={() => router.push('/SignUp/signupscreen')} />
        <Button title="Go to Create Event" onPress={() => router.push('/CreateEvent/createevent')} />
        <Button title="Go to Settings Page" onPress={() => router.push('/Settings/SettingsFrontPage')} />
        <Button title="Go to Login Page" onPress={() => router.push('/Login/Loginscreen')} />
        <Button title="Go to 2fa Page" onPress={() => router.push('/TwoFactor/TwoFAPage')} />
        <Button title="Go to Map Page" onPress={() => router.push('/Map/map')} />
        <Button title="Go to Profile Page (Internal)" onPress={() => router.push('/Profile/Internal')} />
        <Button title="Go to Profile Page (External)" onPress={() => router.push('/Profile/External')} />
        <Button title="Go to Saved/RSVP Events" onPress={() => router.push('/Saved/Saved')} />
        <Button title="Go to Follow Page" onPress={() => router.push('/Follow/follow')} />
        <Button title="Go to eventList Page" onPress={() => router.push('/listView/eventList')} />
        <Button title="Go to List View" onPress={() => router.push('/listView')} />
      </ThemedView>
    </ParallaxScrollView>
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