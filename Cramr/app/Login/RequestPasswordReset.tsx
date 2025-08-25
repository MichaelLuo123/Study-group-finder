import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const RequestPasswordResetScreen = () => {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // 'success', 'error', 'info'
    const { isDarkMode } = useUser();
    const router = useRouter();

    const handleSendCode = async () => {
        if (!email.trim()) {
            setMessage({ text: 'Please enter your email address', type: 'error' });
            return;
        }

        if (!email.endsWith('.edu')) {
            setMessage({ text: 'Please use a valid .edu email address', type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: 'Sending verification code...', type: 'info' });

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ 
                    text: 'A 6-digit verification code has been sent to your email. Please check your inbox.', 
                    type: 'success' 
                });
                setIsCodeSent(true);
                setTimeout(() => {
                    setMessage({ text: '', type: '' });
                }, 3000);
            } else {
                setMessage({ 
                    text: result.message || 'Failed to send verification code. Please try again.', 
                    type: 'error' 
                });
            }
        } catch (error) {
            setMessage({ 
                text: 'Network error. Please check your connection and try again.', 
                type: 'error' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode.trim()) {
            setMessage({ text: 'Please enter the verification code', type: 'error' });
            return;
        }

        if (verificationCode.length !== 6) {
            setMessage({ text: 'Please enter a valid 6-digit code', type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: 'Verifying code...', type: 'info' });

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/verify-reset-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    verificationCode 
                })
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ 
                    text: 'Code verified successfully! Redirecting to password reset...', 
                    type: 'success' 
                });
                
                setTimeout(() => {
                    router.push({
                        pathname: '/Login/SetNewPassword',
                        params: { token: result.token }
                    });
                }, 1500);
            } else {
                setMessage({ 
                    text: result.message || 'Invalid verification code. Please try again.', 
                    type: 'error' 
                });
            }
        } catch (error) {
            setMessage({ 
                text: 'Network error. Please check your connection and try again.', 
                type: 'error' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setVerificationCode('');
        setMessage({ text: 'Resending verification code...', type: 'info' });
        
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ 
                    text: 'New verification code sent! Please check your email.', 
                    type: 'success' 
                });
                setTimeout(() => {
                    setMessage({ text: '', type: '' });
                }, 3000);
            } else {
                setMessage({ 
                    text: result.message || 'Failed to resend code. Please try again.', 
                    type: 'error' 
                });
            }
        } catch (error) {
            setMessage({ 
                text: 'Network error. Please check your connection and try again.', 
                type: 'error' 
            });
        }
    };

    const getMessageStyle = () => {
        if (!message.text) return null;
        
        switch (message.type) {
            case 'success':
                return styles.successMessage;
            case 'error':
                return styles.errorMessage;
            case 'info':
                return styles.infoMessage;
            default:
                return styles.infoMessage;
        }
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
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Reset Password</Text>
                <Text style={styles.description}>
                    {isCodeSent 
                        ? 'Enter the 6-digit verification code sent to your email.'
                        : 'Enter your email address to receive a verification code.'
                    }
                </Text>

                {!isCodeSent ? (
                    // Email input state
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Email address</Text>
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
                                onChangeText={(text) => {
                                    setEmail(text);
                                   
                                    if (message.type === 'error') {
                                        setMessage({ text: '', type: '' });
                                    }
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="your.email@school.edu"
                                placeholderTextColor="#9CA3AF"
                                editable={!isLoading}
                            />
                        </View>
                    </View>
                ) : (
                    // Code verification state
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Verification Code</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons 
                                name="key-outline" 
                                size={16} 
                                color="#9CA3AF" 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={verificationCode}
                                onChangeText={(text) => {
                                    const numericText = text.replace(/[^0-9]/g, '');
                                    setVerificationCode(numericText.slice(0, 6));
                                    
                                    if (message.type === 'error') {
                                        setMessage({ text: '', type: '' });
                                    }
                                }}
                                keyboardType="numeric"
                                placeholder="Enter 6-digit code"
                                placeholderTextColor="#9CA3AF"
                                maxLength={6}
                                editable={!isLoading}
                            />
                        </View>
                        <TouchableOpacity 
                            style={styles.resendButton} 
                            onPress={handleResendCode}
                            disabled={isLoading}
                        >
                            <Text style={styles.resendButtonText}>Resend Code</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity 
                    style={[styles.resetButton, isLoading && styles.resetButtonDisabled]} 
                    onPress={isCodeSent ? handleVerifyCode : handleSendCode}
                    disabled={isLoading}
                >
                    <Text style={styles.resetButtonText}>
                        {isLoading 
                            ? (isCodeSent ? 'Verifying...' : 'Sending...') 
                            : (isCodeSent ? 'Verify Code' : 'Send Code')
                        }
                    </Text>
                </TouchableOpacity>

                {/* Message display */}
                {message.text && (
                    <View style={[styles.messageContainer, getMessageStyle()]}>
                        <Ionicons 
                            name={
                                message.type === 'success' ? 'checkmark-circle' : 
                                message.type === 'error' ? 'close-circle' : 
                                'information-circle'
                            } 
                            size={16} 
                            color={
                                message.type === 'success' ? '#10B981' : 
                                message.type === 'error' ? '#EF4444' : 
                                '#3B82F6'
                            } 
                            style={styles.messageIcon}
                        />
                        <Text style={[styles.messageText, getMessageStyle()]}>
                            {message.text}
                        </Text>
                    </View>
                )}
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
    cardTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: isDarkMode ? '#FFFFFF' : '#111827',
        textAlign: 'center',
        marginBottom: 16,
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
        borderColor: isDarkMode ? '#6B5563' : '#D1D5DB',
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
    resendButton: {
        alignSelf: 'flex-end',
        marginTop: 8,
        padding: 8,
    },
    resendButtonText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '500',
    },
    resetButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    resetButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    messageIcon: {
        marginRight: 8,
    },
    messageText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    successMessage: {
        backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5',
        borderColor: '#10B981',
    },
    errorMessage: {
        backgroundColor: isDarkMode ? '#7F1D1D' : '#FEF2F2',
        borderColor: '#EF4444',
    },
    infoMessage: {
        backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF',
        borderColor: '#3B82F6',
    },
});

export default RequestPasswordResetScreen;
