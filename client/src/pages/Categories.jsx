import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import API from "../api/axios";


function Categories(){


    const [categories,setCategories] = useState([]);


    const [name,setName] = useState("");


    const [editing,setEditing] = useState(null);




    const loadCategories = async()=>{

        try{

            const response = await API.get("/categories/");

            setCategories(response.data);

        }
        catch(error){

            console.log(error);

        }

    };




    useEffect(()=>{

        loadCategories();

    },[]);





    const submitCategory = async(e)=>{

        e.preventDefault();


        try{


            if(editing){


                await API.put(

                    `/categories/${editing}`,

                    {
                        name
                    }

                );


            }
            else{


                await API.post(

                    "/categories/",

                    {
                        name
                    }

                );


            }



            setName("");

            setEditing(null);

            loadCategories();



        }
        catch(error){

            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Failed to save category"
            );

        }


    };







    const editCategory=(category)=>{


        setEditing(category.id);

        setName(category.name);


    };






    const deleteCategory=async(id)=>{

        if(!window.confirm("Delete this category?")){
            return;
        }

        try{


            await API.delete(

                `/categories/${id}`

            );


            loadCategories();


        }
        catch(error){

            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Failed to delete category"
            );

        }


    };







    return (

        <DashboardLayout>


            <div className="space-y-6">


                <div>

                    <h1 className="text-3xl font-bold">
                        Categories
                    </h1>

                    <p className="text-ink-soft">
                        Manage your expense categories.
                    </p>

                </div>







                <div className="grid md:grid-cols-3 gap-6">





                    <form

                        onSubmit={submitCategory}

                        className="passbook-card p-6 space-y-4"

                    >


                        <h2 className="text-xl font-semibold">

                            {
                                editing
                                ?
                                "Edit Category"
                                :
                                "Add Category"
                            }

                        </h2>




                        <input


                            className="input-field"


                            placeholder="Category name"


                            value={name}


                            onChange={
                                e=>setName(e.target.value)
                            }


                        />





                        <button

                            className="btn-primary w-full"

                        >

                            {
                                editing
                                ?
                                "Update"
                                :
                                "Add"
                            }


                        </button>



                    </form>









                    <div

                        className="md:col-span-2 passbook-card p-6"

                    >


                        <h2 className="text-xl font-semibold mb-4">

                            Your Categories

                        </h2>





                        {

                            categories.length === 0

                            ?

                            (

                                <p className="text-ink-soft">

                                    No categories yet.

                                </p>

                            )

                            :

                            (

                                <div className="space-y-3">


                                {
                                    categories.map(category=>(


                                        <div

                                            key={category.id}

                                            className="
                                            flex
                                            justify-between
                                            items-center
                                            border-b
                                            pb-3
                                            "

                                        >



                                            <p className="font-medium">

                                                {category.name}

                                            </p>





                                            <div className="flex gap-3">


                                                <button

                                                    onClick={
                                                        ()=>editCategory(category)
                                                    }

                                                    className="btn-edit-text"

                                                >

                                                    Edit

                                                </button>




                                                <button

                                                    onClick={
                                                        ()=>deleteCategory(category.id)
                                                    }

                                                    className="btn-danger-text"

                                                >

                                                    Delete

                                                </button>


                                            </div>




                                        </div>


                                    ))
                                }


                                </div>

                            )

                        }



                    </div>




                </div>




            </div>



        </DashboardLayout>

    );

}


export default Categories;
