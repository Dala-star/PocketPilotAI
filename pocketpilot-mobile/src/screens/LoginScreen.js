import { useState, useContext } from "react";
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
import * as Haptics from "expo-haptics";

import { AuthContext } from "../context/AuthContext";
import { loginUser } from "../api/auth";
import { colors, fonts, spacing, radius, shadow } from "../theme/tokens";


function getErrorMessage(error) {
    const detail = error?.response?.data?.detail;

    if (Array.isArray(detail)) {
        return detail.map((d) => d.msg).join("\n");
    }

    if (typeof detail === "string") {
        return detail;
    }

    return "Invalid login";
}


function LoginScreen({ navigation }) {

    const { login } = useContext(AuthContext);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);


    const submit = async () => {

        if (!form.email.trim() || !form.password) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Missing info", "Enter both your email and password.");

            return;

        }

        try {

            setLoading(true);

            const response = await loginUser(form.email.trim(), form.password);

            await login(response.access_token);

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Login failed",
                getErrorMessage(error)
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

            <View style={styles.card}>

                <View style={styles.logoBadge}>
                    <Text style={styles.logoBadgeText}>PP</Text>
                </View>

                <Text style={styles.title}>PocketPilot AI</Text>

                <Text style={styles.subtitle}>Log in to your account</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={colors.inkSoft}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={form.email}
                    onChangeText={(text) => setForm({ ...form, email: text })}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={colors.inkSoft}
                    secureTextEntry
                    value={form.password}
                    onChangeText={(text) => setForm({ ...form, password: text })}
                />

                <TouchableOpacity
                    onPress={() => navigation.navigate("ForgotPassword")}
                    style={styles.forgotLink}
                >
                    <Text style={styles.forgotLinkText}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={submit}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Logging in..." : "Login"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                    <Text style={styles.link}>
                        Don't have an account? <Text style={styles.linkAccent}>Register</Text>
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

    card: {
        backgroundColor: colors.white,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 2,
    },

    logoBadge: {
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

    logoBadgeText: {
        fontFamily: fonts.displayBold,
        color: colors.white,
        fontSize: 18,
        letterSpacing: 0.5,
    },

    title: {
        fontFamily: fonts.displayBold,
        fontSize: 24,
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

    forgotLink: {
        alignSelf: "flex-end",
        marginBottom: spacing.xs,
    },

    forgotLinkText: {
        fontFamily: fonts.bodyMedium,
        color: colors.navySoft,
        fontSize: 13,
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

export default LoginScreen;