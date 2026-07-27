import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import API from "../api/axios";


function Expenses(){


    const [expenses,setExpenses] = useState([]);

    const [categories,setCategories] = useState([]);


    const [form,setForm] = useState({

        amount:"",
        description:"",
        category_id:""

    });


    const [editing,setEditing] = useState(null);





    const loadExpenses = async()=>{

        try{

            const response = await API.get("/expenses/");

            setExpenses(response.data);

        }
        catch(error){

            console.log(error);

        }

    };






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


        loadExpenses();

        loadCategories();


    },[]);









    const submitExpense = async(e)=>{

        e.preventDefault();


        try{


            const data = {

                amount:Number(form.amount),

                description:form.description,

                category_id:Number(form.category_id)

            };





            if(editing){


                await API.put(

                    `/expenses/${editing}`,

                    data

                );


            }
            else{


                await API.post(

                    "/expenses/",

                    data

                );


            }



            setForm({

                amount:"",
                description:"",
                category_id:""

            });



            setEditing(null);


            loadExpenses();


        }
        catch(error){

            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Failed to save expense"
            );

        }


    };









    const editExpense=(expense)=>{


        setEditing(expense.id);


        setForm({

            amount:expense.amount,

            description:expense.description || "",

            category_id:expense.category_id

        });


    };









    const deleteExpense=async(id)=>{

        if(!window.confirm("Delete this expense?")){
            return;
        }

        try{


            await API.delete(

                `/expenses/${id}`

            );


            loadExpenses();


        }
        catch(error){

            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Failed to delete expense"
            );

        }


    };









    const getCategoryName=(id)=>{


        const category = categories.find(

            item=>item.id === id

        );


        return category
        ?
        category.name
        :
        "Unknown";


    };







    return (

        <DashboardLayout>


            <div className="space-y-6">



                <div>

                    <h1 className="text-3xl font-bold">

                        Expenses

                    </h1>


                    <p className="text-ink-soft">

                        Track where your money goes.

                    </p>


                </div>








                <div className="grid md:grid-cols-3 gap-6">





                    <form

                        onSubmit={submitExpense}

                        className="passbook-card p-6 space-y-4"

                    >


                        <h2 className="text-xl font-semibold">

                            {
                                editing
                                ?
                                "Edit Expense"
                                :
                                "Add Expense"
                            }

                        </h2>





                        <input

                            type="number"

                            placeholder="Amount"

                            className="input-field"

                            value={form.amount}

                            onChange={
                                e=>
                                setForm({
                                    ...form,
                                    amount:e.target.value
                                })
                            }

                        />






                        <select


                            className="input-field"


                            value={form.category_id}


                            onChange={
                                e=>
                                setForm({
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








                        <textarea


                            placeholder="Description"


                            className="input-field"


                            value={form.description}


                            onChange={
                                e=>
                                setForm({
                                    ...form,
                                    description:e.target.value
                                })
                            }


                        />






                        <button

                            className="btn-primary w-full"

                        >

                            {
                                editing
                                ?
                                "Update Expense"
                                :
                                "Add Expense"
                            }


                        </button>



                    </form>









                    <div

                        className="md:col-span-2 passbook-card p-6"

                    >



                        <h2 className="text-xl font-semibold mb-4">

                            Expense History

                        </h2>






                        {

                            expenses.length === 0

                            ?

                            (

                                <p className="text-ink-soft">

                                    No expenses yet.

                                </p>

                            )


                            :


                            expenses.map(expense=>(


                                <div

                                    key={expense.id}

                                    className="
                                    flex
                                    justify-between
                                    items-center
                                    border-b
                                    py-3
                                    "

                                >


                                    <div>


                                        <p className="font-semibold">

                                            {getCategoryName(
                                                expense.category_id
                                            )}

                                        </p>



                                        <p className="text-sm text-ink-soft">

                                            {expense.description}

                                        </p>


                                    </div>





                                    <div className="flex items-center gap-3">


                                        <span className="amount text-coral font-bold">

                                            -${Number(expense.amount).toFixed(2)}

                                        </span>



                                        <button

                                            onClick={
                                                ()=>editExpense(expense)
                                            }

                                            className="btn-edit-text"

                                        >

                                            Edit

                                        </button>





                                        <button

                                            onClick={
                                                ()=>deleteExpense(expense.id)
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





                </div>






            </div>



        </DashboardLayout>

    );


}


export default Expenses;
