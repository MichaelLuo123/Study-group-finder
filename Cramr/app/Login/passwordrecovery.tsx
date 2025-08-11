import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const PasswordRecoveryScreen = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { isDarkMode } = useUser();
    const router = useRouter();

    const handleResetPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        if (!email.endsWith('.edu')) {
            Alert.alert('Error', 'Please use a valid .edu email address');
            return;
        }

        setIsLoading(true);

    };

    const styles = getStyles(isDarkMode);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: styles.container.backgroundColor }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                >
                    <Ionicons 
                        name="arrow-back" 
                        size={24} 
                        color={isDarkMode ? '#FFFFFF' : '#111827'} 
                    />
                </TouchableOpacity>
                <Text style={styles.title}>Reset Password</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.description}>
                    Enter your school email address and we'll send you instructions to reset your password.
                </Text>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>School Email</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons 
                            name="mail-outline" 
                            size={16} 
                            color="#9CA3AF" 
                            style={styles.inputIcon} 
                        />
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="your.email@school.edu"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.resetButton, isLoading && styles.resetButtonDisabled]} 
                    onPress={handleResetPassword}
                    disabled={isLoading}
                >
                    <Text style={styles.resetButtonText}>
                        {isLoading ? 'Sending...' : 'Reset Password'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 20,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? '#FFFFFF' : '#111827',
    },
    card: {
        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
    },
    description: {
        fontSize: 16,
        color: isDarkMode ? '#9CA3AF' : '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    fieldContainer: {
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? '#FFFFFF' : '#111827',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? '#6B7280' : '#D1D5DB',
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: isDarkMode ? '#FFFFFF' : '#111827',
    },
    resetButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    resetButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PasswordRecoveryScreen;
