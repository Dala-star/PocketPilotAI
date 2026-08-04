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
    ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
} from "../api/expenses";
import { getCategories } from "../api/categories";
import { useTheme } from "../context/ThemeContext";
import { fonts, spacing, radius, shadow } from "../theme/tokens";


function ExpensesScreen() {

    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

    const [expenses, setExpenses] = useState([]);

    const [categories, setCategories] = useState([]);

    const [refreshing, setRefreshing] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    const [filterCategoryId, setFilterCategoryId] = useState(null); // null = all

    const [modalVisible, setModalVisible] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        amount: "",
        description: "",
        category_id: null,
    });


    const loadData = async () => {

        try {

            const [expenseData, categoryData] = await Promise.all([
                getExpenses(),
                getCategories(),
            ]);

            setExpenses(expenseData);

            setCategories(categoryData);

            if (categoryData.length > 0 && form.category_id === null) {
                setForm((prev) => ({ ...prev, category_id: categoryData[0].id }));
            }

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

        setForm({
            amount: "",
            description: "",
            category_id: categories.length > 0 ? categories[0].id : null,
        });

        setModalVisible(true);

    };


    const openEditModal = (expense) => {

        setEditingId(expense.id);

        setForm({
            amount: String(expense.amount),
            description: expense.description || "",
            category_id: expense.category_id,
        });

        setModalVisible(true);

    };


    const submit = async () => {

        if (!form.amount || Number(form.amount) <= 0) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Invalid amount", "Enter an amount greater than 0.");

            return;

        }

        if (!form.category_id) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Category required", "Add a category first, on the Budgets tab.");

            return;

        }

        const data = {
            amount: Number(form.amount),
            description: form.description,
            category_id: form.category_id,
        };

        try {

            if (editingId) {

                await updateExpense(editingId, data);

            } else {

                await createExpense(data);

            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setModalVisible(false);

            loadData();

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Failed to save expense",
                error.response?.data?.detail || "Something went wrong."
            );

        }

    };


    const confirmDelete = (id) => {

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Alert.alert(
            "Delete expense",
            "Are you sure you want to delete this expense?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => removeExpense(id),
                },
            ]
        );

    };


    const removeExpense = async (id) => {

        try {

            await deleteExpense(id);

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


    const getCategoryName = (id) => {

        const match = categories.find((c) => c.id === id);

        return match ? match.name : "Unknown";

    };


    const filteredExpenses = expenses.filter((item) => {

        const matchesCategory =
            filterCategoryId === null || item.category_id === filterCategoryId;

        const query = searchQuery.trim().toLowerCase();

        const matchesSearch =
            query === "" ||
            (item.description || "").toLowerCase().includes(query) ||
            getCategoryName(item.category_id).toLowerCase().includes(query);

        return matchesCategory && matchesSearch;

    });


    const renderItem = ({ item }) => (

        <View style={styles.row}>

            <View style={styles.rowIcon}>
                <Ionicons name="cart" size={16} color={colors.coral} />
            </View>

            <View style={styles.rowLeft}>

                <Text style={styles.rowCategory}>
                    {getCategoryName(item.category_id)}
                </Text>

                {!!item.description && (
                    <Text style={styles.rowDescription}>{item.description}</Text>
                )}

            </View>

            <View style={styles.rowRight}>

                <Text style={styles.rowAmount}>
                    -${Number(item.amount).toFixed(2)}
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

                <Text style={styles.title}>Expenses</Text>

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
                    placeholder="Search expenses..."
                    placeholderTextColor={colors.inkSoft}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
                contentContainerStyle={styles.filterRowContent}
            >

                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        filterCategoryId === null && styles.filterChipActive,
                    ]}
                    onPress={() => setFilterCategoryId(null)}
                >
                    <Text
                        style={[
                            styles.filterChipText,
                            filterCategoryId === null && styles.filterChipTextActive,
                        ]}
                    >
                        All
                    </Text>
                </TouchableOpacity>

                {categories.map((category) => (

                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.filterChip,
                            filterCategoryId === category.id && styles.filterChipActive,
                        ]}
                        onPress={() =>
                            setFilterCategoryId(
                                filterCategoryId === category.id ? null : category.id
                            )
                        }
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                filterCategoryId === category.id && styles.filterChipTextActive,
                            ]}
                        >
                            {category.name}
                        </Text>
                    </TouchableOpacity>

                ))}

            </ScrollView>

            <FlatList
                data={filteredExpenses}
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
                        <Ionicons name="receipt-outline" size={40} color={colors.border} />
                        <Text style={styles.emptyTitle}>
                            {expenses.length === 0 ? "No expenses yet" : "No matches"}
                        </Text>
                        <Text style={styles.emptyText}>
                            {expenses.length === 0
                                ? "Tap the + button to log your first one."
                                : "Try a different search or filter."}
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
                            {editingId ? "Edit Expense" : "Add Expense"}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            placeholderTextColor={colors.inkSoft}
                            keyboardType="decimal-pad"
                            value={form.amount}
                            onChangeText={(text) => setForm({ ...form, amount: text })}
                        />

                        <Text style={styles.fieldLabel}>Category</Text>

                        <View style={styles.categoryGrid}>

                            {categories.map((category) => (

                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryOption,
                                        form.category_id === category.id &&
                                            styles.categoryOptionActive,
                                    ]}
                                    onPress={() =>
                                        setForm({ ...form, category_id: category.id })
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.categoryOptionText,
                                            form.category_id === category.id &&
                                                styles.categoryOptionTextActive,
                                        ]}
                                    >
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>

                            ))}

                        </View>

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
        marginBottom: spacing.xs,
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

    filterRow: {
        marginBottom: spacing.sm,
        flexGrow: 0,
    },

    filterRowContent: {
        gap: spacing.xs,
        alignItems: "center",
    },

    filterChip: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm + 2,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        flexShrink: 0,
        alignSelf: "flex-start",
    },

    filterChipActive: {
        backgroundColor: colors.navy,
        borderColor: colors.navy,
    },

    filterChipText: {
        fontFamily: fonts.bodyMedium,
        color: colors.inkSoft,
        fontSize: 12,
    },

    filterChipTextActive: {
        color: colors.white,
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
        backgroundColor: colors.coralSoft,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.sm,
    },

    rowLeft: {
        flex: 1,
        marginRight: spacing.sm,
    },

    rowCategory: {
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
        color: colors.coral,
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

    fieldLabel: {
        fontFamily: fonts.bodyMedium,
        fontSize: 13,
        color: colors.inkSoft,
        marginBottom: spacing.xs,
    },

    categoryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },

    categoryOption: {
        paddingVertical: spacing.xs + 4,
        paddingHorizontal: spacing.md,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.paper,
    },

    categoryOptionActive: {
        backgroundColor: colors.navy,
        borderColor: colors.navy,
    },

    categoryOptionText: {
        fontFamily: fonts.bodyMedium,
        color: colors.ink,
        fontSize: 13,
    },

    categoryOptionTextActive: {
        color: colors.white,
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

export default ExpensesScreen;