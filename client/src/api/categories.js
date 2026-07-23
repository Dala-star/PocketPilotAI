import API from "./axios";


export const getCategories = async () => {

    const response = await API.get("/categories/");

    return response.data;

};


export const createCategory = async (categoryData) => {

    const response = await API.post(
        "/categories/",
        categoryData
    );

    return response.data;

};


export const deleteCategory = async (categoryId) => {

    const response = await API.delete(
        `/categories/${categoryId}`
    );

    return response.data;

};