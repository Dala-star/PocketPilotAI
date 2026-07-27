import { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { PieChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";

import { getDashboardData } from "../api/dashboard";
import { colors, fonts, spacing, radius } from "../theme/tokens";

const PALETTE = [colors.mint, colors.coral, colors.amber, colors.navy, "#5b8def", "#9b6bd6"];


function DashboardScreen() {

    const [data, setData] = useState({
        balance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        transactions: [],
        categoryData: [],
    });

    const [refreshing, setRefreshing] = useState(false);


    const loadDashboard = async () => {

        try {

            const result = await getDashboardData();

            setData(result);

        } catch (error) {

            console.log("Dashboard error:", error);

        }

    };


    useFocusEffect(
        useCallback(() => {

            loadDashboard();

        }, [])
    );


    const onRefresh = async () => {

        setRefreshing(true);

        await loadDashboard();

        setRefreshing(false);

    };


    const pieData = data.categoryData.map((item, index) => ({
        value: item.amount,
        color: PALETTE[index % PALETTE.length],
        text: item.name,
    }));


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

            <Text style={styles.title}>Welcome back 👋</Text>

            <Text style={styles.subtitle}>Here is your financial overview.</Text>

            <View style={styles.summaryRow}>

                <View style={[styles.summaryCard, styles.summaryCardFirst]}>

                    <Text style={styles.eyebrow}>BALANCE</Text>

                    <Text
                        style={[
                            styles.summaryValue,
                            { color: data.balance >= 0 ? colors.mint : colors.coral },
                        ]}
                    >
                        ${data.balance.toFixed(2)}
                    </Text>

                </View>

                <View style={styles.summaryCard}>

                    <Text style={styles.eyebrow}>INCOME</Text>

                    <Text style={[styles.summaryValue, { color: colors.mint }]}>
                        ${data.totalIncome.toFixed(2)}
                    </Text>

                </View>

                <View style={[styles.summaryCard, styles.summaryCardLast]}>

                    <Text style={styles.eyebrow}>EXPENSES</Text>

                    <Text style={[styles.summaryValue, { color: colors.coral }]}>
                        ${data.totalExpenses.toFixed(2)}
                    </Text>

                </View>

            </View>

            <View style={styles.card}>

                <Text style={styles.sectionTitle}>Expenses by Category</Text>

                {pieData.length === 0 ? (

                    <View style={styles.emptyState}>
                        <Ionicons name="pie-chart-outline" size={36} color={colors.border} />
                        <Text style={styles.emptyText}>No expenses yet.</Text>
                    </View>

                ) : (

                    <View style={styles.chartWrapper}>

                        <PieChart
                            data={pieData}
                            donut
                            radius={90}
                            innerRadius={55}
                            centerLabelComponent={() => (
                                <Text style={styles.chartCenterLabel}>
                                    ${data.totalExpenses.toFixed(0)}
                                </Text>
                            )}
                        />

                        <View style={styles.legend}>

                            {pieData.map((item, index) => (

                                <View key={index} style={styles.legendRow}>

                                    <View
                                        style={[styles.legendDot, { backgroundColor: item.color }]}
                                    />

                                    <Text style={styles.legendText}>
                                        {item.text} · ${item.value.toFixed(2)}
                                    </Text>

                                </View>

                            ))}

                        </View>

                    </View>

                )}

            </View>

            <View style={styles.card}>

                <Text style={styles.sectionTitle}>Recent Activity</Text>

                {data.transactions.length === 0 ? (

                    <View style={styles.emptyState}>
                        <Ionicons name="time-outline" size={36} color={colors.border} />
                        <Text style={styles.emptyText}>No transactions yet.</Text>
                    </View>

                ) : (

                    data.transactions.slice(0, 5).map((item) => (

                        <View key={`${item.type}-${item.id}`} style={styles.transactionRow}>

                            <View style={styles.transactionLeft}>

                                <Text style={styles.transactionTitle}>{item.title}</Text>

                                <Text style={styles.transactionDate}>
                                    {new Date(item.date).toLocaleDateString()}
                                </Text>

                            </View>

                            <Text
                                style={[
                                    styles.transactionAmount,
                                    { color: item.type === "income" ? colors.mint : colors.coral },
                                ]}
                            >
                                {item.type === "income" ? "+" : "-"}
                                ${Number(item.amount).toFixed(2)}
                            </Text>

                        </View>

                    ))

                )}

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
    },

    subtitle: {
        fontFamily: fonts.body,
        color: colors.inkSoft,
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },

    summaryRow: {
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.md,
    },

    summaryCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
    },

    summaryCardFirst: {},

    summaryCardLast: {},

    eyebrow: {
        fontFamily: fonts.mono,
        fontSize: 10,
        letterSpacing: 1,
        color: colors.inkSoft,
        marginBottom: spacing.xs,
    },

    summaryValue: {
        fontFamily: fonts.monoBold,
        fontSize: 16,
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

    emptyText: {
        fontFamily: fonts.body,
        color: colors.inkSoft,
    },

    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: spacing.lg,
        gap: spacing.xs,
    },

    chartWrapper: {
        alignItems: "center",
    },

    chartCenterLabel: {
        fontFamily: fonts.monoBold,
        fontSize: 14,
        color: colors.ink,
    },

    legend: {
        marginTop: spacing.md,
        alignSelf: "stretch",
        gap: spacing.xs,
    },

    legendRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },

    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },

    legendText: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: colors.ink,
    },

    transactionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    transactionLeft: {
        flex: 1,
    },

    transactionTitle: {
        fontFamily: fonts.bodyMedium,
        color: colors.ink,
        fontSize: 14,
    },

    transactionDate: {
        fontFamily: fonts.body,
        color: colors.inkSoft,
        fontSize: 12,
        marginTop: 2,
    },

    transactionAmount: {
        fontFamily: fonts.monoBold,
        fontSize: 14,
    },

});

export default DashboardScreen;