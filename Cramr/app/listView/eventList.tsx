import { PublicStudySessionFactory } from '@/Logic/PublicStudySessionFactory';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Filters } from './filter';


export default function EventList({ filters, selectedEventId }: { filters: Filters | null, selectedEventId?: string | null }) {


  const userId = '2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5';

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedEvents, setCollapsedEvents] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());

  const fetchEvents = async () => {
    try {
      console.log('Fetching events from backend...');
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events`);
      console.log('Events fetch response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      console.log('Raw events data:', data);

      const factory = new PublicStudySessionFactory();

      const eventsWithDetails = await Promise.all(
        data.map(async (event: any) => {
          console.log(`Processing event ${event.id}:`, {
            title: event.title,
            accepted_count: event.accepted_count,
            accepted_ids: event.accepted_ids,
            type: typeof event.accepted_count
          });
          
          const studySession = factory.createStudySession(event.location, event.date_and_time, event.title);
          const coords = await studySession.addressToCoordinates();

          let isRSVPed = false;
          let isSaved = false;
          
          try {
            const rsvpRes = await fetch(
              `${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${event.id}/rsvpd?user_id=${userId}`
            );
            console.log(`RSVP status fetch for event ${event.id} status:`, rsvpRes.status);
            if (rsvpRes.ok) {
              const rsvpData = await rsvpRes.json();
              isRSVPed = Boolean(rsvpData.rsvp && rsvpData.rsvp.status === 'accepted');
            }
          } catch (e) {
            console.warn('Failed to fetch RSVP status:', e);
            isRSVPed = false;
          }

          try {
            const savedRes = await fetch(
              `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${event.id}`
            );
            if (savedRes.ok) {
              const savedData = await savedRes.json();
              isSaved = Boolean(savedData.is_saved);
            }
          } catch (e) {
            console.warn('Failed to fetch saved status:', e);
            isSaved = false;
          }

          const finalEvent = {
            ...event,
            coordinates: coords.geometry.location,
            isRSVPed,
            isSaved,
          };
          
          console.log(`Final event ${event.id} data:`, {
            title: finalEvent.title,
            accepted_count: finalEvent.accepted_count,
            accepted_ids: finalEvent.accepted_ids,
            isRSVPed: finalEvent.isRSVPed,
            isSaved: finalEvent.isSaved
          });
          
          return finalEvent;
        })
      );

      // Sort events by distance ascending (closest first)
      const sortedData = eventsWithDetails.sort((a: any, b: any) => {
        const aDistance = compareDistanceFromLocation(a.coordinates.lat, a.coordinates.lng);
        const bDistance = compareDistanceFromLocation(b.coordinates.lat, b.coordinates.lng);
        return aDistance - bDistance;
      });

      setEvents(sortedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
      console.log('Finished fetching events');
    }
  };

  useEffect(() => {
    fetchEvents();

    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
    getCurrentLocation();
  }, []);

  

  // ADDED: Function to RSVP/un-RSVP
  const toggleRSVP = async (eventId: string, currentStatus: boolean) => {
    if (busyEventId) return; // Prevent multiple requests at once
    setBusyEventId(eventId);

    try {
      if (currentStatus) {
        console.log(`Cancelling RSVP for event ${eventId}...`);
        const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });
        console.log('Cancel RSVP response status:', res.status);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to cancel RSVP: ${txt}`);
        }
        
        // Update local state immediately for instant feedback
        setEvents(prevEvents => {
          const currentEvent = prevEvents.find(e => e.id === eventId);
          const newCount = Math.max(0, (currentEvent?.accepted_count || 0) - 1);
          console.log(`Updating local state: RSVP cancelled, count from ${currentEvent?.accepted_count} to ${newCount}`);
          
          return prevEvents.map(event => 
            event.id === eventId 
              ? { 
                  ...event, 
                  isRSVPed: false,
                  accepted_count: newCount
                }
              : event
          );
        });
        
        Alert.alert('RSVP Cancelled', 'You have been removed from the attendance list.');
        
        // Small delay before database refresh to allow local state to be visible
        setTimeout(async () => {
          console.log('Refreshing from database...');
          await fetchEvents();
        }, 100);
      } else {
        console.log(`RSVPing for event ${eventId}...`);
        const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, status: 'accepted' }),
        });
        console.log('RSVP response status:', res.status);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to RSVP: ${txt}`);
        }
        
        // Update local state immediately for instant feedback
        setEvents(prevEvents => {
          const currentEvent = prevEvents.find(e => e.id === eventId);
          const newCount = (currentEvent?.accepted_count || 0) + 1;
          console.log(`Updating local state: RSVP accepted, count from ${currentEvent?.accepted_count} to ${newCount}`);
          
          return prevEvents.map(event => 
            event.id === eventId 
              ? { 
                  ...event, 
                  isRSVPed: true,
                  accepted_count: newCount
                }
              : event
          );
        });
        
        Alert.alert('RSVP Successful', 'You are now attending this event.');
        
        // Small delay before database refresh to allow local state to be visible
        setTimeout(async () => {
          console.log('Refreshing from database...');
          await fetchEvents();
        }, 100);
      }
    } catch (err) {
      console.error('RSVP toggle error:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setBusyEventId(null);
    }
  };

  // ADDED: Function to save/unsave events
  const toggleSave = async (eventId: string, currentStatus: boolean) => {
    if (busyEventId) return; // Prevent multiple requests at once
    setBusyEventId(eventId);

    try {
      if (currentStatus) {
        console.log(`Unsaving event ${eventId}...`);
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${eventId}`,
          { method: 'DELETE' }
        );
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to unsave event: ${txt}`);
        }
        
        // Update local state immediately for instant feedback
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId 
              ? { ...event, isSaved: false }
              : event
          )
        );
        
        Alert.alert('Event Unsaved', 'Event has been removed from your saved events.');
        
        // Small delay before database refresh to allow local state to be visible
        setTimeout(async () => {
          console.log('Refreshing from database...');
          await fetchEvents();
        }, 100);
      } else {
        console.log(`Saving event ${eventId}...`);
        const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: eventId }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to save event: ${txt}`);
        }
        
        // Update local state immediately for instant feedback
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId 
              ? { ...event, isSaved: true }
              : event
          )
        );
        
        Alert.alert('Event Saved', 'Event has been added to your saved events.');
        
        // Small delay before database refresh to allow local state to be visible
        setTimeout(async () => {
          console.log('Refreshing from database...');
          await fetchEvents();
        }, 100);
      }
    } catch (err) {
      console.error('Save toggle error:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setBusyEventId(null);
    }
  };
  
  

  const compareDistanceFromLocation = (lat: number, long: number) => {
    let latDistance = (location?.coords.latitude || 0) - lat;
    let longDistance = (location?.coords.longitude || 0) - long;
    return Math.sqrt(latDistance ** 2 + longDistance ** 2);
  };

  const toggleEvent = (eventId: string) => {
    setCollapsedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // ----------- FILTERING LOGIC -----------
  const filteredEvents = events.filter((event: any) => {
    if (!filters) return true;
    // Filter by attendees (event.accepted_count)
    if (filters.attendees && event.accepted_count > filters.attendees) return false;
    // Filter by noise (tags)
    if (filters.noise && !(event.tags && event.tags.includes(filters.noise))) return false;
    // Filter by location type (tags)
    if (filters.location && !(event.tags && event.tags.includes(filters.location))) return false;
    // You could filter by distance as well (uncomment if needed)
    // if (filters.distance && compareDistanceFromLocation(event.coordinates.lat, event.coordinates.lng) > filters.distance) return false;
    return true;
  });

  // Update collapsed events when selectedEventId changes
  useEffect(() => {
    if (selectedEventId) {
      setCollapsedEvents(new Set(
        events
          .map(event => event.id)
          .filter(id => id !== selectedEventId)
      ));
    }
  }, [selectedEventId, events]);

  // Scroll to selected event when selectedEventId changes
  useEffect(() => {
    if (selectedEventId && filteredEvents.length > 0) {
      const eventIndex = filteredEvents.findIndex(event => event.id === selectedEventId);
      if (eventIndex !== -1) {
        
        setTimeout(() => {
          let scrollPosition = 0;
          for (let i = 0; i < eventIndex; i++) {
            const event = filteredEvents[i];
            const baseHeight = 80;
            if (!collapsedEvents.has(event.id)) {
              // Add height for expanded content (adjust these values based on your actual layout)
              scrollPosition += event.tags?.length ? 40 : 0;
              scrollPosition += 60; 
            }
            scrollPosition += baseHeight; // Add base height
            scrollPosition += 20; // Margin between events
          }
          
          scrollViewRef.current?.scrollTo({ 
            y: Math.max(0, scrollPosition - 30), 
            animated: true 
          });
        }, 100); 
      }
    }
  }, [selectedEventId, filteredEvents, collapsedEvents]);

  // ----------- RENDER LOGIC -----------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5CAEF1" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchEvents}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView 
      ref={scrollViewRef}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
      style={{ flex: 1 }}
      bounces={true}
      alwaysBounceVertical={false}
      scrollEnabled={true}
    >
      {filteredEvents.map((event: any) => {
        const isCollapsed = collapsedEvents.has(event.id);

        return (
          <View key={event.id} style={styles.card}>
            {/* Title Header - Clickable */}
            <Pressable 
              style={[styles.header, { backgroundColor: '#f0f0f0' }]}
              onPress={() => toggleEvent(event.id)}
            >
              <View style={styles.headerLeft}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{event.title}</Text>
                  <Text style={styles.creatorName}>
                    by {event.creator_name || 'Unknown User'}
                  </Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                {/* Creator Profile Picture */}
                {event.creator_profile_picture && (
                  <Image 
                    source={{ uri: event.creator_profile_picture }} 
                    style={styles.profilePicture}
                  />
                )}
                <Text style={styles.collapseIcon}>{isCollapsed ? '▼' : '▲'}</Text>
              </View>
            </Pressable>

            {/* Collapsible Content */}
            {!isCollapsed && (
              <>
                {/* Labels */}
                {event.tags && event.tags.length > 0 && (
                  <View style={styles.labels}>
                    {event.tags.map((tag: string, index: number) => (
                      <Text key={index} style={styles.label}>
                        {tag}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Details */}
                {event.class && (
                  <View style={styles.detailRow}>
                    <Text style={styles.icon}>📘</Text>
                    <Text style={styles.detail}>{event.class}</Text>
                  </View>
                )}
                {event.location && (
                  <View style={styles.detailRow}>
                    <Text style={styles.icon}>📍</Text>
                    <Text style={styles.detail}>{event.location}</Text>
                  </View>
                )}
                {event.date_and_time && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.icon}>📅</Text>
                      <Text style={styles.detail}>{new Date(event.date_and_time).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.icon}>🕒</Text>
                      <Text style={styles.detail}>{new Date(event.date_and_time).toLocaleTimeString()}</Text>
                    </View>
                  </>
                )}

                {/* Debug logging for count display */}
                {(() => {
                  console.log(`Rendering event ${event.id} footer:`, {
                    title: event.title,
                    accepted_count: event.accepted_count,
                    accepted_ids: event.accepted_ids,
                    display_count: event.accepted_count || 0
                  });
                  return null;
                })()}

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.count}>
                    {event.accepted_count || 0}/{event.capacity || '∞'} 👥
                  </Text>
                  <View style={styles.buttonContainer}>
                    <Pressable
                      style={styles.saveButton}
                      onPress={() => toggleSave(event.id, event.isSaved)}
                      disabled={busyEventId === event.id}
                    >
                      <Ionicons 
                        name={event.isSaved ? "bookmark" : "bookmark-outline"} 
                        size={20} 
                        color={event.isSaved ? "#000000" : "#666666"} 
                      />
                    </Pressable>
                    <Pressable
                      style={styles.rsvpButton}
                      onPress={() => toggleRSVP(event.id, event.isRSVPed)}
                      disabled={busyEventId === event.id}
                    >
                      <Text style={{ color: 'white' }}>
                        {event.isRSVPed ? 'Cancel RSVP' : 'RSVP'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </View>
        );
      })}
      {/* Extra space */}
      <View style={[styles.extraSpace, { height: Math.max(filteredEvents.length * 75 + 160, 300) }]} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#5CAEF1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    marginVertical: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  creatorName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  collapseIcon: {
    fontSize: 12,
    color: '#666',
  },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  label: {
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  icon: {
    marginRight: 6,
    fontSize: 14,
  },
  detail: {
    fontSize: 13,
  },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    fontSize: 13,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 22,
  },
  attendees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatars: {
    fontSize: 16,
    marginRight: 4,
  },
  extraCount: {
    fontSize: 12,
    color: '#666',
  },
  rsvpButton: {
    backgroundColor: '#5CAEF1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  extraSpace: {},
});