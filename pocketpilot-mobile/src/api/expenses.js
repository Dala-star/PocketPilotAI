import API from "./axios";


export const getExpenses = async () => {

    const response = await API.get("/expenses/");

    return response.data;

};


export const createExpense = async (data) => {

    const response = await API.post("/expenses/", data);

    return response.data;

};


export const updateExpense = async (id, data) => {

    const response = await API.put(`/expenses/${id}`, data);

    return response.data;

};


export const deleteExpense = async (id) => {

    const response = await API.delete(`/expenses/${id}`);

    return response.data;

};
