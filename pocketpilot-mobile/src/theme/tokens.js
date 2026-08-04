// theme/tokens.js
// Central design tokens for PocketPilotAI. Keeping these in one place means
// a palette or spacing tweak here updates the whole app consistently.
//
// Color usage convention:
//  - `surface` is the card/input/row background (was `white` before dark mode)
//  - `white` is ALWAYS pure white — used for text/icons drawn on top of an
//    accent-colored background (a navy button, a mint button, a chat bubble),
//    which must stay legible in both light and dark mode.
//  - `paper` is the screen/page background.

export const lightColors = {
    // Core palette
    navy: "#1B2A4A",
    navySoft: "#2E4270",
    mint: "#2FBF8F",
    mintSoft: "#E4F8F0",
    coral: "#F0654A",
    coralSoft: "#FDEAE5",
    amber: "#F2A93B",
    amberSoft: "#FCF0DD",

    // Surfaces & text
    paper: "#F5F6FA",
    surface: "#FFFFFF",
    white: "#FFFFFF",
    ink: "#171C2A",
    inkSoft: "#6B7280",
    inkFaint: "#A2A8B8",
    border: "#E6E8F0",
    borderSoft: "#EFF1F7",

    // Overlays
    overlay: "rgba(16, 24, 40, 0.5)",
};

export const darkColors = {
    // Core palette — brightened slightly so accents stay legible on dark surfaces
    navy: "#4C6FE0",
    navySoft: "#3A4E85",
    mint: "#33D6A0",
    mintSoft: "rgba(51, 214, 160, 0.16)",
    coral: "#FF7A5C",
    coralSoft: "rgba(255, 122, 92, 0.16)",
    amber: "#F4B85C",
    amberSoft: "rgba(244, 184, 92, 0.16)",

    // Surfaces & text
    paper: "#0F1420",
    surface: "#1A2030",
    white: "#FFFFFF",
    ink: "#F1F3F9",
    inkSoft: "#9AA3B8",
    inkFaint: "#6B7488",
    border: "#2A3142",
    borderSoft: "#232939",

    // Overlays
    overlay: "rgba(0, 0, 0, 0.6)",
};

// Kept for any file that hasn't been migrated to useTheme() yet — points at
// the light palette so nothing crashes, but every screen should prefer
// `const { colors } = useTheme()` instead of importing this directly.
export const colors = lightColors;

export const fonts = {
    display: "System",
    displayBold: "System",
    body: "System",
    bodyMedium: "System",
    mono: "System",
    monoBold: "System",
};

export const spacing = {
    xs: 6,
    sm: 12,
    md: 18,
    lg: 24,
    xl: 32,
};

export const radius = {
    sm: 10,
    md: 16,
    lg: 24,
    pill: 999,
};

// Soft, consistent elevation presets — spread these into any card, row,
// or floating button style to give it depth instead of relying on borders.
export const shadow = {
    card: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 2,
    },
    raised: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 5,
    },
    button: {
        shadowColor: "#1B2A4A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 3,
    },
};
