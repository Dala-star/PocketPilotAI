import API from "./axios";


export const loginUser = async (email, password) => {
    const response = await API.post("/auth/login", {
        email,
        password,
    });

    return response.data;
};


export const registerUser = async (userData) => {
    const response = await API.post("/auth/register", userData);

    return response.data;
};


export const forgotPassword = async (email) => {
    const response = await API.post("/auth/forgot-password", { email });

    return response.data;
};


export const resetPassword = async (token, newPassword) => {
    const response = await API.post("/auth/reset-password", {
        token,
        new_password: newPassword,
    });

    return response.data;
};
