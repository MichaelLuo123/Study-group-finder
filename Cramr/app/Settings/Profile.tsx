import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Dropdown from '../../components/Dropdown';
import ImageUpload from '../../components/ImageUpload';
import Slider from '../../components/Slider';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function SettingsProfilePage() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textInputColor = useThemeColor({}, 'textInput');
  const [selectedBannerColor, setSelectedBannerColor] = useState<number | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const options = [
    { label: 'The best study spot is...', value: "first" },
    { label: 'My current classes are...', value: "second" },
    { label: 'The best study method is...', value: "third" },
  ];

  return (
    <SafeAreaView style={{backgroundColor: backgroundColor, flex: 1 }}>
      <ScrollView>
        <View style={[styles.container, {backgroundColor: backgroundColor }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={require('../../assets/images/Arrow_black.png')} style={styles.iconContainer} />
          </TouchableOpacity>

          <Text style={[styles.headerText, {color: textColor , textAlign: 'center', marginTop: 10}]}>
            Profile
          </Text>

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}>
            Picture
          </Text>
          <ImageUpload />

          <Text style={[styles.subheaderText, {color: textColor , marginTop: 10, marginBottom: 5}]}>
            Banner
          </Text>
            <View style={styles.bannerColorContainer}>
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: '#AACC96'}, selectedBannerColor === 1 && styles.ring]}
              onPress={() => setSelectedBannerColor(1)} 
            />
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: '#F4BEAE'}, selectedBannerColor === 2 && styles.ring]} 
              onPress={() => setSelectedBannerColor(2)} 
            />
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: '#52A5CE'}, selectedBannerColor === 3 && styles.ring]} 
              onPress={() => setSelectedBannerColor(3)} 
            />
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: '#FF7BAC'}, selectedBannerColor === 4 && styles.ring]} 
              onPress={() => setSelectedBannerColor(4)} 
            />
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: '#D3B6D3'}, selectedBannerColor === 5 && styles.ring]} 
              onPress={() => setSelectedBannerColor(5)} 
            />
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: '#EFCE7B'}, selectedBannerColor === 6 && styles.ring]} 
              onPress={() => setSelectedBannerColor(6)} 
            />
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: '#B8CEE8'}, selectedBannerColor === 7 && styles.ring]} 
              onPress={() => setSelectedBannerColor(7)} 
            />
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: '#EF6F3C'}, selectedBannerColor === 8 && styles.ring]} 
              onPress={() => setSelectedBannerColor(8)} 
            />
            <TouchableOpacity 
              style={[styles.bannerColor, {backgroundColor: '#AFAB23'}, selectedBannerColor === 9 && styles.ring]} 
              onPress={() => setSelectedBannerColor(9)} 
            />
            </View>

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Name 
          </Text>
          <TextInput 
            style={[styles.bodyText, styles.textInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter your name."
            textAlign="left"
            textAlignVertical="top" 
            maxLength={50}
            numberOfLines={1}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Username
          </Text>
          <TextInput 
            style={[styles.bodyText, styles.textInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter your username."
            textAlign="left"
            textAlignVertical="top" 
            maxLength={50} 
            numberOfLines={1}
          />
          
          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            School
          </Text>
          <TextInput 
            style={[styles.bodyText, styles.textInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter your school."
            textAlign="left"
            textAlignVertical="top" 
            maxLength={50}
            numberOfLines={1}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Major
          </Text>
          <TextInput 
            style={[styles.bodyText, styles.textInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter your major."
            textAlign="left"
            textAlignVertical="top"
            maxLength={50}
            numberOfLines={1}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Class Level
          </Text>
          <TextInput 
            style={[styles.bodyText, styles.textInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter your class level."
            textAlign="left"
            textAlignVertical="top"
            maxLength={25}
            numberOfLines={1}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Pronouns
          </Text>
          <TextInput 
            style={[styles.bodyText, styles.textInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter your pronouns."
            textAlign="left"
            textAlignVertical="top"
            maxLength={25}
            numberOfLines={1}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Transfer?
          </Text>
          <Slider
            leftLabel="Yes"
            rightLabel="No"
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}> 
            Bio
          </Text>
          <TextInput
            style={[styles.bodyText, styles.largeTextInputContainer, {backgroundColor: textInputColor}]} 
            placeholder="Enter bio."
            textAlign="left"
            textAlignVertical="top"
            maxLength={150}
            multiline={true}
          />

          <Text style={[styles.subheaderText, {color: textColor, marginTop: 10, marginBottom: 5}]}>
            Prompts
          </Text>
          < Dropdown
            options={options}
            placeholder="Select a prompt."
            onSelect={(value) => setSelectedValue(value)}
          />

          <TouchableOpacity style={[styles.buttonContainer, {marginTop: 20}]}>
            <Text style={[styles.bodyText, {color: textColor}]}>Save</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  subheaderText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  bodyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  captionText: {
    fontFamily: 'Poppins-Light',
    fontSize: 12,
  },
  container: {
    padding: 20,
    height: 1500,
  },
  iconContainer: {
    width: 25,
    height: 25,
  },
  bannerColorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bannerColor: {
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  ring: {
    borderWidth: 2,
    borderColor: '#5CAEF1', // White ring around the selected color
  },
  textInputContainer: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    padding: 10
  },
  largeTextInputContainer: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    
    padding: 10
  },
  buttonContainer: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#5CAEF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsibleContainer: {
    width: '100%',
    backgroundColor: '#ee5e5e',

  },
});