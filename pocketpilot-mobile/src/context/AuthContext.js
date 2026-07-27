import { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";


export const AuthContext = createContext();


export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        loadToken();

    }, []);


    const loadToken = async () => {

        const token = await SecureStore.getItemAsync("token");

        setUser(token || null);

        setLoading(false);

    };


    const login = async (token) => {

        console.log("LOGIN TOKEN RECEIVED:", typeof token, JSON.stringify(token));

        await SecureStore.setItemAsync("token", token);

        setUser(token);

    };


    const logout = async () => {

        await SecureStore.deleteItemAsync("token");

        setUser(null);

    };


    return (

        <AuthContext.Provider

            value={{
                user,
                login,
                logout,
                loading
            }}

        >

            {children}

        </AuthContext.Provider>

    );

}