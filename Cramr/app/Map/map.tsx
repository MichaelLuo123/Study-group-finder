import { PublicStudySessionFactory } from '@/Logic/PublicStudySessionFactory';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation, useRouter } from 'expo-router';
import haversine from 'haversine';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { IconButton, TextInput, useTheme } from 'react-native-paper';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../contexts/UserContext';
import EventList from '../listView/eventList';
import FilterModal, { Filters } from '../listView/filter';

const { height: screenHeight } = Dimensions.get('window');
const BOTTOM_SHEET_MIN_HEIGHT = 120; 
const HEADER_HEIGHT = 100; 
const NAVBAR_HEIGHT = 80; 
const BOTTOM_SHEET_MAX_HEIGHT = screenHeight - HEADER_HEIGHT - NAVBAR_HEIGHT; 

// Custom star marker component
const StarMarker = ({ color, remainingCapacity }: { color: string, remainingCapacity: number }) => {
  return (
    <View style={styles.starContainer}>
      <Image 
        source={require('../../assets/images/Star.png')} 
        style={[styles.starImage, { tintColor: color === 'transparent' ? 'white' : color }]}
      />
      <View style={styles.textContainer}>
        <Text style={styles.starText}>{remainingCapacity}</Text>
      </View>
    </View>
  );
};

