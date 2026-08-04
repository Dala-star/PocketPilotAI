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

import { registerUser } from "../api/auth";
import { colors, fonts, spacing, radius, shadow } from "../theme/tokens";


function RegisterScreen({ navigation }) {

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);


    const submit = async () => {

        try {

            setLoading(true);

            await registerUser(form);

            Alert.alert("Success", "Account created successfully!");

            navigation.navigate("Login");

        } catch (error) {

            console.log(error);

            Alert.alert(
                "Registration failed",
                error.response?.data?.detail || "Registration failed"
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

                <Text style={styles.title}>Create Account</Text>

                <Text style={styles.subtitle}>Start tracking your money</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor={colors.inkSoft}
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                />

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
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={submit}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Creating Account..." : "Register"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.link}>
                        Already have an account? <Text style={styles.linkAccent}>Login</Text>
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

export default RegisterScreen;
