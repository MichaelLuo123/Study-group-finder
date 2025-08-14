import EventCollapsible from '@/components/EventCollapsible';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Slider from '../../components/Slider';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../contexts/UserContext';

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
    const { isDarkMode } = useUser();

    // Colors
    const backgroundColor = (true ? Colors.light.background : Colors.dark.background)
    const textColor = (true ? Colors.light.text : Colors.dark.text)
    const textInputColor = (true ? Colors.light.textInput : Colors.dark.background)
    const bannerColors = ['#AACC96', '#F4BEAE', '#52A5CE', '#FF7BAC', '#D3B6D3']

    const [isSwitch, setIsSwitch] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState('bookmarks');
    
    // User
    const userId = '2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5';

    // Events
    const [rsvpedEvents, setRsvpedEvents] = useState<Event[]>([]);
    const [savedEvents, setSavedEvents] = useState<Event[]>([]);
    
    useEffect(() => {
    const fetchEvents = async () => {
        try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events`);
        if (response.ok) {
            const eventsData = await response.json();
        
            // Corrected filter for saved events
            const savedEvents = eventsData.filter((event: Event) => event.saved_ids && event.saved_ids.includes(userId));
            setSavedEvents(savedEvents);

            // Corrected filter for RSVPed events
            const rsvpedEvents = eventsData.filter((event: Event) => event.rsvped_ids && event.rsvped_ids.includes(userId));
            setRsvpedEvents(rsvpedEvents);

        } else {
            console.error('Failed to fetch events data');
        }
        } catch (error) {
        console.error('Error fetching events data:', error);
        }
    };

    fetchEvents(); // You must call the function to execute it
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

    return (
        <SafeAreaView>
            <ScrollView style={{ paddingBottom: 100 }}>
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
                        />
                    </View>

                    {isSwitch === false && (
                        rsvpedEvents.length === 0 ? 
                        (<Text style={styles.normalText}> No RSVPed events... </Text>) 
                        : 
                        (rsvpedEvents.map((event) => (
                            <EventCollapsible
                                key={event.id}
                                title={event.title}
                                bannerColor={bannerColors[event.banner_color || 1]}
                                ownerId={event.creator_id}
                                tag1={event.tags[0] || null}
                                tag2={event.tags[1] || null}
                                tag3={event.tags[2] || null}
                                eventClass={event.class}
                                location={event.location}
                                date={event.date}
                                time={event.time}
                                numAttendees={event.rsvped_count}
                                capacity={event.capacity}
                                acceptedIds={event.rsvped_ids}
                                light={true}
                                isOwner={false}
                                style={{}}
                            />
                        )))
                    )}

                    {isSwitch === true && (
                        savedEvents.length === 0 ? 
                        (<Text style={styles.normalText}> No saved events.. </Text>) 
                        : 
                        (savedEvents.map((event) => (
                            <EventCollapsible
                                key={event.id}
                                title={event.title}
                                bannerColor={bannerColors[event.banner_color || 1]}
                                ownerId={event.creator_id}
                                tag1={event.tags[0] || null}
                                tag2={event.tags[1] || null}
                                tag3={event.tags[2] || null}
                                eventClass={event.class}
                                location={event.location}
                                date={event.date}
                                time={event.time}
                                numAttendees={event.rsvped_count}
                                capacity={event.capacity}
                                acceptedIds={event.rsvped_ids}
                                light={true}
                                isOwner={false}
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