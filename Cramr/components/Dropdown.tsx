import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

interface DropdownOption {
    label: string;
    value: string;
}

interface DropdownProps {
    options: DropdownOption[]; // array of options with label and value
    placeholder?: string; // optional placeholder text
    onSelect: (value: string) => void; // callback when an option is selected
    style?: object; // optional style for the dropdown container
}

const Dropdown: React.FC<DropdownProps> = ({ 
    options, 
    placeholder = "Select an option", 
    onSelect,
    style = {marginLeft: 20, marginRight: 20}
}) => {
    // Get theme colors for consistent styling
    const dropdownColor = useThemeColor({}, 'dropdown');
    const textInputColor = useThemeColor({}, 'textInput');
    const textColor = useThemeColor({}, 'text');

    // State to track if dropdown is open/closed
    const [isOpen, setIsOpen] = useState<boolean>(false);
  
    // State to keep track of all selected options as an array
    const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>([]);

    // State to keep track of remaining unselected options
    const [remainingOptions, setRemainingOptions] = useState<DropdownOption[]>(options);

    // Handler when an option is selected from the dropdown
    const handleSelect = (option: DropdownOption): void => {
        // Add the selected option to the list of selected options
        setSelectedOptions(prev => [...prev, option]);
        // Remove the selected option from remaining options to prevent re-selection
        setRemainingOptions(prevOptions => 
            prevOptions.filter(opt => opt.value !== option.value)
        );
        // Close the dropdown after selection
        setIsOpen(false);
        // Call the parent component's callback with the selected value
        onSelect(option.value);
    };

    // Handler to delete a selected option (called from swipe-to-delete)
    const handleDelete = (indexToDelete: number): void => {
        const deletedOption = selectedOptions[indexToDelete];
    
        // Remove the option from selected options array
        setSelectedOptions(prev => prev.filter((_, index) => index !== indexToDelete));

        // Add the deleted option back to remaining options and sort alphabetically
        setRemainingOptions(prev => [...prev, deletedOption].sort((a, b) => a.value.localeCompare(b.value)));
    };

    return (
        <View style={styles.container}>
            {/* Gray bar with arrow - the main dropdown trigger */}
            <TouchableOpacity
                style={[styles.grayBar, { backgroundColor: dropdownColor }]}
                onPress={() => setIsOpen(!isOpen)} // Toggle dropdown open/closed state
                activeOpacity={0.7}
            >
                {/* Down arrow icon that rotates when dropdown opens */}
                <Image 
                    source={require('../assets/images/down_arrow.png')} 
                    style={[styles.icon, { transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }]} 
                />
            </TouchableOpacity>

            {/* Dropdown menu - only visible when isOpen is true */}
            {isOpen && (
                <View style={[styles.menu, { backgroundColor: textInputColor }]}>
                    {/* Map through remaining options to create selectable items */}
                    {remainingOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.option,
                                // Remove border from last item for cleaner look
                                index === remainingOptions.length - 1 && styles.lastOption
                            ]}
                            onPress={() => handleSelect(option)}
                        >
                            <Text style={[styles.bodyText, { color: textColor }]}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Render all selected options with swipe-to-delete functionality */}
            {selectedOptions.map((option, index) => (
                <View key={index}>
                    <View style={[styles.selectedContainer, { backgroundColor: textInputColor, marginTop: 10 }]}>
                        <Text style={[styles.bodyText, { color: textColor }]}>{option.label}</Text>
                    </View>

                    <TextInput
                        style={[styles.bodyText, styles.largeTextInputContainer, { backgroundColor: textInputColor, marginTop: 1 }]}
                        placeholder="Enter answer to prompt."
                        textAlign="left"
                        textAlignVertical="top"
                        maxLength={100}
                        multiline={true}
                    />

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(index)}
                    >
                        <Text style={[styles.deleteText]}>✕</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    bodyText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    container: {
        position: 'relative',
    },
    grayBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
    },
    selectedContainer: {
        padding: 10,
        borderRadius: 10,
    },
    selectedText: {
        color: 'white',
        fontSize: 16,
        flex: 1,
    },
    icon: {
        width: 20,
        height: 20,
    },
    menu: {
        borderRadius: 10,
    },
    option: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    lastOption: {
        borderBottomWidth: 0,
    },
    largeTextInputContainer: {
        width: '100%',
        height: 80,
        borderRadius: 10,
        padding: 10,
    },
    deleteButton: {
        position: 'absolute',
        right: 15,
        top: 23,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteText: {
        fontSize: 14,
        color: '#E36062',
        fontWeight: 'bold',
    },
});

export default Dropdown;