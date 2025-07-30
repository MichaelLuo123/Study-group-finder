import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface EventCollapsibleProps {
    title: string;
    bannerColor: string;
    tag1?: string,
    tag2?: string,
    tag3?: string,
    ownerProfile?: string;
    eventClass: string;
    location: string;
    date: string;
    time: string;
    numAttendees: number;
    capacity: number;
    attendee1Profile?: string;
    attendee2Profile?: string;
    attendee3Profile?: string;
    light: boolean;
    isOwner: boolean;
}

const EventCollapsible: React.FC<EventCollapsibleProps> = ({
    title,
    bannerColor,
    tag1,
    tag2,
    tag3,
    ownerProfile,
    eventClass,
    location,
    date,
    time,
    numAttendees,
    capacity,
    attendee1Profile,
    attendee2Profile,
    attendee3Profile,
    light,
    isOwner,
}) => {
    const router = useRouter();

    const backgroundColor = (light ? Colors.light.background : Colors.dark.background)
    const textColor = (light ? Colors.light.text : Colors.dark.text)
    const textInputColor = (light ? Colors.light.textInput : Colors.dark.backgroundColor)
    const buttonColor = Colors.button

    const [isOpen, setIsOpen] = useState<boolean>(false);
    
    return (
        <View style={[styles.eventContainer, {backgroundColor: textInputColor}]}>
            <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={[styles.bannerContainer, {backgroundColor: bannerColor}]}>
                <Text style={[styles.normalBoldText, {color: textColor ? Colors.light.text : Colors.dark.text}]}>{title}</Text>
                <Image source={{uri: ownerProfile}} style={styles.profilePictureContainer}/>
            </TouchableOpacity>

            {isOpen && (
                <View style={[styles.contentContainer]}>
                    <View style={[styles.tagContainer, {marginBottom: 8}]}>
                        <View style={[styles.tag, {borderColor: textColor}]}>
                            {tag1 !== null && (<Text style={[styles.normalText, {color: textColor}]}>
                                {tag1}
                            </Text>)}
                        </View>
                        <View style={[styles.tag, {borderColor: textColor}]}>
                            {tag2 !== null && (<Text style={[styles.normalText, {color: textColor}]}>
                                {tag2}
                            </Text>)}
                        </View>
                        <View style={[styles.tag, {borderColor: textColor}]}>
                            {tag3 !== null && (<Text style={[styles.normalText, {color: textColor}]}>
                                {tag3}
                            </Text>)}
                        </View>
                    </View>
                    <View style={styles.iconTextContainer}>
                        <Image source={require('../assets/images/book.png')} style={styles.eventIcon}/>
                        <Text style={[styles.normalText, {color: textColor ? Colors.light.text : Colors.dark.text}]}> {eventClass} </Text>
                    </View>
                    <View style={[styles.iconTextContainer, {marginTop: 3}]}>
                        <Image source={require('../assets/images/location.png')} style={styles.eventIcon}/>
                        <Text style={[styles.normalText, {color: textColor ? Colors.light.text : Colors.dark.text}]}> {location} </Text>
                    </View>
                    <View style={[styles.iconTextContainer, {marginTop: 3}]}>
                        <Image source={require('../assets/images/calendar.png')} style={styles.eventIcon}/>
                        <Text style={[styles.normalText, {color: textColor ? Colors.light.text : Colors.dark.text}]}> {date} </Text>
                    </View>
                    <View style={[styles.iconTextContainer, {marginTop: 3}]}>
                        <Image source={require('../assets/images/clock.png')} style={styles.eventIcon}/>
                        <Text style={[styles.normalText, {color: textColor ? Colors.light.text : Colors.dark.text}]}> {time} </Text>
                    </View>
                    <View style={[styles.iconTextContainer, {marginTop: 3}]}>
                        <Image source={require('../assets/images/person.png')} style={styles.eventIcon}/>
                        <Text style={[styles.normalText, {color: textColor ? Colors.light.text : Colors.dark.text}]}> {numAttendees}/{capacity} </Text>
                        {attendee1Profile != null && (
                            <Image source={{uri: attendee1Profile}} style={styles.smallProfilePictureContainer}/>)}
                        {attendee2Profile != null && (
                            <Image source={{uri: attendee2Profile}} style={styles.smallProfilePictureContainer}/>)}
                        {attendee3Profile != null && (
                            <Image source={{uri: attendee3Profile}} style={styles.smallProfilePictureContainer}/>)}
                        <Text style={[styles.normalText, {color: textColor ? Colors.light.text : Colors.dark.text}]}>
                            +{numAttendees - 
                            (attendee1Profile != null ? 1 : 0) -
                            (attendee2Profile != null ? 1 : 0) -
                            (attendee3Profile != null ? 1 : 0)}
                        </Text>
                    </View>
                    {isOwner && (<TouchableOpacity onPress={() => router.push('')}>
                        <View style={[styles.buttonContainer, {backgroundColor: buttonColor}]}>
                            <Text style={[styles.normalText, {color: textColor}]}> Edit </Text>
                        </View>
                    </TouchableOpacity>)}
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
        width: 20,
        height: 20,
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
        width: '100%',
        height: 35,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8
    }
});

export default EventCollapsible;