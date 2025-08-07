import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Button } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import Modal from 'react-native-modal';

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
  const [step, setStep] = useState(0);
  const [distance, setDistance] = useState(1);
  const [unit, setUnit] = useState<'mi' | 'km'>('mi');
  const [attendees, setAttendees] = useState(2);
  const [noise, setNoise] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const reset = () => {
    setDistance(1);
    setUnit('mi');
    setAttendees(2);
    setNoise(null);
    setLocation(null);
    setStep(0);
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
      <View style={styles.modal}>
        <Text style={styles.header}>Filter by</Text>
        <View style={styles.content}>
          {step === 0 && (
            <>
              <Pressable style={styles.inputBox} onPress={() => setStep(1)}>
                <Text style={styles.inputLabel}>Distance</Text>
                <Text style={styles.inputValue}>
                  {distance} {unit}
                </Text>
              </Pressable>
              <Pressable style={styles.inputBox} onPress={() => setStep(2)}>
                <Text style={styles.inputLabel}>Number of Attendees</Text>
                <Text style={styles.inputValue}>{attendees} people</Text>
              </Pressable>
              <Pressable style={styles.inputBox} onPress={() => setStep(3)}>
                <Text style={styles.inputLabel}>Noise Level</Text>
                <Text style={styles.inputValue}>{noise || ''}</Text>
              </Pressable>
              <Pressable style={styles.inputBox} onPress={() => setStep(4)}>
                <Text style={styles.inputLabel}>Location Type</Text>
                <Text style={styles.inputValue}>{location || ''}</Text>
              </Pressable>
            </>
          )}
          {step === 1 && (
            <>
              <Text style={styles.inputLabel}>Distance</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                <Button mode={unit === 'mi' ? 'contained' : 'outlined'} onPress={() => setUnit('mi')}>
                  Mi
                </Button>
                <Button
                  mode={unit === 'km' ? 'contained' : 'outlined'}
                  onPress={() => setUnit('km')}
                  style={{ marginLeft: 8 }}
                >
                  Km
                </Button>
              </View>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={20}
                step={1}
                value={distance}
                onValueChange={setDistance}
                minimumTrackTintColor="#5caef1"
                maximumTrackTintColor="#eee"
              />
              <Text style={{ alignSelf: 'center', marginBottom: 24 }}>
                {`> ${distance} ${unit}`}
              </Text>
            </>
          )}
          {step === 2 && (
            <>
              <Text style={styles.inputLabel}>Number of Attendees</Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={20}
                step={1}
                value={attendees}
                onValueChange={setAttendees}
                minimumTrackTintColor="#5caef1"
                maximumTrackTintColor="#eee"
              />
              <Text style={{ alignSelf: 'center', marginBottom: 24 }}>
                {`> ${attendees} People`}
              </Text>
            </>
          )}
          {step === 3 && (
            <>
              <Text style={styles.inputLabel}>Noise Level</Text>
              <View style={styles.choiceRow}>
                {noiseLevels.map((lvl) => (
                  <Pressable
                    key={lvl}
                    onPress={() => setNoise(lvl)}
                    style={[
                      styles.choice,
                      noise === lvl && styles.choiceSelected,
                    ]}
                  >
                    <Text style={{ color: noise === lvl ? 'white' : '#333' }}>{lvl}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={{ alignSelf: 'flex-end', marginBottom: 24 }}>{noise || ''}</Text>
            </>
          )}
          {step === 4 && (
            <>
              <Text style={styles.inputLabel}>Location Type</Text>
              <View style={styles.choiceRow}>
                {locationTypes.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setLocation(type)}
                    style={[
                      styles.choice,
                      location === type && styles.choiceSelected,
                    ]}
                  >
                    <Text style={{ color: location === type ? 'white' : '#333' }}>{type}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={{ alignSelf: 'flex-end', marginBottom: 24 }}>{location || ''}</Text>
            </>
          )}
        </View>
        <View style={styles.footer}>
          <Pressable style={[styles.footerBtn, { backgroundColor: '#f37b7b' }]} onPress={reset}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Reset</Text>
          </Pressable>
          <Pressable
            style={[styles.footerBtn, { backgroundColor: '#5caef1' }]}
            onPress={step === 0 ? handleSave : nextOrSave}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {step === 0 ? 'Save' : 'Next'}
            </Text>
          </Pressable>
        </View>
        {step > 0 && (
          <Pressable onPress={prev} style={styles.backBtn}>
            <Text style={{ color: '#5caef1', fontWeight: 'bold', fontSize: 16 }}>{'<'}</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
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
    fontSize: 17,
    alignSelf: 'center',
    marginBottom: 8,
  },
  content: {
    marginBottom: 32,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 9,
    padding: 14,
    marginBottom: 12,
  },
  inputLabel: {
    color: '#666',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  inputValue: {
    color: '#222',
    fontSize: 14,
  },
  choiceRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  choice: {
    backgroundColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'transparent',
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