import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";



function SpendingChart({data}){


    return (

        <div className="passbook-card p-6">


            <h2 className="
                text-xl
                font-semibold
                mb-4
            ">

                Spending Trend

            </h2>




            <ResponsiveContainer
                width="100%"
                height={300}
            >


                <LineChart data={data}>


                    <XAxis dataKey="date"/>


                    <YAxis/>


                    <Tooltip/>




                    <Line

                        type="monotone"

                        dataKey="amount"

                        stroke="#16213e"

                        strokeWidth={3}

                    />



                </LineChart>



            </ResponsiveContainer>



        </div>


    );


}


export default SpendingChart;
