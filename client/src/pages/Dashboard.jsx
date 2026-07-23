import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";

import SummaryCard from "../components/dashboard/SummaryCard";

import {
    getDashboardData
} from "../services/dashboard";



function Dashboard() {


    const [data, setData] = useState({

        balance: 0,

        totalIncome: 0,

        totalExpenses: 0,

        transactions: []

    });



    const [loading, setLoading] = useState(true);



    const loadDashboard = async () => {

        try {

            const result = await getDashboardData();

            setData(result);


        } catch(error) {

            console.log(error);

        }
        finally {

            setLoading(false);

        }

    };




    useEffect(() => {

        loadDashboard();

    }, []);





    return (

        <DashboardLayout>


            <div className="space-y-6">



                <div>

                    <h1 className="text-3xl font-bold">

                        Welcome back 👋

                    </h1>


                    <p className="text-gray-600 mt-2">

                        Here is your financial overview.

                    </p>


                </div>





                {
                    loading ?

                    (

                        <p>
                            Loading dashboard...
                        </p>

                    )

                    :

                    (

                    <>


                    <div className="
                        grid
                        grid-cols-1
                        md:grid-cols-3
                        gap-6
                    ">


                        <SummaryCard

                            title="Total Balance"

                            value={`$${data.balance.toFixed(2)}`}

                        />



                        <SummaryCard

                            title="Income"

                            value={`$${data.totalIncome.toFixed(2)}`}

                        />



                        <SummaryCard

                            title="Expenses"

                            value={`$${data.totalExpenses.toFixed(2)}`}

                        />


                    </div>





                    <div className="
                        bg-white
                        rounded-xl
                        shadow
                        p-6
                    ">


                        <h2 className="
                            text-xl
                            font-semibold
                            mb-4
                        ">

                            Recent Activity

                        </h2>





                        <div className="space-y-3">



                            {
                                data.transactions.length === 0 ?


                                (

                                    <p className="text-gray-500">

                                        No transactions yet.

                                    </p>

                                )


                                :


                                (

                                    data.transactions
                                    .slice(0,5)
                                    .map(item => (


                                        <div

                                            key={`${item.type}-${item.id}`}

                                            className="
                                                flex
                                                justify-between
                                                border-b
                                                pb-3
                                            "

                                        >



                                            <div>


                                                <p className="font-medium">

                                                    {
                                                        item.title ||
                                                        "Transaction"
                                                    }

                                                </p>



                                                <p className="text-sm text-gray-500">

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
                                                    item.type === "income"

                                                    ?

                                                    "text-green-600 font-semibold"

                                                    :

                                                    "text-red-500 font-semibold"
                                                }

                                            >


                                                {
                                                    item.type === "income"

                                                    ?

                                                    "+"

                                                    :

                                                    "-"
                                                }


                                                ${item.amount}


                                            </p>




                                        </div>


                                    ))

                                )

                            }



                        </div>



                    </div>


                    </>

                    )

                }





            </div>


        </DashboardLayout>

    );

}


export default Dashboard;