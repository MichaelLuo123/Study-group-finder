import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';

const SettingsFrontPage = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Settings</Text>

        <TouchableOpacity
        style={styles.item}
        onPress={() => router.push('../')}
        >
        <Text style={styles.itemText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.item}
        onPress={() => router.push('../Settings/AccountPage')}
        >
        <Text style={styles.itemText}>Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.item}
        onPress={() => router.push('../Settings/PreferencesPage')}
        >
        <Text style={styles.itemText}>Preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.item}
        onPress={() => router.push('../Settings/AboutPage')}
        >
        <Text style={styles.itemText}>About</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        {/* Sign-out Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Sign out?</Text>
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => {
                    setModalVisible(false);
                    // Sign out logic goes here
                  }}
                >
                  <Text style={styles.confirmText}>Yes</Text>
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
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 24,
  },
  item: {
    backgroundColor: '#f9fafb',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemText: {
    fontSize: 16,
    color: '#111827',
  },
  signOutButton: {
    backgroundColor: '#5CAEF1',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
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
    backgroundColor: '#5CAEF1',
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

export default SettingsFrontPage;
