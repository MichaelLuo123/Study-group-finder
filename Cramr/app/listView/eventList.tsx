import { PublicStudySessionFactory } from '@/Logic/PublicStudySessionFactory';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
export default function EventList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedEvents, setCollapsedEvents] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  type eventFilter = "distance" | "alphabetical" | "subject" | "time";

  useEffect(() => {
    fetchEvents();
    //replica of the getCurrentLocation function in mapView. If we can import a specific function to reduce redundancy, that would be great.
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if(status != 'granted'){
        setErrorMsg('Permssion to access location was denied');
        return;
      }
    
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
        
    getCurrentLocation();
  }, []);

    const fetchEvents = async () => {
    try {
      const factory = new PublicStudySessionFactory();

      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      
      console.log('Events data:', data); // Debug log to see the actual data
       
      // sort the JSON data here (I'm gonna sort by name as a test)

      const eventsWithCoordinates = await Promise.all(data.map(async (event) => {
        const studySession = factory.createStudySession(event.location, event.date_and_time, event.title);
        const coords = await studySession.addressToCoordinates();
        return {
          ...event,
          coordinates: coords.geometry.location
        }
      }));

      const sortedData = eventsWithCoordinates.sort((a, b) => {
        const aDistance = compareDistanceFromLocation(a.coordinates.lat, a.coordinates.lng);
        const bDistance = compareDistanceFromLocation(b.coordinates.lat, b.coordinates.lng);
        return bDistance - aDistance; 
      })

      // Sort aphabetically
      // const sortedData = [...data].sort((a, b) => {
      //   const locA = a.title?.toLowerCase() || '';
      //   const locB = b.title?.toLowerCase() || '';
      //   return locA.localeCompare(locB);
      // });

      setEvents(sortedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const compareDistanceFromLocation = (lat:number, long:number) => {
    let latDistance = (location?.coords.latitude || 0) - lat;
    let longDistance = (location?.coords.longitude || 0) - long;
    return Math.sqrt(latDistance ** 2 + longDistance ** 2);
  }

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
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
      style={{ flex: 1 }}
      bounces={true}
      alwaysBounceVertical={false}
      scrollEnabled={true}
    >
             {events.map((event: any) => {
         const isCollapsed = collapsedEvents.has(event.id);
         
         // Debug log for each event being rendered
         console.log('Rendering event:', {
           id: event.id,
           title: event.title,
           creator_id: event.creator_id,
           creator_name: event.creator_name,
           creator_profile_picture: event.creator_profile_picture,
           hasProfilePicture: !!event.creator_profile_picture
         });
        
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

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.count}>
                    {event.accepted_count || 0}/{event.capacity || '∞'} 👥
                  </Text>
                  <Pressable style={styles.rsvpButton}>
                    <Text style={{ color: 'white' }}>RSVP</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        );
      })}
      
      {/* Extra space that scales with number of events */}
      <View style={[styles.extraSpace, { height: Math.max(events.length * 75 + 160, 300) }]} />
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
  extraSpace: {
    
  },
});