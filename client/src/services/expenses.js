import API from "../api/axios";


export const getExpenses = async () => {

    const response = await API.get("/expenses/");

    return response.data;

};



export const createExpense = async (expenseData) => {

    const response = await API.post(
        "/expenses/",
        expenseData
    );

    return response.data;

};



export const deleteExpense = async (id) => {

    const response = await API.delete(
        `/expenses/${id}`
    );

    return response.data;

};