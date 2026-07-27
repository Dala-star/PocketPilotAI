import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import SummaryCard from "../components/dashboard/SummaryCard";

import {
    getDashboardData
} from "../services/dashboard";


import IncomeExpenseChart 
from "../components/dashboard/IncomeExpenseChart";


import SpendingChart
from "../components/dashboard/SpendingChart";


import ExpenseCategoryChart
from "../components/dashboard/ExpenseCategoryChart";

import AIInsights from "../components/dashboard/AIInsights";



function Dashboard(){


    const [data,setData] = useState({

        balance:0,

        totalIncome:0,

        totalExpenses:0,

        transactions:[],

        chartData:[],

        spendingTrend:[],

        categoryData:[]

    });






    const loadDashboard = async()=>{


        try{


            const result = await getDashboardData();


            setData(result);


        }
        catch(error){

            console.log(
                "Dashboard error:",
                error
            );

        }


    };







    useEffect(()=>{


        loadDashboard();


    },[]);









    return (


        <DashboardLayout>



            <div className="space-y-6">





                <div>


                    <h1 className="text-3xl font-bold">

                        Welcome back 👋

                    </h1>



                    <p className="text-ink-soft mt-2">

                        Here is your financial overview.

                    </p>


                </div>









                {/* SUMMARY CARDS */}

                <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    gap-6
                ">



                    <SummaryCard

                        title="Total Balance"

                        value={
                            `$${data.balance.toFixed(2)}`
                        }

                        tone={
                            data.balance >= 0
                            ? "positive"
                            : "negative"
                        }

                    />



                    <SummaryCard

                        title="Income"

                        value={
                            `$${data.totalIncome.toFixed(2)}`
                        }

                        tone="positive"

                    />



                    <SummaryCard

                        title="Expenses"

                        value={
                            `$${data.totalExpenses.toFixed(2)}`
                        }

                        tone="negative"

                    />


                </div>









                {/* MAIN CHARTS */}


                <div className="
                    grid
                    md:grid-cols-2
                    gap-6
                ">



                    <IncomeExpenseChart

                        data={
                            data.chartData
                        }

                    />





                    <SpendingChart

                        data={
                            data.spendingTrend
                        }

                    />



                </div>









                {/* CATEGORY CHART */}


                <div className="
                    grid
                    md:grid-cols-2
                    gap-6
                ">


                    <ExpenseCategoryChart

                        data={
                            data.categoryData
                        }

                    />


                </div>



                <AIInsights data={data} />





                {/* RECENT ACTIVITY */}


                <div className="passbook-card p-6">



                    <h2 className="
                        text-xl
                        font-semibold
                        mb-4
                    ">

                        Recent Activity

                    </h2>






                    {

                    data.transactions.length === 0


                    ?

                    (

                        <p className="
                            text-ink-soft
                        ">

                            No transactions yet.

                        </p>

                    )


                    :


                    (

                    data.transactions
                    .slice(0,5)
                    .map(item=>(


                        <div

                            key={
                                `${item.type}-${item.id}`
                            }

                            className="
                                flex
                                justify-between
                                items-center
                                border-b
                                py-3
                            "

                        >



                            <div>


                                <p className="
                                    font-medium
                                ">

                                    {
                                        item.title
                                    }

                                </p>



                                <p className="
                                    text-sm
                                    text-ink-soft
                                ">


                                    {
                                        new Date(
                                            item.date
                                        )
                                        .toLocaleDateString()
                                    }


                                </p>


                            </div>






                            <p

                            className={

                                "amount font-bold " +

                                (
                                item.type === "income"

                                ?

                                "text-mint"

                                :

                                "text-coral"
                                )

                            }

                            >



                                {
                                    item.type === "income"
                                    ?
                                    "+"
                                    :
                                    "-"
                                }


                                ${Number(item.amount).toFixed(2)}



                            </p>




                        </div>


                    ))

                    )

                    }



                </div>







            </div>





        </DashboardLayout>


    );


}



export default Dashboard;
