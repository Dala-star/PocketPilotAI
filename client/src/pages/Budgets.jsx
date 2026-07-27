import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import API from "../api/axios";

import ProgressBar from "../components/common/ProgressBar";

function Budgets() {

    const [budgets, setBudgets] = useState([]);

    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        amount: "",
        category_id: ""
    });

    const loadData = async () => {

        try {

            const budgetRes = await API.get("/budgets/");

            const categoryRes = await API.get("/categories/");

            setBudgets(budgetRes.data);

            setCategories(categoryRes.data);

        } catch (error) {

            console.log(error);

        }

    };

    useEffect(() => {

        loadData();

    }, []);

    const submit = async (e) => {

        e.preventDefault();

        try {

            await API.post("/budgets/", {

                amount: Number(form.amount),

                category_id: Number(form.category_id)

            });

            setForm({
                amount: "",
                category_id: ""
            });

            loadData();

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Failed to create budget"
            );

        }

    };

    const removeBudget = async (id) => {

        if(!window.confirm("Delete this budget?")){
            return;
        }

        try {

            await API.delete(`/budgets/${id}`);

            loadData();

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Failed to delete budget"
            );

        }

    };

    return (

        <DashboardLayout>

            <div className="space-y-6">

                <h1 className="text-3xl font-bold">
                    Budgets
                </h1>

                <form
                    onSubmit={submit}
                    className="passbook-card p-6 space-y-4"
                >

                    <select
                        className="input-field"
                        value={form.category_id}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                category_id: e.target.value
                            })
                        }
                    >

                        <option value="">
                            Select Category
                        </option>

                        {categories.map((category) => (

                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>

                        ))}

                    </select>

                    <input
                        className="input-field"
                        type="number"
                        placeholder="Budget Amount"
                        value={form.amount}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                amount: e.target.value
                            })
                        }
                    />

                    <button
                        className="btn-primary"
                    >
                        Save Budget
                    </button>

                </form>

                <div className="passbook-card overflow-hidden">

                    <table className="w-full">

                        <thead>

                            <tr className="border-b bg-paper">

                                <th className="p-4 text-left eyebrow">
                                    Category
                                </th>

                                <th className="p-4 text-left eyebrow">
                                    Budget
                                </th>

                                <th className="p-4 text-left eyebrow">
                                    Progress
                                </th>

                                <th className="p-4 text-center eyebrow">
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {budgets.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="4"
                                        className="p-6 text-center text-ink-soft"
                                    >
                                        No budgets created yet.
                                    </td>

                                </tr>

                            ) : (

                                budgets.map((budget) => {

                                    const category = categories.find(
                                        (c) => c.id === budget.category_id
                                    );

                                    return (

                                        <tr
                                            key={budget.id}
                                            className="border-b"
                                        >

                                            <td className="p-4">
                                                {category?.name || "Unknown"}
                                            </td>

                                            <td className="p-4 amount">
                                                £{Number(budget.amount).toFixed(2)}
                                            </td>

                                            <td className="p-4 w-64">

                                                <ProgressBar
                                                    value={budget.percentage || 0}
                                                />

                                            </td>

                                            <td className="p-4 text-center">

                                                <button
                                                    onClick={() =>
                                                        removeBudget(budget.id)
                                                    }
                                                    className="btn-danger-text"
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>

                                    );

                                })

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </DashboardLayout>

    );

}

export default Budgets;
