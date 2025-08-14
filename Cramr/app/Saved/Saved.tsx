import EventCollapsible from '@/components/EventCollapsible';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

    // Colors
    const {isDarkMode, toggleDarkMode} = useUser();
    const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background)
    const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text)
    const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput)
    const bannerColors = ['#AACC96', '#F4BEAE', '#52A5CE', '#FF7BAC', '#D3B6D3']

    const [isSwitch, setIsSwitch] = useState<boolean>(false);
    
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

    return (
        <SafeAreaView style={{backgroundColor: backgroundColor, height: 800}}>
            <ScrollView>
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
                                isDarkMode={isDarkMode}
                                isOwner={false}
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
                                isOwner={false}
                                isDarkMode={isDarkMode}
                                style={{marginBottom: 10}}
                            />
                        )))
                    )}

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

    // idk
    logoContainer: {
        height: 27,
        width: 120
    },
});