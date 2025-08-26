import React from 'react';
import { View } from 'react-native';
import LeaderboardCard from './LeaderboardCard';

const sample = [
  { id: '1', name: 'Jessica Stacy', events: 18 },
  { id: '2', name: 'Jessica Stacy', events: 15 },
  { id: '3', name: 'Jessica Stacy', events: 12 },
];

export default function LeaderboardPage() {
  return (
    <View style={{ padding: 16 }}>
      <LeaderboardCard data={sample} />
    </View>
  );
}