import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    invited_ids: string[];
    accepted_ids: string[];
    declined_ids: string[];
    invited_count: number;
    accepted_count: number;
    declined_count: number;
    class: string;
    creator_name: string;
    creator_profile_picture: string;
    creator_username: string;
    following: number;
    follwers: number;
    following_ids: string[];
    followers_ids: string[];
}

export default function Saved() {
    const router = useRouter();

    const backgroundColor = (true ? Colors.light.background : Colors.dark.background)
    const textColor = (true ? Colors.light.text : Colors.dark.text)
    const textInputColor = (true ? Colors.light.textInput : Colors.dark.backgroundColor)
    const bannerColors = ['#AACC96', '#F4BEAE', '#52A5CE', '#FF7BAC', '#D3B6D3']

    const [isSwitch, setIsSwitch] = useState<boolean>(false);

    return (
        <SafeAreaView>
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
                        />
                    </View>

                    {isSwitch == false  && (
                        <Text>rsvped events</Text>
                    )}

                    {isSwitch == true  && (
                        <Text>saved events</Text>
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