import React, { useState } from 'react';
import {
  SafeAreaView, ScrollView, StyleSheet, Text,
  TouchableOpacity, View, Image
} from 'react-native';
import { useRouter } from 'expo-router';

const PreferencesPage = () => {
  const router = useRouter();
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(false);
  const [switch3, setSwitch3] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const styles = getStyles(isDarkMode);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
    <Image
      source={
        isDarkMode
          ? require('../../assets/images/arrow_white.png')
          : require('../../assets/images/Arrow_black.png')
      }
      style={styles.backArrowImage}
      resizeMode="contain"
    />
  </TouchableOpacity>

        

        <Text style={styles.heading}>Account</Text>

        {/* Toggles */}
        <View style={styles.toggleGroup}>
          <Text style={styles.toggleLabel}>Push Notifications</Text>
          <TouchableOpacity onPress={() => setSwitch1(!switch1)}>
            <Image
              source={
                switch1
                  ? require('../../assets/images/SwitchFieldOn.png')
                  : require('../../assets/images/SwitchFieldOff.png')
              }
              style={styles.switch}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.toggleGroup}>
          <Text style={styles.toggleLabel}>Email Notifications</Text>
          <TouchableOpacity onPress={() => setSwitch2(!switch2)}>
            <Image
              source={
                switch2
                  ? require('../../assets/images/SwitchFieldOn.png')
                  : require('../../assets/images/SwitchFieldOff.png')
              }
              style={styles.switch}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.toggleGroup}>
          <Text style={styles.toggleLabel}>SMS Notifications</Text>
          <TouchableOpacity onPress={() => setSwitch3(!switch3)}>
            <Image
              source={
                switch3
                  ? require('../../assets/images/SwitchFieldOn.png')
                  : require('../../assets/images/SwitchFieldOff.png')
              }
              style={styles.switch}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.themeButtons}>
          {['light', 'dark'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.themeButton,
                (isDarkMode && t === 'dark') || (!isDarkMode && t === 'light')
                  ? styles.themeButtonActive
                  : null
              ]}
              onPress={() => setIsDarkMode(t === 'dark')}
            >
              <Text style={styles.themeText}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Dynamic styling based on dark mode
const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#393939' : '#fff',
    },
    scrollContent: {
      padding: 24,
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
    themeToggleContainer: {
      alignItems: 'flex-end',
      marginBottom: 16,
    },
    themeToggle: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB',
    },
    heading: {
      fontSize: 20,
      fontWeight: 'bold',
      alignSelf: 'center',
      marginBottom: 24,
      color: isDarkMode ? '#FFFFFF' : '#111827',
    },
    toggleGroup: {
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    toggleLabel: {
      fontSize: 16,
      color: isDarkMode ? '#D1D5DB' : '#111827',
      marginBottom: 16,
    },
    switch: {
      width: 40,
      height: 30,
    },
    sectionTitle: {
      marginTop: 12,
      fontSize: 16,
      fontWeight: '500',
      color: isDarkMode ? '#E5E7EB' : '#111827',
    },
    themeButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    themeButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#6E6E6E' : '#f3f4f6',
    },
    themeButtonActive: {
      backgroundColor: isDarkMode ? '#6B7280' : '#d1d5db',
    },
    themeText: {
      color: isDarkMode ? '#F9FAFB' : '#111827',
    },
    saveButton: {
      backgroundColor: '#5CAEF1',
      padding: 16,
      borderRadius: 12,
      marginTop: 24,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: '600',
      textAlign: 'center',
    },
  });

export default PreferencesPage;
