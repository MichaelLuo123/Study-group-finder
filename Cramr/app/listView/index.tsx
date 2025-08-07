import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, TextInput, useTheme } from 'react-native-paper';
import EventList from './eventList';
import FilterModal, { Filters } from './filter';

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('listView');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [searchMode, setSearchMode] = useState<'events' | 'people'>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [peopleResults, setPeopleResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [following, setFollowing] = useState<any[]>([]);
  const [currentUserId] = useState('2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5'); // TODO: Get from auth

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Image
          source={require('./assets/images/finalCramrLogo.png')}
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
      headerTitle: '', // Hide "index"
    });
    
    // Load current following list when component mounts
    loadFollowing();
  }, [navigation]);

  const handleNavigation = (page: string) => {
    if (currentPage !== page) {
      setCurrentPage(page);
      if (page === 'listView') router.push('/listView');
      if (page === 'map') router.push('/Map/map');
      if (page === 'addEvent') router.push('/CreateEvent/createevent');
      if (page === 'profile') router.push('/Profile/ProfilePage');
    }
  };

  // Handler for saving filters from FilterModal
  const handleSaveFilters = (filterData: Filters) => {
    setFilters(filterData);
    setShowFilter(false);
  };

  // Search for people
  const searchPeople = async (query: string) => {
    if (query.length < 2) {
      setPeopleResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`http://132.249.242.182:8080/users/search?q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        setPeopleResults(data || []);
      } else {
        console.log('Failed to search people');
        setPeopleResults([]);
      }
    } catch (error) {
      console.log('Network error:', error);
      setPeopleResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search query changes
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchMode === 'people') {
      searchPeople(text);
    }
  };

  // Follow a user
  const followUser = async (userId: string) => {
    try {
      const response = await fetch(`http://132.249.242.182:8080/users/${currentUserId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add to following list
        const userToFollow = peopleResults.find(p => p.id === userId);
        if (userToFollow) {
          setFollowing(prev => [...prev, userToFollow]);
        }
      } else {
        const errorData = await response.json();
        console.log('Failed to follow user:', errorData);
      }
    } catch (error) {
      console.log('Network error:', error);
    }
  };

  // Unfollow a user
  const unfollowUser = async (userId: string) => {
    try {
      const response = await fetch(`http://132.249.242.182:8080/users/${currentUserId}/follow/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        // Remove from following list
        setFollowing(prev => prev.filter(p => p.id !== userId));
      } else {
        const errorData = await response.json();
        console.log('Failed to unfollow user:', errorData);
      }
    } catch (error) {
      console.log('Network error:', error);
    }
  };

  // Load current following list
  const loadFollowing = async () => {
    try {
      const response = await fetch(`http://132.249.242.182:8080/users/${currentUserId}/following`);
      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following || []);
      }
    } catch (error) {
      console.log('Failed to load following:', error);
    }
  };

  // Check if user is being followed
  const isFollowing = (userId: string) => {
    return following.some(user => user.id === userId);
  };

  // Navigate to user profile
  const navigateToProfile = (userId: string) => {
    router.push(`/Profile/ProfilePage?userId=${userId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Bar + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <TextInput
            mode="flat"
            placeholder={searchMode === 'events' ? 'Search events...' : 'Search people...'}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>
        <IconButton
          icon={searchMode === 'events' ? 'calendar' : 'account-group'}
          size={28}
          onPress={() => setSearchMode(searchMode === 'events' ? 'people' : 'events')}
          style={styles.toggleButton}
          iconColor="#000"
        />
        <IconButton
          icon="filter"
          size={28}
          onPress={() => setShowFilter(true)}
          style={styles.filterButton}
          iconColor="#000"
        />
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onSave={handleSaveFilters}
      />

      {/* Event List (with filters) */}
      {searchMode === 'events' && <EventList filters={filters} />}

      {/* People Results */}
      {searchMode === 'people' && (
        <View style={styles.peopleContainer}>
          {searchLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#5CAEF1" />
              <Text style={styles.loadingText}>Searching people...</Text>
            </View>
          ) : peopleResults.length > 0 ? (
            <ScrollView style={styles.peopleList}>
              {peopleResults
                .filter(person => person.id !== currentUserId) // Don't show current user
                .map((person: any) => {
                  const following = isFollowing(person.id);
                  return (
                    <TouchableOpacity 
                      key={person.id} 
                      style={styles.personCard}
                      onPress={() => navigateToProfile(person.id)}
                    >
                      <View style={styles.personInfo}>
                        <View style={styles.personAvatar}>
                          <Text style={styles.personAvatarText}>
                            {person.full_name?.charAt(0) || person.username?.charAt(0) || '?'}
                          </Text>
                        </View>
                        <View style={styles.personDetails}>
                          <Text style={styles.personName}>{person.full_name || 'Unknown'}</Text>
                          <Text style={styles.personUsername}>@{person.username}</Text>
                          {following && (
                            <Text style={styles.followingBadge}>Following</Text>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={[styles.followButton, following && styles.followingButton]}
                        onPress={(e) => {
                          e.stopPropagation(); // Prevent navigation
                          if (following) {
                            unfollowUser(person.id);
                          } else {
                            followUser(person.id);
                          }
                        }}
                      >
                        <Text style={[styles.followButtonText, following && styles.followingButtonText]}>
                          {following ? 'Unfollow' : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          ) : searchQuery.length >= 2 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No people found</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Type at least 2 characters to search people</Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom Navigation Icons - Fixed at bottom */}
      <View style={[
        styles.bottomNav,
        {
          backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
          borderTopColor: isDarkMode ? '#4a5568' : '#e0e0e0'
        }
      ]}>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
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
  toggleButton: {
    backgroundColor: '#e5e5e5',
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
  peopleContainer: {
    flex: 1,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  peopleList: {
    flex: 1,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  personInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  personAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  personAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  personUsername: {
    fontSize: 14,
    color: '#666',
  },
  followButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButton: {
    backgroundColor: '#e0e0e0',
  },
  followingButtonText: {
    color: '#666',
  },
  followingBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
});