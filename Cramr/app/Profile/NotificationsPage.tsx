import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
type Notification = {
  id: string;
  sender: string;
  message: string;
  date: string;
};

export default function NotificationsPage({ navigation }: { navigation: any }) {
  const router = useRouter();
  const {isDarkMode, toggleDarkMode} = useUser();
  const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background)
  const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text)
  const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput)
  const bannerColors = Colors.bannerColors


  const [notifications, setNotifications] = useState<{ [date: string]: Notification[] }>({});
  const [refreshing, setRefreshing] = useState(false);
  
  // Hardcoded user ID as requested
  const userId = '2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/notifications`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform the backend data to match the original format
          const transformedNotifications: { [date: string]: Notification[] } = {};
          
          Object.entries(data.notifications).forEach(([date, notifs]: [string, any]) => {
            transformedNotifications[date] = notifs.map((notif: any) => ({
              id: notif.id,
              sender: notif.sender,
              message: notif.message,
              date: notif.date
            }));
          });
          
          setNotifications(transformedNotifications);
        }
      } else {
        console.error('Failed to fetch notifications:', response.status);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor }}>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Top bar with back arrow and title */}
        <View style={styles.headerRow}>
          <ArrowLeft onPress={() => router.back()} color={textColor} />
        </View>

        <Text style={[styles.title, { color: textColor }]}>Notifications</Text>

        {/* Notifications List */}
        {Object.entries(notifications).map(([date, notifs]) => (
          <View key={date} style={{ marginBottom: 14 }}>
            <Text style={[styles.dateHeader, { color: textColor }]}>{date}</Text>
            {notifs.map(notif => (
              <View key={notif.id} style={[styles.notifBox, { backgroundColor: textInputColor }]}>
                <Text>
                  <Text style={[styles.bold, { color: textColor }]}>{notif.sender}</Text>
                  <Text style={{ color: textColor, fontFamily: 'Poppins-Regular' }}> {notif.message}</Text>
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
    padding: 2,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#222',
    marginBottom: 10,
    alignSelf: 'center',
  },
  dateHeader: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginVertical: 5,
    marginLeft: 5
  },
  notifBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  bold: {
    fontFamily: 'Poppins-SemiBold',
    color: '#222',
  },
});