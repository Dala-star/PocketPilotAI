import API from "../api/axios";


export const getProfile = async () => {

    const response = await API.get("/users/me");

    return response.data;

};


export const updateProfile = async (data) => {

    const response = await API.put(
        "/users/me",
        data
    );

    return response.data;

};


export const changePassword = async (data) => {

    const response = await API.put(
        "/users/change-password",
        data
    );

    return response.data;

};