export default function MapScreen() {
  // Colors
  const {isDarkMode, toggleDarkMode} = useUser();
  const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background)
  const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text)
  const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput)
  const placeholderTextColor = (!isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText)
  const bannerColors = ['#AACC96', '#F4BEAE', '#52A5CE', '#FF7BAC', '#D3B6D3']

  const theme = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('map');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const translateY = useSharedValue(-100);

  // Map Filter
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<Filters | null>(null);
  const handleSaveFilters = (filterData: Filters) => {
    setFilters(filterData);
    setShowFilter(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: backgroundColor,
        height: Platform.OS === 'ios' ? 100 : 80,
      },
      headerTitleStyle: {
        width: '100%',
      },
      headerTitle: () => null,
      headerLeft: () => (
        <View style={styles.fullWidthHeader}>
          <TouchableOpacity 
            style={styles.logo}
            onPress={() => router.push('/(tabs)')}
          >
            <Image
              source={require('../listView/assets/images/finalCramrLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      ),
      headerTitleContainerStyle: {
        left: 0,
        right: 0,
      },
    });
  }, [navigation, backgroundColor]);

  const handleNavigation = (page: string) => {
    if (currentPage !== page) {
      setCurrentPage(page);
      if (page === 'listView') {
        router.push('/listView');
      }
      if (page === 'addEvent') {
        router.push('/CreateEvent/createevent');
      } 
      if (page === 'bookmarks') {
        router.push('/Saved/Saved');
      } 
      if (page === 'profile') {
        router.push('/Profile/Internal');
      }
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startY = translateY.value;
    },
    onActive: (event, context: any) => {
      const newTranslateY = context.startY + event.translationY;
      const maxUpward = -(BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT - HEADER_HEIGHT - 50); 
      const maxDownward = 200; 
      translateY.value = Math.max(maxUpward, Math.min(maxDownward, newTranslateY));
    },
    onEnd: (event) => {
      const topPosition = -(BOTTOM_SHEET_MAX_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT - HEADER_HEIGHT - 50);
      const middlePosition = -100;
      const bottomPosition = 200; 
      const currentPosition = translateY.value;
      let currentState;
      if (currentPosition < topPosition / 2) {
        currentState = 'top';
      } else if (currentPosition < (middlePosition + bottomPosition) / 2) {
        currentState = 'middle';
      } else {
        currentState = 'bottom';
      }
      
      let targetState = currentState;
      if (event.velocityY < -300) {
        if (currentState === 'bottom') targetState = 'middle';
        else if (currentState === 'middle') targetState = 'top';
      } else if (event.velocityY > 300) {
        if (currentState === 'top') targetState = 'middle';
        else if (currentState === 'middle') targetState = 'bottom';
      }
      
      if (targetState === 'top') {
        translateY.value = withSpring(topPosition);
      } else if (targetState === 'middle') {
        translateY.value = withSpring(middlePosition);
      } else {
        translateY.value = withSpring(bottomPosition);
      }
    },
  });

  const bottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if(status != 'granted'){
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
    
    getCurrentLocation();
  }, []);


  // calculating distance
  const calculateDistance = (userLocation: any, eventCoordinates: any, unit: 'km' | 'mi' = 'km') => {
  if (!userLocation || !eventCoordinates?.lat || !eventCoordinates?.lng) return 0;
  
  const distance = haversine(
    { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
    { latitude: eventCoordinates.lat, longitude: eventCoordinates.lng },
    { unit: unit } // 'km' or 'mile'
  );
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
};

const [eventDistances, setEventDistances] = useState<{ [eventId: string]: number }>({});

// Update your useEffect to build the distance dictionary:
useEffect(() => {
  const fetchEvents = async () => {
    try {
      const factory = new PublicStudySessionFactory();
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();

      const eventsWithCoordinates = [];
      const distanceMap: { [eventId: string]: number } = {};

      for (const event of data) {
        const studySession = factory.createStudySession(event.location, event.date_and_time, event.title);
        const coords = await studySession.addressToCoordinates();
        
        // Calculate distance
        const distance = location ? calculateDistance(location, coords.geometry.location, 'km') : 0;
        
        // Store in distance map
        distanceMap[event.id] = distance;
        
        const processedEvent = {
          ...event,
          coordinates: coords.geometry.location,
          remainingCapacity: event.capacity - (event.accepted_count || 0),
          bannerColor: event.banner_color || 'transparent'
        };
        
        eventsWithCoordinates.push(processedEvent);
      }

      setEvents(eventsWithCoordinates);
      setEventDistances(distanceMap); // Set the distance dictionary
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  if (location) {
    fetchEvents();
  }
}, [location]);

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor}]}>  
      {/* Full Screen Map Background */}
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map}
          provider={PROVIDER_GOOGLE} 
          showsUserLocation={true}
          initialRegion={location ? {
            latitude: location.coords.latitude - .025,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          } : undefined}
        >
          {events.map((event, index) => {
            // Check if coordinates are valid
            if (!event.coordinates?.lat || !event.coordinates?.lng) {
              console.log('Invalid coordinates for event:', event);
              return null;
            }
            
            console.log('Rendering marker for event:', event.id, 'at', event.coordinates);
            return (
              <Marker
                key={event.id}
                coordinate={{
                  latitude: event.coordinates.lat,
                  longitude: event.coordinates.lng
                }}
                onPress={() => setSelectedEventId(event.id)}
                zIndex={index + 1}
              >
                <StarMarker 
                  color={event.bannerColor}
                  remainingCapacity={event.remainingCapacity}
                />
              </Marker>
            );
          })}
        </MapView>
      </View>

      {/* Draggable Bottom Sheet */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.bottomSheet, bottomSheetStyle, {backgroundColor: backgroundColor}]}>
          {/* Drag Handle */}
          <View style={[styles.dragHandle]} />
          
          {/* Search Bar + Filter */}
          <View style={[styles.searchRow]}>
            <View style={[styles.searchInputContainer, {backgroundColor: textInputColor}]}>
              <TextInput
                mode="flat"
                placeholder="Search"
                style={styles.searchInput}
                left={<TextInput.Icon icon="magnify" color={textColor}/>}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={textColor}
                placeholderTextColor={placeholderTextColor}
              />
            </View>
            <IconButton
              icon="filter"
              size={28}
              onPress={() => setShowFilter(true)}
              style={[styles.filterButton, {backgroundColor: textInputColor}]}
              iconColor={textColor}
            />
          </View>

          {/* Filter Modal */}
          <FilterModal
            visible={showFilter}
            onClose={() => setShowFilter(false)}
            onSave={handleSaveFilters}
          />

          {/* Event List - Only visible when expanded */}
          <View style={styles.eventListContainer}>
            <EventList 
              filters={filters}
              selectedEventId={selectedEventId}
              isDistanceVisible={true}
              eventDistances={eventDistances}
            />
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Bottom Navigation Icons - Fixed at bottom */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  starContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starImage: {
    width: 35,
    height: 35,
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  starText: {
    color: 'black',
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: '100%'
  },
  container: {
    flex: 1,
  },
  logo: {
    height: 120,
    width: 120,
    marginTop: -18
  },
  fullWidthHeader: {
    width: '100%',
    flexDirection: 'row',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    textAlign: 'center',
    color: '#888',
    fontSize: 18,
  },
  bottomSheet: {
    position: 'absolute',
    top: HEADER_HEIGHT + (screenHeight - HEADER_HEIGHT - NAVBAR_HEIGHT) / 2, 
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_MAX_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000, 
    paddingHorizontal: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#999',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    borderRadius: 10,
    marginRight: 5,
    justifyContent: 'center',
  },
  searchInput: {
    fontFamily: 'Poppins-Regular',
    backgroundColor: 'transparent',
    height: 44,
    fontSize: 16,
  },
  filterButton: {
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventListContainer: {
    flex: 1,
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