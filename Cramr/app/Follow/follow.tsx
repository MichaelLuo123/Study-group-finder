import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Friend {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar?: string;
  status?: string;
}

interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar?: string;
  status?: string;
}

const FollowList = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'following' | 'followers' | 'add'>('following');
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendSearchQuery, setAddFriendSearchQuery] = useState('');
  const [following, setFollowing] = useState<Friend[]>([]);
  const [followers, setFollowers] = useState<Friend[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // TODO: Replace with actual user ID from authentication
  const currentUserId = '2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5';

  useEffect(() => {
    if (activeTab === 'following') {
      fetchFollowing();
    } else if (activeTab === 'followers') {
      fetchFollowers();
    }
  }, [activeTab]);

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://132.249.242.182:8080/users/${currentUserId}/following`);
      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following || []);
      } else {
        console.log('Failed to load following');
        setFollowing([]);
      }
    } catch (error) {
      console.log('Network error:', error);
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://132.249.242.182:8080/users/${currentUserId}/followers`);
      if (response.ok) {
        const data = await response.json();
        setFollowers(data.followers || []);
      } else {
        console.log('Failed to load followers');
        setFollowers([]);
      }
    } catch (error) {
      console.log('Network error:', error);
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // TODO: Replace with actual search endpoint
      const response = await fetch(`http://132.249.242.182:8080/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current user and people already following
        const filteredData = data.filter((user: User) => 
          user.id !== currentUserId && 
          !following.some(followingUser => followingUser.id === user.id)
        );
        setSearchResults(filteredData);
      } else {
        console.log('Failed to search users');
        setSearchResults([]);
      }
    } catch (error) {
      console.log('Network error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

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
        Alert.alert('Success', 'Now following!');
        // Remove from search results
        setSearchResults(searchResults.filter(user => user.id !== userId));
        // Refresh following list
        fetchFollowing();
      } else {
        Alert.alert('Error', 'Failed to follow user');
      }
    } catch (error) {
      console.log('Network error:', error);
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      const response = await fetch(`http://132.249.242.182:8080/users/${currentUserId}/follow/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Unfollowed successfully!');
        // Update UI
        setFollowing(following.filter(user => user.id !== userId));
      } else {
        Alert.alert('Error', 'Failed to unfollow user');
      }
    } catch (error) {
      console.log('Network error:', error);
      Alert.alert('Error', 'Network error occurred');
    }
  };



  const filteredFollowing = following.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFollowingItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendContainer}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.full_name?.charAt(0) || item.username?.charAt(0) || '?'}
          </Text>
        </View>
      </View>
      
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.full_name || 'Unknown'}</Text>
        <Text style={styles.friendUsername}>@{item.username}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => unfollowUser(item.id)}
      >
        <Ionicons name="close" size={20} color="#FF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchResultItem = ({ item }: { item: User }) => {
    // Check if this user is already being followed
    const isFollowing = following.some(user => user.id === item.id);
    
    return (
      <View style={styles.searchResultContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.full_name?.charAt(0) || item.username?.charAt(0) || '?'}
            </Text>
          </View>
        </View>
        
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.full_name || 'Unknown'}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
          {isFollowing && (
            <Text style={styles.followingText}>Following</Text>
          )}
        </View>
        
        {!isFollowing && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => followUser(item.id)}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
    );
  };



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Follow</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setActiveTab('following')}
        >
          <Ionicons 
            name="people" 
            size={16} 
            color={activeTab === 'following' ? '#fff' : '#666'} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
            Following
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
          onPress={() => setActiveTab('followers')}
        >
          <Ionicons 
            name="heart" 
            size={16} 
            color={activeTab === 'followers' ? '#fff' : '#666'} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}>
            Followers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.activeTab]}
          onPress={() => setActiveTab('add')}
        >
          <Ionicons 
            name="add-circle" 
            size={16} 
            color={activeTab === 'add' ? '#fff' : '#666'} 
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>
            Add
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'add' ? (
        <>
          {/* Add Friends Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for users to add..."
              placeholderTextColor="#999"
              value={addFriendSearchQuery}
              onChangeText={(text) => {
                setAddFriendSearchQuery(text);
                searchUsers(text);
              }}
            />
          </View>

          {/* Search Results */}
          <FlatList
            data={searchResults}
            renderItem={renderSearchResultItem}
            keyExtractor={(item) => item.id}
            style={styles.friendsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchLoading ? 'Searching...' : 
                   addFriendSearchQuery.length < 2 ? 'Type at least 2 characters to search' :
                   'No users found'}
                </Text>
              </View>
            }
          />
        </>
      ) : activeTab === 'followers' ? (
        <>
          {/* Followers List */}
          <FlatList
            data={followers}
            renderItem={renderFollowingItem}
            keyExtractor={(item) => item.id}
            style={styles.friendsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {loading ? 'Loading...' : 'No followers found'}
                </Text>
              </View>
            }
          />
        </>
      ) : (
        <>
          {/* Following Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search following"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Following List */}
          <FlatList
            data={filteredFollowing}
            renderItem={renderFollowingItem}
            keyExtractor={(item) => item.id}
            style={styles.friendsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {loading ? 'Loading...' : 'Not following anyone yet'}
                </Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 34, // Same width as back button for centering
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  activeTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  tabIcon: {
    marginBottom: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  friendsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  friendContainer: {
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
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultContainer: {
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
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#FFE8E8',
    borderRadius: 20,
  },
  addButton: {
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
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
  followingText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 2,
  },
  pendingText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: 'bold',
    marginTop: 2,
  },
  requestButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    padding: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
  },
  declineButton: {
    padding: 8,
    backgroundColor: '#FFE8E8',
    borderRadius: 20,
  },
  sentText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 2,
  },
  cancelButton: {
    padding: 8,
    backgroundColor: '#FFE8E8',
    borderRadius: 20,
  },
});

export default FollowList; 