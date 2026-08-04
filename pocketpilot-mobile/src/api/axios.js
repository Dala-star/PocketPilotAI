import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_URL =
    Constants.expoConfig?.extra?.apiUrl ||
    "http://localhost:8000";

const API = axios.create({
    baseURL: API_URL,
});

API.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            await SecureStore.deleteItemAsync("token");
        }

        return Promise.reject(error);
    }
);

export default API;