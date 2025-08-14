import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

const ResetPasswordScreen = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // 'success', 'error', 'info'
    const [errors, setErrors] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const { isDarkMode } = useUser();
    const router = useRouter();
    const { token } = useLocalSearchParams();

    // Validates password using the same logic as signup screen
    const validatePassword = (pwd: string) => {
        const errors: string[] = [];
        if (pwd.length < 8) errors.push('At least 8 characters');
        if (!/[A-Z]/.test(pwd)) errors.push('At least 1 capital letter');
        if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('At least 1 special character');
        return errors;
    };

    const handleResetPassword = async () => {
        let newErrors = { newPassword: '', confirmPassword: '' };
        let hasError = false;

        if (!newPassword.trim()) {
            newErrors.newPassword = 'Please enter a new password';
            hasError = true;
        } else {
            const pwdErrors = validatePassword(newPassword);
            if (pwdErrors.length > 0) {
                newErrors.newPassword = 'Password must have: ' + pwdErrors.join(', ');
                hasError = true;
            }
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
            hasError = true;
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) {
            return;
        }

        if (!token) {
            setMessage({ text: 'Invalid reset token', type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: 'Changing your password...', type: 'info' });

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/reset-password/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    token, 
                    newPassword 
                })
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ 
                    text: 'Your password has been changed successfully! You can now log in with your new password.', 
                    type: 'success' 
                });
                
                setTimeout(() => {
                    setMessage({ text: '', type: '' });
                    router.push('/Login/Loginscreen');
                }, 2000);
            } else {
                setMessage({ 
                    text: result.message || 'Failed to change password. Please try again.', 
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
                <Text style={styles.cardTitle}>Set New Password</Text>
                <Text style={styles.description}>
                    Enter your new password below.
                </Text>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={[styles.inputContainer, errors.newPassword ? styles.inputError : null]}>
                        <Ionicons 
                            name="lock-closed-outline" 
                            size={16} 
                            color="#9CA3AF" 
                            style={styles.inputIcon} 
                        />
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
                            value={newPassword}
                            onChangeText={text => {
                                setNewPassword(text);
                                if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                                
                                if (message.type === 'error') {
                                    setMessage({ text: '', type: '' });
                                }
                            }}
                            secureTextEntry={!showNewPassword}
                            placeholder="Enter new password"
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity 
                            style={styles.eyeIcon} 
                            onPress={() => setShowNewPassword(!showNewPassword)}
                        >
                            <Ionicons 
                                name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                                size={16} 
                                color="#9CA3AF" 
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Confirm New Password</Text>
                    <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
                        <Ionicons 
                            name="lock-closed-outline" 
                            size={16} 
                            color="#9CA3AF" 
                            style={styles.inputIcon} 
                        />
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
                            value={confirmPassword}
                            onChangeText={text => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                                
                                if (message.type === 'error') {
                                    setMessage({ text: '', type: '' });
                                }
                            }}
                            secureTextEntry={!showConfirmPassword}
                            placeholder="Confirm new password"
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity 
                            style={styles.eyeIcon} 
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Ionicons 
                                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                                size={16} 
                                color="#9CA3AF" 
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                </View>

                <TouchableOpacity 
                    style={[styles.resetButton, isLoading && styles.resetButtonDisabled]} 
                    onPress={handleResetPassword}
                    disabled={isLoading}
                >
                    <Text style={styles.resetButtonText}>
                        {isLoading ? 'Changing Password...' : 'Change Password'}
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
    inputError: {
        borderColor: '#EF4444',
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: isDarkMode ? '#FFFFFF' : '#111827',
    },
    passwordInput: {
        paddingRight: 40,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        padding: 4,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
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

export default ResetPasswordScreen;
