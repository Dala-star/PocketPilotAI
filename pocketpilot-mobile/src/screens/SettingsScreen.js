import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    Alert,
    Switch,
    StyleSheet,
    RefreshControl,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
    getProfile,
    updateProfile,
    changeEmail,
    changePassword,
    deleteAccount,
    getPreferences,
    updatePreferences,
    getNotificationPreferences,
    updateNotificationPreferences,
    submitFeedback,
} from "../api/settings";
import { getExpenses } from "../api/expenses";
import { getIncome } from "../api/income";
import { getCategories } from "../api/categories";
import { fonts, spacing, radius, shadow } from "../theme/tokens";


const THEME_OPTIONS = [
    { key: "light", label: "Light", icon: "sunny-outline" },
    { key: "dark", label: "Dark", icon: "moon-outline" },
    { key: "system", label: "Match device", icon: "phone-portrait-outline" },
];

const CURRENCY_OPTIONS = [
    { key: "USD", label: "US Dollar", symbol: "$" },
    { key: "EUR", label: "Euro", symbol: "€" },
    { key: "GBP", label: "British Pound", symbol: "£" },
    { key: "JPY", label: "Japanese Yen", symbol: "¥" },
    { key: "UGX", label: "Ugandan Shilling", symbol: "USh" },
    { key: "INR", label: "Indian Rupee", symbol: "₹" },
];

const BUDGET_PERIOD_OPTIONS = [
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
];

const START_OF_WEEK_OPTIONS = [
    { key: "sunday", label: "Sunday" },
    { key: "monday", label: "Monday" },
];

const BIOMETRIC_STORAGE_KEY = "@pocketpilot_biometric_enabled";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUPPORT_EMAIL = "pocketpilotai.help@gmail.com";

const PRIVACY_POLICY_TEXT = `Last updated: August 2026

PocketPilot AI ("we", "our", "the app") helps you track income, expenses, and budgets, and offers an AI assistant to answer questions about your finances.

INFORMATION WE COLLECT
- Account info: name, email, and password (stored as a salted hash, never in plain text).
- Financial data you enter: income, expenses, categories, and budgets.
- Chat messages you send to the Finance Assistant, which may be sent to our AI provider to generate a response.
- Basic device/usage data (crash logs, app version) used only to keep the app working.

HOW WE USE IT
- To show you your dashboard, transactions, and budgets.
- To answer your questions in the Finance Assistant.
- To send the notifications you've opted into (budget alerts, weekly digest, bill reminders).
- To fix bugs and improve the app.

WHAT WE DON'T DO
- We don't sell your financial data.
- We don't share your data with advertisers.

DATA STORAGE & SECURITY
Your data is stored on our servers with industry-standard encryption in transit. You can export your data or delete your account at any time from Settings.

YOUR CHOICES
- Export your data (Settings > Data > Export Data).
- Delete your account and all associated data (Settings > Danger Zone > Delete Account).
- Turn off any notification type individually.

CONTACT
Questions about this policy? Reach us at ${SUPPORT_EMAIL}.

This is a starting template — have it reviewed by counsel before relying on it for a production app, especially given the financial data involved.`;

const TERMS_TEXT = `Last updated: August 2026

By using PocketPilot AI, you agree to the following:

1. YOUR ACCOUNT
You're responsible for keeping your login credentials secure and for all activity under your account.

2. THE SERVICE
PocketPilot AI is a personal budgeting tool. The Finance Assistant provides general information based on the data you enter — it is not financial, tax, or legal advice, and you should consult a professional before making financial decisions.

3. YOUR DATA
You own the financial data you enter. We store it to provide the app's features and will delete it if you delete your account.

4. ACCEPTABLE USE
Don't use the app to store or transmit unlawful content, attempt to breach its security, or interfere with other users.

5. AVAILABILITY
We aim to keep the app available but don't guarantee uninterrupted access. Features may change over time.

6. LIMITATION OF LIABILITY
The app is provided "as is." We aren't liable for financial decisions made using information from the app.

7. CHANGES
We may update these terms as the app evolves; continued use means you accept the current version.

CONTACT
Questions? Reach us at ${SUPPORT_EMAIL}.

This is a starting template — have it reviewed by counsel before relying on it for a production app.`;


