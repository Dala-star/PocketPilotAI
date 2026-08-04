import { useContext } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { AuthContext } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

function RootNavigatorInner() {

    const { user, loading } = useContext(AuthContext);
    const { colors, isDark } = useTheme();

    const navigationTheme = {
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            background: colors.paper,
            card: colors.surface,
            text: colors.ink,
            border: colors.border,
            primary: colors.navy,
        },
    };

    if (loading) {

        return (

            <View style={[styles.loadingContainer, { backgroundColor: colors.paper }]}>

                <ActivityIndicator size="large" color={colors.navy} />

            </View>

        );

    }

    return (

        <NavigationContainer theme={navigationTheme}>

            {user ? <MainTabs /> : <AuthStack />}

        </NavigationContainer>

    );

}

function RootNavigator() {

    return (

        <ThemeProvider>
            <RootNavigatorInner />
        </ThemeProvider>

    );

}

const styles = StyleSheet.create({

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

});

export default RootNavigator;
