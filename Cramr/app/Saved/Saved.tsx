import EventCollapsible from '@/components/EventCollapsible';
import { useUser } from '@/contexts/UserContext';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Slider from '../../components/Slider';
import { Colors } from '../../constants/Colors';

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
    saved_ids: string[]
    class: string;
    creator_profile_picture: string;
}

export default function Saved() {
    const router = useRouter();

    // Colors
    const {isDarkMode, toggleDarkMode, user} = useUser();
    const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background)
    const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text)
    const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput)
    const bannerColors = ['#AACC96', '#F4BEAE', '#52A5CE', '#FF7BAC', '#D3B6D3']

    const [isSwitch, setIsSwitch] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState('bookmarks');
    
    // User
    const userId = user?.id;
    
    // Debug logging
    console.log('Saved component - User context:', {
        user,
        userId,
        userEmail: user?.email,
        userName: user?.username,
        isLoggedIn: !!user
    });
    
    // Additional debugging for environment variables
    console.log('Environment variables:', {
        backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL,
        nodeEnv: process.env.NODE_ENV
    });

    // Redirect to login if not logged in
    useEffect(() => {
        if (!user) {
            router.push('/Login/Loginscreen');
        }
    }, [user, router]);

    // Events
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [rsvpedEvents, setRsvpedEvents] = useState<Event[]>([]);
    const [savedEvents, setSavedEvents] = useState<Event[]>([]);

    // Show loading or redirect if user not loaded
    if (!user) {
        return null; // Will redirect in useEffect
    }

    // 1. Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data: Event[] = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      }
    };

    fetchEvents();
  }, []);

  // 2. Filter RSVP'd and saved events from the fetched events
  useEffect(() => {
    if (!events.length || !userId) return;

    // Filter events where the current user is in rsvped_ids
    const rsvped = events.filter(event => 
      event.rsvped_ids && event.rsvped_ids.includes(userId)
    );
    setRsvpedEvents(rsvped);

    // Filter events where the current user is in saved_ids
    const saved = events.filter(event => 
      event.saved_ids && event.saved_ids.includes(userId)
    );
    setSavedEvents(saved);

    setLoading(false);
  }, [events, userId]);

  // Function to refresh events
  const refreshEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data: Event[] = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    }
  };

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

    return (
        <SafeAreaView style={{backgroundColor: backgroundColor, height: 800}}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refreshEvents}
                        colors={[isDarkMode ? '#ffffff' : '#000000']}
                        tintColor={isDarkMode ? '#ffffff' : '#000000'}
                    />
                }
            >
                <View style={{padding: 20, backgroundColor: backgroundColor}}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Image source={require('../../assets/images/cramr_logo.png')} style={[styles.logoContainer]} />
                    </TouchableOpacity>
                
                    <View style={{alignItems: 'center', marginTop: 20, marginBottom: 20}}>
                        <Slider
                            leftLabel='RSVPed'
                            rightLabel='Saved'
                            width={180}
                            onChangeSlider={setIsSwitch}
                            lightMode={!isDarkMode}
                        />
                    </View>

                    {isSwitch === false && (
                        rsvpedEvents.length === 0 ? 
                        (<Text style={[styles.normalText, {color: textColor}]}> No RSVPed events... </Text>) 
                        : 
                        (rsvpedEvents.map((event) => (
                            <EventCollapsible
                                key={event.id}
                                eventId={event.id}
                                title={event.title}
                                bannerColor={bannerColors[event.banner_color || 1]}
                                ownerId={event.creator_id}
                                ownerProfile={event.creator_profile_picture || 'https://via.placeholder.com/30'}
                                tag1={event.tags[0] || null}
                                tag2={event.tags[1] || null}
                                tag3={event.tags[2] || null}
                                subject={event.class}
                                location={event.location}
                                date={event.date}
                                time={event.time}
                                rsvpedCount={event.rsvped_count}
                                capacity={event.capacity}
                                isOwner={false}
                                isSaved={event.saved_ids && event.saved_ids.includes(userId)}
                                onSavedChange={async (saved) => {
                                    if (!userId) return;
                                    try {
                                        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events`;
                                        const method = saved ? 'POST' : 'DELETE';
                                        const body = saved ? { event_id: event.id } : undefined;
                                        const deleteUrl = saved ? url : `${url}/${event.id}`;
                                        
                                        const response = await fetch(deleteUrl, { 
                                            method, 
                                            headers: { 'Content-Type': 'application/json' },
                                            body: body ? JSON.stringify(body) : undefined
                                        });
                                        if (!response.ok) throw new Error(`Failed to ${saved ? 'save' : 'unsave'} event`);
                                        refreshEvents();
                                    } catch (error) {
                                        console.error(`Error ${saved ? 'saving' : 'unsaving'} event:`, error);
                                    }
                                }}
                                isRsvped={event.rsvped_ids && event.rsvped_ids.includes(userId)}
                                onRsvpedChange={async (rsvped) => {
                                    if (!userId) return;
                                    try {
                                        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${event.id}/rsvpd`;
                                        const method = rsvped ? 'POST' : 'DELETE';
                                        const body = rsvped ? { user_id: userId, status: 'accepted' } : { user_id: userId };
                                        
                                        const response = await fetch(url, {
                                            method,
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(body)
                                        });
                                        if (!response.ok) throw new Error(`Failed to ${rsvped ? 'RSVP' : 'unRSVP'} event`);
                                        refreshEvents();
                                    } catch (error) {
                                        console.error(`Error ${rsvped ? 'RSVPing' : 'unRSVPing'} event:`, error);
                                    }
                                }}
                                isDarkMode={isDarkMode}
                                style={{}}
                            />
                        )))
                    )}

                    {isSwitch === true && (
                        savedEvents.length === 0 ? 
                        (<Text style={[styles.normalText, {color: textColor}]}> No saved events.. </Text>) 
                        : 
                        (savedEvents.map((event) => (
                            <EventCollapsible
                                key={event.id}
                                eventId={event.id}
                                title={event.title}
                                bannerColor={bannerColors[event.banner_color || 1]}
                                ownerId={event.creator_id}
                                ownerProfile={event.creator_profile_picture || 'https://via.placeholder.com/30'}
                                tag1={event.tags[0] || null}
                                tag2={event.tags[1] || null}
                                tag3={event.tags[2] || null}
                                subject={event.class}
                                location={event.location}
                                date={event.date}
                                time={event.time}
                                rsvpedCount={event.rsvped_count}
                                capacity={event.capacity}
                                isOwner={false}
                                isSaved={event.saved_ids && event.saved_ids.includes(userId)}
                                onSavedChange={async (saved) => {
                                    if (!userId) return;
                                    try {
                                        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}/saved-events`;
                                        const method = saved ? 'POST' : 'DELETE';
                                        const body = saved ? { event_id: event.id } : undefined;
                                        const deleteUrl = saved ? url : `${url}/${event.id}`;
                                        
                                        const response = await fetch(deleteUrl, { 
                                            method, 
                                            headers: { 'Content-Type': 'application/json' },
                                            body: body ? JSON.stringify(body) : undefined
                                        });
                                        if (!response.ok) throw new Error(`Failed to ${saved ? 'save' : 'unsave'} event`);
                                        refreshEvents();
                                    } catch (error) {
                                        console.error(`Error ${saved ? 'saving' : 'unsaving'} event:`, error);
                                    }
                                }}
                                isRsvped={event.rsvped_ids && event.rsvped_ids.includes(userId)}
                                onRsvpedChange={async (rsvped) => {
                                    if (!userId) return;
                                    try {
                                        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${event.id}/rsvpd`;
                                        const method = rsvped ? 'POST' : 'DELETE';
                                        const body = rsvped ? { user_id: userId, status: 'accepted' } : { user_id: userId };
                                        
                                        const response = await fetch(url, {
                                            method,
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(body)
                                        });
                                        if (!response.ok) throw new Error(`Failed to ${rsvped ? 'RSVP' : 'unRSVP'} event`);
                                        refreshEvents();
                                    } catch (error) {
                                        console.error(`Error ${rsvped ? 'RSVPing' : 'unRSVPing'} event:`, error);
                                    }
                                }}
                                isDarkMode={isDarkMode}
                                style={{marginBottom: 10}}
                            />
                        )))
                    )}

                </View>
            </ScrollView>

            {/* Bottom Navigation Bar - Same as Map */}
            <View style={[styles.bottomNav, { backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff', borderTopColor: isDarkMode ? '#4a5568' : '#e0e0e0' }]}> 
                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => handleNavigation('listView')}
                >
                    <MaterialCommunityIcons 
                        name="clipboard-list-outline" 
                        size={24} 
                        color={isDarkMode ? "#ffffff" : "#000000"} 
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
                        color={isDarkMode ? "#ffffff" : "#000000"} 
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
                        color={isDarkMode ? "#ffffff" : "#000000"} 
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
                        color={isDarkMode ? "#ffffff" : "#000000"} 
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
                        color={isDarkMode ? "#ffffff" : "#000000"} 
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

    // idk
    logoContainer: {
        height: 27,
        width: 120
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