function SettingsScreen() {

    const { logout } = useContext(AuthContext);
    const { colors, preference, setThemePreference } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

    const [profile, setProfile] = useState({ name: "", email: "" });

    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: "" });
    const [savingProfile, setSavingProfile] = useState(false);

    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
    const [savingEmail, setSavingEmail] = useState(false);

    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [password, setPassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [savingPassword, setSavingPassword] = useState(false);

    const [preferences, setPreferences] = useState({
        currency: "USD",
        budgetPeriod: "monthly",
        startOfWeek: "sunday",
    });

    const [notifications, setNotifications] = useState({
        budgetAlerts: true,
        weeklyDigest: true,
        billReminders: true,
    });
    const [notificationsSaving, setNotificationsSaving] = useState(false);

    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);

    const [exporting, setExporting] = useState(false);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteForm, setDeleteForm] = useState({ confirmText: "", password: "" });
    const [deletingAccount, setDeletingAccount] = useState(false);

    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
    const [termsModalVisible, setTermsModalVisible] = useState(false);
    const [helpModalVisible, setHelpModalVisible] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [sendingFeedback, setSendingFeedback] = useState(false);

    // Generic picker modal state, reused for currency / budget period /
    // start of week so we don't need three near-identical modals.
    const [pickerModal, setPickerModal] = useState({
        visible: false,
        title: "",
        options: [],
        selectedKey: null,
        onSelect: () => {},
    });

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


    const loadPreferences = async () => {

        try {

            const data = await getPreferences();

            setPreferences({
                currency: data.currency || "USD",
                budgetPeriod: data.budget_period || "monthly",
                startOfWeek: data.start_of_week || "sunday",
            });

        } catch (error) {

            console.log(error);

        }

    };


    const loadNotifications = async () => {

        try {

            const data = await getNotificationPreferences();

            setNotifications({
                budgetAlerts: data.budget_alerts ?? true,
                weeklyDigest: data.weekly_digest ?? true,
                billReminders: data.bill_reminders ?? true,
            });

        } catch (error) {

            console.log(error);

        }

    };


    const loadAll = async () => {

        await Promise.all([loadProfile(), loadPreferences(), loadNotifications()]);

    };


    useFocusEffect(
        useCallback(() => {

            loadAll();

        }, [])
    );


    // Biometric hardware check + stored preference — this is device-local,
    // not synced to the backend, so it only needs to run once on mount.
    useEffect(() => {

        (async () => {

            try {

                const hasHardware = await LocalAuthentication.hasHardwareAsync();
                const isEnrolled = await LocalAuthentication.isEnrolledAsync();

                setBiometricAvailable(hasHardware && isEnrolled);

                const stored = await AsyncStorage.getItem(BIOMETRIC_STORAGE_KEY);

                setBiometricEnabled(stored === "true");

            } catch (error) {

                console.log(error);

            }

        })();

    }, []);


    const onRefresh = async () => {

        setRefreshing(true);

        await loadAll();

        setRefreshing(false);

    };


    // ---- Profile ----

    const openProfileModal = () => {

        setProfileForm({ name: profile.name });

        setProfileModalVisible(true);

    };


    const saveProfile = async () => {

        if (!profileForm.name.trim()) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Missing info", "Enter your name.");

            return;

        }

        try {

            setSavingProfile(true);

            await updateProfile({ name: profileForm.name });

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


    // ---- Email ----

    const openEmailModal = () => {

        setEmailForm({ newEmail: "", password: "" });

        setEmailModalVisible(true);

    };


    const submitEmailChange = async () => {

        if (!emailForm.newEmail.trim() || !emailForm.password) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Missing info", "Enter your new email and current password.");

            return;

        }

        if (!EMAIL_PATTERN.test(emailForm.newEmail.trim())) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Invalid email", "Enter a valid email address.");

            return;

        }

        try {

            setSavingEmail(true);

            await changeEmail({
                newEmail: emailForm.newEmail.trim(),
                password: emailForm.password,
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setEmailModalVisible(false);

            Alert.alert(
                "Check your inbox",
                "We've sent a confirmation link to your new email address."
            );

            loadProfile();

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Unable to update email",
                error.response?.data?.detail || "Something went wrong."
            );

        } finally {

            setSavingEmail(false);

        }

    };


    // ---- Password ----

    const openPasswordModal = () => {

        setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });

        setPasswordModalVisible(true);

    };


    const submitPasswordChange = async () => {

        if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Missing info", "Fill in all three password fields.");

            return;

        }

        if (password.newPassword.length < 8) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Password too short", "New password must be at least 8 characters.");

            return;

        }

        if (password.newPassword !== password.confirmPassword) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Passwords don't match", "Double check your new password.");

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

            setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });

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


    // ---- Preferences (currency / budget period / start of week) ----

    const savePreference = async (key, value) => {

        const next = { ...preferences, [key]: value };

        setPreferences(next);

        setPickerModal((prev) => ({ ...prev, visible: false }));

        try {

            await updatePreferences(next);

            Haptics.selectionAsync();

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Unable to save preference",
                error.response?.data?.detail || "Something went wrong."
            );

            loadPreferences();

        }

    };


    const openCurrencyPicker = () => {

        setPickerModal({
            visible: true,
            title: "Currency",
            options: CURRENCY_OPTIONS.map((c) => ({ key: c.key, label: `${c.label} (${c.symbol})` })),
            selectedKey: preferences.currency,
            onSelect: (key) => savePreference("currency", key),
        });

    };


    const openBudgetPeriodPicker = () => {

        setPickerModal({
            visible: true,
            title: "Default Budget Period",
            options: BUDGET_PERIOD_OPTIONS,
            selectedKey: preferences.budgetPeriod,
            onSelect: (key) => savePreference("budgetPeriod", key),
        });

    };


    const openStartOfWeekPicker = () => {

        setPickerModal({
            visible: true,
            title: "Start of Week",
            options: START_OF_WEEK_OPTIONS,
            selectedKey: preferences.startOfWeek,
            onSelect: (key) => savePreference("startOfWeek", key),
        });

    };


    // ---- Notifications ----

    const toggleNotification = async (key) => {

        const next = { ...notifications, [key]: !notifications[key] };

        setNotifications(next);

        Haptics.selectionAsync();

        try {

            setNotificationsSaving(true);

            await updateNotificationPreferences(next);

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Unable to save",
                error.response?.data?.detail || "Something went wrong."
            );

            setNotifications(notifications);

        } finally {

            setNotificationsSaving(false);

        }

    };


    // ---- Biometric unlock (device-local) ----

    const toggleBiometric = async (value) => {

        if (value) {

            try {

                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: "Confirm to enable biometric unlock",
                });

                if (!result.success) return;

            } catch (error) {

                console.log(error);

                Alert.alert("Unable to verify", "Please try again.");

                return;

            }

        }

        setBiometricEnabled(value);

        Haptics.selectionAsync();

        await AsyncStorage.setItem(BIOMETRIC_STORAGE_KEY, value ? "true" : "false");

    };


    // ---- Export data ----

    const csvEscape = (value) => {

        const text = String(value ?? "");

        if (/[",\n]/.test(text)) {

            return `"${text.replace(/"/g, '""')}"`;

        }

        return text;

    };


    const handleExport = async () => {

        try {

            setExporting(true);

            const [expenseData, incomeData, categoryData] = await Promise.all([
                getExpenses(),
                getIncome(),
                getCategories(),
            ]);

            const categoryName = (id) =>
                categoryData.find((c) => c.id === id)?.name || "Unknown";

            const rows = [["Type", "Date", "Category / Source", "Description", "Amount"]];

            expenseData.forEach((item) => {
                rows.push([
                    "Expense",
                    item.date || item.created_at || "",
                    categoryName(item.category_id),
                    item.description || "",
                    item.amount,
                ]);
            });

            incomeData.forEach((item) => {
                rows.push([
                    "Income",
                    item.date || item.created_at || "",
                    item.source,
                    item.description || "",
                    item.amount,
                ]);
            });

            const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");

            const file = new File(Paths.document, "pocketpilot-export.csv");

            file.write(csv);

            const canShare = await Sharing.isAvailableAsync();

            if (canShare) {

                await Sharing.shareAsync(file.uri, { mimeType: "text/csv" });

            } else {

                Alert.alert("Export ready", `Saved to ${file.uri}`);

            }

        } catch (error) {

            console.log(error);

            Alert.alert(
                "Export failed",
                error.response?.data?.detail || "Something went wrong."
            );

        } finally {

            setExporting(false);

        }

    };


    // ---- Delete account ----

    const openDeleteModal = () => {

        setDeleteForm({ confirmText: "", password: "" });

        setDeleteModalVisible(true);

    };


    const submitDeleteAccount = async () => {

        if (deleteForm.confirmText.trim().toUpperCase() !== "DELETE") {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Type DELETE to confirm", "This action can't be undone.");

            return;

        }

        if (!deleteForm.password) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Password required", "Enter your password to confirm.");

            return;

        }

        try {

            setDeletingAccount(true);

            await deleteAccount(deleteForm.password);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setDeleteModalVisible(false);

            logout();

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Unable to delete account",
                error.response?.data?.detail || "Something went wrong."
            );

        } finally {

            setDeletingAccount(false);

        }

    };


    // ---- Logout / theme ----

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


    const openHelpModal = () => {

        setFeedbackMessage("");

        setHelpModalVisible(true);

    };


    const sendFeedback = async () => {

        if (!feedbackMessage.trim()) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Nothing to send", "Write a quick note first.");

            return;

        }

        try {

            setSendingFeedback(true);

            await submitFeedback(feedbackMessage.trim());

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setHelpModalVisible(false);

            setFeedbackMessage("");

            Alert.alert("Thanks!", "Your feedback has been sent.");

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Couldn't send feedback",
                error.response?.data?.detail || `Please try again, or email us directly at ${SUPPORT_EMAIL}.`
            );

        } finally {

            setSendingFeedback(false);

        }

    };


    const currentCurrencyLabel =
        CURRENCY_OPTIONS.find((c) => c.key === preferences.currency)?.symbol || preferences.currency;

    const currentBudgetPeriodLabel =
        BUDGET_PERIOD_OPTIONS.find((o) => o.key === preferences.budgetPeriod)?.label || "";

    const currentStartOfWeekLabel =
        START_OF_WEEK_OPTIONS.find((o) => o.key === preferences.startOfWeek)?.label || "";


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

                <TouchableOpacity style={styles.row} onPress={openEmailModal}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="mail-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Change Email</Text>
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

            <Text style={styles.sectionLabel}>PREFERENCES</Text>

            <View style={styles.card}>

                <TouchableOpacity style={styles.row} onPress={openCurrencyPicker}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="cash-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Currency</Text>
                    <Text style={styles.rowValue}>{currentCurrencyLabel}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.row} onPress={openBudgetPeriodPicker}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="calendar-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Default Budget Period</Text>
                    <Text style={styles.rowValue}>{currentBudgetPeriodLabel}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.row} onPress={openStartOfWeekPicker}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="today-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Start of Week</Text>
                    <Text style={styles.rowValue}>{currentStartOfWeekLabel}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
                </TouchableOpacity>

            </View>

            <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>

            <View style={styles.card}>

                <View style={styles.row}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="alert-circle-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Budget Alerts</Text>
                    <Switch
                        value={notifications.budgetAlerts}
                        onValueChange={() => toggleNotification("budgetAlerts")}
                        disabled={notificationsSaving}
                        trackColor={{ false: colors.border, true: colors.mint }}
                        thumbColor={colors.white}
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="stats-chart-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Weekly Digest</Text>
                    <Switch
                        value={notifications.weeklyDigest}
                        onValueChange={() => toggleNotification("weeklyDigest")}
                        disabled={notificationsSaving}
                        trackColor={{ false: colors.border, true: colors.mint }}
                        thumbColor={colors.white}
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="receipt-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Bill Reminders</Text>
                    <Switch
                        value={notifications.billReminders}
                        onValueChange={() => toggleNotification("billReminders")}
                        disabled={notificationsSaving}
                        trackColor={{ false: colors.border, true: colors.mint }}
                        thumbColor={colors.white}
                    />
                </View>

            </View>

            <Text style={styles.sectionLabel}>SECURITY</Text>

            <View style={styles.card}>

                <View style={styles.row}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="finger-print-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Biometric Unlock</Text>
                    <Switch
                        value={biometricEnabled}
                        onValueChange={toggleBiometric}
                        disabled={!biometricAvailable}
                        trackColor={{ false: colors.border, true: colors.mint }}
                        thumbColor={colors.white}
                    />
                </View>

                {!biometricAvailable && (
                    <Text style={styles.helperText}>
                        Set up Face ID, Touch ID, or a device passcode to use this.
                    </Text>
                )}

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

            <Text style={styles.sectionLabel}>DATA</Text>

            <View style={styles.card}>

                <TouchableOpacity
                    style={styles.row}
                    onPress={handleExport}
                    disabled={exporting}
                >
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="download-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>
                        {exporting ? "Preparing export..." : "Export Data"}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
                </TouchableOpacity>

            </View>

            <Text style={styles.sectionLabel}>SUPPORT</Text>

            <View style={styles.card}>

                <TouchableOpacity style={styles.row} onPress={openHelpModal}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="help-circle-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Help & Feedback</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.row} onPress={() => setPrivacyModalVisible(true)}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="shield-checkmark-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Privacy Policy</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.row} onPress={() => setTermsModalVisible(true)}>
                    <View style={styles.rowIconWrap}>
                        <Ionicons name="document-text-outline" size={18} color={colors.navy} />
                    </View>
                    <Text style={styles.rowLabel}>Terms of Service</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
                </TouchableOpacity>

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

            <Text style={styles.sectionLabel}>DANGER ZONE</Text>

            <View style={styles.dangerCard}>

                <TouchableOpacity style={styles.row} onPress={openDeleteModal}>
                    <View style={styles.dangerIconWrap}>
                        <Ionicons name="trash-outline" size={18} color={colors.coral} />
                    </View>
                    <View style={styles.rowLeft}>
                        <Text style={styles.dangerLabel}>Delete Account</Text>
                        <Text style={styles.dangerSubtext}>
                            Permanently deletes your data. Can't be undone.
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.coral} />
                </TouchableOpacity>

            </View>

            <Modal
                visible={profileModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setProfileModalVisible(false)}
            >

                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>Edit Profile</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor={colors.inkSoft}
                            value={profileForm.name}
                            onChangeText={(text) => setProfileForm({ ...profileForm, name: text })}
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

                </KeyboardAvoidingView>

            </Modal>

            <Modal
                visible={emailModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setEmailModalVisible(false)}
            >

                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>Change Email</Text>

                        <Text style={styles.modalSubtitle}>
                            Current: {profile.email}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="New Email"
                            placeholderTextColor={colors.inkSoft}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={emailForm.newEmail}
                            onChangeText={(text) => setEmailForm({ ...emailForm, newEmail: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Current Password"
                            placeholderTextColor={colors.inkSoft}
                            secureTextEntry
                            value={emailForm.password}
                            onChangeText={(text) => setEmailForm({ ...emailForm, password: text })}
                        />

                        <View style={styles.modalActions}>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setEmailModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveButton, savingEmail && styles.buttonDisabled]}
                                onPress={submitEmailChange}
                                disabled={savingEmail}
                            >
                                <Text style={styles.saveButtonText}>
                                    {savingEmail ? "Saving..." : "Save"}
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                </KeyboardAvoidingView>

            </Modal>

            <Modal
                visible={passwordModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setPasswordModalVisible(false)}
            >

                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >

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

                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            placeholderTextColor={colors.inkSoft}
                            secureTextEntry
                            value={password.confirmPassword}
                            onChangeText={(text) =>
                                setPassword({ ...password, confirmPassword: text })
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

                </KeyboardAvoidingView>

            </Modal>

            <Modal
                visible={pickerModal.visible}
                animationType="slide"
                transparent
                onRequestClose={() => setPickerModal((prev) => ({ ...prev, visible: false }))}
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>{pickerModal.title}</Text>

                        {pickerModal.options.map((option, index) => (

                            <View key={option.key}>

                                <TouchableOpacity
                                    style={styles.pickerRow}
                                    onPress={() => pickerModal.onSelect(option.key)}
                                >
                                    <Text style={styles.rowLabel}>{option.label}</Text>
                                    {pickerModal.selectedKey === option.key && (
                                        <Ionicons name="checkmark" size={20} color={colors.mint} />
                                    )}
                                </TouchableOpacity>

                                {index < pickerModal.options.length - 1 && (
                                    <View style={styles.divider} />
                                )}

                            </View>

                        ))}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setPickerModal((prev) => ({ ...prev, visible: false }))}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

            <Modal
                visible={deleteModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setDeleteModalVisible(false)}
            >

                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>Delete Account</Text>

                        <Text style={styles.modalSubtitle}>
                            This permanently deletes your account and all data. This can't be undone.
                        </Text>

                        <Text style={styles.fieldLabel}>Type DELETE to confirm</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="DELETE"
                            placeholderTextColor={colors.inkSoft}
                            autoCapitalize="characters"
                            value={deleteForm.confirmText}
                            onChangeText={(text) =>
                                setDeleteForm({ ...deleteForm, confirmText: text })
                            }
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={colors.inkSoft}
                            secureTextEntry
                            value={deleteForm.password}
                            onChangeText={(text) =>
                                setDeleteForm({ ...deleteForm, password: text })
                            }
                        />

                        <View style={styles.modalActions}>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.dangerButton,
                                    deletingAccount && styles.buttonDisabled,
                                ]}
                                onPress={submitDeleteAccount}
                                disabled={deletingAccount}
                            >
                                <Text style={styles.dangerButtonText}>
                                    {deletingAccount ? "Deleting..." : "Delete Account"}
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                </KeyboardAvoidingView>

            </Modal>

            <Modal
                visible={privacyModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setPrivacyModalVisible(false)}
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.modalCardTall}>

                        <Text style={styles.modalTitle}>Privacy Policy</Text>

                        <ScrollView style={styles.policyScroll}>
                            <Text style={styles.policyText}>{PRIVACY_POLICY_TEXT}</Text>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() => setPrivacyModalVisible(false)}
                        >
                            <Text style={styles.saveButtonText}>Close</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

            <Modal
                visible={termsModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setTermsModalVisible(false)}
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.modalCardTall}>

                        <Text style={styles.modalTitle}>Terms of Service</Text>

                        <ScrollView style={styles.policyScroll}>
                            <Text style={styles.policyText}>{TERMS_TEXT}</Text>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() => setTermsModalVisible(false)}
                        >
                            <Text style={styles.saveButtonText}>Close</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

            <Modal
                visible={helpModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setHelpModalVisible(false)}
            >

                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>Help & Feedback</Text>

                        <Text style={styles.modalSubtitle}>
                            Tell us what's wrong or what you'd like to see — this sends
                            straight to our team, no need to leave the app.
                        </Text>

                        <TextInput
                            style={[styles.input, styles.feedbackInput]}
                            placeholder="What's on your mind?"
                            placeholderTextColor={colors.inkSoft}
                            multiline
                            textAlignVertical="top"
                            value={feedbackMessage}
                            onChangeText={setFeedbackMessage}
                            editable={!sendingFeedback}
                        />

                        <View style={styles.modalActions}>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setHelpModalVisible(false)}
                                disabled={sendingFeedback}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveButton, sendingFeedback && styles.buttonDisabled]}
                                onPress={sendFeedback}
                                disabled={sendingFeedback}
                            >
                                <Text style={styles.saveButtonText}>
                                    {sendingFeedback ? "Sending..." : "Send"}
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                </KeyboardAvoidingView>

            </Modal>

        </ScrollView>


    );

}

