import { useRouter } from 'expo-router';
import { Bookmark, BookOpen, Calendar, Clock, Edit3, MapPin, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface RSVP {
    event_id: string;
    user_id: string;
    status: string;
    rsvp_date: string;
    username: string;
    full_name: string;
    profile_picture_url: string;
}

interface EventCollapsibleProps {
    eventId: string;
    ownerId: string;
    ownerProfile: string;
    title: string;
    bannerColor: string;
    tag1?: string | null;
    tag2?: string | null;
    tag3?: string | null;
    subject: string;
    location: string;
    date: string;
    time: string;
    capacity: number;
    rsvpedCount: number;
    isOwner: boolean;
    isSaved: boolean;
    onSavedChange?: (saved: boolean) => void;
    isRsvped: boolean;
    onRsvpedChange?: (rsvped: boolean) => void;
    isDarkMode: boolean;
    style?: object;
}

const EventCollapsible: React.FC<EventCollapsibleProps> = ({
    eventId,
    ownerId,
    ownerProfile,
    title,
    bannerColor,
    tag1,
    tag2,
    tag3,
    subject,
    location,
    date,
    time,
    capacity,
    rsvpedCount,
    isOwner,
    isSaved,
    onSavedChange = () => {},
    isRsvped,
    onRsvpedChange = () => {},
    isDarkMode,
    style,
}) => {
    const router = useRouter();

    // Colors
    const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text);
    const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput);
     const cancelButtonColor = (!isDarkMode ? Colors.light.cancelButton : Colors.dark.cancelButton);
    const buttonColor = Colors.button;

    const [RSVPs, setRSVPs] = useState<RSVP[]>([]);

    useEffect(() => {
        const fetchRSVPs = async () => {
            if (!eventId) return;
            
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}/rsvps`);
                if (response.ok) {
                    const data = await response.json();
                    setRSVPs(data.rsvps);
                } else {
                    setRSVPs([]);
                }
            } catch (error) {
                console.error('Error fetching RSVPs:', error);
                setRSVPs([]);
            }
        };

        fetchRSVPs();
    }, [eventId]);
    
    // Extract individual profile pictures for easier use
    const attendee1Profile = RSVPs && RSVPs[0] && RSVPs[0].profile_picture_url || null;
    const attendee2Profile = RSVPs && RSVPs[1] && RSVPs[1].profile_picture_url || null;
    const attendee3Profile = RSVPs && RSVPs[2] && RSVPs[2].profile_picture_url || null;

    const [isOpen, setIsOpen] = useState(false);

    const handleRSVPPress = () => {
        if (onRsvpedChange) {
            onRsvpedChange(!isRsvped);
        }
    };
    
    return (
        <View style={[styles.eventContainer, {backgroundColor: textInputColor}, style]}>
            <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={[styles.bannerContainer, {backgroundColor: bannerColor}]}>
                {/* Use white text on colored banner for better contrast */}
                <Text style={[styles.normalBoldText, {color: '#FFFFFF'}]}>{title}</Text>
                <Image source={{uri: ownerProfile}} style={styles.profilePictureContainer}/>
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.contentContainer}>
                    <View style={[styles.tagContainer, {marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between'}]}>
                        <View style={{flexDirection: 'row'}}>
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
                        <TouchableOpacity onPress={() => {
                            if (onSavedChange) {
                                onSavedChange(!isSaved);
                            }
                        }}>
                            <Bookmark 
                                color={textColor} 
                                fill={isSaved ? textColor : 'none'}
                            />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.mainContentContainer}>
                        <View style={styles.eventDetailsContainer}>
                            <View style={styles.iconTextContainer}>
                                <BookOpen size={20} color={textColor} style={styles.eventIcon}/>
                                <Text style={[styles.normalText, {color: textColor}]}>{subject}</Text>
                            </View>
                            <View style={[styles.iconTextContainer, {marginTop: 3}]}>
                                <MapPin size={20} color={textColor} style={styles.eventIcon}/>
                                <Text style={[styles.normalText, {color: textColor}]}>{location}</Text>
                            </View>
                            <View style={[styles.iconTextContainer, {marginTop: 3}]}>
                                <Calendar size={20} color={textColor} style={styles.eventIcon}/>
                                <Text style={[styles.normalText, {color: textColor}]}>{date}</Text>
                            </View>
                            <View style={[styles.iconTextContainer, {marginTop: 3}]}>
                                <Clock size={20} color={textColor} style={styles.eventIcon}/>
                                <Text style={[styles.normalText, {color: textColor}]}>{time}</Text>
                            </View>
                            <View style={[styles.iconTextContainer, {marginTop: 3}]}>
                                <Users size={20} color={textColor} style={styles.eventIcon}/>
                                <Text style={[styles.normalText, {color: textColor}]}>{RSVPs.length}/{capacity}</Text>
                                {attendee1Profile != null && (
                                    <Image source={{uri: attendee1Profile}} style={styles.smallProfilePictureContainer}/>
                                )}
                                {attendee2Profile != null && (
                                    <Image source={{uri: attendee2Profile}} style={styles.smallProfilePictureContainer}/>
                                )}
                                {attendee3Profile != null && (
                                    <Image source={{uri: attendee3Profile}} style={styles.smallProfilePictureContainer}/>
                                )}
                                {RSVPs.length > 3 && (
                                    <Text style={[styles.normalText, {color: textColor, marginLeft: 5}]}>
                                        +{RSVPs.length - 
                                            (attendee1Profile != null ? 1 : 0) - 
                                            (attendee2Profile != null ? 1 : 0) - 
                                            (attendee3Profile != null ? 1 : 0)}
                                    </Text>
                                )}
                            </View>
                            
                            {isOwner && (
                                <TouchableOpacity onPress={() => router.push('/CreateEvent/EditEvent')} style={{marginTop: 10}}>
                                    <View style={[styles.buttonContainer, {backgroundColor: buttonColor}]}>
                                        <Edit3 size={16} color={textColor} style={{marginRight: 5}}/>
                                        <Text style={[styles.normalText, {color: textColor}]}>Edit</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        <TouchableOpacity onPress={handleRSVPPress} style={styles.rsvpButtonContainer}>
                            <View style={[styles.rsvpButton, {backgroundColor: isRsvped ? cancelButtonColor : '#5CAEF1', marginTop: -50, marginRight: 3}]}>
                                <Text style={[styles.subheaderText, {color: textColor}]}>
                                    {isRsvped ? 'RSVPed' : 'RSVP'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
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
        marginLeft: 2,
        marginRight: 2,
        padding: 5,
    },
    mainContentContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    eventDetailsContainer: {
        flex: 1,
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
        borderRadius: 15,
        marginLeft: 2
    },
    smallProfilePictureContainer: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        marginLeft: 3,
        marginRight: 3
    },
    buttonContainer: {
        width: '100%',
        height: 35,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginBottom: 5
    },
    rsvpButtonContainer: {
        alignItems: 'flex-end',
        marginTop: 10,
    },
    rsvpButton: {
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 8,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default EventCollapsible;