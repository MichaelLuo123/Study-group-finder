import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useThemeColor } from '../hooks/useThemeColor';

export default function ImageUpload() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textInputColor = useThemeColor({}, 'textInput');

  // Stores the selected image URI, starts as null
  const [file, setFile] = useState<string | null>(null);
  // Stores any error message
  const [error, setError] = useState(null);
  
  // Function to pick an image from the device's media library
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      // If permission is denied, show an alert
      Alert.alert("Permission Denied", `Sorry, we need camera roll permission to upload images.`);
    } else {
      // Launch the image library and get the selected image
      const result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        // If an image is selected (not canceled), update the file state variable
        setFile(result.assets[0].uri);
        // Clear any previous errors
        setError(null);
      }
    }
  };

  // Function to remove the selected image
  const removeImage = () => {
    setFile(null);
  };

  return (
    <View style={styles.container}>
      {/* Button to choose an image */}
      <TouchableOpacity onPress={pickImage}>
        {/* Show selected image if available, otherwise show default */}
        <Image
          source={file ? { uri: file } : require('../assets/images/default_profile.jpg')}
          style={styles.profilePicture}
        />
      </TouchableOpacity>
      
      {/* Show remove button only if there's a selected image */}
      {file && (
        <TouchableOpacity onPress={removeImage} style={[styles.removeButton, {backgroundColor: backgroundColor}]}>
          <Text style={[styles.removeButtonText]}>×</Text>
        </TouchableOpacity>
      )}

      {/* Display error message if there's an error */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 75,
    height: 75,
  },
  header: {
    fontSize: 20,
    marginBottom: 16,
  },
  errorText: {
    color: "red",
    marginTop: 16,
  },
  profilePicture: {
    width: 75,
    height: 75,
    borderRadius: 50,
  },
  removeButton: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 25,
    height: 25,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#E36062',
    fontWeight: 'bold'
  }
});