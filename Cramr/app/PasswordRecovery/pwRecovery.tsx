import React, { useMemo, useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  LayoutAnimation,
  UIManager,
} from "react-native";

export default function PasswordRecoveryScreen({ onBack }: { onBack?: () => void }) {
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const emailRegex = useMemo(
    () =>
      /^(?:[a-zA-Z0-9_'^&+%=-]+(?:\.[a-zA-Z0-9_'^&+%=-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
    []
  );

  const emailValid = emailRegex.test(email);
  const emailsMatch = email.trim() !== "" && email === confirm;
  const canSubmit = emailValid && emailsMatch;

  function handleSubmit() {
    setSubmitted(true);
    if (!canSubmit) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSuccessMessage(`Password sent to ${email}!`);
  }

  function handleBack() {
    if (onBack) return onBack();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text style={styles.backIcon}>{"\u2190"}</Text>
              </Pressable>
            </View>

            {/* Title */}
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Password Recovery</Text>
              <Text style={styles.subtitle}>
                Enter your email address to receive your password.
              </Text>
            </View>

            {/* Form */}
            <View>
              <View style={styles.fieldBlock}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Email address"
                  placeholderTextColor="#6B7280"
                  style={styles.input}
                />
                {submitted && !emailValid && (
                  <Text style={styles.errorText}>Please enter a valid email.</Text>
                )}
              </View>

              <View style={styles.fieldBlock}>
                <TextInput
                  value={confirm}
                  onChangeText={setConfirm}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Confirm email address"
                  placeholderTextColor="#6B7280"
                  style={styles.input}
                />
                {submitted && !emailsMatch && (
                  <Text style={styles.errorText}>Emails don’t match.</Text>
                )}
              </View>

              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  !canSubmit && styles.btnDisabled,
                  pressed && canSubmit && styles.pressed,
                ]}
              >
                <Text style={styles.primaryBtnText}>Recover Password</Text>
              </Pressable>

              {successMessage ? (
                <Text style={styles.successText}>{successMessage}</Text>
              ) : (
                <Text style={styles.finePrint}>
                  We’ll send a password reset link to your email if it’s associated with an
                  account.
                </Text>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // LIGHT THEME
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6", // neutral-100
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 420,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB", // neutral-300
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: {
    padding: 8,
    borderRadius: 999,
  },
  backIcon: {
    color: "#111827", // neutral-900
    fontSize: 20,
    lineHeight: 20,
  },
  pressed: { opacity: 0.9 },
  titleBlock: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 22,
  },
  subtitle: {
    marginTop: 8,
    color: "#6B7280", // neutral-500
    textAlign: "center",
  },
  fieldBlock: { marginBottom: 12 },
  input: {
    width: "100%",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB", // neutral-200
  },
  errorText: {
    marginTop: 6,
    color: "#EF4444", // red-500
    fontSize: 12,
  },
  primaryBtn: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#60A5FA", // blue-400
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  btnDisabled: { opacity: 0.6 },
  finePrint: {
    marginTop: 16,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  successText: {
    marginTop: 16,
    fontSize: 14,
    color: "#4B5563", // neutral-600
    fontWeight: "600",
    textAlign: "center",
  },
});