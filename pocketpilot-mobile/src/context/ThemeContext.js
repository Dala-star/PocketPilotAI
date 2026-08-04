import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { lightColors, darkColors } from "../theme/tokens";

const THEME_STORAGE_KEY = "themePreference"; // "light" | "dark" | "system"

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    // The device's current system setting — used when preference is "system".
    const systemScheme = useColorScheme();

    const [preference, setPreference] = useState("system");
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
                if (saved === "light" || saved === "dark" || saved === "system") {
                    setPreference(saved);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoaded(true);
            }
        })();
    }, []);

    const isDark =
        preference === "dark" || (preference === "system" && systemScheme === "dark");

    const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

    const setThemePreference = async (next) => {
        setPreference(next);
        try {
            await SecureStore.setItemAsync(THEME_STORAGE_KEY, next);
        } catch (error) {
            console.log(error);
        }
    };

    const value = useMemo(
        () => ({ colors, isDark, preference, setThemePreference }),
        [colors, isDark, preference]
    );

    // Avoid a light->dark flash on launch: render nothing until we've read
    // the saved preference (this resolves in a single tick, not noticeable).
    if (!loaded) return null;

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return ctx;
}
