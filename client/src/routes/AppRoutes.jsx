import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";


import Login from "../auth/Login";
import Register from "../auth/Register";
import Dashboard from "../pages/Dashboard";
import Income from "../pages/Income";
import Expenses from "../pages/Expenses";
import Categories from "../pages/Categories";
import Budgets from "../pages/Budgets";
import Settings from "../pages/Settings";


import ProtectedRoute from "./ProtectedRoute";



function AppRoutes(){


    return (

        <BrowserRouter>

            <Routes>



                <Route
                    path="/"
                    element={
                        <Navigate to="/login" />
                    }
                />



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
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />




                <Route
                    path="/income"
                    element={
                        <ProtectedRoute>
                            <Income />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/expenses"
                    element={
                        <ProtectedRoute>
                            <Expenses />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/categories"
                    element={
                        <ProtectedRoute>
                            <Categories />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/budgets"
                    element={
                        <ProtectedRoute>
                            <Budgets />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />



            </Routes>


        </BrowserRouter>

    );

}


export default AppRoutes;