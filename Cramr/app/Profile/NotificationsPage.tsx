import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Notification = {
  id: string;
  sender: string;
  message: string;
  date: string; 
};

const notifications: { [date: string]: Notification[] } = {
  "Today": [
    {
      id: "1",
      sender: "jessicastacy",
      message: "created Carl's Jr Study Session.",
      date: "Today"
    },
    {
      id: "2",
      sender: "jessicastacy",
      message: "started following you.",
      date: "Today"
    }
  ],
  "7/29": [
    {
      id: "3",
      sender: "caileymnm",
      message: "RSVPed to In-N-Out Study Session.",
      date: "7/29"
    }
  ]
};

export default function NotificationsPage({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top bar with back arrow and title */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
        </View>

        {/* Notifications List */}
        {Object.entries(notifications).map(([date, notifs]) => (
          <View key={date} style={{ marginBottom: 14 }}>
            <Text style={styles.dateHeader}>{date}</Text>
            {notifs.map(notif => (
              <View key={notif.id} style={styles.notifBox}>
                <Text>
                  <Text style={styles.bold}>{notif.sender}</Text>
                  <Text> {notif.message}</Text>
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
    padding: 18,
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
  },
  dateHeader: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    marginVertical: 6,
    color: '#222',
  },
  notifBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  bold: {
    fontFamily: 'Poppins-SemiBold',
    fontWeight: 'bold',
    color: '#222',
  },
});