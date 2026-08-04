import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { resetPassword } from "../api/auth";
import { colors, fonts, spacing, radius, shadow } from "../theme/tokens";


// route.params.token is populated automatically when the app is opened via
// the deep link in the reset email. Pasting the code manually still works
// as a fallback for testing or if the link doesn't open the app directly.
function ResetPasswordScreen({ navigation, route }) {

    const [token, setToken] = useState(route?.params?.token || "");

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);


    const submit = async () => {

        if (!token.trim()) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Missing code", "Paste the reset code from your email.");

            return;

        }

        if (newPassword.length < 8) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Password too short", "New password must be at least 8 characters.");

            return;

        }

        if (newPassword !== confirmPassword) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Passwords don't match", "Make sure both passwords match.");

            return;

        }

        try {

            setLoading(true);

            await resetPassword(token.trim(), newPassword);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert("Success", "Your password has been reset. Please log in.", [
                { text: "OK", onPress: () => navigation.navigate("Login") },
            ]);

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Reset failed",
                error.response?.data?.detail || "That reset link is invalid or expired."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={22} color={colors.ink} />
            </TouchableOpacity>

            <View style={styles.card}>

                <View style={styles.iconBadge}>
                    <Ionicons name="lock-open-outline" size={24} color={colors.white} />
                </View>

                <Text style={styles.title}>Set a new password</Text>

                <Text style={styles.subtitle}>
                    Paste the reset code from your email, then choose a new password.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Reset code"
                    placeholderTextColor={colors.inkSoft}
                    autoCapitalize="none"
                    value={token}
                    onChangeText={setToken}
                />

                <TextInput
                    style={styles.input}
                    placeholder="New password"
                    placeholderTextColor={colors.inkSoft}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.inkSoft}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={submit}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Resetting..." : "Reset password"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.link}>
                        Remembered it? <Text style={styles.linkAccent}>Back to login</Text>
                    </Text>
                </TouchableOpacity>

            </View>

        </KeyboardAvoidingView>

    );

}

const styles = StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: colors.paper,
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
    },

    backButton: {
        position: "absolute",
        top: spacing.xl,
        left: spacing.lg,
        width: 40,
        height: 40,
        borderRadius: radius.pill,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        ...shadow.card,
    },

    card: {
        backgroundColor: colors.white,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        padding: spacing.lg,
        ...shadow.card,
    },

    iconBadge: {
        width: 52,
        height: 52,
        borderRadius: radius.md,
        backgroundColor: colors.navy,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginBottom: spacing.sm,
        ...shadow.button,
    },

    title: {
        fontFamily: fonts.displayBold,
        fontSize: 22,
        color: colors.ink,
        textAlign: "center",
        letterSpacing: -0.3,
    },

    subtitle: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.inkSoft,
        textAlign: "center",
        marginTop: spacing.xs,
        marginBottom: spacing.md,
        lineHeight: 19,
    },

    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        fontFamily: fonts.body,
        color: colors.ink,
        marginBottom: spacing.sm,
    },

    button: {
        backgroundColor: colors.navy,
        borderRadius: radius.sm,
        paddingVertical: spacing.sm + 4,
        alignItems: "center",
        marginTop: spacing.sm,
        ...shadow.button,
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    buttonText: {
        color: colors.white,
        fontFamily: fonts.bodyMedium,
        fontSize: 15,
    },

    link: {
        textAlign: "center",
        marginTop: spacing.md,
        fontFamily: fonts.body,
        color: colors.inkSoft,
        fontSize: 13,
    },

    linkAccent: {
        color: colors.mint,
        fontFamily: fonts.bodyMedium,
    },

});

export default ResetPasswordScreen;
