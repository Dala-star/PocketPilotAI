import API from "./axios";


export const getIncome = async () => {

    const response = await API.get("/income/");

    return response.data;

};


export const createIncome = async (incomeData) => {

    const response = await API.post(
        "/income/",
        incomeData
    );

    return response.data;

};


export const deleteIncome = async (incomeId) => {

    const response = await API.delete(
        `/income/${incomeId}`
    );

    return response.data;

};