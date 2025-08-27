import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../constants/Colors';

interface Message {
  id: string;
  text: string;
  isFromMe: boolean;
  timestamp: string;
}

const ChatScreen = () => {
  const { isDarkMode } = useUser();
  const router = useRouter();

  // Consistent color scheme using Colors.ts
  const backgroundColor = !isDarkMode ? Colors.light.background : Colors.dark.background;
  const textColor = !isDarkMode ? Colors.light.text : Colors.dark.text;
  const textInputColor = !isDarkMode ? Colors.light.textInput : Colors.dark.textInput;
  const placeholderColor = !isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText;
  const trackColor = !isDarkMode ? Colors.light.track : Colors.dark.track;
  
  // Additional theme colors for chat bubbles and header
  const headerBackgroundColor = !isDarkMode ? Colors.light.textInput : Colors.dark.textInput;
  const myMessageBubbleColor = '#5CAEF1'; // Keep brand color for sent messages
  const theirMessageBubbleColor = trackColor; // Use theme track color for received messages
  const myMessageTextColor = '#FFFFFF'; // White text on blue bubble
  const theirMessageTextColor = textColor; // Theme text color for received messages

  const [messageText, setMessageText] = useState('');
  const [messages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi there! How are you doing?',
      isFromMe: false,
      timestamp: '1 day ago'
    },
    {
      id: '2',
      text: 'Hey! I\'m doing great, thanks for asking. How about you?',
      isFromMe: true,
      timestamp: '1 day ago'
    },
    {
      id: '3',
      text: 'That\'s wonderful to hear! I\'m doing well too.',
      isFromMe: false,
      timestamp: '1 day ago'
    }
  ]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isFromMe ? styles.myMessageContainer : styles.theirMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        item.isFromMe 
          ? [styles.myMessageBubble, { backgroundColor: myMessageBubbleColor }]
          : [styles.theirMessageBubble, { backgroundColor: theirMessageBubbleColor }]
      ]}>
        <Text style={[
          styles.messageText,
          { color: item.isFromMe ? myMessageTextColor : theirMessageTextColor }
        ]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={[styles.chatHeader, { backgroundColor }]}>
          <View style={[styles.chatHeaderBubble, { backgroundColor: headerBackgroundColor }]}>
            <Image 
              source={require('../../../assets/images/avatar_1.png')} 
              style={styles.chatProfilePicture}
            />
            <View style={styles.chatHeaderInfo}>
              <Text style={[styles.chatName, { color: textColor }]}>
                Jessica Stacy
              </Text>
              <Text style={[styles.chatUsername, { color: placeholderColor }]}>
                @Jessica_Stacy
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={[styles.messagesList, { backgroundColor }]}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Message Input */}
        <View style={[styles.messageInputContainer, { backgroundColor }]}>
          <View style={[styles.messageInputWrapper, { backgroundColor: textInputColor }]}>
            <TextInput
              style={[styles.messageInput, { color: textColor }]}
              placeholder="Send a message..."
              placeholderTextColor={placeholderColor}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity 
              style={styles.messageSendButton}
              onPress={handleSendMessage}
            >
              <Ionicons name="send" size={20} color={myMessageBubbleColor} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header Styles
  chatHeader: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  chatHeaderBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'flex-start',
  },
  
  chatHeaderInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  
  chatProfilePicture: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginRight: 12,
  },

  chatName: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
  },

  chatUsername: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },

  // Messages Styles
  messagesList: {
    flex: 1,
  },

  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  messageContainer: {
    marginVertical: 5,
  },

  myMessageContainer: {
    alignItems: 'flex-end',
  },

  theirMessageContainer: {
    alignItems: 'flex-start',
  },

  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },

  myMessageBubble: {
    // backgroundColor set dynamically
  },

  theirMessageBubble: {
    // backgroundColor set dynamically
  },

  messageText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },

  // Input Styles
  messageInputContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
  },

  messageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },

  messageInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    padding: 5,
  },

  messageSendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;