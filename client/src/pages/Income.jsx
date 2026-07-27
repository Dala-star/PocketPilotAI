import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import API from "../api/axios";


function Income(){


    const [income,setIncome] = useState([]);


    const [form,setForm] = useState({
        amount:"",
        source:"",
        description:""
    });


    const [editing,setEditing] = useState(null);



    const loadIncome = async()=>{

        try{

            const response = await API.get("/income/");

            setIncome(response.data);

        }
        catch(error){

            console.log(error);

        }

    };



    useEffect(()=>{

        loadIncome();

    },[]);





    const submitIncome = async(e)=>{

        e.preventDefault();


        try{


            if(editing){


                await API.put(
                    `/income/${editing}`,
                    {
                        amount:Number(form.amount),
                        source:form.source,
                        description:form.description
                    }
                );


            }
            else{


                await API.post(
                    "/income/",
                    {
                        amount:Number(form.amount),
                        source:form.source,
                        description:form.description
                    }
                );


            }



            setForm({
                amount:"",
                source:"",
                description:""
            });


            setEditing(null);


            loadIncome();



        }
        catch(error){

            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Failed to save income"
            );

        }


    };






    const editIncome=(item)=>{


        setEditing(item.id);


        setForm({

            amount:item.amount,

            source:item.source,

            description:item.description || ""

        });


    };






    const deleteIncome=async(id)=>{

        if(!window.confirm("Delete this income entry?")){
            return;
        }

        try{


            await API.delete(
                `/income/${id}`
            );


            loadIncome();


        }
        catch(error){

            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Failed to delete income"
            );

        }


    };







    return (

        <DashboardLayout>


            <div className="space-y-6">


                <h1 className="text-3xl font-bold">
                    Income
                </h1>




                <div className="grid md:grid-cols-3 gap-6">



                    <form

                        onSubmit={submitIncome}

                        className="passbook-card p-6 space-y-4"

                    >


                        <h2 className="text-xl font-semibold">

                            {
                                editing
                                ?
                                "Edit Income"
                                :
                                "Add Income"
                            }

                        </h2>



                        <input

                            type="number"

                            placeholder="Amount"

                            className="input-field"

                            value={form.amount}

                            onChange={
                                e =>
                                setForm({
                                    ...form,
                                    amount:e.target.value
                                })
                            }

                        />




                        <input

                            placeholder="Source"

                            className="input-field"

                            value={form.source}

                            onChange={
                                e =>
                                setForm({
                                    ...form,
                                    source:e.target.value
                                })
                            }

                        />




                        <textarea

                            placeholder="Description"

                            className="input-field"

                            value={form.description}

                            onChange={
                                e =>
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
                                "Update Income"
                                :
                                "Add Income"
                            }

                        </button>



                    </form>







                    <div

                        className="md:col-span-2 passbook-card p-6"

                    >


                        <h2 className="text-xl font-semibold mb-4">

                            Income History

                        </h2>




                        {
                            income.length === 0 ?

                            (

                                <p className="text-ink-soft">
                                    No income yet.
                                </p>

                            )

                            :

                            income.map(item=>(


                                <div

                                    key={item.id}

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

                                            {item.source}

                                        </p>


                                        <p className="text-sm text-ink-soft">

                                            {item.description}

                                        </p>


                                    </div>




                                    <div className="flex items-center gap-3">


                                        <span className="amount text-mint font-bold">

                                            +${Number(item.amount).toFixed(2)}

                                        </span>



                                        <button

                                            onClick={()=>editIncome(item)}

                                            className="btn-edit-text"

                                        >

                                            Edit

                                        </button>




                                        <button

                                            onClick={()=>deleteIncome(item.id)}

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


export default Income;