function createStyles(colors, insets) {
    return StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: colors.paper,
    },

    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: insets.top + spacing.md,
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
        gap: spacing.xs,
    },

    rowLeft: {
        flex: 1,
    },

    rowIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.paper,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.xs,
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

    helperText: {
        fontFamily: fonts.body,
        color: colors.inkSoft,
        fontSize: 12,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm + 2,
        marginTop: -spacing.xs,
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
        marginBottom: spacing.md,
    },

    logoutText: {
        fontFamily: fonts.bodyMedium,
        color: colors.coral,
        fontSize: 15,
    },

    dangerCard: {
        backgroundColor: colors.coralSoft,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.coral,
        marginBottom: spacing.md,
    },

    dangerIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.xs,
    },

    dangerLabel: {
        fontFamily: fonts.bodyMedium,
        color: colors.coral,
        fontSize: 15,
    },

    dangerSubtext: {
        fontFamily: fonts.body,
        color: colors.coral,
        fontSize: 12,
        marginTop: 2,
        opacity: 0.85,
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
        paddingBottom: insets.bottom + spacing.lg,
        ...shadow.card,
    },

    modalCardTall: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        padding: spacing.lg,
        paddingBottom: insets.bottom + spacing.lg,
        maxHeight: "80%",
        ...shadow.card,
    },

    policyScroll: {
        marginBottom: spacing.md,
    },

    policyText: {
        fontFamily: fonts.body,
        fontSize: 13,
        lineHeight: 20,
        color: colors.ink,
    },

    feedbackInput: {
        minHeight: 100,
    },

    modalTitle: {
        fontFamily: fonts.displayBold,
        fontSize: 18,
        color: colors.ink,
        marginBottom: spacing.md,
    },

    modalSubtitle: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.inkSoft,
        marginBottom: spacing.md,
    },

    fieldLabel: {
        fontFamily: fonts.bodyMedium,
        fontSize: 13,
        color: colors.inkSoft,
        marginBottom: spacing.xs,
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

    pickerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.sm + 4,
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

    dangerButton: {
        backgroundColor: colors.coral,
        borderRadius: radius.sm,
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.lg,
    },

    dangerButtonText: {
        fontFamily: fonts.bodyMedium,
        color: colors.white,
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    });
}

export default SettingsScreen;