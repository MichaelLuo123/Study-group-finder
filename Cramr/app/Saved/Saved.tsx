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
    saved_ids: string[];
    class: string;
    creator_profile_picture: string;
}

export default function Saved() {
    const router = useRouter();

    // Colors
    const { isDarkMode, toggleDarkMode, user } = useUser();
    const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background);
    const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text);
    const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput);
    const bannerColors = ['#AACC96', '#F4BEAE', '#52A5CE', '#FF7BAC', '#D3B6D3'];

    const [isSwitch, setIsSwitch] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState('bookmarks');
    const [isMounted, setIsMounted] = useState(false);
    
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

    // Events
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [rsvpedEvents, setRsvpedEvents] = useState<Event[]>([]);
    const [savedEvents, setSavedEvents] = useState<Event[]>([]);

    // Wait for component to mount before checking navigation
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Redirect to login if not logged in (only after mounting)
    useEffect(() => {
        if (isMounted && !user) {
            // Add a small delay to ensure router is ready
            const timer = setTimeout(() => {
                router.replace('/Login/Loginscreen');
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [user, router, isMounted]);

    // Fetch events and filter in a single useEffect
    useEffect(() => {
        if (!isMounted || (!user && isMounted)) {
            return;
        }
        const fetchAndFilterEvents = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setError(null);
                const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
                
                if (!backendUrl) {
                    throw new Error('Backend URL is not configured');
                }

                const response = await fetch(`${backendUrl}/events`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data: Event[] = await response.json();
                setEvents(data);

                // Filter events immediately after fetching
                const rsvped = data.filter(event => 
                    event.rsvped_ids && event.rsvped_ids.includes(userId)
                );
                setRsvpedEvents(rsvped);

                const saved = data.filter(event => 
                    event.saved_ids && event.saved_ids.includes(userId)
                );
                setSavedEvents(saved);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching events:', err);
                setError(err instanceof Error ? err.message : 'Failed to load events');
                setLoading(false);
            }
        };

        if (isMounted && userId) {
            fetchAndFilterEvents();
        }
    }, [userId, isMounted]); // Only depend on userId and isMounted

    // Function to refresh events with proper loading states
    const refreshEvents = async () => {
        if (!userId) return;
        
        setRefreshing(true);
        try {
            setError(null);
            const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
            
            if (!backendUrl) {
                throw new Error('Backend URL is not configured');
            }

            const response = await fetch(`${backendUrl}/events`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data: Event[] = await response.json();
            setEvents(data);

            // Filter events immediately after fetching
            const rsvped = data.filter(event => 
                event.rsvped_ids && event.rsvped_ids.includes(userId)
            );
            setRsvpedEvents(rsvped);

            const saved = data.filter(event => 
                event.saved_ids && event.saved_ids.includes(userId)
            );
            setSavedEvents(saved);

        } catch (err) {
            console.error('Error fetching events:', err);
            setError(err instanceof Error ? err.message : 'Failed to load events');
        } finally {
            setRefreshing(false);
        }
    };

    const handleNavigation = (page: string) => {
        if (currentPage !== page && isMounted) {
            setCurrentPage(page);
            // Add timeout to ensure navigation is safe
            setTimeout(() => {
                switch (page) {
                    case 'listView':
                        router.push('/listView');
                        break;
                    case 'map':
                        router.push('/Map/map');
                        break;
                    case 'addEvent':
                        router.push('/CreateEvent/createevent');
                        break;
                    case 'bookmarks':
                        router.push('/Saved/Saved');
                        break;
                    case 'profile':
                        router.push('/Profile/Internal');
                        break;
                }
            }, 50);
        }
    };

    // Handle saved change with error handling
    const handleSavedChange = async (eventId: string, saved: boolean) => {
        if (!userId) return;
        
        try {
            const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
            if (!backendUrl) {
                throw new Error('Backend URL is not configured');
            }

            const url = `${backendUrl}/users/${userId}/saved-events`;
            const method = saved ? 'POST' : 'DELETE';
            const body = saved ? { event_id: eventId } : undefined;
            const deleteUrl = saved ? url : `${url}/${eventId}`;
            
            const response = await fetch(deleteUrl, { 
                method, 
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await refreshEvents();
        } catch (error) {
            console.error(`Error ${saved ? 'saving' : 'unsaving'} event:`, error);
            // Could add toast notification here
        }
    };

    // Handle RSVP change with error handling
    const handleRsvpChange = async (eventId: string, rsvped: boolean) => {
        if (!userId) return;
        
        try {
            const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
            if (!backendUrl) {
                throw new Error('Backend URL is not configured');
            }

            const url = `${backendUrl}/events/${eventId}/rsvpd`;
            const method = rsvped ? 'POST' : 'DELETE';
            const body = rsvped ? { user_id: userId, status: 'accepted' } : { user_id: userId };
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await refreshEvents();
        } catch (error) {
            console.error(`Error ${rsvped ? 'RSVPing' : 'unRSVPing'} event:`, error);
            // Could add toast notification here
        }
    };

    // Render event list
    const renderEventList = (eventList: Event[], emptyMessage: string) => {
        if (loading) {
            return <Text style={[styles.normalText, {color: textColor}]}>Loading {emptyMessage.toLowerCase()}...</Text>;
        }
        
        if (eventList.length === 0) {
            return <Text style={[styles.normalText, {color: textColor}]}>{emptyMessage}</Text>;
        }
        
        return eventList.map((event) => (
            <EventCollapsible
                key={event.id}
                eventId={event.id}
                title={event.title}
                bannerColor={bannerColors[event.banner_color % bannerColors.length]}
                ownerId={event.creator_id}
                ownerProfile={event.creator_profile_picture || 'https://via.placeholder.com/30'}
                tag1={event.tags?.[0] || null}
                tag2={event.tags?.[1] || null}
                tag3={event.tags?.[2] || null}
                subject={event.class}
                location={event.location}
                date={event.date}
                time={event.time}
                rsvpedCount={event.rsvped_count}
                capacity={event.capacity}
                isOwner={false}
                isSaved={event.saved_ids?.includes(userId || '') || false}
                onSavedChange={(saved) => handleSavedChange(event.id, saved)}
                isRsvped={event.rsvped_ids?.includes(userId || '') || false}
                onRsvpedChange={(rsvped) => handleRsvpChange(event.id, rsvped)}
                isDarkMode={isDarkMode}
                style={{marginBottom: 10}}
            />
        ));
    };

    return (
        <SafeAreaView style={{backgroundColor: backgroundColor, flex: 1}}>
            <View style={{flex: 1}}>
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, {backgroundColor}]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refreshEvents}
                            colors={[isDarkMode ? '#ffffff' : '#000000']}
                            tintColor={isDarkMode ? '#ffffff' : '#000000'}
                        />
                    }
                >
                    <View style={{padding: 20}}>
                        <TouchableOpacity onPress={() => {
                            if (isMounted) {
                                setTimeout(() => router.back(), 50);
                            }
                        }}>
                            <Image 
                                source={require('../../assets/images/cramr_logo.png')} 
                                style={styles.logoContainer} 
                                resizeMode="contain"
                            />
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

                        {error && (
                            <Text style={[styles.normalText, {color: 'red', marginBottom: 10}]}>
                                Error: {error}
                            </Text>
                        )}

                        {!isSwitch && renderEventList(rsvpedEvents, 'No RSVPed events...')}
                        {isSwitch && renderEventList(savedEvents, 'No saved events...')}
                    </View>
                </ScrollView>

                {/* Bottom Navigation Bar */}
                <View style={[styles.bottomNav, { 
                    backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff', 
                    borderTopColor: isDarkMode ? '#4a5568' : '#e0e0e0' 
                }]}> 
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={() => handleNavigation('listView')}
                        accessible={true}
                        accessibilityLabel="List View"
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
                        accessible={true}
                        accessibilityLabel="Map View"
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
                        accessible={true}
                        accessibilityLabel="Add Event"
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
                        accessible={true}
                        accessibilityLabel="Bookmarks"
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
                        accessible={true}
                        accessibilityLabel="Profile"
                    >
                        <Ionicons 
                            name="person-circle-outline" 
                            size={24} 
                            color={isDarkMode ? "#ffffff" : "#000000"} 
                        />
                        {currentPage === 'profile' && <View style={styles.activeDot} />}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Container styles
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },

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

    // Layout
    logoContainer: {
        height: 27,
        width: 120
    },
    
    // Navigation
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        marginBottom: -34,
        paddingBottom: Platform.OS === 'ios' ? 34 : 12,
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