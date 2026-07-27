import API from "../api/axios";


export const getDashboardData = async () => {

    const [incomeRes, expenseRes, categoryRes] = await Promise.all([
        API.get("/income/"),
        API.get("/expenses/"),
        API.get("/categories/"),
    ]);

    const incomes = incomeRes.data;

    const expenses = expenseRes.data;

    const categories = categoryRes.data;


    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);


    const transactions = [

        ...incomes.map((item) => ({
            id: item.id,
            type: "income",
            title: item.source,
            amount: item.amount,
            date: item.date,
        })),

        ...expenses.map((item) => ({
            id: item.id,
            type: "expense",
            title: item.description || "Expense",
            amount: item.amount,
            date: item.date,
        })),

    ];

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));


    const categoryTotals = {};

    expenses.forEach((expense) => {

        const category = expense.category_id;

        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }

        categoryTotals[category] += expense.amount;

    });

    const categoryData = Object.keys(categoryTotals).map((categoryId) => {

        const match = categories.find((c) => c.id === Number(categoryId));

        return {
            name: match ? match.name : "Uncategorized",
            amount: categoryTotals[categoryId],
        };

    });


    return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactions,
        categoryData,
    };

};
