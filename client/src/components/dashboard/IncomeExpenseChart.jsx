import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";



function IncomeExpenseChart({data}){


    return (

        <div className="passbook-card p-6">


            <h2 className="
                text-xl
                font-semibold
                mb-4
            ">

                Income vs Expenses

            </h2>




            <ResponsiveContainer
                width="100%"
                height={300}
            >


                <BarChart data={data}>


                    <XAxis dataKey="name"/>


                    <YAxis/>


                    <Tooltip/>


                    <Legend/>




                    <Bar

                        dataKey="income"

                        name="Income"

                        fill="#1fa97b"

                    />



                    <Bar

                        dataKey="expenses"

                        name="Expenses"

                        fill="#f2542d"

                    />



                </BarChart>


            </ResponsiveContainer>


        </div>

    );


}


export default IncomeExpenseChart;
