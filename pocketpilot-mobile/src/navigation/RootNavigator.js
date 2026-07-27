import { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { AuthContext } from "../context/AuthContext";
import { colors } from "../theme/tokens";

import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

function RootNavigator() {

    const { user, loading } = useContext(AuthContext);

    if (loading) {

        return (

            <View style={styles.loadingContainer}>

                <ActivityIndicator size="large" color={colors.navy} />

            </View>

        );

    }

    return (

        <NavigationContainer>

            {user ? <MainTabs /> : <AuthStack />}

        </NavigationContainer>

    );

}

const styles = StyleSheet.create({

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.paper,
    },

});

export default RootNavigator;
