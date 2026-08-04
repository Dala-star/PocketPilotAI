import { useState, useCallback, useMemo } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
    StyleSheet,
    RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import {
    getIncome,
    createIncome,
    updateIncome,
    deleteIncome,
} from "../api/income";
import { useTheme } from "../context/ThemeContext";
import { fonts, spacing, radius, shadow } from "../theme/tokens";


function IncomeScreen() {

    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

    const [income, setIncome] = useState([]);

    const [refreshing, setRefreshing] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    const [modalVisible, setModalVisible] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        amount: "",
        source: "",
        description: "",
    });


    const loadData = async () => {

        try {

            const data = await getIncome();

            setIncome(data);

        } catch (error) {

            console.log(error);

        }

    };


    useFocusEffect(
        useCallback(() => {

            loadData();

        }, [])
    );


    const onRefresh = async () => {

        setRefreshing(true);

        await loadData();

        setRefreshing(false);

    };


    const openAddModal = () => {

        setEditingId(null);

        setForm({ amount: "", source: "", description: "" });

        setModalVisible(true);

    };


    const openEditModal = (item) => {

        setEditingId(item.id);

        setForm({
            amount: String(item.amount),
            source: item.source,
            description: item.description || "",
        });

        setModalVisible(true);

    };


    const submit = async () => {

        if (!form.amount || Number(form.amount) <= 0) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Invalid amount", "Enter an amount greater than 0.");

            return;

        }

        if (!form.source.trim()) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Source required", "Enter where this income came from.");

            return;

        }

        const data = {
            amount: Number(form.amount),
            source: form.source,
            description: form.description,
        };

        try {

            if (editingId) {

                await updateIncome(editingId, data);

            } else {

                await createIncome(data);

            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setModalVisible(false);

            loadData();

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Failed to save income",
                error.response?.data?.detail || "Something went wrong."
            );

        }

    };


    const confirmDelete = (id) => {

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Alert.alert(
            "Delete income",
            "Are you sure you want to delete this income entry?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => removeIncome(id),
                },
            ]
        );

    };


    const removeIncome = async (id) => {

        try {

            await deleteIncome(id);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            loadData();

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Failed to delete",
                error.response?.data?.detail || "Something went wrong."
            );

        }

    };


    const filteredIncome = income.filter((item) => {

        const query = searchQuery.trim().toLowerCase();

        return (
            query === "" ||
            item.source.toLowerCase().includes(query) ||
            (item.description || "").toLowerCase().includes(query)
        );

    });


    const renderItem = ({ item }) => (

        <View style={styles.row}>

            <View style={styles.rowIcon}>
                <Ionicons name="trending-up" size={16} color={colors.mint} />
            </View>

            <View style={styles.rowLeft}>

                <Text style={styles.rowSource}>{item.source}</Text>

                {!!item.description && (
                    <Text style={styles.rowDescription}>{item.description}</Text>
                )}

            </View>

            <View style={styles.rowRight}>

                <Text style={styles.rowAmount}>
                    +${Number(item.amount).toFixed(2)}
                </Text>

                <TouchableOpacity onPress={() => openEditModal(item)}>
                    <Ionicons name="pencil" size={18} color={colors.navy} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                    <Ionicons name="trash" size={18} color={colors.coral} />
                </TouchableOpacity>

            </View>

        </View>

    );


    return (

        <View style={styles.screen}>

            <View style={styles.header}>

                <Text style={styles.title}>Income</Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        openAddModal();
                    }}
                >

                    <Ionicons name="add" size={22} color={colors.white} />

                </TouchableOpacity>

            </View>

            <View style={styles.searchWrapper}>
                <Ionicons name="search" size={16} color={colors.inkSoft} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search income..."
                    placeholderTextColor={colors.inkSoft}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredIncome}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.navy}
                        colors={[colors.navy]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="trending-up-outline" size={40} color={colors.border} />
                        <Text style={styles.emptyTitle}>
                            {income.length === 0 ? "No income yet" : "No matches"}
                        </Text>
                        <Text style={styles.emptyText}>
                            {income.length === 0
                                ? "Tap the + button to log your first entry."
                                : "Try a different search."}
                        </Text>
                    </View>
                }
            />

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>
                            {editingId ? "Edit Income" : "Add Income"}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            placeholderTextColor={colors.inkSoft}
                            keyboardType="decimal-pad"
                            value={form.amount}
                            onChangeText={(text) => setForm({ ...form, amount: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Source (e.g. Part-time job)"
                            placeholderTextColor={colors.inkSoft}
                            value={form.source}
                            onChangeText={(text) => setForm({ ...form, source: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Description"
                            placeholderTextColor={colors.inkSoft}
                            value={form.description}
                            onChangeText={(text) => setForm({ ...form, description: text })}
                        />

                        <View style={styles.modalActions}>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveButton} onPress={submit}>
                                <Text style={styles.saveButtonText}>
                                    {editingId ? "Update" : "Add"}
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>

            </Modal>

        </View>

    );

}

function createStyles(colors, insets) {
    return StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: colors.paper,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        paddingTop: insets.top + spacing.md,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },

    title: {
        fontFamily: fonts.displayBold,
        fontSize: 24,
        color: colors.ink,
    },

    addButton: {
        backgroundColor: colors.navy,
        borderRadius: 999,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        ...shadow.button,
    },

    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },

    searchIcon: {
        marginRight: spacing.xs,
    },

    searchInput: {
        flex: 1,
        paddingVertical: spacing.xs + 4,
        fontFamily: fonts.body,
        color: colors.ink,
        fontSize: 14,
    },

    list: {
        flex: 1,
    },

    listContent: {
        paddingBottom: spacing.xl,
    },

    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: spacing.xl * 2,
        gap: spacing.xs,
    },

    emptyTitle: {
        fontFamily: fonts.bodyMedium,
        color: colors.ink,
        fontSize: 15,
        marginTop: spacing.sm,
    },

    emptyText: {
        fontFamily: fonts.body,
        color: colors.inkSoft,
        fontSize: 13,
        textAlign: "center",
    },

    row: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        padding: spacing.md,
        marginBottom: spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        ...shadow.card,
    },

    rowIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.mintSoft,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.sm,
    },

    rowLeft: {
        flex: 1,
        marginRight: spacing.sm,
    },

    rowSource: {
        fontFamily: fonts.bodyMedium,
        color: colors.ink,
        fontSize: 15,
    },

    rowDescription: {
        fontFamily: fonts.body,
        color: colors.inkSoft,
        fontSize: 13,
        marginTop: 2,
    },

    rowRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },

    rowAmount: {
        fontFamily: fonts.monoBold,
        color: colors.mint,
        fontSize: 15,
        marginRight: spacing.xs,
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

    });
}

export default IncomeScreen;