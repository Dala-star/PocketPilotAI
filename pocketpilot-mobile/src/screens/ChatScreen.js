import React, { useState, useRef, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sendChatMessage } from "../api/ai";
import { useTheme } from "../context/ThemeContext";

const INITIAL_MESSAGE = {
    role: "assistant",
    content: "Hi! Ask me anything about your spending, income, or budgets.",
};

export default function ChatScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const listRef = useRef(null);

    const scrollToEnd = () => {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const nextMessages = [...messages, { role: "user", content: text }];
        setMessages(nextMessages);
        setInput("");
        setLoading(true);
        scrollToEnd();

        try {
            const data = await sendChatMessage(nextMessages);
            setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
        } catch (err) {
            setMessages([
                ...nextMessages,
                {
                    role: "assistant",
                    content: "Sorry, something went wrong. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
            scrollToEnd();
        }
    };

    const renderItem = ({ item }) => {
        const isUser = item.role === "user";
        return (
            <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
                {!isUser && (
                    <View style={styles.avatar}>
                        <Ionicons name="sparkles" size={14} color={colors.white} />
                    </View>
                )}
                <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                    <Text style={isUser ? styles.userText : styles.assistantText}>
                        {item.content}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Ionicons name="sparkles" size={18} color={colors.white} />
                </View>
                <View>
                    <Text style={styles.headerTitle}>Finance Assistant</Text>
                    <Text style={styles.headerSubtitle}>Ask about your money, anytime</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.flexFill}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={90}
            >
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(_, i) => String(i)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={scrollToEnd}
                />

                {loading && (
                    <View style={[styles.row, styles.rowAssistant]}>
                        <View style={styles.avatar}>
                            <Ionicons name="sparkles" size={14} color={colors.white} />
                        </View>
                        <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}>
                            <View style={styles.dot} />
                            <View style={[styles.dot, styles.dotMid]} />
                            <View style={styles.dot} />
                        </View>
                    </View>
                )}

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask about your finances..."
                        placeholderTextColor={colors.inkSoft}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!input.trim() || loading}
                    >
                        <Ionicons name="arrow-up" size={20} color={colors.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function createStyles(colors) {
    return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.paper },
    flexFill: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.navy,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    headerTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
    headerSubtitle: { fontSize: 12, color: colors.inkSoft, marginTop: 1 },

    listContent: { padding: 16, paddingBottom: 8 },

    row: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 12,
    },
    rowUser: { justifyContent: "flex-end" },
    rowAssistant: { justifyContent: "flex-start" },

    avatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.navy,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },

    bubble: {
        maxWidth: "76%",
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
    },
    userBubble: {
        backgroundColor: colors.navy,
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: colors.surface,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    userText: { color: colors.white, fontSize: 15, lineHeight: 20 },
    assistantText: { color: colors.ink, fontSize: 15, lineHeight: 20 },

    typingBubble: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.inkSoft,
        opacity: 0.5,
    },
    dotMid: { opacity: 0.8 },

    inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    input: {
        flex: 1,
        backgroundColor: colors.paper,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        maxHeight: 100,
        fontSize: 15,
        color: colors.ink,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.navy,
        alignItems: "center",
        justifyContent: "center",
    },
    sendButtonDisabled: {
        backgroundColor: colors.inkSoft,
        opacity: 0.5,
    },
    });
}
