import { useContext, useState, useCallback, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    Alert,
    StyleSheet,
    RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getProfile, updateProfile, changePassword } from "../api/settings";
import { fonts, spacing, radius, shadow } from "../theme/tokens";


const THEME_OPTIONS = [
    { key: "light", label: "Light", icon: "sunny-outline" },
    { key: "dark", label: "Dark", icon: "moon-outline" },
    { key: "system", label: "Match device", icon: "phone-portrait-outline" },
];


function SettingsScreen() {

    const { logout } = useContext(AuthContext);
    const { colors, preference, setThemePreference } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [profile, setProfile] = useState({ name: "", email: "" });

    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: "", email: "" });
    const [savingProfile, setSavingProfile] = useState(false);

    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
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


    const openProfileModal = () => {

        setProfileForm({ name: profile.name, email: profile.email });

        setProfileModalVisible(true);

    };


    const saveProfile = async () => {

        if (!profileForm.name.trim() || !profileForm.email.trim()) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Missing info", "Name and email are both required.");

            return;

        }

        try {

            setSavingProfile(true);

            await updateProfile(profileForm);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setProfileModalVisible(false);

            loadProfile();

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


    const openPasswordModal = () => {

        setPassword({ currentPassword: "", newPassword: "" });

        setPasswordModalVisible(true);

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

            setPasswordModalVisible(false);

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


    const selectTheme = (key) => {

        Haptics.selectionAsync();

        setThemePreference(key);

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

            <Text style={styles.sectionLabel}>ACCOUNT</Text>

            <View style={styles.card}>

                <TouchableOpacity style={styles.row} onPress={openProfileModal}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="person-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Edit Profile</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.row} onPress={openPasswordModal}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="lock-closed-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Change Password</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
                </TouchableOpacity>

            </View>

            <Text style={styles.sectionLabel}>APPEARANCE</Text>

            <View style={styles.card}>

                {THEME_OPTIONS.map((option, index) => (

                    <View key={option.key}>

                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => selectTheme(option.key)}
                        >
                            <View style={styles.rowIconWrap}>
                                <Ionicons name={option.icon} size={18} color={colors.navy} />
                            </View>
                            <Text style={styles.rowLabel}>{option.label}</Text>
                            {preference === option.key && (
                                <Ionicons name="checkmark" size={20} color={colors.mint} />
                            )}
                        </TouchableOpacity>

                        {index < THEME_OPTIONS.length - 1 && <View style={styles.divider} />}

                    </View>

                ))}

            </View>

            <Text style={styles.sectionLabel}>ABOUT</Text>

            <View style={styles.card}>

                <View style={styles.row}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="information-circle-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>PocketPilot AI</Text>
                    <Text style={styles.rowValue}>v1.0.0</Text>
                </View>

            </View>

            <TouchableOpacity style={styles.logoutRow} onPress={confirmLogout}>
                <Ionicons name="log-out-outline" size={18} color={colors.coral} />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Modal
                visible={profileModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setProfileModalVisible(false)}
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>Edit Profile</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor={colors.inkSoft}
                            value={profileForm.name}
                            onChangeText={(text) => setProfileForm({ ...profileForm, name: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={colors.inkSoft}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={profileForm.email}
                            onChangeText={(text) => setProfileForm({ ...profileForm, email: text })}
                        />

                        <View style={styles.modalActions}>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setProfileModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveButton, savingProfile && styles.buttonDisabled]}
                                onPress={saveProfile}
                                disabled={savingProfile}
                            >
                                <Text style={styles.saveButtonText}>
                                    {savingProfile ? "Saving..." : "Save"}
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>

            </Modal>

            <Modal
                visible={passwordModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setPasswordModalVisible(false)}
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>Change Password</Text>

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

                        <View style={styles.modalActions}>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setPasswordModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveButton, savingPassword && styles.buttonDisabled]}
                                onPress={submitPasswordChange}
                                disabled={savingPassword}
                            >
                                <Text style={styles.saveButtonText}>
                                    {savingPassword ? "Updating..." : "Update"}
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>

            </Modal>

        </ScrollView>

    );

}

function createStyles(colors) {
    return StyleSheet.create({

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
        marginBottom: spacing.lg,
    },

    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.navy,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
        ...shadow.button,
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

    sectionLabel: {
        fontFamily: fonts.mono,
        fontSize: 11,
        letterSpacing: 1,
        color: colors.inkSoft,
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
    },

    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: spacing.md,
        ...shadow.card,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
    },

    rowIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.paper,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.sm,
    },

    rowLabel: {
        flex: 1,
        fontFamily: fonts.bodyMedium,
        color: colors.ink,
        fontSize: 15,
    },

    rowValue: {
        fontFamily: fonts.body,
        color: colors.inkSoft,
        fontSize: 13,
    },

    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: spacing.md + 30 + spacing.sm,
    },

    logoutRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        paddingVertical: spacing.sm + 4,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.coralSoft,
        backgroundColor: colors.surface,
    },

    logoutText: {
        fontFamily: fonts.bodyMedium,
        color: colors.coral,
        fontSize: 15,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: "flex-end",
    },

    modalCard: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        padding: spacing.lg,
        ...shadow.card,
    },

    modalTitle: {
        fontFamily: fonts.displayBold,
        fontSize: 18,
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

    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: spacing.sm,
        gap: spacing.sm,
    },

    cancelButton: {
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
    },

    cancelButtonText: {
        fontFamily: fonts.bodyMedium,
        color: colors.inkSoft,
    },

    saveButton: {
        backgroundColor: colors.navy,
        borderRadius: radius.sm,
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.lg,
    },

    saveButtonText: {
        fontFamily: fonts.bodyMedium,
        color: colors.white,
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    });
}

export default SettingsScreen;
