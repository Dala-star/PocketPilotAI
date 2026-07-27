import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useFonts } from "expo-font";

import {
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";

import {
    Inter_400Regular,
    Inter_600SemiBold,
} from "@expo-google-fonts/inter";

import {
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
} from "@expo-google-fonts/ibm-plex-mono";

import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { colors } from "./src/theme/tokens";

export default function App() {

    const [fontsLoaded] = useFonts({
        SpaceGrotesk_600SemiBold,
        SpaceGrotesk_700Bold,
        Inter_400Regular,
        Inter_600SemiBold,
        IBMPlexMono_500Medium,
        IBMPlexMono_600SemiBold,
    });

    if (!fontsLoaded) {

        return (

            <View style={styles.loadingContainer}>

                <ActivityIndicator size="large" color={colors.navy} />

            </View>

        );

    }

    return (

        <AuthProvider>

            <RootNavigator />

        </AuthProvider>

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
