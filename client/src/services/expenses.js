import API from "../api/axios";


// Get expenses

export const getExpenses = async () => {

    const response = await API.get("/expenses/");

    return response.data;

};




// Create expense

export const createExpense = async (data) => {

    const response = await API.post(
        "/expenses/",
        data
    );

    return response.data;

};




// Delete expense

export const deleteExpense = async (id) => {

    const response = await API.delete(
        `/expenses/${id}`
    );

    return response.data;

};