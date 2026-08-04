import API from "./axios";


export const getProfile = async () => {

    const response = await API.get("/users/me");

    return response.data;

};


export const updateProfile = async (data) => {

    // Only `name` is editable here now — email changes go through the
    // dedicated changeEmail flow below since they need password
    // confirmation and (usually) re-verification.
    const response = await API.put("/users/me", data);

    return response.data;

};


export const changeEmail = async (data) => {

    // data: { newEmail, password }
    // Backend expects snake_case field names — mapped here from the
    // camelCase local state.
    const response = await API.put("/users/change-email", {
        new_email: data.newEmail,
        password: data.password,
    });

    return response.data;

};


export const changePassword = async (data) => {

    const response = await API.put("/users/change-password", data);

    return response.data;

};


export const deleteAccount = async (password) => {

    // DELETE with a body — axios needs it passed under `data`.
    const response = await API.delete("/users/me", {
        data: { password },
    });

    return response.data;

};


export const getPreferences = async () => {

    const response = await API.get("/users/preferences");

    return response.data;

};


export const updatePreferences = async (data) => {

    // data: { currency, budgetPeriod, startOfWeek }
    const response = await API.put("/users/preferences", {
        currency: data.currency,
        budget_period: data.budgetPeriod,
        start_of_week: data.startOfWeek,
    });

    return response.data;

};


export const getNotificationPreferences = async () => {

    const response = await API.get("/users/notifications");

    return response.data;

};


export const updateNotificationPreferences = async (data) => {

    // data: { budgetAlerts, weeklyDigest, billReminders }
    const response = await API.put("/users/notifications", {
        budget_alerts: data.budgetAlerts,
        weekly_digest: data.weeklyDigest,
        bill_reminders: data.billReminders,
    });

    return response.data;

};