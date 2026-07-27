import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API = axios.create({
    baseURL: "http://10.15.24.81:8000",
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