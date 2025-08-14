import { useRouter } from 'expo-router';
import { BookOpen, Calendar, Clock, Edit3, MapPin, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface EventCollapsibleProps {
    title: string;
    bannerColor: string;
    tag1?: string | null,
    tag2?: string | null,
    tag3?: string | null,
    ownerId: string
    eventClass: string;
    location: string;
    date: string;
    time: string;
    numAttendees: number;
    capacity: number;
    acceptedIds: string[];
    isOwner: boolean;
    style?: object;
    isDarkMode: boolean;
}

const EventCollapsible: React.FC<EventCollapsibleProps> = ({
    title,
    bannerColor,
    tag1,
    tag2,
    tag3,
    ownerId,
    eventClass,
    location,
    date,
    time,
    numAttendees,
    capacity,
    acceptedIds,
    isOwner,
    style,
    isDarkMode,
}) => {
    const router = useRouter();

    const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text);
    const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput);
    const buttonColor = Colors.button;

    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Add state for attendee profile pictures
    const [attendeeProfiles, setAttendeeProfiles] = useState<string[]>([]);

    // Fetch profile pictures when component mounts or acceptedIds changes
    useEffect(() => {
        const fetchAttendeeProfiles = async () => {
            if (!acceptedIds || acceptedIds.length === 0) return;
            
            try {
                const firstThreeIds = acceptedIds.slice(0, 3);
                const profilePromises = firstThreeIds.map(async (userId) => {
                    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}`);
                    if (response.ok) {
                        const userData = await response.json();
                        return userData.profile_picture_url || '';
                    }
                    return '';
                });
                
                const profiles = await Promise.all(profilePromises);
                setAttendeeProfiles(profiles.filter(profile => profile !== ''));
            } catch (error) {
                console.error('Error fetching attendee profiles:', error);
            }
        };

        fetchAttendeeProfiles();
    }, [acceptedIds]);

    const [ownerProfile, setOwnerProfile] = useState<string>('');

    useEffect(() => {
        const fetchOwnerProfile = async () => {
            if (!ownerId) return;
            
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${ownerId}`);
                if (response.ok) {
                    const userData = await response.json();
                    const profileUrl = userData.profile_picture_url || '';
                    setOwnerProfile(profileUrl);
                } else {
                    setOwnerProfile('');
                }
            } catch (error) {
                console.error('Error fetching owner profile:', error);
                setOwnerProfile('');
            }
        };

        fetchOwnerProfile();
    }, [ownerId]);
    
    // Extract individual profile pictures for easier use
    const attendee1Profile = attendeeProfiles[0] || null;
    const attendee2Profile = attendeeProfiles[1] || null;
    const attendee3Profile = attendeeProfiles[2] || null;
    
    return (
        <View style={[styles.eventContainer, {backgroundColor: textInputColor}, style]}>
            <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={[styles.bannerContainer, {backgroundColor: bannerColor}]}>
                {/* Fixed: Apply proper text color for title - use white/light text on colored banner */}
                <Text style={[styles.normalBoldText, {color: textColor}]}>{title}</Text>
                <Image source={{uri: ownerProfile}} style={styles.profilePictureContainer}/>
            </TouchableOpacity>

            {isOpen && (
                <View style={[styles.contentContainer]}>
                    <View style={[styles.tagContainer, {marginBottom: 8}]}>
                        {tag1 !== null && (
                            <View style={[styles.tag, {borderColor: textColor}]}>
                                <Text style={[styles.normalText, {color: textColor}]}>
                                    {tag1}
                                </Text>
                            </View>
                        )}
                        {tag2 !== null && (
                            <View style={[styles.tag, {borderColor: textColor}]}>
                                <Text style={[styles.normalText, {color: textColor}]}>
                                    {tag2}
                                </Text>
                            </View>
                        )}
                        {tag3 !== null && (
                            <View style={[styles.tag, {borderColor: textColor}]}>
                                <Text style={[styles.normalText, {color: textColor}]}>
                                    {tag3}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.iconTextContainer}>
                        <BookOpen size={20} color={textColor} style={styles.eventIcon}/>
                        <Text style={[styles.normalText, {color: textColor}]}> {eventClass} </Text>
                    </View>
                    <View style={[styles.iconTextContainer, {marginTop: 3}]}>
                        <MapPin size={20} color={textColor} style={styles.eventIcon}/>
                        <Text style={[styles.normalText, {color: textColor}]}> {location} </Text>
                    </View>
                    <View style={[styles.iconTextContainer, {marginTop: 3}]}>
                        <Calendar size={20} color={textColor} style={styles.eventIcon}/>
                        <Text style={[styles.normalText, {color: textColor}]}> {date} </Text>
                    </View>
                    <View style={[styles.iconTextContainer, {marginTop: 3}]}>
                        <Clock size={20} color={textColor} style={styles.eventIcon}/>
                        <Text style={[styles.normalText, {color: textColor}]}> {time} </Text>
                    </View>
                    <View style={[styles.iconTextContainer, {marginTop: 3}]}>
                        <Users size={20} color={textColor} style={styles.eventIcon}/>
                        <Text style={[styles.normalText, {color: textColor}]}> {numAttendees}/{capacity} </Text>
                        {attendee1Profile != null && (
                            <Image source={{uri: attendee1Profile}} style={styles.smallProfilePictureContainer}/>
                        )}
                        {attendee2Profile != null && (
                            <Image source={{uri: attendee2Profile}} style={styles.smallProfilePictureContainer}/>
                        )}
                        {attendee3Profile != null && (
                            <Image source={{uri: attendee3Profile}} style={styles.smallProfilePictureContainer}/>
                        )}
                        <Text style={[styles.normalText, {color: textColor}]}>
                            {numAttendees > 3 && `+${numAttendees - 
                                (attendee1Profile != null ? 1 : 0) - 
                                (attendee2Profile != null ? 1 : 0) - 
                                (attendee3Profile != null ? 1 : 0)}`}
                        </Text>
                    </View>
                    {isOwner && (
                        <TouchableOpacity onPress={() => router.push('')}>
                            <View style={[styles.buttonContainer, {backgroundColor: buttonColor}]}>
                                <Edit3 size={16} color={textColor} style={{marginRight: 5}}/>
                                <Text style={[styles.normalText, {color: textColor}]}> Edit </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

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

    eventContainer: {
        flexDirection: 'column',
        width: '100%',
        marginTop: 5,
        borderRadius: 10,

        // shadow for android
        elevation: 3,
        // shadow for ios
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bannerContainer: {
        width: '100%',
        borderRadius: 10,
        height: 50,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    contentContainer: {
        padding: 10,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    tag: {
        borderWidth: 1,
        borderRadius: 20,
        marginLeft: 2, // space between tags
        marginRight: 2, // space between tags
        padding: 5,
    },
    eventIcon: {
        marginRight: 5,
    },
    iconTextContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    profilePictureContainer: {
        width: 30,
        height: 30,
        borderRadius: 50,
        marginLeft: 2
    },
    smallProfilePictureContainer: {
        width: 25,
        height: 25,
        borderRadius: 50,
        marginLeft: 3,
        marginRight: 3
    },
    buttonContainer: {
        width: 330,
        height: 35,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 5
    }
});

export default EventCollapsible;