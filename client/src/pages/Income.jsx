import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import {
    getIncome,
    createIncome,
    deleteIncome
} from "../services/income";


function Income(){


    const [income,setIncome] = useState([]);


    const [form,setForm] = useState({

        amount:"",
        source:"",
        description:""

    });



    const loadIncome = async()=>{

        const data = await getIncome();

        setIncome(data);

    };



    useEffect(()=>{

        loadIncome();

    },[]);





    const submit = async(e)=>{

        e.preventDefault();


        await createIncome(form);


        setForm({

            amount:"",
            source:"",
            description:""

        });


        loadIncome();

    };





    const removeIncome = async(id)=>{

        await deleteIncome(id);

        loadIncome();

    };





    return (

        <DashboardLayout>


            <div className="space-y-6">


                <h1 className="text-3xl font-bold">
                    Income
                </h1>



                <form
                    onSubmit={submit}
                    className="bg-white p-6 rounded-xl shadow space-y-4"
                >


                    <input
                        className="border p-2 w-full"
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
                        className="border p-2 w-full"
                        placeholder="Source"
                        value={form.source}
                        onChange={
                            e=>setForm({
                                ...form,
                                source:e.target.value
                            })
                        }
                    />



                    <input
                        className="border p-2 w-full"
                        placeholder="Description"
                        value={form.description}
                        onChange={
                            e=>setForm({
                                ...form,
                                description:e.target.value
                            })
                        }
                    />



                    <button
                        className="
                        bg-emerald-600
                        text-white
                        px-4
                        py-2
                        rounded-lg
                        "
                    >

                        Add Income

                    </button>


                </form>





                <div className="bg-white rounded-xl shadow p-6">


                    <h2 className="text-xl font-semibold mb-4">

                        Income History

                    </h2>



                    {
                        income.map(item=>(

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
                                        {item.source}
                                    </p>

                                    <p className="text-gray-500">
                                        {item.description}
                                    </p>

                                </div>



                                <div>

                                    <p>
                                        ${item.amount}
                                    </p>


                                    <button
                                        onClick={()=>removeIncome(item.id)}
                                        className="text-red-500"
                                    >
                                        Delete
                                    </button>

                                </div>


                            </div>


                        ))
                    }


                </div>


            </div>


        </DashboardLayout>

    )

}


export default Income;