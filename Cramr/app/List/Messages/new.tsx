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

  const backgroundColor = !isDarkMode ? Colors.light.background : Colors.dark.background;
  const textColor = !isDarkMode ? Colors.light.text : Colors.dark.text;
  const textInputColor = !isDarkMode ? Colors.light.textInput : Colors.dark.textInput;
  const placeholderColor = !isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText;

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
    <SafeAreaView style={[styles.container, { backgroundColor: '#F8F8F8' }]}>
      {/* White Box Container */}
      <View style={styles.whiteBox}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>New Message</Text>
          <TouchableOpacity 
            style={[styles.sendButton, { opacity: recipient.trim() && messageText.trim() ? 1 : 0.5 }]}
            onPress={handleSendMessage}
            disabled={!recipient.trim() || !messageText.trim()}
          >
            <Text style={[styles.sendButtonText, { color: textColor }]}>Send</Text>
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
                color: textColor 
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
                color: textColor 
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
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#5CAEF1',
  },
  sendButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
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
  },
  messageInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    height: 200,
  },
});

export default NewMessageScreen;
