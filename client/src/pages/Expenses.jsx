import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import {
    getExpenses,
    createExpense,
    deleteExpense
} from "../services/expenses";

import {
    getCategories
} from "../services/categories";



function Expenses(){


    const [expenses,setExpenses] = useState([]);

    const [categories,setCategories] = useState([]);



    const [form,setForm] = useState({

        amount:"",
        description:"",
        category_id:""

    });





    const loadData = async()=>{


        const expenseData = await getExpenses();

        const categoryData = await getCategories();


        setExpenses(expenseData);

        setCategories(categoryData);


    };





    useEffect(()=>{

        loadData();

    },[]);







    const submit = async(e)=>{

        e.preventDefault();


        await createExpense({

            amount:Number(form.amount),

            description:form.description,

            category_id:Number(form.category_id)

        });



        setForm({

            amount:"",

            description:"",

            category_id:""

        });


        loadData();

    };








    const removeExpense = async(id)=>{

        await deleteExpense(id);

        loadData();

    };









    return (

        <DashboardLayout>


            <div className="space-y-6">



                <h1 className="text-3xl font-bold">

                    Expenses

                </h1>







                <form

                    onSubmit={submit}

                    className="
                    bg-white
                    p-6
                    rounded-xl
                    shadow
                    space-y-4
                    "

                >




                    <input

                        type="number"

                        className="border p-2 w-full rounded"

                        placeholder="Amount"

                        value={form.amount}

                        onChange={
                            e=>setForm({
                                ...form,
                                amount:e.target.value
                            })
                        }

                    />







                    <input

                        className="border p-2 w-full rounded"

                        placeholder="Description"

                        value={form.description}

                        onChange={
                            e=>setForm({
                                ...form,
                                description:e.target.value
                            })
                        }

                    />








                    <select

                        className="border p-2 w-full rounded"

                        value={form.category_id}

                        onChange={
                            e=>setForm({
                                ...form,
                                category_id:e.target.value
                            })
                        }

                    >


                        <option value="">

                            Select Category

                        </option>



                        {
                            categories.map(category=>(


                                <option

                                    key={category.id}

                                    value={category.id}

                                >

                                    {category.name}

                                </option>


                            ))
                        }


                    </select>









                    <button

                        className="
                        bg-red-500
                        text-white
                        px-4
                        py-2
                        rounded-lg
                        "

                    >

                        Add Expense

                    </button>




                </form>









                <div className="bg-white rounded-xl shadow p-6">


                    <h2 className="text-xl font-semibold mb-4">

                        Expense History

                    </h2>





                    {
                        expenses.map(item=>(


                            <div

                                key={item.id}

                                className="
                                flex
                                justify-between
                                border-b
                                py-3
                                "

                            >


                                <div>


                                    <p className="font-semibold">

                                        ${item.amount}

                                    </p>


                                    <p className="text-gray-500">

                                        {item.description}

                                    </p>



                                    <p className="text-sm text-gray-400">

                                        Category ID: {item.category_id}

                                    </p>


                                </div>





                                <button

                                    onClick={
                                        ()=>removeExpense(item.id)
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



export default Expenses;