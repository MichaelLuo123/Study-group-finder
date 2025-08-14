import { useUser } from '@/contexts/UserContext';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Bell, Settings } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EventCollapsible from '../../components/EventCollapsible';
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
  following: number;
  follwers: number;
}

interface Event {
  id: string;
  title: string;
  banner_color: number;
  description: string;
  location: string;
  date: string;
  time: string;
  creator_id: string;
  created_at: string;
  event_type: string;
  status: string;
  capacity: number;
  tags: string[];
  rsvped_count: number;
  rsvped_ids: string[];
  class: string;
  creator_name: string;
  creator_profile_picture: string;
  creator_username: string;
}

export default function Internal() {
  const router = useRouter();
  const { user: loggedInUser } = useUser();

  // Colors
  const {isDarkMode, toggleDarkMode} = useUser();
  const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background)
  const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text)
  const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput)
  const bannerColors = Colors.bannerColors

  // User
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const userId = '2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5'; // CHANGE THIS TO LOGGED IN USER !!!

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
  const [followers, setFollowers] = useState<string | null>(null);
  const [following, setFollowing] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('profile');

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
          setFollowers(userData.followers);
          setFollowing(userData.following);
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

  // Events
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);

  // Fetch all events from database and filter by creator_id
  useEffect(() => {
    const fetchAllEventsAndFilter = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events`);
        if (response.ok) {
          const eventsData = await response.json();
          setAllEvents(eventsData);
          
          // Filter events where creator_id matches userId
          const filteredEvents = eventsData.filter((event: Event) => event.creator_id === userId);
          setUserEvents(filteredEvents);
          
          console.log(`Found ${filteredEvents.length} events created by user ${userId}`);
        } else {
          console.error('Failed to fetch events data');
        }
      } catch (error) {
        console.error('Error fetching events data:', error);
      }
    };

    fetchAllEventsAndFilter();
  }, [userId]);

  const handleNavigation = (page: string) => {
    if (currentPage !== page) {
      setCurrentPage(page);
      if (page === 'listView') router.push('/listView');
      if (page === 'map') router.push('/Map/map');
      if (page === 'addEvent') router.push('/CreateEvent/createevent');
      if (page === 'bookmarks') router.push('/Saved/Saved');
      if (page === 'profile') router.push('/Profile/Internal');
    }
  };

  const getUserProfilePicture = async (userId: string): Promise<string | null> => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        return userData.profile_picture_url || null;
      }
    } catch (error) {
      console.error('Error fetching user profile picture:', error);
    }
    return null;
  };

  const [acceptedUserProfilePics, setAcceptedUserProfilePics] = useState<string[]>([]);

  const fetchAcceptedUserProfilePics = async (acceptedIds: string[]) => {
    try {
      // Take only first 3 IDs
      const firstThreeIds = acceptedIds.slice(0, 3);
      const profilePicPromises = firstThreeIds.map(async (userId) => {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          return userData.profile_picture_url || null;
        }
        return null;
      });
      
      const profilePics = await Promise.all(profilePicPromises);
      // Filter out any null results
      const validProfilePics = profilePics.filter(pic => pic !== null);
      setAcceptedUserProfilePics(validProfilePics);
    } catch (error) {
      console.error('Error fetching profile pictures:', error);
    }
  };

  return (
    <SafeAreaView style={{backgroundColor: backgroundColor, height: 800}}>
      <ScrollView>
        <View style={[styles.container, {backgroundColor: backgroundColor}]}>
          
          {/* Show message if no user is logged in */}
          {!loggedInUser && (
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, {color: textColor}]}>
                Please log in to view your profile
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
            <View style={styles.topButtonsContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Image source={require('../../assets/images/cramr_logo.png')} style={[styles.logoContainer]} />
            </TouchableOpacity>
            
            <View style={styles.notificationsAndSettingsButtonContainer}>
              <TouchableOpacity onPress={() => router.push('')}>
                <Bell size={24} color={textColor} style={styles.iconContainer} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/Settings/SettingsFrontPage')}>
                <Settings size={24} color={textColor} style={styles.iconContainer} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.bannerContainer, {backgroundColor: bannerColors[bannerColor || 1], marginTop: 20}]}>
            <View style={styles.leftOfBannerContainer}>
              <Image source={profilePicture ? {uri: profilePicture} : require('../../assets/images/default_profile.jpg')} style={styles.profilePictureContainer}/>
            </View>

            <View style={styles.rightOfBannerContainer}>
              <Text style={[styles.headerText, {color: textColor}]}>{name}</Text>
              <Text style={[styles.subheaderText, {color: textColor, marginTop: 3}]}>@{username}</Text>
              <TouchableOpacity onPress={() => router.push('/Follow/follow')}>
                <Text style={[styles.subheaderText, {color: textColor, marginTop: 3}]}>
                <Text style={[styles.subheaderBoldText, {color: textColor}]}>{followers}</Text> Followers
                <View style={styles.dotContainer}>
                  <View style={[styles.dot, {backgroundColor: textColor}]} />
                </View>
                <Text style={[styles.subheaderBoldText, {color: textColor}]}>{following}</Text> Following
                </Text>
              </TouchableOpacity>
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

          {bio !== null && (<View style={[styles.promptAnswerContainer, {marginTop: 10, backgroundColor: textInputColor}]}>
            <Text style={[styles.normalText, {color: textColor}]}>
              {bio}
            </Text>
          </View>)}

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
          

          <Text style={[styles.subheaderBoldText, {color: textColor, marginTop: 10}]}>{name}'s Events</Text>
          
          {userEvents.length === 0 ? (
            <Text style={styles.normalText}> No events </Text>
          ) : (
            userEvents.map((event) => (
              <EventCollapsible
                key={event.id} // Add this key prop
                title={event.title}
                bannerColor={bannerColors[bannerColor ? bannerColor : 1]}
                tag1={event.tags[0] != null ? event.tags[0] : null} // Also fixed this - should be event.tags[0], not EventSource.tags[0]
                tag2={event.tags[1] != null ? event.tags[1] : null} // Fixed this too
                tag3={event.tags[2] != null ? event.tags[2] : null} // Fixed this too
                ownerId = {event.creator_id}
                eventClass={event.class}
                location={event.location}
                date={event.date}
                time={event.time}
                numAttendees={event.rsvped_count}
                capacity={event.capacity}
                acceptedIds={event.rsvped_ids}
                light={true}
                isOwner={true}
                style={{marginBottom: 10}}
                isDarkMode={isDarkMode}
              />
            ))
          )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar - Same as Map */}
      <View style={[styles.bottomNav, { backgroundColor: true ? '#ffffff' : '#2d2d2d', borderTopColor: true ? '#e0e0e0' : '#4a5568' }]}> 
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleNavigation('listView')}
        >
          <MaterialCommunityIcons 
            name="clipboard-list-outline" 
            size={24} 
            color={true ? "#000000" : "#ffffff"} 
          />
          {currentPage === 'listView' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleNavigation('map')}
        >
          <Ionicons 
            name="map-outline" 
            size={24} 
            color={true ? "#000000" : "#ffffff"} 
          />
          {currentPage === 'map' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleNavigation('addEvent')}
        >
          <Feather 
            name="plus-square" 
            size={24} 
            color={true ? "#000000" : "#ffffff"} 
          />
          {currentPage === 'addEvent' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleNavigation('bookmarks')}
        >
          <Feather 
            name="bookmark" 
            size={24} 
            color={true ? "#000000" : "#ffffff"} 
          />
          {currentPage === 'bookmarks' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => handleNavigation('profile')}
        >
          <Ionicons 
            name="person-circle-outline" 
            size={24} 
            color={true ? "#000000" : "#ffffff"} 
          />
          {currentPage === 'profile' && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>
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

  container: {
    padding: 20,
    height: 1000
  },
  logoContainer: {
    height: 27,
    width: 120
  },
  topButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  notificationsAndSettingsButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 70,
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
  leftOfBannerContainer: {
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'center', // center vertically
    alignItems: 'center', // center horizontally
  },
  rightOfBannerContainer: {
    flex: 1, // takes up rest of space
    alignItems: 'center',
  },
  profilePictureContainer: {
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    zIndex: 1001,
    elevation: 5,
  },
  navButton: {
    alignItems: 'center',
    padding: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5caef1',
    position: 'absolute',
    bottom: -5,
  },
});