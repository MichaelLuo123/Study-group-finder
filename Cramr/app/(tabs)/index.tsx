import { useUser } from '@/contexts/UserContext';
import { Redirect, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const {user} = useUser();

  if(user != null){
    return <Redirect href="/Map/map" />;
  }
  
  return <Redirect href="/Login/Loginscreen" />; //maybe we have it so that if usercontext is true, login. Else go to login screen
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
