import API from "../api/axios";


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



export const deleteIncome = async (id) => {

    const response = await API.delete(
        `/income/${id}`
    );

    return response.data;

};