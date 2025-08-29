import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../constants/Colors';

const NewMessageScreen = () => {
  const { isDarkMode } = useUser();
  const router = useRouter();

  // Consistent color scheme using Colors.ts
  const backgroundColor = !isDarkMode ? Colors.light.background : Colors.dark.background;
  const textColor = !isDarkMode ? Colors.light.text : Colors.dark.text;
  const textInputColor = !isDarkMode ? Colors.light.textInput : Colors.dark.textInput;
  const placeholderColor = !isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText;
  const trackColor = !isDarkMode ? Colors.light.track : Colors.dark.track;
  
  // Additional theme colors for consistent styling
  const cardBackgroundColor = !isDarkMode ? Colors.light.textInput : Colors.dark.textInput;
  const borderColor = !isDarkMode ? '#e0e0e0' : Colors.dark.track;
  const sendButtonColor = '#5CAEF1'; // Keep brand color for send button
  const sendButtonTextColor = '#FFFFFF'; // White text on blue button

  const [recipient, setRecipient] = useState('');
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = () => {
    if (recipient.trim() && messageText.trim()) {
      // Placeholder for sending message
      console.log('Sending message to:', recipient, 'Message:', messageText);
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Card Container */}
      <View style={[styles.whiteBox, { backgroundColor: cardBackgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>New Message</Text>
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              { 
                backgroundColor: sendButtonColor,
                opacity: recipient.trim() && messageText.trim() ? 1 : 0.5 
              }
            ]}
            onPress={handleSendMessage}
            disabled={!recipient.trim() || !messageText.trim()}
          >
            <Text style={[styles.sendButtonText, { color: sendButtonTextColor }]}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Message Form */}
        <View style={styles.formContainer}>
          {/* To Field */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: textColor }]}>To:</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: textInputColor, 
                color: textColor,
                borderColor: borderColor
              }]}
              placeholder="Enter username or email"
              placeholderTextColor={placeholderColor}
              value={recipient}
              onChangeText={setRecipient}
            />
          </View>

          {/* Message Field */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: textColor }]}>Message:</Text>
            <TextInput
              style={[styles.messageInput, { 
                backgroundColor: textInputColor, 
                color: textColor,
                borderColor: borderColor
              }]}
              placeholder="Type your message here..."
              placeholderTextColor={placeholderColor}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  whiteBox: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
  },
  messageInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    height: 200,
    borderWidth: 1,
  },
});

export default NewMessageScreen;