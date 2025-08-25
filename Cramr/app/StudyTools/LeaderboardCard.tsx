import React from 'react';
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Entry = {
  id: string;
  name: string;
  events: number;
  avatar?: string;
};

type Props = {
  data: Entry[]; 
  title?: string;
};

const rankColors = {
  first: '#82BFE6',   // blue
  second: '#F2D7F5',  // pink
  third: '#DCD895',   // olive
};

export default function LeaderboardCard({ data, title = 'Leaderboard' }: Props) {
  const [first, second, third] = data.slice(0, 3);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {/* Podium */}
      <View style={styles.podiumWrap}>
        {/* 3rd */}
        <PodiumCol
          height={90}
          color={rankColors.third}
          rank={3}
          avatarUri={third?.avatar}
        />
        {/* 1st */}
        <PodiumCol
          height={140}
          color={rankColors.first}
          rank={1}
          big
          avatarUri={first?.avatar}
        />
        {/* 2nd */}
        <PodiumCol
          height={110}
          color={rankColors.second}
          rank={2}
          avatarUri={second?.avatar}
        />
      </View>

      <View style={styles.rule} />

      {/* List */}
      <FlatList
        data={data.slice(0, 3)}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Row
            rank={index + 1}
            name={item.name}
            events={item.events}
            color={
              index === 0
                ? rankColors.first
                : index === 1
                ? rankColors.second
                : rankColors.third
            }
            avatarUri={item.avatar}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        scrollEnabled={false}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </View>
  );
}

/* ---------- Pieces ---------- */

function PodiumCol({
  height,
  color,
  rank,
  big = false,
  avatarUri,
}: {
  height: number;
  color: string;
  rank: number;
  big?: boolean;
  avatarUri?: string;
}) {
  return (
    <View style={styles.podiumCol}>
      <View style={[styles.avatarWrap, big && { width: 56, height: 56 }]}>
        <Image
          source={
            avatarUri
              ? { uri: avatarUri }
              : require('../assets/images/default_profile.jpg')
          }
          style={styles.avatar}
        />
      </View>
      <View style={[styles.block, { height, backgroundColor: color }]}>
        <Text style={styles.blockNumber}>{rank}</Text>
      </View>
    </View>
  );
}

function Row({
  rank,
  name,
  events,
  color,
  avatarUri,
}: {
  rank: number;
  name: string;
  events: number;
  color: string;
  avatarUri?: string;
}) {
  return (
    <View style={[styles.row, shadow, { backgroundColor: color }]}>
      <Text style={styles.rowRank}>{rank}.</Text>
      <Image
        source={
          avatarUri
            ? { uri: avatarUri }
            : require('../assets/images/default-avatar.png')
        }
        style={styles.rowAvatar}
      />
      <Text style={styles.rowName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.rowEvents}>{events} events</Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const shadow =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      }
    : { elevation: 3 };

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DFDFDF',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  podiumWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingVertical: 8,
    marginTop: 6,
  },
  podiumCol: {
    alignItems: 'center',
    width: '28%',
  },
  block: {
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 8,
  },
  avatar: { width: '100%', height: '100%' },
  rule: {
    height: 1,
    backgroundColor: '#D6D6D6',
    marginVertical: 10,
  },
  row: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowRank: { width: 22, fontWeight: '600' },
  rowAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 10 },
  rowName: { flex: 1, fontWeight: '700' },
  rowEvents: { marginLeft: 10, fontWeight: '500' },
});