import API from "../api/axios";


export const getDashboardData = async () => {


    const incomeResponse = await API.get("/income/");


    const expenseResponse = await API.get("/expenses/");



    const incomes = incomeResponse.data;


    const expenses = expenseResponse.data;




    const totalIncome = incomes.reduce(

        (sum, item) => sum + item.amount,

        0

    );




    const totalExpenses = expenses.reduce(

        (sum, item) => sum + item.amount,

        0

    );





    const transactions = [


        ...incomes.map(item => ({

            id:item.id,

            type:"income",

            title:item.source,

            amount:item.amount,

            date:item.date

        })),



        ...expenses.map(item => ({

            id:item.id,

            type:"expense",

            title:item.description,

            amount:item.amount,

            date:item.date

        }))


    ];





    transactions.sort(

        (a,b)=>

        new Date(b.date) - new Date(a.date)

    );





    return {


        balance:
            totalIncome - totalExpenses,


        totalIncome,


        totalExpenses,


        transactions


    };


};