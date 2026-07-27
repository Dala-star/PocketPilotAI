import API from "../api/axios";


// Get categories

export const getCategories = async () => {

    const response = await API.get("/categories/");

    return response.data;

};




// Create category

export const createCategory = async (data) => {

    const response = await API.post(
        "/categories/",
        data
    );

    return response.data;

};




// Delete category

export const deleteCategory = async (id) => {

    const response = await API.delete(
        `/categories/${id}`
    );

    return response.data;

};