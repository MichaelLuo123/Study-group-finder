import React, { useState } from 'react';
import {
  SafeAreaView, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View, Modal, Pressable, Image,
} from 'react-native';
import { useRouter } from 'expo-router';

const AccountPage = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Image
            source={require('../../assets/images/Arrow_black.png')}
            style={styles.backArrowImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.heading}>Account</Text>

        <Text style={styles.subheading}>Email</Text>
        <TextInput style={styles.input} placeholder="email@ucsd.edu"/>

        <Text style={styles.subheading}>Phone Number</Text>
        <TextInput style={styles.input} placeholder="(123) 456-7890" />

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


        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
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
    },
    subheading: {
      marginBottom: 8,  
      fontSize: 14,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      padding: 12,
    //   marginTop: 6,
      marginBottom: 16,
    },
    errorText: {
      color: 'red',
      marginBottom: 16,
    },
    saveButton: {
      backgroundColor: '#5CAEF1',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: '600',
      textAlign: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: '#ccc',
      marginVertical: 16,
    },
    deleteButton: {
      backgroundColor: '#E36062',
      padding: 16,
      borderRadius: 12,
    },
    deleteButtonText: {
      color: '#fff',
      fontWeight: '600',
      textAlign: 'center',
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
      borderRadius: 16,
      width: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    cancelButton: {
      backgroundColor: '#e5e7eb',
    },
    confirmButton: {
      backgroundColor: '#E36062',
    },
    cancelText: {
      fontSize: 16,
      color: '#111827',
    },
    confirmText: {
      fontSize: 16,
      color: '#fff',
    },
});
  

export default AccountPage;
