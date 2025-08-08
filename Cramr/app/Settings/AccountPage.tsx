import { useUser } from '@/contexts/UserContext';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
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

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  // This conditional return must come after all hooks
  if (!fontsLoaded) {
    return null; 
  }

  // Colors
  const textColor = (true ? Colors.light.text : Colors.dark.text)
  const textInputColor = (true ? Colors.light.textInput : Colors.dark.textInput)

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Show message if no user is logged in */}
        {!loggedInUser && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              Please log in to edit your account
            </Text>
          </View>
        )}

        {/* Show loading state */}
        {isLoading && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              Loading account...
            </Text>
          </View>
        )}

        {/* Show account content only if user is logged in and not loading */}
        {loggedInUser && !isLoading && (
          <>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Image
                source={require('../../assets/images/Arrow_black.png')}
                style={styles.backArrowImage}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text style={styles.heading}>Account</Text>

            <Text style={styles.subheading}>Email</Text>
            <TextInput style={styles.input} placeholder="email@ucsd.edu" 
              value={email} 
              onChangeText={setEmail}
            />

            <Text style={styles.subheading}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="(123) 456-7890" 
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            <Text style={styles.subheading}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter old password"
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="Re-enter new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <Text style={styles.errorText}>New passwords do not match!</Text>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            <Text style={styles.subheading}>Blocked Accounts</Text>
            
            {blockedUsers.map((user) => (
              <View key={user.id} style={[styles.blockedContainer, {backgroundColor: textInputColor, flexDirection: 'row', alignItems: 'center'}]}>
                <Image
                  source={{ uri: user.profilePicture }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
                <Text style={[styles.normalText, { color: textColor, marginLeft: 12}]}>
                  {user.username}
                </Text>
                <TouchableOpacity>
                    <Text style={[styles.normalBoldText, { color: '#E36062', marginLeft: 150}]}> ✕ </Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.divider} />
            <Text style={styles.subheading}>Delete Account</Text>

            <TouchableOpacity style={styles.deleteButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>

            <Modal transparent visible={modalVisible} animationType="fade">
              <View style={styles.modalBackground}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Delete account? This action cannot be undone.</Text>
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
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 24,
  },
  backArrow: {
    fontSize: 30,
    marginBottom: 0,
    fontWeight: '600',
  },
  backButton: {
    width: 30,
    height: 30,
    marginBottom: 12,
  },
  backArrowImage: {
    width: 30,
    height: 30,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins-Bold',
  },
  subheading: {
    marginBottom: 8,  
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    //   marginTop: 6,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  saveButton: {
    backgroundColor: '#5CAEF1',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
    saveButtonText: {
      color: '#000000',
      fontSize: 14,
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
      padding: 12,
      borderRadius: 12,
    },
    deleteButtonText: {
      color: '#000000',
      fontWeight: '600',
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
      backgroundColor: 'white',
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
      borderRadius: 8,
    }
});
  

export default AccountPage;
