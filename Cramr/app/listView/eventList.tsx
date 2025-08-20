import EventCollapsible from '@/components/EventCollapsible';
import { PublicStudySessionFactory } from '@/Logic/PublicStudySessionFactory';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Colors } from '../../constants/Colors';

import { useUser } from '@/contexts/UserContext';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { Filters } from './filter';

interface EventListProps {
  filters?: Filters | null;
  selectedEventId?: string | null;
  searchQuery?: string;
  creatorUserId?: string; // New prop for filtering by creator
  isDistanceVisible?: boolean;
  eventDistances?: { [eventId: string]: number };
  onClearSelectedEvent?: () => void; // Callback to clear selected event
  onCenterMapOnEvent?: (eventId: string) => void; // Callback to center map on event
}

export default function EventList({ 
  filters, 
  selectedEventId, 
  searchQuery, 
  creatorUserId,
  onClearSelectedEvent,
  onCenterMapOnEvent,
  isDistanceVisible,
  eventDistances,
}: EventListProps) {
  // Colors
  const {isDarkMode, toggleDarkMode, user} = useUser();
  const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background)
  const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text)
  const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput)
  const bannerColors = ['#AACC96', '#F4BEAE', '#52A5CE', '#FF7BAC', '#D3B6D3']

  const userId = user?.id; // Use logged-in user's ID

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
      setLoading(true);
      setError(null);
      
      // 1. Fetch events from backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const eventsData = await response.json();
      
      // 2. Process each event with error handling
      const processedEvents = await Promise.all(
        eventsData.map(async (event: any) => {
          try {
            // Default coordinates (fallback to Carlsbad coordinates)
            let coordinates = { 
              lat: 33.1581, 
              lng: -117.3506,
              isAccurate: false 
            };
            
            // Try geocoding if location exists
            if (event.location) {
              try {
                const factory = new PublicStudySessionFactory();
                const geocodeResult = await factory.addressToCoordinates(event.location);
                
                if (geocodeResult?.geometry?.location) {
                  coordinates = {
                    lat: geocodeResult.geometry.location.lat,
                    lng: geocodeResult.geometry.location.lng,
                    isAccurate: true
                  };
                }
              } catch (geocodeError) {
                console.warn(`Geocoding failed for ${event.location}:`, geocodeError);
              }
            }
            
            // Check RSVP status
            let isRSVPed = false;
            try {
              const rsvpResponse = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${event.id}/rsvpd?user_id=${userId}`
              );
              
              if (rsvpResponse.ok) {
                const rsvpData = await rsvpResponse.json();
                isRSVPed = rsvpData.rsvp?.status === 'accepted';
              }
            } catch (rsvpError) {
              console.warn(`RSVP check failed for event ${event.id}:`, rsvpError);
            }
            
            // Check saved status
            let isSaved = false;
            try {
              const savedResponse = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${event.id}`
              );
              
              if (savedResponse.ok) {
                const savedData = await savedResponse.json();
                isSaved = savedData.is_saved;
              }
            } catch (savedError) {
              console.warn(`Saved check failed for event ${event.id}:`, savedError);
            }
            
            return {
              ...event,
              coordinates,
              isRSVPed,
              isSaved,
              geocodeError: !coordinates.isAccurate
            };
            
          } catch (eventProcessingError) {
            console.error(`Error processing event ${event.id}:`, eventProcessingError);
            return {
              ...event,
              coordinates: { lat: 0, lng: 0, isAccurate: false },
              isRSVPed: false,
              isSaved: false,
              geocodeError: true
            };
          }
        })
      );
      
      // 3. Sort events by distance
      const sortedEvents = processedEvents.sort((a, b) => {
        const aDistance = compareDistanceFromLocation(a.coordinates.lat, a.coordinates.lng);
        const bDistance = compareDistanceFromLocation(b.coordinates.lat, b.coordinates.lng);
        return aDistance - bDistance;
      });
      
      setEvents(sortedEvents);
      
    } catch (mainError) {
      console.error('Failed to fetch events:', mainError);
      setError(mainError instanceof Error ? mainError.message : 'Unknown error');
      setEvents([]); // Clear events on error
    } finally {
      setLoading(false);
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

  const toggleRSVP = async (eventId: string, currentStatus: boolean) => {
    if (busyEventId) return; 
    setBusyEventId(eventId);

    try {
      if (currentStatus) {
        const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to cancel RSVP: ${txt}`);
        }
        
        setEvents(prevEvents => {
          const currentEvent = prevEvents.find(e => e.id === eventId);
          const newCount = Math.max(0, (currentEvent?.accepted_count || 0) - 1);
          return prevEvents.map(event => 
            event.id === eventId 
              ? { ...event, isRSVPed: false, accepted_count: newCount }
              : event
          );
        });
      } else {
        const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvpd`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, status: 'accepted' }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to RSVP: ${txt}`);
        }
        
        setEvents(prevEvents => {
          const currentEvent = prevEvents.find(e => e.id === eventId);
          const newCount = (currentEvent?.accepted_count || 0) + 1;
          return prevEvents.map(event => 
            event.id === eventId 
              ? { ...event, isRSVPed: true, accepted_count: newCount }
              : event
          );
        });
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setBusyEventId(null);
    }
  };

  const toggleSave = async (eventId: string, currentStatus: boolean) => {
    if (busyEventId) return; 
    setBusyEventId(eventId);

    try {
      if (currentStatus) {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events/${eventId}`,
          { method: 'DELETE' }
        );
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to unsave event: ${txt}`);
        }
        
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId 
              ? { ...event, isSaved: false }
              : event
          )
        );
      } else {
        const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: eventId }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to save event: ${txt}`);
        }
        
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId 
              ? { ...event, isSaved: true }
              : event
          )
        );
      }
    } catch (err) {
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

  const handleEventToggle = (eventId: string) => {
    // Clear selectedEventId when user manually toggles events
    if (selectedEventId && onClearSelectedEvent) {
      onClearSelectedEvent();
    }
    
    setCollapsedEvents(prev => {
      const newSet = new Set(prev);
      
      // If this event is already collapsed, expand it
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        // Collapse this event
        newSet.add(eventId);
      }
      
      return newSet;
    });
  };

  // ----------- FILTERING LOGIC -----------
  const filteredEvents = events.filter((event: any) => {
    if (!filters) return true;
  
    // 1) Distance filter (max distance)
    /*if (filters.distance && event.coordinates?.lat != null && event.coordinates?.lng != null) {
      const d = distanceFromUser(event.coordinates.lat, event.coordinates.lng, filters.unit);
      if (d > filters.distance) return false;
    }*/
  
    // 2) Attendees filter (minimum attendees, matches UI "> X people")
    if (filters.attendees) {
      const count = event.accepted_count ?? event.rsvped_count ?? 0;
      if (count < filters.attendees) return false;
    }
  
    // 3) Noise level filter (tags)
    if (filters.noise) {
      const wanted = filters.noise.toLowerCase();
      const hasTag = Array.isArray(event.tags) && event.tags.some((t: string) => (t || '').toLowerCase() === wanted);
      if (!hasTag) return false;
    }
  
    // 4) Location type filter (tags)
    if (filters.location) {
      const wanted = filters.location.toLowerCase();
      const hasTag = Array.isArray(event.tags) && event.tags.some((t: string) => (t || '').toLowerCase() === wanted);
      if (!hasTag) return false;
    }
  
    return true;
  });

  // ----------- CREATOR FILTER -----------
  const creatorFilteredEvents = creatorUserId 
    ? filteredEvents.filter((event: any) => event.creator_id === creatorUserId)
    : filteredEvents;

  // ----------- SEARCH FILTER -----------
  const normalizedQuery = (searchQuery || '').trim().toLowerCase();
  const searchedEvents = normalizedQuery
    ? creatorFilteredEvents.filter((event: any) => {
        const creator = (event.creator_name || event.creator_id || '').toLowerCase();
        const locationText = (event.location || '').toLowerCase();
        const tagsText = Array.isArray(event.tags) ? event.tags.join(' ').toLowerCase() : '';
        return (
          creator.includes(normalizedQuery) ||
          locationText.includes(normalizedQuery) ||
          tagsText.includes(normalizedQuery)
        );
      })
    : creatorFilteredEvents;

  // Update collapsed events when selectedEventId changes
  useEffect(() => {
    if (selectedEventId) {
      setCollapsedEvents(new Set(
        events
          .map(event => event.id)
          .filter(id => id !== selectedEventId)
      ));
    }
  }, [selectedEventId]); // Remove 'events' dependency to prevent unnecessary re-runs

  // Scroll to selected event when selectedEventId changes
  useEffect(() => {
    if (selectedEventId && searchedEvents.length > 0) {
      const eventIndex = searchedEvents.findIndex(event => event.id === selectedEventId);
      if (eventIndex !== -1) {
        setTimeout(() => {
          let scrollPosition = 0;
          for (let i = 0; i < eventIndex; i++) {
            const event = searchedEvents[i];
            
            // Base height for event banner 
            let eventHeight = 60; 
            
            if (!collapsedEvents.has(event.id)) {
              eventHeight += 120; 
              if (event.tags?.length) {
                eventHeight += 30;
              }
            }
            
            scrollPosition += eventHeight;
          }
      
           scrollViewRef.current?.scrollTo({ 
             y: Math.max(0, scrollPosition - 60), 
             animated: true 
           });
        }, 100); 
      }
    }
  }, [selectedEventId, searchedEvents, collapsedEvents]);

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
    <>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        style={{ flex: 1 }}
        bounces={true}
      >
        {searchedEvents.map((event: any) => {
          const isCollapsed = collapsedEvents.has(event.id);

          return (
            // Updated condition: when creatorUserId is provided, show only creator's events
            // When creatorUserId is not provided, exclude the current user's events (original behavior)
            (creatorUserId ? event.creator_id === creatorUserId : event.creator_id !== userId) && (
              <EventCollapsible
                key={event.id}
                eventId={event.id}
                ownerId={event.creator_id}
                ownerProfile={event.creator_profile_picture}
                title={event.title}
                bannerColor={bannerColors[event.banner_color || 1]}
                tag1={event.tags?.[0] || null}
                tag2={event.tags?.[1] || null}
                tag3={event.tags?.[2] || null}
                subject={event.class || 'invalid'}
                location={event.location || 'invalid'}
                date={event.date}
                time={event.time}
                rsvpedCount={event.accepted_count || event.rsvped_count || 0}
                capacity={event.capacity || '∞'}
                isOwner={event.creator_id === userId}
                isSaved={event.isSaved}
                onSavedChange={() => toggleSave(event.id, event.isSaved)}
                isRsvped={event.isRSVPed}
                onRsvpedChange={() => toggleRSVP(event.id, event.isRSVPed)}
                isCollapsed={isCollapsed}
                                 onToggleCollapse={() => handleEventToggle(event.id)}
                 onCenterMapOnEvent={onCenterMapOnEvent}
                 isDistanceVisible={isDistanceVisible ? true : false}
                distanceUnit={filters?.unit || 'mi'}
                distance={isDistanceVisible && eventDistances ? eventDistances[event.id] : null}
                isDarkMode={isDarkMode}
                style={{marginBottom: 5}}
              />
            )
          );
        })}
        <View style={[styles.extraSpace, { height: Math.max(searchedEvents.length * 75 + 160, 300) }]} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
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