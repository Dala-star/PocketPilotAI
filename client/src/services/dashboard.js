import API from "../api/axios";


export const getDashboardData = async()=>{


    const incomeResponse = await API.get(
        "/income/"
    );


    const expenseResponse = await API.get(
        "/expenses/"
    );


    const categoryResponse = await API.get(
        "/categories/"
    );



    const incomes = incomeResponse.data;

    const expenses = expenseResponse.data;

    const categories = categoryResponse.data;



    const totalIncome = incomes.reduce(
        (sum,item)=>sum + item.amount,
        0
    );



    const totalExpenses = expenses.reduce(
        (sum,item)=>sum + item.amount,
        0
    );



    const transactions = [


        ...incomes.map(item=>({

            id:item.id,

            type:"income",

            title:item.source,

            amount:item.amount,

            date:item.date

        })),



        ...expenses.map(item=>({

            id:item.id,

            type:"expense",

            title:item.description || "Expense",

            amount:item.amount,

            date:item.date

        }))


    ];




    transactions.sort(

        (a,b)=>
        new Date(b.date) -
        new Date(a.date)

    );

const chartData = [
    {
        name:"Finance",
        income:totalIncome,
        expenses:totalExpenses
    }
];



const spendingTrend = expenses.map(item=>({

    date:new Date(item.date)
        .toLocaleDateString(),

    amount:item.amount

}));


const categoryTotals = {};


expenses.forEach(expense=>{


    const category =
    expense.category_id;


    if(!categoryTotals[category]){

        categoryTotals[category]=0;

    }


    categoryTotals[category]+=expense.amount;


});



const categoryData = Object.keys(categoryTotals)
.map(categoryId=>{

    const match = categories.find(
        c=>c.id===Number(categoryId)
    );

    return {

        name: match ? match.name : "Uncategorized",

        amount:categoryTotals[categoryId]

    };

});


    return {

    totalIncome,

    totalExpenses,

    balance:
    totalIncome-totalExpenses,


    transactions,


    chartData,


    spendingTrend,

    categoryData

};
}