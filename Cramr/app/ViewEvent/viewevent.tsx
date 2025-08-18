import { useUser } from '@/contexts/UserContext';
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
}

const EventViewScreen = () => {
  const userId = '2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5';
  const { isDarkMode, toggleDarkMode } = useUser();
  const [comment, setComment] = useState('');
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const eventId = '3272c557-e2c8-451b-8114-e9b2d5269d0a';
  const commentInputRef = useRef<TextInput>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState('eventView');
  const [busy, setBusy] = useState(false);

  const handleNavigation = (page: string) => {
    if (currentPage !== page) {
      setCurrentPage(page);
      if (page === 'listView') router.push('/listView');
      if (page === 'profile') router.push('/Profile/Internal');
    }
  };

  const fetchEvent = async () => {
    if (!process.env.EXPO_PUBLIC_BACKEND_URL) {
      console.error('Backend URL not configured');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}`);
      const data = await res.json();
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (!process.env.EXPO_PUBLIC_BACKEND_URL) return;

    fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd?user_id=${userId}`)
      .then(res => res.json())
      .then(data => setIsRSVPed(Boolean(data.rsvp?.status === 'accepted')))
      .catch(console.error);

    fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${eventId}`)
      .then(res => res.json())
      .then(data => setIsSaved(Boolean(data.is_saved)))
      .catch(console.error);
  }, [eventId, userId]);

  const toggleRSVP = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (isRSVPed) {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });
        setIsRSVPed(false);
      } else {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, status: 'accepted' }),
        });
        setIsRSVPed(true);
      }
      await fetchEvent();
    } catch (err) {
      console.error('RSVP toggle error:', err);
    } finally {
      setBusy(false);
    }
  };

  const toggleSave = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (isSaved) {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${eventId}`, {
          method: 'DELETE',
        });
        setIsSaved(false);
      } else {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: eventId }),
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Save toggle error:', err);
    } finally {
      setBusy(false);
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
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Event Card */}
          <View style={[styles.eventCard, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.eventHeader, { backgroundColor: theme.eventHeaderBackground }]}>
              <Text style={[styles.eventTitle, { color: theme.textColor }]}>{event.title}</Text>
              <TouchableOpacity onPress={toggleDarkMode} style={styles.profileButton}>
                <Text style={styles.profileEmoji}>👤</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.eventDetails}>
              <Text style={[styles.detailText, { color: theme.textColor }]}>{event.location}</Text>
              <Text style={[styles.detailText, { color: theme.textColor }]}>
                {new Date(event.date_and_time).toLocaleString()}
              </Text>
            </View>

            {/* RSVP + Save */}
            <View style={styles.rsvpSection}>
              <TouchableOpacity
                onPress={toggleRSVP}
                style={[
                  styles.rsvpButton,
                  {
                    backgroundColor: isRSVPed ? theme.rsvpActiveBackground : theme.rsvpBackground,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rsvpButtonText,
                    { color: isRSVPed ? theme.rsvpActiveText : theme.rsvpText },
                  ]}
                >
                  {isRSVPed ? 'RSVPed!' : 'RSVP'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleSave} style={styles.saveButton}>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={theme.saveButtonText}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 80 },
  content: { paddingHorizontal: 16, paddingBottom: 20 },

  eventCard: {
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: { fontSize: 18, fontWeight: 'bold' },
  profileButton: { padding: 4 },
  profileEmoji: { fontSize: 18 },

  eventDetails: { marginBottom: 12 },
  detailText: { fontSize: 14, marginBottom: 6 },

  rsvpSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rsvpButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rsvpButtonText: { fontSize: 16, fontWeight: '600' },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const lightTheme = {
  backgroundColor: '#f8f9fa',
  cardBackground: '#ffffff',
  eventHeaderBackground: '#e8d5d5',
  textColor: '#000000',
  rsvpBackground: '#87CEEB', // sky blue
  rsvpText: '#ffffff',
  rsvpActiveBackground: '#E8E8E8',
  rsvpActiveText: '#000000',
  saveButtonText: '#000000',
};

const darkTheme = {
  backgroundColor: '#1a1a1a',
  cardBackground: '#2d2d2d',
  eventHeaderBackground: '#374151',
  textColor: '#ffffff',
  rsvpBackground: '#87CEEB',
  rsvpText: '#ffffff',
  rsvpActiveBackground: '#444',
  rsvpActiveText: '#ffffff',
  saveButtonText: '#ffffff',
};

export default EventViewScreen;