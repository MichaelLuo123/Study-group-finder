import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Button, Platform, StyleSheet } from 'react-native';


export default function HomeScreen() {
  const router = useRouter();
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
        <Button title="Go to 2fa Page" onPress={() => router.push('/Login/2fapage')} />
        <Button title="Go to Map Page" onPress={() => router.push('/Map/map')} />
        <Button title="Go to Profile Page (Internal)" onPress={() => router.push('/Profile/Internal')} />
        <Button title="Go to Profile Page (External)" onPress={() => router.push('/Profile/External')} />
        <Button title="Go to Saved/RSVP Events" onPress={() => router.push('/Saved/Saved')} />
        <Button title="Go to Follow Page" onPress={() => router.push('/Follow/follow')} />
        <Button title="Go to eventList Page" onPress={() => router.push('/listView/eventList')} />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  
});
