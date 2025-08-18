import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from '../constants/Colors';

interface ImageUploadProps {
  value?: string | null; // URL or local path
  onChangeImage: (uri: string | null) => void; // Callback to return the URI
  style?: object;
  isDarkMode: boolean;
}

export default function ImageUpload({value, onChangeImage, style, isDarkMode}: ImageUploadProps) {
  const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background)
  
  const [image, setImage] = useState<string | null>(value || null);
  const [error, setError] = useState(null);

  // Update local state when value prop changes
  useEffect(() => {
    setImage(value || null);
  }, [value]);

  // Memoize the callback to prevent unnecessary re-renders
  const handleImageChange = useCallback((newImage: string | null) => {
    onChangeImage(newImage);
  }, [onChangeImage]);

  // Call onChangeImage whenever image changes
  useEffect(() => {
    handleImageChange(image);
  }, [image, handleImageChange]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", `Sorry, we need camera roll permission to upload images.`);
    } else {
      const result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setError(null);
      }
    }
  };

  const removeImage = () => {
    setImage(null); // Set to null instead of default image path
  };
  
  // Function to determine image source
  const getImageSource = () => {
    if (image) {
      // If it's a URL (starts with http) or local URI, use { uri: image }
      if (image.startsWith('http') || image.startsWith('file://')) {
        return { uri: image };
      }
      // For any other string, treat as URI
      return { uri: image };
    }
    // Fallback to default image when no image is set
    return require('../assets/images/default_profile.jpg');
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={getImageSource()}
          style={styles.profilePicture}
        />
      </TouchableOpacity>
      
      {/* Show remove button only if there's a selected image */}
      {image && (
        <TouchableOpacity onPress={removeImage} style={[styles.removeButton, {backgroundColor: backgroundColor}]}>
          <Text style={[styles.removeButtonText]}>×</Text>
        </TouchableOpacity>
      )}
      
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