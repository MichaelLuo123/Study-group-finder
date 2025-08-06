import { useUser } from '@/contexts/UserContext';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Friend {
  id: string;
  username: string;
  full_name: string;
  email: string;
}

interface FriendsDropdownProps {
  selectedFriends: string[];
  onFriendsChange: (friends: string[]) => void;
  placeholder?: string;
  theme: any;
}

const FriendsDropdown: React.FC<FriendsDropdownProps> = ({
  selectedFriends,
  onFriendsChange,
  placeholder = "Select friends to invite...",
  theme
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: loggedInUser } = useUser();

  const currentUserId = loggedInUser?.id; // Use the logged-in user's ID

  useEffect(() => {
    fetchFriends();
  }, [currentUserId]);

  const fetchFriends = async () => {
    if (!currentUserId) {
      setFriends([]);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching friends for user:', currentUserId);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      let response;
      try {
        response = await fetch(`http://132.249.242.182:8080/users/${currentUserId}/friends`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        console.log('Response status:', response.status);
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.log('Request timed out');
          Alert.alert('Error', 'Request timed out. API might be down.');
          setFriends([]);
          return;
        }
        throw error;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Friends data:', data);
        setFriends(data);
      } else {
        console.log('API error:', response.status, response.statusText);
        Alert.alert('Error', `Failed to load friends: ${response.status}`);
      }
    } catch (error) {
      console.log('Network error:', error);
      Alert.alert('Error', 'Network error while loading friends');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (friendId: string) => {
    const newSelected = selectedFriends.includes(friendId)
      ? selectedFriends.filter(id => id !== friendId)
      : [...selectedFriends, friendId];
    onFriendsChange(newSelected);
  };

  const getSelectedFriendsText = () => {
    if (selectedFriends.length === 0) return placeholder;
    
    const selectedNames = friends
      .filter(friend => selectedFriends.includes(friend.id))
      .map(friend => friend.full_name || friend.username);
    
    if (selectedNames.length <= 2) {
      return selectedNames.join(', ');
    }
    return `${selectedNames.length} friends selected`;
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const isSelected = selectedFriends.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.friendItem,
          { backgroundColor: theme.inputBackground },
          isSelected && { backgroundColor: theme.rsvpBackground }
        ]}
        onPress={() => toggleFriend(item.id)}
      >
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: theme.textColor }]}>
            {item.full_name || item.username}
          </Text>
          <Text style={[styles.friendUsername, { color: theme.placeholderColor }]}>
            @{item.username}
          </Text>
        </View>
        {isSelected && (
          <Text style={[styles.checkmark, { color: theme.rsvpText }]}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          { backgroundColor: theme.inputBackground, borderColor: theme.placeholderColor }
        ]}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[styles.dropdownText, { color: theme.textColor }]}>
          {getSelectedFriendsText()}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: theme.cardBackground }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>
                Select Friends to Invite
              </Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <Text style={[styles.closeButtonText, { color: theme.textColor }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <Text style={[styles.loadingText, { color: theme.textColor }]}>
                Loading friends...
              </Text>
            ) : friends.length === 0 ? (
              <Text style={[styles.noFriendsText, { color: theme.textColor }]}>
                No friends found. Add some friends first!
              </Text>
            ) : (
              <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id}
                style={styles.friendsList}
                showsVerticalScrollIndicator={false}
              />
            )}

            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: theme.rsvpBackground }]}
              onPress={() => setIsVisible(false)}
            >
              <Text style={[styles.doneButtonText, { color: theme.rsvpText }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  noFriendsText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
    fontStyle: 'italic',
  },
  friendsList: {
    maxHeight: 300,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  friendUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FriendsDropdown; 