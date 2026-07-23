import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";


import Login from "../auth/Login";
import Register from "../auth/Register";

import Dashboard from "../pages/Dashboard";
import Income from "../pages/Income";
import Expenses from "../pages/Expenses";
import Categories from "../pages/Categories";

import ProtectedRoute from "./ProtectedRoute";


function AppRoutes(){

    return (

        <BrowserRouter>

            <Routes>


                <Route
                    path="/login"
                    element={<Login />}
                />


                <Route
                    path="/register"
                    element={<Register />}
                />


                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard/>
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/income"
                    element={
                        <ProtectedRoute>
                            <Income/>
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/expenses"
                    element={
                        <ProtectedRoute>
                            <Expenses/>
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/categories"
                    element={
                        <ProtectedRoute>
                            <Categories/>
                        </ProtectedRoute>
                    }
                />


            </Routes>


        </BrowserRouter>

    )

}


export default AppRoutes;