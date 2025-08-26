import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import React, { useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../constants/Colors';
// import NewMessageLogo from '../../assets/images/NewMessage.png';

interface MessagePreview {
  id: string;
  full_name: string;
  username: string;
  avatar?: string;
  lastMessage: string;
  timeAgo: string;
}

const Messages = () => {
  const { isDarkMode } = useUser();
  const router = useRouter();

  const backgroundColor = !isDarkMode ? Colors.light.background : Colors.dark.background;
  const textColor = !isDarkMode ? Colors.light.text : Colors.dark.text;
  const cardBackgroundColor = !isDarkMode ? '#fff' : '#2d2d2d';
  const borderColor = !isDarkMode ? '#e0e0e0' : '#4a5568';

  // Example static data for now
  const [messages, setMessages] = useState<MessagePreview[]>([
    {
      id: '1',
      full_name: 'Jessica Stacy',
      username: 'Jessica_Stacy',
      lastMessage: 'Hi',
      timeAgo: '1 day ago',
    },
    {
      id: '2',
      full_name: 'Jessica Williams',
      username: 'Jessica_W',
      lastMessage: 'Hey',
      timeAgo: '1 day ago',
    },
  ]);

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const renderMessageItem = ({ item }: { item: MessagePreview }) => (
    <TouchableOpacity
      style={[styles.messageContainer, { backgroundColor: cardBackgroundColor, borderColor }]}
      onPress={() => router.push('/Messages/chat' as any)}
    >
      <Image 
        source={require('../../assets/images/avatar_1.png')} 
        style={styles.avatar}
      />
      <View style={styles.messageInfo}>
        <Text style={[styles.name, { color: textColor }]}>{item.full_name}</Text>
        <Text style={[styles.timeAgo, { color: textColor }]}>{item.timeAgo}</Text>
      </View>
      <TouchableOpacity
        onPress={() => removeMessage(item.id)}
        style={styles.removeButton}
      >
        <Ionicons name="close" size={22} color="#E36062" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/Messages/new' as any)}
        >
          <Image
            source={require('../../assets/images/NewMessage.png')}
            style={[styles.createImage, { width: 27, height: 27}]} // adjust width/height here
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>



      {/* Message List */}
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              No messages yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ---------- Header ----------
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // needed for absolute positioning of the button
    paddingHorizontal: 20,
  },
  
  headerTitleWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    top: '55%', 
  },
  
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  
  createButton: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -12 }], // vertically center the button
  },
  createImage: {
    width: 14,   // default size, you can override inline like above
    height: 14,
  },
  
  

  // ---------- Message Item ----------
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  messageInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  timeAgo: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  removeButton: {
    padding: 5,
    
  },

  // ---------- Empty State ----------
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});

export default Messages;