import { useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, IconButton, TextInput, useTheme } from 'react-native-paper';
import EventList from './eventList';


export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Image
          source={require('./assets/images/finalCramrLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      ),
      headerRight: () => (
        <Button
          mode="contained"
          compact
          buttonColor="#5caef1"
          textColor="black"
          style={styles.addButton}
          onPress={() => {}}
        >
          Add Event
        </Button>
      ),
      headerTitle: '', // Hide "index"
    });
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* Search Bar + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <TextInput
            mode="flat"
            placeholder="Search"
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
        </View>
        <IconButton
          icon="filter"
          size={28}
          onPress={() => {}}
          style={styles.filterButton}
          iconColor="#000"
        />
      </View>

      {<EventList />}

      {/* Placeholder Footer */}
      <View style={styles.footerPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  logo: {
    height: 100,
    width: 100,
    marginLeft: 12,
  },
  addButton: {
    marginRight: 8,
    borderRadius: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: '#e5e5e5',
    borderRadius: 25,
    marginRight: 8,
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: 'transparent',
    height: 44,
    fontSize: 16,
    paddingLeft: 0,
  },
  filterButton: {
    backgroundColor: '#e5e5e5',
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerPlaceholder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FBE6FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});