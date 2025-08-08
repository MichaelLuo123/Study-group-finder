import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface SliderProps {
    rightLabel: string;
    leftLabel: string;
    width: number;
    onChangeSlider?: (value: boolean) => void;
    value?: boolean; // Optional initial value
    style?: object; // Optional style prop for customization
}

const Slider: React.FC<SliderProps> = ({ 
    rightLabel, 
    leftLabel, 
    width,
    onChangeSlider: onValueChange, 
    value: initialValue = false,
    style={}
}) => {
    const sliderBackgroundColor = (true ? Colors.light.sliderBackground : Colors.dark.sliderBackground)
    const sliderColor = (true ? Colors.light.slider : Colors.dark.slider)
    const textColor = (true ? Colors.light.text : Colors.dark.text)

    const [value, setValue] = useState(initialValue);
    const [slideAnim] = useState(new Animated.Value(initialValue ? 1 : 0));

    const toggleSlider = () => {
        const newValue = !value;
        setValue(newValue);
        onValueChange?.(newValue);
        
        Animated.timing(slideAnim, {
        toValue: newValue ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
        }).start();
    };

    const slideWidth = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '50%'],
    });

    return (
        <TouchableOpacity style={[{width: width, height: 40}, style]} onPress={toggleSlider}>
            <View style={[styles.track, { backgroundColor: sliderBackgroundColor }]}>
            <Animated.View 
                style={[
                styles.slider, 
                {
                    left: slideWidth, 
                    backgroundColor: sliderColor,
                }
                ]}
            />
            <View style={styles.labelContainer}>
                <Text style={[styles.bodyText, {color: textColor}]}>{leftLabel}</Text>
                <Text style={[styles.bodyText, {color: textColor}]}>{rightLabel}</Text>
            </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    bodyText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    track: {
        flex: 1,
        backgroundColor: '#gray',
        borderRadius: 20,
        position: 'relative',
        justifyContent: 'center',
    },
    slider: {
        position: 'absolute',
        width: '50%',
        height: '100%',
        borderRadius: 20,
        zIndex: 1, 
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: '100%',
        borderRadius: 20,
        zIndex: 2, // In front of the slider
    },
});

export default Slider;