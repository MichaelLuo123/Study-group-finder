import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
//manages the state for input fields, password validation, error messages, and dark mode
const SignUpScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const router = useRouter();
    //logo image path
    const logoImagePath = require('../../assets/images/logo.png'); 
    //validates password
    const validatePassword = (pwd) => {
        const errors = [];
        if (pwd.length < 8) errors.push('At least 8 characters');
        if (!/[A-Z]/.test(pwd)) errors.push('At least 1 capital letter');
        if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('At least 1 special character');
        return errors;
    };
    //handles sign up process
    const handleSignUp = () => {
        let newErrors = { username: '', email: '', password: '', confirmPassword: '' };
        let hasError = false;
        if (!username.trim()) {
            newErrors.username = 'Please enter your name!';
            hasError = true;
        }
        if (!email.trim()) {
            newErrors.email = 'Please enter your email!';
            hasError = true;
        } else if (!email.endsWith('.edu')) {
            newErrors.email = 'Please use a valid .edu email address.';
            hasError = true;
        }
        const pwdErrors = validatePassword(password);
        if (!password.trim()) {
            newErrors.password = 'Please enter a password!';
            hasError = true;
        } else if (pwdErrors.length > 0) {
            newErrors.password = 'Password must have: ' + pwdErrors.join(', ');
            hasError = true;
        }
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password!';
            hasError = true;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match!';
            hasError = true;
        }
        setErrors(newErrors);
        if (!hasError) {
            router.push('/SignUp/signupsuccess');
        }
    };
    //styles for the sign up screen
    const styles = getStyles(isDarkMode);
    //returns the sign up screen
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: styles.container.backgroundColor }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            
            <KeyboardAwareScrollView
                contentContainerStyle={styles.contentContainer}
                enableOnAndroid={true}
                extraScrollHeight={Platform.OS === 'ios' ? 30 : 100}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableAutomaticScroll={true}
                enableResetScrollToCoords={false}
                keyboardOpeningTime={100}
                extraHeight={Platform.OS === 'android' ? 100 : 30}
                keyboardDismissMode="interactive"
                scrollEnabled={true}
            >
                <View style={styles.card}>
                    {/* Theme Toggle */}
                    <View style={styles.themeToggleContainer}>
                        <TouchableOpacity
                            style={styles.themeToggle}
                            onPress={() => setIsDarkMode(!isDarkMode)}
                        >
                            <Ionicons 
                                name={isDarkMode ? "sunny" : "moon"} 
                                size={20} 
                                color={isDarkMode ? "#fff" : "#000"} 
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <Image source={logoImagePath} style={styles.logo} />
                        </View>
                        <Text style={styles.title}>Sign up</Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Name Field */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Name</Text>
                            <View style={[styles.inputContainer, errors.username ? styles.inputError : null]}>
                                <Ionicons 
                                    name="person-outline" 
                                    size={16} 
                                    color="#9CA3AF" 
                                    style={styles.inputIcon} 
                                />
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={text => {
                                        setUsername(text);
                                        if (errors.username) setErrors({ ...errors, username: '' });
                                    }}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
                        </View>

                        {/* Email Field */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>School Email</Text>
                            <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                                <Ionicons 
                                    name="mail-outline" 
                                    size={16} 
                                    color="#9CA3AF" 
                                    style={styles.inputIcon} 
                                />
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={text => {
                                        setEmail(text);
                                        if (errors.email) setErrors({ ...errors, email: '' });
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                        </View>

                        {/* Password Field */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                                <Ionicons 
                                    name="lock-closed-outline" 
                                    size={16} 
                                    color="#9CA3AF" 
                                    style={styles.inputIcon} 
                                />
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    value={password}
                                    onChangeText={text => {
                                        setPassword(text);
                                        if (errors.password) setErrors({ ...errors, password: '' });
                                    }}
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons 
                                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                        size={16} 
                                        color="#9CA3AF" 
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                        </View>

                        {/* Confirm Password Field */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
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
                                    }}
                                    secureTextEntry={!showConfirmPassword}
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
                    </View>

                    {/* Sign Up Button */}
                    <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                        <Text style={styles.signUpButtonText}>Sign Up</Text>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginLinkContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity>
                            <Text style={styles.signInText}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6',
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        padding: 16,
        paddingTop: 40,
    },
    card: {
        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
        borderRadius: 24,
        padding: 32,
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
    themeToggleContainer: {
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    themeToggle: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoContainer: {
        width: 220,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    logo: {
        width: 280,
        height: 160,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: isDarkMode ? '#FFFFFF' : '#111827',
        marginBottom: 16,
    },
    formContainer: {
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? '#FFFFFF' : '#111827',
        textAlign: 'center',
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
    passwordInput: {
        paddingRight: 40,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        padding: 4,
    },
    signUpButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    signUpButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
        color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    signInText: {
        fontSize: 14,
        color: isDarkMode ? '#60A5FA' : '#3B82F6',
        fontWeight: '500',
    },
    inputError: {
        borderColor: '#EF4444', // red-500
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});

export default SignUpScreen;