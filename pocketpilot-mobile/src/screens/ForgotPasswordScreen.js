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

import { forgotPassword } from "../api/auth";
import { colors, fonts, spacing, radius, shadow } from "../theme/tokens";


function ForgotPasswordScreen({ navigation }) {

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const [sent, setSent] = useState(false);


    const submit = async () => {

        if (!email.trim()) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Missing info", "Enter the email on your account.");

            return;

        }

        try {

            setLoading(true);

            await forgotPassword(email.trim());

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setSent(true);

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Something went wrong",
                error.response?.data?.detail || "Please try again."
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
                    <Ionicons
                        name={sent ? "mail-open-outline" : "key-outline"}
                        size={24}
                        color={colors.white}
                    />
                </View>

                <Text style={styles.title}>
                    {sent ? "Check your email" : "Forgot password?"}
                </Text>

                <Text style={styles.subtitle}>
                    {sent
                        ? `If ${email.trim()} is registered, a reset link is on its way. It expires in 30 minutes.`
                        : "Enter your account email and we'll send you a link to reset your password."}
                </Text>

                {!sent && (

                    <>

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={colors.inkSoft}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={submit}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? "Sending..." : "Send reset link"}
                            </Text>
                        </TouchableOpacity>

                    </>

                )}

                {sent && (

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate("ResetPassword")}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.buttonText}>I have a reset code</Text>
                    </TouchableOpacity>

                )}

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

export default ForgotPasswordScreen;
