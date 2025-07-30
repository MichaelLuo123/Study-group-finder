import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const sampleEvents = [
  {
    id: 1,
    title: 'In-N-Out',
    emoji: '🍔',
    color: '#f9caca',
    labels: ['Loud', 'Music', 'Pomodoro'],
    course: 'CSE 120',
    location: '2910 Damon Ave, San Diego',
    date: 'July 10th, 2025',
    time: '6:00 PM - 11:00 PM',
    current: 7,
    max: 8,
    avatars: '🧑‍🎓👨‍🏫🧑‍💻',
    extraCount: 4,
  },
  {
    id: 2,
    title: 'CSE 140 Study Group',
    emoji: '📚',
    color: '#cce5ff',
    labels: ['Quiet', 'Pomodoro'],
    course: 'CSE 140',
    location: 'zoom.us/j/3u4r3',
    date: 'July 10th, 2025',
    time: '10:30 AM - 12:00 PM',
    current: 3,
    max: 5,
    avatars: '👩‍💻👨‍🎓',
    extraCount: 2,
  },
];

export default function EventList() {
  const [collapsedEvents, setCollapsedEvents] = useState<Set<number>>(new Set());

  const toggleEvent = (eventId: number) => {
    setCollapsedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {sampleEvents.map((event) => {
        const isCollapsed = collapsedEvents.has(event.id);
        
        return (
          <View key={event.id} style={styles.card}>
            {/* Title Header - Clickable */}
            <Pressable 
              style={[styles.header, { backgroundColor: event.color || '#eee' }]}
              onPress={() => toggleEvent(event.id)}
            >
              <Text style={styles.title}>{event.title}</Text>
              <View style={styles.headerRight}>
                <Text style={styles.emoji}>{event.emoji}</Text>
                <Text style={styles.collapseIcon}>{isCollapsed ? '▼' : '▲'}</Text>
              </View>
            </Pressable>

            {/* Collapsible Content */}
            {!isCollapsed && (
              <>
                {/* Labels */}
                <View style={styles.labels}>
                  {event.labels.map((label, index) => (
                    <Text key={index} style={styles.label}>
                      {label}
                    </Text>
                  ))}
                </View>

                {/* Details */}
                <View style={styles.detailRow}>
                  <Text style={styles.icon}>📘</Text>
                  <Text style={styles.detail}>{event.course}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.icon}>📍</Text>
                  <Text style={styles.detail}>{event.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.icon}>📅</Text>
                  <Text style={styles.detail}>{event.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.icon}>🕒</Text>
                  <Text style={styles.detail}>{event.time}</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.count}>
                    {event.current}/{event.max} 👥 {event.avatars} +{event.extraCount}
                  </Text>
                  <Pressable style={styles.rsvpButton}>
                    <Text style={{ color: 'white' }}>RSVP</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    marginVertical: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  collapseIcon: {
    fontSize: 12,
    color: '#666',
  },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  label: {
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  icon: {
    marginRight: 6,
    fontSize: 14,
  },
  detail: {
    fontSize: 13,
  },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    fontSize: 13,
  },
  rsvpButton: {
    backgroundColor: '#5CAEF1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
});