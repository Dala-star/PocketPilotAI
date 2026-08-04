import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";

import DashboardScreen from "../screens/DashboardScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import IncomeScreen from "../screens/IncomeScreen";
import BudgetsScreen from "../screens/BudgetsScreen";
import ChatScreen from "../screens/ChatScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

const ICONS = {
    Dashboard: "home",
    Expenses: "arrow-down-circle",
    Income: "arrow-up-circle",
    Budgets: "pie-chart",
    Chat: "chatbubble-ellipses",
    Settings: "settings",
};

function MainTabs() {

    const { colors } = useTheme();

    return (

        <Tab.Navigator

            screenOptions={({ route }) => ({

                headerShown: false,

                tabBarActiveTintColor: colors.navy,

                tabBarInactiveTintColor: colors.inkSoft,

                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },

                tabBarIcon: ({ color, size }) => (

                    <Ionicons

                        name={ICONS[route.name]}

                        size={size}

                        color={color}

                    />

                ),

            })}

        >

            <Tab.Screen name="Dashboard" component={DashboardScreen} />

            <Tab.Screen name="Expenses" component={ExpensesScreen} />

            <Tab.Screen name="Income" component={IncomeScreen} />

            <Tab.Screen name="Budgets" component={BudgetsScreen} />

            <Tab.Screen name="Chat" component={ChatScreen} />

            <Tab.Screen name="Settings" component={SettingsScreen} />

        </Tab.Navigator>

    );

}

export default MainTabs;
