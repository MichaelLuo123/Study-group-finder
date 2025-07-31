import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { IconButton, TextInput, useTheme } from 'react-native-paper';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import EventList from '../listView/eventList';

const { height: screenHeight } = Dimensions.get('window');
const BOTTOM_SHEET_MIN_HEIGHT = 120; 
const HEADER_HEIGHT = 100; 
const NAVBAR_HEIGHT = 80; 
const BOTTOM_SHEET_MAX_HEIGHT = screenHeight - HEADER_HEIGHT - NAVBAR_HEIGHT; 

export default function MapScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('map');
  const translateY = useSharedValue(-100);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Image
          source={require('../listView/assets/images/finalCramrLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      ),
      headerTitle: '', 
    });
  }, [navigation]);

  const handleNavigation = (page: string) => {
    if (currentPage !== page) {
      setCurrentPage(page);
      if (page === 'listView') {
        router.push('/listView');
      } else if (page === 'map') {
        // Already on map page, no navigation needed
      } else if (page === 'addEvent') {
        // router.push('/addEvent');
      } else if (page === 'bookmarks') {
        // router.push('/bookmarks');
      } else if (page === 'profile') {
        // router.push('/profile');
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

  //currently unnecessary, but we might need it once we need geocoordinates to find study groups near us.
  useEffect(() => {
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

  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>  
      {/* Full Screen Map Background */}
      <View style={styles.mapContainer}>
        {/* <Text style={styles.mapPlaceholder}>{JSON.stringify(location)}</Text> */}
        <MapView style={styles.map} provider={PROVIDER_GOOGLE} showsUserLocation={true}/>
      </View>

      {/* Draggable Bottom Sheet */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.bottomSheet, bottomSheetStyle]}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />
          
          {/* Search Bar + Filter */}
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <TextInput
                mode="flat"
                placeholder="Search"
                style={styles.searchInput}
                left={<TextInput.Icon icon="magnify" />}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
              />
            </View>
            <IconButton
              icon="filter"
              size={28}
              onPress={() => {}}
              style={styles.filterButton}
              iconColor="#000"
            />
          </View>

          {/* Event List - Only visible when expanded */}
          <View style={styles.eventListContainer}>
            <EventList />
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
  map: {
    width: '100%',
    height: '100%'
  },
  container: {
    flex: 1,
  },
  logo: {
    height: 100,
    width: 100,
    marginLeft: 12,
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
    backgroundColor: 'white',
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: '#e5e5e5',
    borderRadius: 25,
    marginRight: 8,
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: 'transparent',
    height: 44,
    fontSize: 16,
    paddingLeft: 0,
  },
  filterButton: {
    backgroundColor: '#e5e5e5',
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20, 
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
