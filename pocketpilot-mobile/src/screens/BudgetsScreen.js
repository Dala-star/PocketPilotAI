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
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
} from "../api/budgets";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../api/categories";
import { useTheme } from "../context/ThemeContext";
import { fonts, spacing, radius, shadow } from "../theme/tokens";


function BudgetsScreen() {

    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [tab, setTab] = useState("budgets"); // "budgets" | "categories"

    const [budgets, setBudgets] = useState([]);

    const [categories, setCategories] = useState([]);

    const [refreshing, setRefreshing] = useState(false);


    // Budget modal state
    const [budgetModalVisible, setBudgetModalVisible] = useState(false);

    const [editingBudgetId, setEditingBudgetId] = useState(null);

    const [budgetForm, setBudgetForm] = useState({ amount: "", category_id: null });


    // Category modal state
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);

    const [editingCategoryId, setEditingCategoryId] = useState(null);

    const [categoryName, setCategoryName] = useState("");


    const loadData = async () => {

        try {

            const [budgetData, categoryData] = await Promise.all([
                getBudgets(),
                getCategories(),
            ]);

            setBudgets(budgetData);

            setCategories(categoryData);

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


    const getCategoryName = (id) => {

        const match = categories.find((c) => c.id === id);

        return match ? match.name : "Unknown";

    };


    // ---- Budgets ----

    const openAddBudget = () => {

        if (categories.length === 0) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert(
                "No categories yet",
                "Add a category first using the Categories tab above."
            );

            return;

        }

        setEditingBudgetId(null);

        setBudgetForm({ amount: "", category_id: categories[0].id });

        setBudgetModalVisible(true);

    };


    const openEditBudget = (budget) => {

        setEditingBudgetId(budget.id);

        setBudgetForm({
            amount: String(budget.amount),
            category_id: budget.category_id,
        });

        setBudgetModalVisible(true);

    };


    const submitBudget = async () => {

        if (!budgetForm.amount || Number(budgetForm.amount) <= 0) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Invalid amount", "Enter an amount greater than 0.");

            return;

        }

        const data = {
            amount: Number(budgetForm.amount),
            category_id: budgetForm.category_id,
        };

        try {

            if (editingBudgetId) {

                await updateBudget(editingBudgetId, data);

            } else {

                await createBudget(data);

            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setBudgetModalVisible(false);

            loadData();

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Failed to save budget",
                error.response?.data?.detail || "Something went wrong."
            );

        }

    };


    const confirmDeleteBudget = (id) => {

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Alert.alert(
            "Delete budget",
            "Are you sure you want to delete this budget?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => removeBudget(id),
                },
            ]
        );

    };


    const removeBudget = async (id) => {

        try {

            await deleteBudget(id);

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


    // ---- Categories ----

    const openAddCategory = () => {

        setEditingCategoryId(null);

        setCategoryName("");

        setCategoryModalVisible(true);

    };


    const openEditCategory = (category) => {

        setEditingCategoryId(category.id);

        setCategoryName(category.name);

        setCategoryModalVisible(true);

    };


    const submitCategory = async () => {

        if (!categoryName.trim()) {

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            Alert.alert("Name required", "Enter a category name.");

            return;

        }

        try {

            if (editingCategoryId) {

                await updateCategory(editingCategoryId, { name: categoryName });

            } else {

                await createCategory({ name: categoryName });

            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setCategoryModalVisible(false);

            loadData();

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                "Failed to save category",
                error.response?.data?.detail || "Something went wrong."
            );

        }

    };


    const confirmDeleteCategory = (id) => {

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Alert.alert(
            "Delete category",
            "Are you sure you want to delete this category?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => removeCategory(id),
                },
            ]
        );

    };


    const removeCategory = async (id) => {

        try {

            await deleteCategory(id);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            loadData();

        } catch (error) {

            console.log(error);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            // Backend blocks deletion if expenses/budgets still reference this
            // category — the detail message explains that to the user.
            Alert.alert(
                "Failed to delete category",
                error.response?.data?.detail || "Something went wrong."
            );

        }

    };


    const renderBudget = ({ item }) => {

        const pct = Math.min(item.percentage || 0, 100);
        const overBudget = (item.percentage || 0) >= 100;

        return (

            <View style={styles.row}>

                <View style={styles.rowLeft}>

                    <View style={styles.rowTitleLine}>
                        <Text style={styles.rowTitle}>{getCategoryName(item.category_id)}</Text>
                        {overBudget && (
                            <View style={styles.overBadge}>
                                <Text style={styles.overBadgeText}>Over</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.rowAmount}>${Number(item.amount).toFixed(2)} / month</Text>

                    <View style={styles.progressTrack}>

                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${pct}%`,
                                    backgroundColor: overBudget ? colors.coral : colors.mint,
                                },
                            ]}
                        />

                    </View>

                </View>

                <View style={styles.rowActions}>

                    <TouchableOpacity onPress={() => openEditBudget(item)}>
                        <Ionicons name="pencil" size={18} color={colors.navy} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => confirmDeleteBudget(item.id)}>
                        <Ionicons name="trash" size={18} color={colors.coral} />
                    </TouchableOpacity>

                </View>

            </View>

        );

    };


    const renderCategory = ({ item }) => (

        <View style={styles.row}>

            <View style={styles.categoryDot} />

            <Text style={[styles.rowTitle, styles.categoryRowTitle]}>{item.name}</Text>

            <View style={styles.rowActions}>

                <TouchableOpacity onPress={() => openEditCategory(item)}>
                    <Ionicons name="pencil" size={18} color={colors.navy} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => confirmDeleteCategory(item.id)}>
                    <Ionicons name="trash" size={18} color={colors.coral} />
                </TouchableOpacity>

            </View>

        </View>

    );


    return (

        <View style={styles.screen}>

            <View style={styles.header}>

                <Text style={styles.title}>Budgets</Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                        if (tab === "budgets") {
                            openAddBudget();
                        } else {
                            openAddCategory();
                        }
                    }}
                >

                    <Ionicons name="add" size={22} color={colors.white} />

                </TouchableOpacity>

            </View>

            <View style={styles.segmentWrapper}>

                <TouchableOpacity
                    style={[styles.segment, tab === "budgets" && styles.segmentActive]}
                    onPress={() => {
                        Haptics.selectionAsync();
                        setTab("budgets");
                    }}
                >
                    <Text
                        style={[
                            styles.segmentText,
                            tab === "budgets" && styles.segmentTextActive,
                        ]}
                    >
                        Budgets
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.segment, tab === "categories" && styles.segmentActive]}
                    onPress={() => {
                        Haptics.selectionAsync();
                        setTab("categories");
                    }}
                >
                    <Text
                        style={[
                            styles.segmentText,
                            tab === "categories" && styles.segmentTextActive,
                        ]}
                    >
                        Categories
                    </Text>
                </TouchableOpacity>

            </View>

            {tab === "budgets" ? (

                <FlatList
                    data={budgets}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderBudget}
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
                            <Ionicons name="pie-chart-outline" size={40} color={colors.border} />
                            <Text style={styles.emptyTitle}>No budgets yet</Text>
                            <Text style={styles.emptyText}>
                                Tap + to set a spending limit for a category.
                            </Text>
                        </View>
                    }
                />

            ) : (

                <FlatList
                    data={categories}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderCategory}
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
                            <Ionicons name="pricetags-outline" size={40} color={colors.border} />
                            <Text style={styles.emptyTitle}>No categories yet</Text>
                            <Text style={styles.emptyText}>
                                Tap + to create your first category.
                            </Text>
                        </View>
                    }
                />

            )}

            {/* Budget add/edit modal */}
            <Modal
                visible={budgetModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setBudgetModalVisible(false)}
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>
                            {editingBudgetId ? "Edit Budget" : "Add Budget"}
                        </Text>

                        <Text style={styles.fieldLabel}>Category</Text>

                        <View style={styles.categoryGrid}>

                            {categories.map((category) => (

                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryOption,
                                        budgetForm.category_id === category.id &&
                                            styles.categoryOptionActive,
                                    ]}
                                    onPress={() =>
                                        setBudgetForm({ ...budgetForm, category_id: category.id })
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.categoryOptionText,
                                            budgetForm.category_id === category.id &&
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
                            placeholder="Budget amount"
                            placeholderTextColor={colors.inkSoft}
                            keyboardType="decimal-pad"
                            value={budgetForm.amount}
                            onChangeText={(text) =>
                                setBudgetForm({ ...budgetForm, amount: text })
                            }
                        />

                        <View style={styles.modalActions}>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setBudgetModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveButton} onPress={submitBudget}>
                                <Text style={styles.saveButtonText}>
                                    {editingBudgetId ? "Update" : "Add"}
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>

            </Modal>

            {/* Category add/edit modal */}
            <Modal
                visible={categoryModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setCategoryModalVisible(false)}
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>
                            {editingCategoryId ? "Edit Category" : "Add Category"}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Category name"
                            placeholderTextColor={colors.inkSoft}
                            value={categoryName}
                            onChangeText={setCategoryName}
                        />

                        <View style={styles.modalActions}>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setCategoryModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveButton} onPress={submitCategory}>
                                <Text style={styles.saveButtonText}>
                                    {editingCategoryId ? "Update" : "Add"}
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>

            </Modal>

        </View>

    );

}

function createStyles(colors) {
    return StyleSheet.create({

    screen: {
        flex: 1,
        backgroundColor: colors.paper,
        padding: spacing.lg,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.md,
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

    segmentWrapper: {
        flexDirection: "row",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 4,
        marginBottom: spacing.md,
    },

    segment: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: radius.sm,
        alignItems: "center",
    },

    segmentActive: {
        backgroundColor: colors.navy,
    },

    segmentText: {
        fontFamily: fonts.bodyMedium,
        color: colors.inkSoft,
        fontSize: 14,
    },

    segmentTextActive: {
        color: colors.white,
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
        justifyContent: "space-between",
        alignItems: "center",
        ...shadow.card,
    },

    rowLeft: {
        flex: 1,
        marginRight: spacing.sm,
    },

    rowTitleLine: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
    },

    rowTitle: {
        fontFamily: fonts.bodyMedium,
        color: colors.ink,
        fontSize: 15,
    },

    categoryRowTitle: {
        flex: 1,
    },

    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.navy,
        marginRight: spacing.sm,
    },

    overBadge: {
        backgroundColor: colors.coralSoft,
        borderRadius: 999,
        paddingHorizontal: spacing.xs + 2,
        paddingVertical: 2,
    },

    overBadgeText: {
        fontFamily: fonts.bodyMedium,
        color: colors.coral,
        fontSize: 10,
    },

    rowAmount: {
        fontFamily: fonts.mono,
        color: colors.inkSoft,
        fontSize: 13,
        marginTop: 2,
        marginBottom: spacing.xs,
    },

    rowActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },

    progressTrack: {
        height: 6,
        backgroundColor: colors.paper,
        borderRadius: 999,
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        borderRadius: 999,
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

export default BudgetsScreen;
