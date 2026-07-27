import API from "../api/axios";


// Get all income

export const getIncome = async () => {

    const response = await API.get("/income/");

    return response.data;

};




// Create income

export const createIncome = async (data) => {

    const response = await API.post(
        "/income/",
        data
    );

    return response.data;

};




// Delete income

export const deleteIncome = async (id) => {

    const response = await API.delete(
        `/income/${id}`
    );

    return response.data;

};