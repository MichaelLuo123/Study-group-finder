import Slider from '@react-native-community/slider';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';
import { Button } from 'react-native-paper';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../contexts/UserContext';

const noiseLevels = ['Quiet', 'Medium', 'Loud'];
const locationTypes = ['Library', 'Cafe', 'Outdoor'];

export type Filters = {
  distance: number;
  unit: 'mi' | 'km';
  attendees: number;
  noise: string | null;
  location: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (filters: Filters) => void;
};

export default function FilterModal({ visible, onClose, onSave }: Props) {
  // Colors
    const {isDarkMode, toggleDarkMode} = useUser();
    const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background)
    const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text)
    const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput)
    const placeholderTextColor = (!isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText)
    const bannerColors = Colors.bannerColors
    const buttonColor = Colors.button
    const cancelButtonColor = (!isDarkMode ? Colors.light.cancelButton : Colors.dark.cancelButton)

  const [step, setStep] = useState(0);
  const [distance, setDistance] = useState(1);
  const [unit, setUnit] = useState<'mi' | 'km'>('mi');
  const [attendees, setAttendees] = useState(2);
  const [noise, setNoise] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  // We keep prev for internal use, but the UI back button will jump to step 0 (main)
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  // 🔄 Reset now also clears filters in the parent + closes the modal
  const reset = () => {
    // reset local UI to defaults
    setDistance(1);
    setUnit('mi');
    setAttendees(2);
    setNoise(null);
    setLocation(null);
    setStep(0);

    // tell parent "no filters" (distance/attendees = 0 disables them in your EventList)
    onSave({ distance: 0, unit: 'mi', attendees: 0, noise: null, location: null });
    onClose();
  };

  const handleSave = () => {
    onSave({ distance, unit, attendees, noise, location });
    onClose();
    setStep(0);
  };

  function nextOrSave() {
    if (step < 4) next();
    else handleSave();
  }

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ justifyContent: 'center', margin: 0 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={[styles.modal, {backgroundColor: backgroundColor}]}>
        <Text style={[styles.header, {color: textColor}]}>Filter by</Text>
        <View style={styles.content}>
          {step === 0 && (
            <>
              <Pressable style={[styles.inputBox, {backgroundColor: textInputColor}]} onPress={() => setStep(1)}>
                <Text style={[styles.inputLabel, {color: textColor}]}>Distance</Text>
                <Text style={[styles.inputValue, {color: textColor}]}>
                  {distance} {unit}
                </Text>
              </Pressable>
              <Pressable style={[styles.inputBox, {backgroundColor: textInputColor}]} onPress={() => setStep(2)}>
                <Text style={[styles.inputLabel, {color: textColor}]}>Number of Attendees</Text>
                <Text style={[styles.inputValue, {color: textColor}]}>{attendees} people</Text>
              </Pressable>
              <Pressable style={[styles.inputBox, {backgroundColor: textInputColor}]} onPress={() => setStep(3)}>
                <Text style={[styles.inputLabel, {color: textColor}]}>Noise Level</Text>
                <Text style={[styles.inputValue, {color: textColor}]}>{noise || '--'}</Text>
              </Pressable>
              <Pressable style={[styles.inputBox, {backgroundColor: textInputColor}]} onPress={() => setStep(4)}>
                <Text style={[styles.inputLabel, {color: textColor}]}>Location Type</Text>
                <Text style={[styles.inputValue, {color: textColor}]}>{location || '--'}</Text>
              </Pressable>
            </>
          )}

          {step === 1 && (
            <>
              <Text style={[styles.inputLabel, {color: textColor}]}>Distance</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                <Button 
                  mode={unit === 'mi' ? 'outlined' : 'contained'} 
                  onPress={() => setUnit('mi')} 
                  style={{ backgroundColor: textInputColor }}
                  theme={{
                    colors: {
                      outline: textColor, // This sets the border color for outlined mode
                      onSurface: textColor, // This affects the text color in outlined mode
                    }
                  }}
                >
                  <Text style={{ color: textColor, fontFamily: 'Poppins-Regular', fontSize: 14 }}>Mi</Text>
                </Button>
                <Button
                  mode={unit === 'km' ? 'outlined' : 'contained'}
                  onPress={() => setUnit('km')}
                  style={{ marginLeft: 8, backgroundColor: textInputColor }}
                  theme={{
                    colors: {
                      outline: textColor, // This sets the border color for outlined mode
                      onSurface: textColor, // This affects the text color in outlined mode
                    }
                  }}
                >
                  <Text style={{ color: textColor, fontFamily: 'Poppins-Regular', fontSize: 14 }}>Km</Text>
                </Button>
              </View>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={20}
                step={1}
                value={distance}
                onValueChange={setDistance}
                minimumTrackTintColor={textColor}
                maximumTrackTintColor={placeholderTextColor}
              />
              <Text style={{ alignSelf: 'center', marginBottom: 24, fontSize: 14, fontFamily: 'Poppins-Regular', color: textColor }}>
                {`> ${distance} ${unit}`}
              </Text>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={[styles.inputLabel, {color: textColor}]}>Number of Attendees</Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={20}
                step={1}
                value={attendees}
                onValueChange={setAttendees}
                minimumTrackTintColor={textColor}
                maximumTrackTintColor="#eee"
              />
              <Text style={{ alignSelf: 'center', marginBottom: 24, color: textColor, fontFamily: 'Poppins-Regular', fontSize: 14 }}>
                {`> ${attendees} People`}
              </Text>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={[styles.inputLabel, {color: textColor}]}>Noise Level</Text>
              <View style={styles.choiceRow}>
                {noiseLevels.map((lvl) => (
                  <Pressable
                    key={lvl}
                    onPress={() => setNoise(lvl)}
                    style={[
                      styles.choice, {backgroundColor: textInputColor},
                      noise === lvl && {
                        borderColor: textColor,
                        borderWidth: 1,
                        backgroundColor: textInputColor,
                      }
                    ]}
                  >
                    <Text style={{ 
                      color: textColor, fontFamily: 'Poppins-Regular', fontSize: 14
                    }}>
                      {lvl}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {step === 4 && (
            <>
              <Text style={[styles.inputLabel, {color: textColor}]}>Location Type</Text>
              <View style={styles.choiceRow}>
                {locationTypes.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setLocation(type)}
                    style={[
                      styles.choice, {backgroundColor: textInputColor},
                      location === type && {
                        borderColor: textColor,
                        borderWidth: 1,
                        backgroundColor: textInputColor,}
                    ]}
                  >
                    <Text style={{ color: textColor, fontFamily: 'Poppins-Regular', fontSize: 14}}>{type}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Pressable style={[styles.footerBtn, { backgroundColor: '#f37b7b' }]} onPress={reset}>
            <Text style={{ color: textColor, fontFamily: 'Poppins-Regular', fontSize: 16 }}>Reset</Text>
          </Pressable>
          <Pressable
            style={[styles.footerBtn, { backgroundColor: '#5caef1' }]}
            onPress={step === 0 ? handleSave : nextOrSave}
          >
            <Text style={{ color: textColor, fontFamily: 'Poppins-Regular', fontSize: 16 }}>
              {step === 0 ? 'Save' : 'Next'}
            </Text>
          </Pressable>
        </View>

        {/* ⏪ Back button now uses ArrowLeft icon */}
        {step > 0 && (
          <Pressable onPress={() => setStep(0)} style={styles.backBtn} accessibilityLabel="Back to main filter menu">
            <ArrowLeft
              size={24}
              color={textColor}
              style={{marginTop: -5}}
            />
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    borderRadius: 18,
    padding: 20,
    margin: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    minHeight: 420,
    justifyContent: 'flex-start',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    alignSelf: 'center',
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold'
  },
  content: {
    marginTop: 5,
    marginBottom: 10,
  },
  inputBox: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  inputLabel: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular'
  },
  inputValue: {
    color: '#222',
    fontSize: 14,
    fontFamily: 'Poppins-Regular'
  },
  choiceRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  choice: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 10,
  },
  choiceSelected: {
    backgroundColor: '#5caef1',
    borderColor: '#3795e3',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  footerBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  backBtn: {
    position: 'absolute',
    left: 14,
    top: 20,
    padding: 5,
    zIndex: 1,
  },
});