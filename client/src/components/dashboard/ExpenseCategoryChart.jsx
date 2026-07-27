import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const PALETTE = [
    "#1fa97b",
    "#f2542d",
    "#e3a008",
    "#16213e",
    "#5b8def",
    "#9b6bd6"
];


function ExpenseCategoryChart({data}){


    return (

        <div
            className="passbook-card p-6"
        >


            <h2 className="
                text-xl
                font-semibold
                mb-4
            ">

                Expenses by Category

            </h2>




            <ResponsiveContainer

                width="100%"

                height={300}

            >


                <PieChart>


                    <Pie

                        data={data}

                        dataKey="amount"

                        nameKey="name"

                        cx="50%"

                        cy="50%"

                        outerRadius={100}

                        label

                    >


                        {

                            data.map(
                                (entry,index)=>(

                                <Cell

                                    key={index}

                                    fill={PALETTE[index % PALETTE.length]}

                                />

                                )

                            )

                        }


                    </Pie>




                    <Tooltip />


                    <Legend />


                </PieChart>


            </ResponsiveContainer>



        </div>

    );

}


export default ExpenseCategoryChart;
