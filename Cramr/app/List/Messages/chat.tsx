import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// import SendLogo from '../../assets/images/Send.png';
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

  const backgroundColor = !isDarkMode ? Colors.light.background : Colors.dark.background;
  const textColor = !isDarkMode ? Colors.light.text : Colors.dark.text;
  const textInputColor = !isDarkMode ? Colors.light.textInput : Colors.dark.textInput;
  const placeholderColor = !isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText;

  const [messageText, setMessageText] = useState('');
  const [messages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi',
      isFromMe: false,
      timestamp: '1 day ago'
    },
    {
      id: '2',
      text: 'Hi',
      isFromMe: true,
      timestamp: '1 day ago'
    }
  ]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Placeholder for sending message
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
        item.isFromMe ? styles.myMessageBubble : styles.theirMessageBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isFromMe ? styles.myMessageText : styles.theirMessageText
        ]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.chatHeader}>
  {/* White Bubble Around Name & Username */}
  <View style={styles.chatHeaderBubble}>
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
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      />

      {/* Message Input */}
<View style={[styles.messageInputWrapper, { backgroundColor: textInputColor }]}>
  <TextInput
    style={[styles.messageInput, { color: textColor }]}
    placeholder="Send a message..."
    placeholderTextColor={placeholderColor}
    value={messageText}
    onChangeText={setMessageText}
    multiline
  />
  
  <TouchableOpacity 
  style={styles.messageSendButton}
  onPress={handleSendMessage}
>
  <Image
    source={require('../../../assets/images/Send.png')}
    style={[styles.sendButtonImage, { width: 24, height: 24 }]} // adjust size
    resizeMode="contain"
  />
</TouchableOpacity>


</View>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatHeader: {
    width: '100%',
    paddingHorizontal: 15,      // leaves space for rounded corners
    paddingVertical: 10,
    alignItems: 'center',       // centers the bubble horizontally
    justifyContent: 'center',
  },
  
  chatHeaderBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',              // full width minus parent padding
    justifyContent: 'flex-start',  // align content to the left
  },
  
  chatHeaderInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',   // aligns text to the left of avatar
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
    backgroundColor: '#5CAEF1',
  },
  theirMessageBubble: {
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  myMessageText: {
    color: '#333',
  },
  theirMessageText: {
    color: '#333',
  },
  messageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',  // vertically center contents
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 16,
    borderRadius: 10,
    backgroundColor: '#fff',  // or textInputColor
  },
  
  messageInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    paddingVertical: 8,      // ensures space for multiline
    paddingRight: 12,
  },
  
  
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,

  },
  // messageInput: {
  //   flex: 1,
  //   borderRadius: 20,
  //   paddingHorizontal: 16,
  //   paddingVertical: 10,
  //   maxHeight: 100,
  //   marginRight: 10,
  //   fontSize: 16,
  //   fontFamily: 'Poppins-Regular',
  // },
  messageSendButton: {
    width: 40,           // keeps a reasonable clickable area
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    // removed backgroundColor and borderRadius
  },
  
  sendButtonImage: {
    width: 24,
    height: 24,
  },
  
  
});

export default ChatScreen;
