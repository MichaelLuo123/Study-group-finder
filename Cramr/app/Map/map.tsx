import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, TextInput, useTheme } from 'react-native-paper';
import EventList from '../listView/eventList';

export default function MapScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('map');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Image
          source={require('../listView/assets/images/finalCramrLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      ),
      headerRight: () => (
        <Button
          mode="contained"
          compact
          buttonColor="#5caef1"
          textColor="black"
          style={styles.addButton}
          onPress={() => {}}
        >
          Add Event
        </Button>
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
      } else if (page === 'addEvent') {
        // router.push('/addEvent');
      } else if (page === 'bookmarks') {
        // router.push('/bookmarks');
      } else if (page === 'profile') {
        // router.push('/profile');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>  
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <Text style={{textAlign: 'center', color: '#888', marginTop: 10}}>Map Placeholder</Text>
      </View>

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

      {/* Event List */}
      <EventList />

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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    justifyContent: 'flex-start',
    paddingBottom: 80, 
  },
  logo: {
    height: 100,
    width: 100,
    marginLeft: 12,
  },
  addButton: {
    marginRight: 8,
    borderRadius: 10,
  },
  mapContainer: {
    height: 300,
    width: '100%',
    backgroundColor: '#e5e5e5',
    borderRadius: 20,
    marginBottom: 10,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
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
