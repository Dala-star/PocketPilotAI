import { useContext, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet,
    RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { AuthContext } from "../context/AuthContext";
import { getProfile, updateProfile, changePassword } from "../api/settings";
import { colors, fonts, spacing, radius } from "../theme/tokens";


function SettingsScreen() {

    const { logout } = useContext(AuthContext);

    const [profile, setProfile] = useState({ name: "", email: "" });

    const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });

    const [savingProfile, setSavingProfile] = useState(false);

    const [savingPassword, setSavingPassword] = useState(false);

    const [refreshing, setRefreshing] = useState(false);


    const getInitials = (name) => {

        if (!name) return "?";

        const parts = name.trim().split(/\s+/);

        const first = parts[0]?.[0] || "";

        const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

        return (first + last).toUpperCase();

    };


    const loadProfile = async () => {

        try {

            const data = await getProfile();

            setProfile({ name: data.name, email: data.email });

        } catch (error) {

            console.log(error);

        }

    };


    useFocusEffect(
        useCallback(() => {

            loadProfile();

        }, [])
    );


    const onRefresh = async () => {

        setRefreshing(true);

        await loadProfile();

        setRefreshing(false);

    };


    const saveProfile = async () => {

        if (!profile.name.trim() || !profile.email.trim()) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Missing info", "Name and email are both required.");

            return;

        }

        try {

            setSavingProfile(true);

            await updateProfile(profile);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert("Success", "Profile updated successfully.");

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Unable to update profile",
                error.response?.data?.detail || "Something went wrong."
            );

        } finally {

            setSavingProfile(false);

        }

    };


    const submitPasswordChange = async () => {

        if (!password.currentPassword || !password.newPassword) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Missing info", "Enter both your current and new password.");

            return;

        }

        if (password.newPassword.length < 8) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Password too short", "New password must be at least 8 characters.");

            return;

        }

        try {

            setSavingPassword(true);

            // Backend expects snake_case field names — mapped here from the
            // camelCase local state.
            await changePassword({
                current_password: password.currentPassword,
                new_password: password.newPassword,
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert("Success", "Password updated successfully.");

            setPassword({ currentPassword: "", newPassword: "" });

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Unable to change password",
                error.response?.data?.detail || "Something went wrong."
            );

        } finally {

            setSavingPassword(false);

        }

    };


    const confirmLogout = () => {

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Alert.alert(
            "Log out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Log out", style: "destructive", onPress: logout },
            ]
        );

    };


    return (

        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.navy}
                    colors={[colors.navy]}
                />
            }
        >

            <Text style={styles.title}>Settings</Text>

            <View style={styles.profileHeader}>

                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
                </View>

                <View style={styles.profileHeaderText}>
                    <Text style={styles.profileName}>{profile.name || "Your name"}</Text>
                    <Text style={styles.profileEmail}>{profile.email}</Text>
                </View>

            </View>

            <View style={styles.card}>

                <Text style={styles.sectionTitle}>Profile</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={colors.inkSoft}
                    value={profile.name}
                    onChangeText={(text) => setProfile({ ...profile, name: text })}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={colors.inkSoft}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={profile.email}
                    onChangeText={(text) => setProfile({ ...profile, email: text })}
                />

                <TouchableOpacity
                    style={[styles.primaryButton, savingProfile && styles.buttonDisabled]}
                    onPress={saveProfile}
                    disabled={savingProfile}
                >
                    <Text style={styles.primaryButtonText}>
                        {savingProfile ? "Saving..." : "Save Changes"}
                    </Text>
                </TouchableOpacity>

            </View>

            <View style={styles.card}>

                <Text style={styles.sectionTitle}>Change Password</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Current Password"
                    placeholderTextColor={colors.inkSoft}
                    secureTextEntry
                    value={password.currentPassword}
                    onChangeText={(text) =>
                        setPassword({ ...password, currentPassword: text })
                    }
                />

                <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor={colors.inkSoft}
                    secureTextEntry
                    value={password.newPassword}
                    onChangeText={(text) =>
                        setPassword({ ...password, newPassword: text })
                    }
                />

                <TouchableOpacity
                    style={[styles.secondaryButton, savingPassword && styles.buttonDisabled]}
                    onPress={submitPasswordChange}
                    disabled={savingPassword}
                >
                    <Text style={styles.primaryButtonText}>
                        {savingPassword ? "Updating..." : "Update Password"}
                    </Text>
                </TouchableOpacity>

            </View>

            <View style={styles.card}>

                <Text style={styles.sectionTitle}>Account</Text>

                <TouchableOpacity style={styles.dangerButton} onPress={confirmLogout}>
                    <Text style={styles.primaryButtonText}>Logout</Text>
                </TouchableOpacity>

            </View>

        </ScrollView>

    );

}

const styles = StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: colors.paper,
    },

    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },

    title: {
        fontFamily: fonts.displayBold,
        fontSize: 24,
        color: colors.ink,
        marginBottom: spacing.md,
    },

    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.md,
    },

    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.navy,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
    },

    avatarText: {
        fontFamily: fonts.displayBold,
        color: colors.white,
        fontSize: 20,
    },

    profileHeaderText: {
        flex: 1,
    },

    profileName: {
        fontFamily: fonts.displayBold,
        color: colors.ink,
        fontSize: 18,
    },

    profileEmail: {
        fontFamily: fonts.body,
        color: colors.inkSoft,
        fontSize: 13,
        marginTop: 2,
    },

    card: {
        backgroundColor: colors.white,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.md,
    },

    sectionTitle: {
        fontFamily: fonts.displayBold,
        fontSize: 16,
        color: colors.ink,
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

    primaryButton: {
        backgroundColor: colors.navy,
        borderRadius: radius.sm,
        paddingVertical: spacing.sm + 4,
        alignItems: "center",
        marginTop: spacing.xs,
    },

    secondaryButton: {
        backgroundColor: colors.mint,
        borderRadius: radius.sm,
        paddingVertical: spacing.sm + 4,
        alignItems: "center",
        marginTop: spacing.xs,
    },

    dangerButton: {
        backgroundColor: colors.coral,
        borderRadius: radius.sm,
        paddingVertical: spacing.sm + 4,
        alignItems: "center",
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    primaryButtonText: {
        color: colors.white,
        fontFamily: fonts.bodyMedium,
        fontSize: 15,
    },

});

export default SettingsScreen;