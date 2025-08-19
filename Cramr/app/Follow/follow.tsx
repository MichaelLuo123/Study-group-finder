import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import Slider from '../../components/Slider'; // ✅ import your custom Slider

interface Friend {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar?: string;
  status?: string;
}

const FollowList = () => {
  const router = useRouter();
  const scheme = useColorScheme();
  const lightMode = scheme !== 'dark';
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
  const [searchQuery, setSearchQuery] = useState('');
  const [following, setFollowing] = useState<Friend[]>([]);
  const [followers, setFollowers] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [unfollowModalVisible, setUnfollowModalVisible] = useState(false);
  const [userToUnfollow, setUserToUnfollow] = useState<Friend | null>(null);
  const [removeFollowerModalVisible, setRemoveFollowerModalVisible] = useState(false);
  const [userToRemoveFollower, setUserToRemoveFollower] = useState<Friend | null>(null);

  const currentUserId = user?.id; // Use logged-in user's ID

  useEffect(() => {
    if (activeTab === 'following') fetchFollowing();
    else fetchFollowers();
  }, [activeTab]);

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://132.249.242.182:8080/users/${currentUserId}/following`);
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following || []);
      } else setFollowing([]);
    } catch {
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://132.249.242.182:8080/users/${currentUserId}/followers`);
      if (res.ok) {
        const data = await res.json();
        setFollowers(data.followers || []);
      } else setFollowers([]);
    } catch {
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollowCheck = (user: Friend) => {
    setUserToUnfollow(user);
    setUnfollowModalVisible(true);
  };
  const handleCancelUnfollow = () => {
    setUnfollowModalVisible(false);
    setUserToUnfollow(null);
  };

  const handleRemoveFollowerCheck = (user: Friend) => {
    setUserToRemoveFollower(user);
    setRemoveFollowerModalVisible(true);
  };
  const handleCancelRemoveFollower = () => {
    setRemoveFollowerModalVisible(false);
    setUserToRemoveFollower(null);
  };

  const removeFollower = async (userId: string) => {
    try {
      const res = await fetch(`http://132.249.242.182:8080/users/${currentUserId}/followers/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        Alert.alert('Success', 'Follower removed successfully!');
        setFollowers(prev => prev.filter(u => u.id !== userId));
        setRemoveFollowerModalVisible(false);
        setUserToRemoveFollower(null);
      } else {
        Alert.alert('Error', 'Failed to remove follower');
      }
    } catch {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      const res = await fetch(`http://132.249.242.182:8080/users/${currentUserId}/follow/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        Alert.alert('Success', 'Unfollowed successfully!');
        setFollowing(prev => prev.filter(u => u.id !== userId));
        setUnfollowModalVisible(false);
        setUserToUnfollow(null);
      } else {
        Alert.alert('Error', 'Failed to unfollow user');
      }
    } catch {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const filteredFollowing = following.filter(user =>
    (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFollowingItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.full_name?.charAt(0) || item.username?.charAt(0) || '?'}
        </Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.full_name || 'Unknown'}</Text>
        <Text style={styles.friendUsername}>@{item.username}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => handleUnfollowCheck(item)}>
        <Ionicons name="close" size={20} color="#FF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderFollowerItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.full_name?.charAt(0) || item.username?.charAt(0) || '?'}
        </Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.full_name || 'Unknown'}</Text>
        <Text style={styles.friendUsername}>@{item.username}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveFollowerCheck(item)}>
        <Ionicons name="close" size={20} color="#FF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ✅ Slider toggle (Followers / Following) */}
      <View style={styles.segmentWrap}>
        <Slider
          leftLabel="Followers"
          rightLabel="Following"
          width={240}
          lightMode={lightMode}
          value={activeTab === 'following'} 
          onChangeSlider={(val) => setActiveTab(val ? 'following' : 'followers')}
          style={{ height: 40 }}
        />
      </View>

      {activeTab === 'followers' ? (
        <FlatList
          data={followers}
          renderItem={renderFollowerItem}
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
      ) : (
        <>
          {/* Search only for following */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
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

      {/* Unfollow Modal */}
      <Modal animationType="fade" transparent visible={unfollowModalVisible} onRequestClose={handleCancelUnfollow}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Unfollow {userToUnfollow?.full_name || userToUnfollow?.username || 'this user'}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={handleCancelUnfollow}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={() => userToUnfollow && unfollowUser(userToUnfollow.id)}
              >
                <Text style={styles.modalConfirmText}>Unfollow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Remove Follower Modal */}
      <Modal animationType="fade" transparent visible={removeFollowerModalVisible} onRequestClose={handleCancelRemoveFollower}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Remove {userToRemoveFollower?.full_name || userToRemoveFollower?.username || 'this user'} as a follower?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={handleCancelRemoveFollower}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={() => userToRemoveFollower && removeFollower(userToRemoveFollower.id)}
              >
                <Text style={styles.modalConfirmText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerSpacer: { width: 34 },
  segmentWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, alignItems: 'center' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#f0f0f0', borderRadius: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  friendsList: { flex: 1, paddingHorizontal: 16 },
  friendContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#e0e0e0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFD700',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 2 },
  friendUsername: { fontSize: 14, color: '#666' },
  removeButton: { padding: 8, backgroundColor: '#FFE8E8', borderRadius: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, margin: 20, minWidth: 300 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalCancelButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' },
  modalCancelText: { fontSize: 16, color: '#666', fontWeight: '600' },
  modalConfirmButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#FF4444', alignItems: 'center' },
  modalConfirmText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});

export default FollowList;