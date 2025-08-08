import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Dropdown from '../../components/Dropdown';
import ImageUpload from '../../components/ImageUpload';
import Slider from '../../components/Slider';
import { Colors } from '../../constants/Colors';

// Define user interface
interface User {
  id: string;
  profile_picture_url?: string;
  banner_color?: number;
  name?: string;
  username?: string;
  school?: string;
  major?: string;
  class_level?: string;
  pronouns?: string;
  is_transfer?: boolean;
  bio?: string;
  prompt_1: string;
  prompt_1_answer: string;
  prompt_2: string;
  prompt_2_answer: string;
  prompt_3: string;
  prompt_3_answer: string;
}

export default function Profile() {
  const router = useRouter();

  // Colors
  const backgroundColor = (true ? Colors.light.background : Colors.dark.background)
  const textColor = (true ? Colors.light.text : Colors.dark.text)
  const textInputColor = (true ? Colors.light.textInput : Colors.dark.textInput)
  const bannerColors = Colors.bannerColors

  // User
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user: loggedInUser } = useUser();

  // Form state;
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [bannerColor, setBannerColor] = useState<number | null>(null)
  const [name, setName] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [school, setSchool] = useState<string>();
  const [major, setMajor] = useState<string>();
  const [classLevel, setClassLevel] = useState<string>();
  const [pronouns, setPronouns] = useState<string>();
  const [isTransfer, setIsTransfer] = useState<boolean>(false);
  const [bio, setBio] = useState<string>();

  const prompts = [
    // study habits and preferences
    { label: 'The best study spot is...', value: "first" },
    { label: 'The best study method is...', value: "second" },
    { label: 'I focus best when...', value: "third" },
    { label: 'My availability for study sessions is...', value: "fourth" },
    // academic info
    { label: 'My current classes are...', value: "fifth" },
    { label: 'The subject I need the most help with is...', value: "sixth" },
    // personality
    { label: 'Outside of studying, I love...', value: "seventh" },
    { label: 'My go-to study snack is...', value: "eigth" },
    { label: 'A fun fact about me is...', value: "ninth" },
    { label: 'When I’m not studying, you can find me...', value: "tenth" },
  ];
  const [prompt1, setPrompt1] = useState<string | null>(null);
  const [prompt1Answer, setPrompt1Answer] = useState<string | null>(null);
  const [prompt2, setPrompt2] = useState<string | null>(null);
  const [prompt2Answer, setPrompt2Answer] = useState<string | null>(null);
  const [prompt3, setPrompt3] = useState<string | null>(null);
  const [prompt3Answer, setPrompt3Answer] = useState<string | null>(null);

  // pull user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      // Only fetch if we have a valid logged-in user
      if (!loggedInUser?.id) {
        return; // Don't fetch if no logged-in user
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${loggedInUser.id}`);
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // Populate form fields with database data
          setProfilePicture(userData.profile_picture_url || null);
          setBannerColor(Number(userData.banner_color) || null);
          setName(userData.full_name);
          setUsername(userData.username);
          setSchool(userData.school || null);
          setMajor(userData.major || null);
          setClassLevel(userData.year || null);
          setPronouns(userData.pronouns || null);
          setIsTransfer(userData.transfer || false);
          setBio(userData.bio || null);
          setPrompt1(userData.prompt_1 || null);
          setPrompt1Answer(userData.prompt_1_answer || null);
          setPrompt2(userData.prompt_2 || null);
          setPrompt2Answer(userData.prompt_2_answer || null);
          setPrompt3(userData.prompt_3 || null);
          setPrompt3Answer(userData.prompt_3_answer || null);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [loggedInUser?.id]);

  // Save updated profile to database
  const handleSave = async () => {
    try {
      const updatedData = {
        profile_picture_url: profilePicture,
        banner_color: bannerColor,
        full_name: name,
        username: username,
        school: school,
        major: major,
        year: classLevel,
        pronouns: pronouns,
        transfer: isTransfer,
        bio: bio,
        prompt_1: prompt1,
        prompt_1_answer: prompt1Answer,
        prompt_2: prompt2,
        prompt_2_answer: prompt2Answer,
        prompt_3: prompt3,
        prompt_3_answer: prompt3Answer,
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${loggedInUser?.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        console.log('Profile updated successfully');
        // Optionally show success message or navigate back
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={[styles.container, {backgroundColor: backgroundColor}]}>
          
          {/* Show message if no user is logged in */}
          {!loggedInUser && (
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, {color: textColor}]}>
                Please log in to edit your profile
              </Text>
            </View>
          )}

          {/* Show loading state */}
          {isLoading && (
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, {color: textColor}]}>
                Loading profile...
              </Text>
            </View>
          )}

          {/* Show profile content only if user is logged in and not loading */}
          {loggedInUser && !isLoading && (
            <>
              <TouchableOpacity onPress={() => router.back()}>
                <Image source={require('../../assets/images/Arrow_black.png')} style={styles.iconContainer} />
              </TouchableOpacity>

              <Text style={[styles.headerText, {color: textColor , textAlign: 'center', marginTop: 10}]}>
                Profile
              </Text>

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}>
            Picture
          </Text>
          <ImageUpload 
            value={profilePicture}
            onChangeImage={setProfilePicture}
          />

          <Text style={[styles.subheaderText, {color: textColor , marginTop: 10, marginBottom: 5}]}>
            Banner
          </Text>
            <View style={styles.bannerColorContainer}>
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: bannerColors[0]}, bannerColor === 1 && styles.ring]}
              onPress={() => setBannerColor(1)} 
            />
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: bannerColors[1]}, bannerColor === 2 && styles.ring]} 
              onPress={() => setBannerColor(2)} 
            />
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: bannerColors[2]}, bannerColor === 3 && styles.ring]} 
              onPress={() => setBannerColor(3)} 
            />
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: bannerColors[3]}, bannerColor === 4 && styles.ring]} 
              onPress={() => setBannerColor(4)} 
            />
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: bannerColors[4]}, bannerColor === 5 && styles.ring]} 
              onPress={() => setBannerColor(5)} 
            />
            </View>

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Name 
          </Text>
          <TextInput 
            style={[styles.bodyText, styles.textInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter your name."
            value={name}
            onChangeText={setName}
            textAlign="left"
            textAlignVertical="top" 
            maxLength={50}
            numberOfLines={1}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Username
          </Text>
          <TextInput 
            style={[styles.bodyText, styles.textInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter your username."
            value={username}
            onChangeText={setUsername}
            textAlign="left"
            textAlignVertical="top" 
            maxLength={50} 
            numberOfLines={1}
          />
          
          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            School
          </Text>
          <TextInput 
            style={[styles.bodyText, styles.textInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter your school."
            value={school}
            onChangeText={setSchool}
            textAlign="left"
            textAlignVertical="top" 
            maxLength={50}
            numberOfLines={1}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Major
          </Text>
          <TextInput 
            style={[styles.bodyText, styles.textInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter your major."
            value={major}
            onChangeText={setMajor}
            textAlign="left"
            textAlignVertical="top"
            maxLength={50}
            numberOfLines={1}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Class Level
          </Text>
          <TextInput 
            style={[styles.bodyText, styles.textInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter your class level."
            value={classLevel}
            onChangeText={setClassLevel}
            textAlign="left"
            textAlignVertical="top"
            maxLength={25}
            numberOfLines={1}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Pronouns
          </Text>
          <TextInput 
            style={[styles.bodyText, styles.textInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter your pronouns."
            value={pronouns}
            onChangeText={setPronouns}
            textAlign="left"
            textAlignVertical="top"
            maxLength={25}
            numberOfLines={1}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Transfer?
          </Text>
          <Slider
            leftLabel="Yes"
            rightLabel="No"
            width={125}
            value={isTransfer}
            onChangeSlider={setIsTransfer}
            lightMode={true}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Bio
          </Text>
          <TextInput
            style={[styles.bodyText, styles.largeTextInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter bio."
            value={bio}
            onChangeText={setBio}
            textAlign="left"
            textAlignVertical="top"
            maxLength={150}
            multiline={true}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}>
            Prompts
          </Text>
          < Dropdown
            options={prompts.filter(option => option.label !== prompt1 && option.label !==prompt2 && option.label !== prompt3)}
            onSelect={(value) => setPrompt1(value)}
            style = {{marginLeft: 20, marginRight: 20}}
            option1={prompt1}
            onChangeOption1={setPrompt1}
            option1Answer={prompt1Answer}
            onChangeOption1Answer={setPrompt1Answer}
            option2={prompt2}
            onChangeOption2={setPrompt2}
            option2Answer={prompt2Answer}
            onChangeOption2Answer={setPrompt2Answer}
            option3={prompt3}
            onChangeOption3={setPrompt3}
            option3Answer={prompt3Answer}
            onChangeOption3Answer={setPrompt3Answer}
          />

          <TouchableOpacity 
            style={[styles.buttonContainer, {marginTop: 20}]}
            onPress={handleSave}
          >
            <Text style={[styles.subheaderText, {color: textColor}]}>Save</Text>
          </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  subheaderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  bodyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  captionText: {
    fontFamily: 'Poppins-Light',
    fontSize: 12,
  },
  container: {
    padding: 20,
    height: 2000,
  },
  iconContainer: {
    width: 25,
    height: 25,
  },
  bannerColorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: 175
  },
  bannerColor: {
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  ring: {
    borderWidth: 2,
    borderColor: '#5CAEF1', // White ring around the selected color
  },
  textInputContainer: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    padding: 10
  },
  largeTextInputContainer: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    
    padding: 10
  },
  buttonContainer: {
    width: '100%',
    height: 45,
    borderRadius: 10,
    backgroundColor: '#5CAEF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsibleContainer: {
    width: '100%',
    backgroundColor: '#ee5e5e',

  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
});