import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

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

export default function ProfilePage() {
  const router = useRouter();

  // Colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textInputColor = useThemeColor({}, 'textInput');
  const bannerColors = ['#AACC96', '#F4BEAE', '#52A5CE', '#FF7BAC', '#D3B6D3']

  // User
  const [user, setUser] = useState<User | null>(null);
  const userId = '2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5';

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
  const [prompt1, setPrompt1] = useState<string | null>(null);
  const [prompt1Answer, setPrompt1Answer] = useState<string | null>(null);
  const [prompt2, setPrompt2] = useState<string | null>(null);
  const [prompt2Answer, setPrompt2Answer] = useState<string | null>(null);
  const [prompt3, setPrompt3] = useState<string | null>(null);
  const [prompt3Answer, setPrompt3Answer] = useState<string | null>(null);


  // pull user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}`);
        
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
      }
    };

    fetchUserData();
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={[styles.container, {backgroundColor: backgroundColor}]}>

          <View style={styles.topButtonsContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Image source={require('../../assets/images/Arrow_black.png')} style={[styles.iconContainer]} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/Settings/SettingsFrontPage')}>
              <Image source={require('../../assets/images/settings.png')} style={styles.iconContainer} />
            </TouchableOpacity>
          </View>

          <View style={[styles.bannerContainer, {backgroundColor: bannerColors[bannerColor || 1], marginTop: 10}]}>
            <View style={styles.leftBannerContainer}>
              <Image source={profilePicture ? {uri: profilePicture} : require('../../assets/images/default_profile.jpg')} style={styles.profilePic}/>
            </View>

            <View style={styles.rightBannerContainer}>
              <Text style={[styles.headerText, {color: textColor}]}>{name}</Text>
              <Text style={[styles.subheaderText, {color: textColor, marginTop: 3}]}>@{username}</Text>
              <Text style={[styles.subheaderText, {color: textColor, marginTop: 3}]}>
                <Text style={[styles.subheaderBoldText, {color: textColor}]}>5</Text> Followers
                <View style={styles.dotContainer}>
                  <View style={[styles.dot, {backgroundColor: textColor}]} />
                </View>
                <Text style={[styles.subheaderBoldText, {color: textColor}]}>5</Text> Following
              </Text>
              <View style={[styles.tagContainer, {marginTop: 3}]}>
                <View style={[styles.tag, {backgroundColor: textInputColor}]}>
                  <Text style={[styles.normalText, {color: textColor}]}>
                    {school}
                  </Text>
                </View>
                <View style={[styles.tag, {backgroundColor: textInputColor}]}>
                  <Text style={[styles.normalText, {color: textColor}]}>
                    {major}
                  </Text>
                </View>
                <View style={[styles.tag, {backgroundColor: textInputColor}]}>
                  <Text style={[styles.normalText, {color: textColor}]}>
                    {classLevel}
                  </Text>
                </View>
                <View style={[styles.tag, {backgroundColor: textInputColor}]}>
                  <Text style={[styles.normalText, {color: textColor}]}>
                    {pronouns}
                  </Text>
                </View>
                {isTransfer && (<View style={[styles.tag, {backgroundColor: textInputColor}]}>
                  <Text style={[styles.normalText, {color: textColor}]}>
                    Transfer
                  </Text>
                </View>)}
              </View>
            </View>
          </View>

          {prompt1 !== null && (<View style={[styles.promptContainer, {marginTop: 10}]}>
            <Text style={[styles.subheaderBoldText, {color: textColor}]}>{prompt1}</Text>
            {prompt1Answer !== null && (<View style={[styles.promptAnswerContainer, {marginTop: 5, backgroundColor: textInputColor}]}>
              <Text style={[styles.normalText, {color: textColor}]}>
                {prompt1Answer}
              </Text>
            </View>)}
          </View>)}

          {prompt2 !== null && (<View style={[styles.promptContainer, {marginTop: 10}]}>
            <Text style={[styles.subheaderBoldText, {color: textColor}]}>{prompt2}</Text>
            {prompt2Answer !== null && (<View style={[styles.promptAnswerContainer, {marginTop: 5, backgroundColor: textInputColor}]}>
              <Text style={[styles.normalText, {color: textColor}]}>
                {prompt2Answer}
              </Text>
            </View>)}
          </View>)}

          {prompt3 !== null && (<View style={[styles.promptContainer, {marginTop: 10}]}>
            <Text style={[styles.subheaderBoldText, {color: textColor}]}>{prompt3}</Text>
            {prompt3Answer !== null && (<View style={[styles.promptAnswerContainer, {marginTop: 5, backgroundColor: textInputColor}]}>
              <Text style={[styles.normalText, {color: textColor}]}>
                {prompt3Answer}
              </Text>
            </View>)}
          </View>)}
          
          <Text style={[styles.subheaderBoldText, {color: textColor, marginTop: 10}]}>Upcoming Events</Text>
          <View style={styles.upcomingEventsContainer}>
            <View style={styles.eventsContainer}>
              <View style={styles.event}>
                <Text style={styles.normalText}>
                    In-N-Out Study Session!
                  </Text>
                <View style={styles.iconTextContainer}>
                  <Image source={require('../../assets/images/book.png')} style={styles.eventIcon}/>
                  <Text style={styles.smallText}> CSE 101 </Text>
                </View>
                <View style={styles.iconTextContainer}>
                  <Image source={require('../../assets/images/location.png')} style={styles.eventIcon}/>
                  <Text style={styles.smallText}> 2910 Damon Ave, San Diego </Text>
                </View>
                <View style={styles.iconTextContainer}>
                  <Image source={require('../../assets/images/calendar.png')} style={styles.eventIcon}/>
                  <Text style={styles.smallText}> July 10th, 2025 </Text>
                </View>
                <View style={styles.iconTextContainer}>
                  <Image source={require('../../assets/images/clock.png')} style={styles.eventIcon}/>
                  <Text style={styles.smallText}> 6:00 PM - 11:00 PM </Text>
                </View>
                <View style={styles.iconTextContainer}>
                  <Image source={require('../../assets/images/person.png')} style={styles.eventIcon}/>
                  <Text style={styles.smallText}> 7/8 </Text>
                  <Image source={require('../../assets/images/avatar_1.png')} style={styles.smallProfilePic}/>
                  <Image source={require('../../assets/images/avatar_2.png')} style={styles.smallProfilePic}/>
                  <Image source={require('../../assets/images/avatar_3.png')} style={styles.smallProfilePic}/>
                  <Text style={styles.smallText}> +4 </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  // Text
  headerText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  subheaderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  subheaderBoldText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  normalText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  normalBoldText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  smallText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    flexWrap: 'wrap',
  },


  container: {
    padding: 20
  },
  topButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  iconContainer: {
    width: 25,
    height: 25,
  },
  bannerContainer: {
    // shadow for android
    elevation: 3,
    // shadow for ios
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 25,

    // internal
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  leftBannerContainer: {
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'center', // center vertically
    alignItems: 'center', // center horizontally
  },
  rightBannerContainer: {
    flex: 1, // takes up rest of space
    alignItems: 'center',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  dotContainer: {
    paddingVertical: 3,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    borderRadius: 25,
    marginTop: 2,
    marginBottom: 2,
    marginLeft: 2, // space between tags
    marginRight: 2, // space between tags
    padding: 5,
  },
  promptContainer: {
    flexDirection: 'column',
  },
  promptAnswerContainer: {
    borderRadius: 15,
    padding: 10,
    
    // shadow for android
    elevation: 3,
    // shadow for ios
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  upcomingEventsContainer: {
    flexDirection: 'column',
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 10,
  },
  eventsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  event: {
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    width: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 10,
    // shadow for android
    elevation: 3,
    // shadow for ios
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventIcon: {
    width: 20,
    height: 20,
  },
  iconTextContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  smallProfilePic: {
    width: 20,
    height: 20,
    borderRadius: 50,
    marginLeft: 2
  },

  pastEventsContainer: {
    flexDirection: 'column',
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 10,
  },
});