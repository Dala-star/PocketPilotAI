import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { loginUser } from "../api/auth";


function Login() {

    const { login } = useContext(AuthContext);

    const navigate = useNavigate();


    const [form, setForm] = useState({
        email: "",
        password: ""
    });


    const [loading, setLoading] = useState(false);



    const submit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);


            const response = await loginUser(
                form.email,
                form.password
            );


            login(
                response.access_token
            );


            navigate("/dashboard");


        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Invalid login"
            );


        } finally {

            setLoading(false);

        }

    };



    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">


            <form
                onSubmit={submit}
                className="bg-white p-8 rounded-xl shadow-md space-y-4 w-96"
            >


                <h1 className="text-2xl font-bold text-center">
                    Login
                </h1>



                <input

                    className="border p-2 w-full rounded"

                    type="email"

                    placeholder="Email"

                    value={form.email}

                    onChange={
                        e =>
                        setForm({
                            ...form,
                            email: e.target.value
                        })
                    }

                />



                <input

                    className="border p-2 w-full rounded"

                    type="password"

                    placeholder="Password"

                    value={form.password}

                    onChange={
                        e =>
                        setForm({
                            ...form,
                            password: e.target.value
                        })
                    }

                />



                <button

                    type="submit"

                    disabled={loading}

                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg w-full"

                >

                    {
                        loading
                        ? "Logging in..."
                        : "Login"
                    }


                </button>




                <p className="text-center text-sm">


                    Don't have an account?


                    <Link

                        to="/register"

                        className="text-emerald-600 ml-1"

                    >

                        Register

                    </Link>


                </p>



            </form>


        </div>

    );

}


export default Login;