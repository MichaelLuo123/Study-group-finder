import { useUser } from '@/contexts/UserContext';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// import { TwoFactorBE } from './TwoFactorBE';

const CODE_LENGTH = 6;
const RESEND_TIME = 60;
// var twoFA: TwoFactorBE;

const TwoFAPage = () => {
    const router = useRouter();
    const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
    const [timer, setTimer] = useState(RESEND_TIME);
    const [error, setError] = useState(false);
    const {isDarkMode, user} = useUser(); //figure out how we can access the username realname if it matches but not 

    const inputs = useRef<TextInput[]>([]);

    const [fontsLoaded] = useFonts({
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    });

    useEffect(() => {
        //load the 2FA backend by generating a key
        // twoFA = new TwoFactorBE();
        // if(user != null)
        //     twoFA.sendEmailWithCode(user?.email, user?.full_name) //can't be null because information should pass through in login screen

        const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (text: string, index: number) => {
        if (!/^\d$/.test(text)) return;
    
        const updated = [...code];
        updated[index] = text;
        setCode(updated);
        setError(false);
    
        if (index < CODE_LENGTH - 1) {
        inputs.current[index + 1]?.focus();
        }
    };
    
    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
        const updated = [...code];
    
        if (code[index] === '') {
            if (index > 0) {
            inputs.current[index - 1]?.focus();
            updated[index - 1] = '';
            }
        } else {
            updated[index] = '';
        }
    
        setCode(updated);
        }
    };

    //passwrod 111111 change for backend
    const handleSubmit = () => {
        const joined = code.join('');
        if (joined === '111111') {
            alert('Success!');
        } else {
            setError(true);
            setCode(Array(CODE_LENGTH).fill(''));
            inputs.current[0]?.focus();
        }
        // if(twoFA.compareOTP(Number(joined)))
        //     alert('Success!');
        // else{
        //     setError(true);
        //     setCode(Array(CODE_LENGTH).fill(''));
        //     inputs.current[0]?.focus();
        // }
    };

    //for backend ;)
    const handleResend = () => {
        setTimer(RESEND_TIME);
        setCode(Array(CODE_LENGTH).fill(''));
        setError(false);
        twoFA.scrambleCode();
        if(user != null)
            twoFA.sendEmailWithCode(user?.email, user?.full_name);
        alert('Verification code resent!');
        inputs.current[0]?.focus();
    };

    if (!fontsLoaded) return null;

    const styles = getStyles(isDarkMode, error);

    return (
        <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Image
                source={isDarkMode ? require('../../assets/images/arrow_white.png') : require('../../assets/images/Arrow_black.png')}
                style={styles.backArrow}
                resizeMode="contain"
            />
            </TouchableOpacity>

            <Text style={styles.title}>Two-Factor Authentication</Text>
            <Text style={styles.subtitle}>Enter 6-digit code sent to email{"\n"}
                
                Name@ucsd.edu</Text>

            <View style={styles.inputRow}>
            {code.map((digit, idx) => (
                <TextInput
                key={idx}
                ref={(ref) => {
                    if (ref) inputs.current[idx] = ref;
                }}
                style={styles.inputBox}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                returnKeyType="next"
                />
            ))}
            </View>

            {error && <Text style={styles.errorText}>Incorrect code! Please try again.</Text>}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Enter</Text>
            </TouchableOpacity>

            <Text style={styles.resendText}>
            Didn’t receive code?{" "}
            {timer > 0 ? (
                <Text style={styles.countdown}>{`0:${timer.toString().padStart(2, '0')}`}</Text>
            ) : (
                <Text style={styles.resendLink} onPress={handleResend}>Resend Code</Text>
            )}
            </Text>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const getStyles = (isDark: boolean, error: boolean) =>
    StyleSheet.create({
        container: {
        flex: 1,
        backgroundColor: isDark ? '#393939' : '#F5F5F5',
        padding: 24,
        },
        inner: {
        flex: 1,
        justifyContent: 'center',
        },
        backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        },
        backArrow: {
        width: 30,
        height: 30,
        },
        title: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: isDark ? '#fff' : '#000',
        textAlign: 'center',
        marginBottom: 12,
        },
        subtitle: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: isDark ? '#E5E5E5' : '#6E6E6E',
        textAlign: 'center',
        marginBottom: 24,
        },
        inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        },
        inputBox: {
        width: 49,
        height: 78,
        fontSize: 18,
        fontFamily: 'Poppins-Regular',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDark ? '#E5E5E5' : '#6E6E6E',
        backgroundColor: isDark ? '#6E6E6E' : '#F5F5F5',
        color: isDark ? '#FFFFFF' : '#000000',
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
        padding: 0,
        },
        submitButton: {
        backgroundColor: '#5CAEF1',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
        },
        submitText: {
        fontFamily: 'Poppins-Regular',
        color: isDark ? '#FFFFFF' : '#000000',
        fontSize: 16,
        },
        resendText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: isDark ? '#FFFFFF' : '#000000',
        },
        resendLink: {
        color: '#5CAEF1',
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        },
        countdown: {
        color: isDark ? '#E5E5E5' :'#6E6E6E',
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        },
        errorText: {
        color: '#E36062',
        textAlign: 'center',
        fontSize: 16,
        marginTop: 6,
        fontFamily: 'Poppins-Regular',
        },
    });

export default TwoFAPage;
