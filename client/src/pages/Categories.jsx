import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import {
    getCategories,
    createCategory,
    deleteCategory
} from "../services/categories";



function Categories(){


    const [categories,setCategories] = useState([]);



    const [name,setName] = useState("");





    const loadCategories = async()=>{

        const data = await getCategories();

        setCategories(data);

    };





    useEffect(()=>{

        loadCategories();

    },[]);







    const submit = async(e)=>{

        e.preventDefault();


        if(!name)
            return;


        await createCategory({
            name
        });


        setName("");

        loadCategories();

    };







    const removeCategory = async(id)=>{

        await deleteCategory(id);

        loadCategories();

    };









    return (

        <DashboardLayout>


            <div className="space-y-6">



                <h1 className="text-3xl font-bold">

                    Categories

                </h1>







                <form

                    onSubmit={submit}

                    className="
                    bg-white
                    p-6
                    rounded-xl
                    shadow
                    flex
                    gap-4
                    "

                >



                    <input

                        className="
                        border
                        p-2
                        rounded
                        flex-1
                        "

                        placeholder="Category name"

                        value={name}

                        onChange={
                            e=>setName(e.target.value)
                        }

                    />





                    <button

                        className="
                        bg-emerald-600
                        text-white
                        px-4
                        rounded-lg
                        "

                    >

                        Add

                    </button>



                </form>









                <div className="bg-white rounded-xl shadow p-6">


                    <h2 className="text-xl font-semibold mb-4">

                        Your Categories

                    </h2>





                    {
                        categories.map(category=>(


                            <div

                                key={category.id}

                                className="
                                flex
                                justify-between
                                border-b
                                py-3
                                "

                            >


                                <span>

                                    {category.name}

                                </span>




                                <button

                                    onClick={
                                        ()=>removeCategory(category.id)
                                    }

                                    className="text-red-500"

                                >

                                    Delete

                                </button>



                            </div>


                        ))
                    }





                </div>





            </div>


        </DashboardLayout>

    )

}



export default Categories;