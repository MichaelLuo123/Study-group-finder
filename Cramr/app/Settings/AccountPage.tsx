import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal, Pressable,
  SafeAreaView, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { Colors } from '../../constants/Colors';

const AccountPage = () => {
  // All state and hooks must be declared at the top of the component
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const { user: loggedInUser } = useUser(); // <-- Re-enabled the correct way to get the user object
  const {isDarkMode, toggleDarkMode} = useUser();

  // Colors
  const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background)
  const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text)
  const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput)
  const placeholderTextColor= (!isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText)

  // First useEffect to fetch all user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!loggedInUser?.id) {
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${loggedInUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setEmail(data.email || '');
          setPhoneNumber(data.phone_number || '');
          setBlockedIds(data.blocked_ids || []);
        } else {
          console.error('Failed to fetch user data:', await response.text());
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    }; // <-- Function definition ends here

    fetchUserData(); // <-- Call the function here
  }, [loggedInUser?.id]);

  // Second useEffect to fetch data for blocked users
  const fetchBlockedUserProfile = async (blockedId: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${blockedId}`);
      if (response.ok) {
        const data = await response.json();
        return {
          id: blockedId,
          profilePicture: data.profile_picture_url,
          username: data.username,
        };
      } else {
        console.error(`Failed to fetch profile for ID ${blockedId}:`, await response.text());
        return null;
      }
    } catch (err) {
      console.error('Error fetching blocked user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    const fetchAllBlockedProfiles = async () => {
      if (!blockedIds.length) {
        setBlockedUsers([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const promises = blockedIds.map(id => fetchBlockedUserProfile(id));
      const profiles = await Promise.all(promises);
      const validProfiles = profiles.filter(p => p !== null);
      setBlockedUsers(validProfiles);
      setIsLoading(false);
    };

    fetchAllBlockedProfiles();
  }, [blockedIds]);

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
  
    try {
      const payload = {
        email,
        phone_number: phoneNumber,
        password: newPassword || undefined,
      };
  
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${loggedInUser?.id}/account`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Account updated:', data);
        alert('Account updated successfully!');
      } else {
        console.error('Failed to update account:', await response.text());
        alert('Failed to update account.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred.');
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${loggedInUser?.id}/blocks/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        alert('User unblocked successfully!');
        // Refresh the blocked users list by refetching user data
        const fetchUserData = async () => {
          if (!loggedInUser?.id) {
            return;
          }
          
          setIsLoading(true);
          try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${loggedInUser.id}`);
            if (response.ok) {
              const data = await response.json();
              setEmail(data.email || '');
              setPhoneNumber(data.phone_number || '');
              setBlockedIds(data.blocked_ids || []);
            } else {
              console.error('Failed to fetch user data:', await response.text());
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
          } finally {
            setIsLoading(false);
          }
        };
        fetchUserData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('Unblock error:', error);
      alert('Network error occurred');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Show message if no user is logged in */}
        {!loggedInUser && (
          <View style={styles.messageContainer}>
            <Text style={[styles.messageText, { color: textColor }]}>
              Please log in to edit your account
            </Text>
          </View>
        )}

        {/* Show loading state */}
        {isLoading && (
          <View style={styles.messageContainer}>
            <Text style={[styles.messageText, { color: textColor }]}>
              Loading account...
            </Text>
          </View>
        )}

        {/* Show account content only if user is logged in and not loading */}
        {loggedInUser && !isLoading && (
          <>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft 
                size={24} 
                color={textColor}
                onPress={() => router.back()}
              />
            </TouchableOpacity>

            <Text style={[styles.heading, { color: textColor, marginTop: -40, marginBottom: 20 }]}>Account</Text>

            <Text style={[styles.subheading, { color: textColor }]}>Email</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: textInputColor, color: textColor }]} 
              placeholder="email@ucsd.edu" 
              placeholderTextColor={placeholderTextColor}
              value={email}
              onChangeText={setEmail}
            />

            <Text style={[styles.subheading, { color: textColor }]}>Phone Number</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: textInputColor, color: textColor }]} 
              placeholder="(123) 456-7890"  
              placeholderTextColor={placeholderTextColor}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            <Text style={[styles.subheading, { color: textColor }]}>Change Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: textInputColor, color: textColor }]}
              placeholder="Enter old password."
              placeholderTextColor={placeholderTextColor}
              secureTextEntry
            />

            <TextInput
              style={[styles.input, { backgroundColor: textInputColor, color: textColor }]}
              placeholder="Enter new password."
              placeholderTextColor={placeholderTextColor}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={[styles.input, { backgroundColor: textInputColor, color: textColor }]}
              placeholder="Re-enter new password."
              placeholderTextColor={placeholderTextColor}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <Text style={styles.errorText}>New passwords do not match!</Text>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={[styles.saveButtonText, {color: textColor}]}>Save</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            <Text style={[styles.subheading, { color: textColor }]}>Blocked Accounts</Text>
            
            {blockedUsers.map((user) => (
              <View key={user.id} style={[styles.blockedContainer, {backgroundColor: textInputColor, flexDirection: 'row', alignItems: 'center'}]}>
                <Image
                  source={{ uri: user.profilePicture }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
                <Text style={[styles.normalText, { color: textColor, marginLeft: 12}]}>
                  {user.username}
                </Text>
                <TouchableOpacity onPress={() => handleUnblock(user.id)}>
                    <Text style={[styles.normalBoldText, { color: '#E36062', marginLeft: 150}]}> ✕ </Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.divider} />
            <Text style={[styles.subheading, { color: textColor }]}>Delete Account</Text>

            <TouchableOpacity style={styles.deleteButton} onPress={() => setModalVisible(true)}>
              <Text style={[styles.deleteButtonText, {color: textColor}]}>Delete</Text>
            </TouchableOpacity>

            <Modal transparent visible={modalVisible} animationType="fade">
              <View style={styles.modalBackground}>
                <View style={[styles.modalCard, { backgroundColor: textInputColor }]}>
                  <Text style={[styles.modalTitle, { color: textColor }]}>Delete account? This action cannot be undone.</Text>
                  <View style={styles.modalButtons}>
                    <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={[styles.modalButton, styles.confirmButton]} onPress={() => {
                      setModalVisible(false);
                    }}>
                      <Text style={styles.confirmText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  subheaderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  subheaderBoldText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  normalText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  normalBoldText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },

  container: {
    flex: 1,
    // backgroundColor moved to inline style
  },
  scrollContent: {
    padding: 20,
  },
  backArrow: {
    fontSize: 25,
    marginBottom: 0,
    fontWeight: '600',
  },
  backButton: {
    width: 25,
    height: 25,
    marginBottom: 12,
  },
  backArrowImage: {
    width: 25,
    height: 25,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-Bold',
  },
  subheading: {
    marginBottom: 10,  
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    // backgroundColor and color moved to inline styles
    fontFamily: 'Poppins-Regular',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  saveButton: {
    backgroundColor: '#5CAEF1',
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
    marginTop: 15
  },
    saveButtonText: {
      color: '#000000',
      fontSize: 16,
      textAlign: 'center',
      fontFamily: 'Poppins-Regular',
    },
    divider: {
      height: 1,
      backgroundColor: '#ccc',
      marginVertical: 16,
    },
    deleteButton: {
      backgroundColor: '#E36062',
      padding: 10,
      borderRadius: 12,
    },
    deleteButtonText: {
      color: '#000000',
      fontSize: 16,
      textAlign: 'center',
      fontFamily: 'Poppins-Regular',
    },
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCard: {
      // backgroundColor moved to inline style
      padding: 24,
      borderRadius: 10,
      width: '70%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      textAlign: 'center',
      fontFamily: 'Poppins-Regular',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
    },
    modalButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
    },
    cancelButton: {
      backgroundColor: '#e5e7eb',
    },
    confirmButton: {
      backgroundColor: '#E36062',
    },
    cancelText: {
      fontSize: 16,
      color: '#000000',
      fontFamily: 'Poppins-Regular',
    },
    confirmText: {
      fontSize: 16,
      color: '#000000',
      fontFamily: 'Poppins-Regular',
    },
    messageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    messageText: {
      fontSize: 16,
      textAlign: 'center',
      fontFamily: 'Poppins-Regular',
    },
    blockedContainer: {
      width: '100%',
      padding: 8,
      marginBottom: 8,
      borderRadius: 10,
    }
});
  

export default AccountPage;