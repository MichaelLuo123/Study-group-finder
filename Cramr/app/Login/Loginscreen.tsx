import { useUser } from '@/contexts/UserContext';
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


const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const {isDarkMode, toggleDarkMode} = useUser();
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [loginStatus, setLoginStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [loginMessage, setLoginMessage] = useState('');
    const router = useRouter();
    const { setUser } = useUser();

    //refactored to make it look cleaner
    const handleLogin = async () => {
        let newErrors = { email: '', password: '' };

        if(email.trim() && email.endsWith('.edu') && password.trim()) { //might replace the last part with regex but this works for now
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const result = await response.json();
                if (result.success) {
                    setLoginStatus('success');
                    setLoginMessage('Login successful!');
                    // Store user information in context
                    setUser(result.user);
                    // Navigate to 2FA page after successful login
                    setTimeout(() => {
                        router.push('/TwoFactor/TwoFAPage');
                    }, 1000); // Small delay to show success message
                } else {
                    setLoginStatus('error');
                    setLoginMessage(result.message || 'Login failed.');
                }
            } catch (error) {
                setLoginStatus('error');
                setLoginMessage('Network error. Please try again.');
            }
       }
        else { //don't know how you can do this efficiently and cleanly
            if (!email.trim()) {
                newErrors.email = 'Please enter your email!';
            } else if (!email.endsWith('.edu')) {
                newErrors.email = 'Please use a valid .edu email address.';
            }

            if (!password.trim()) {
                newErrors.password = 'Please enter your password!';
            }
            
            
            setErrors(newErrors);
        }

    };

   const styles = getStyles(isDarkMode);


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
                   <View style={styles.themeToggleContainer}>
                       <TouchableOpacity
                           style={styles.themeToggle}
                           onPress={toggleDarkMode}
                       >
                           <Ionicons name={isDarkMode ? "sunny" : "moon"} size={20} color={isDarkMode ? "#fff" : "#000"} />
                       </TouchableOpacity>
                   </View>


                   <View style={styles.logoSection}>
                       <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
                       <Text style={styles.title}>Sign in</Text>
                   </View>


                   <View style={styles.formContainer}>
                       <View style={styles.fieldContainer}>
                           <Text style={styles.label}>School Email</Text>
                           <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                               <Ionicons name="mail-outline" size={16} color="#9CA3AF" style={styles.inputIcon} />
                               <TextInput
                                   style={styles.input}
                                   value={email}
                                   onChangeText={text => {
                                       setEmail(text);
                                       if (errors.email) setErrors({ ...errors, email: '' });
                                   }}
                                   keyboardType="email-address"
                                   autoCapitalize="none"
                                   // placeholder="your.email@school.edu"
                                   placeholderTextColor="#9CA3AF"
                               />
                           </View>
                           {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                       </View>


                       <View style={styles.fieldContainer}>
                           <Text style={styles.label}>Password</Text>
                           <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                               <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" style={styles.inputIcon} />
                               <TextInput
                                   style={[styles.input, styles.passwordInput]}
                                   value={password}
                                   onChangeText={text => {
                                       setPassword(text);
                                       if (errors.password) setErrors({ ...errors, password: '' });
                                   }}
                                   secureTextEntry={!showPassword}
                                   // placeholder="Enter your password"
                                   placeholderTextColor="#9CA3AF"
                               />
                               <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                   <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={16} color="#9CA3AF" />
                               </TouchableOpacity>
                           </View>
                           {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                       </View>
                       
                       {/* Forgot Password Link */}
                       <TouchableOpacity 
                           style={styles.forgotPasswordContainer}
                           onPress={() => router.push('/Login/passwordrecovery')}
                       >
                           <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                       </TouchableOpacity>
                   </View>


                   <TouchableOpacity style={styles.signUpButton} onPress={handleLogin}>
                       <Text style={styles.signUpButtonText}>Sign In</Text>
                   </TouchableOpacity>
                   {loginStatus === 'error' && (
                       <Text style={[styles.errorText, { textAlign: 'center' }]}>{loginMessage}</Text>
                   )}
                   {loginStatus === 'success' && (
                       <Text style={{ color: 'green', textAlign: 'center', marginBottom: 8 }}>{loginMessage}</Text>
                   )}


                   <View style={styles.loginLinkContainer}>
                       <Text style={styles.loginText}>Don’t have an account? </Text>
                       <TouchableOpacity onPress={() => router.push('/SignUp/signupscreen')}>
                           <Text style={styles.signInText}>Sign up</Text>
                       </TouchableOpacity>
                   </View>
               </View>
           </KeyboardAwareScrollView>
       </SafeAreaView>
   );
};


const getStyles = (isDarkMode: boolean) => StyleSheet.create({
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
   logo: {
       width: 280,
       height: 160,
       resizeMode: 'contain',
   },
   title: {
       fontSize: 32,
       marginTop: -30,
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
       marginTop: -20,
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
       borderColor: '#EF4444',
   },
   errorText: {
       color: '#EF4444',
       fontSize: 12,
       marginTop: 4,
       marginLeft: 4,
   },
   forgotPasswordContainer: {
       alignItems: 'center',
       marginBottom: 16,
   },
   forgotPasswordText: {
       fontSize: 14,
       color: '#3B82F6',
       fontWeight: '500',
       textDecorationLine: 'underline',
   },
});


export default LoginScreen;