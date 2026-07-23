import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../api/auth";


function Register() {


    const navigate = useNavigate();


    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });


    const [loading, setLoading] = useState(false);



    const register = async (e) => {

        e.preventDefault();


        try {

            setLoading(true);


            const response = await registerUser(form);


            console.log(response);


            alert("Account created successfully!");


            navigate("/login");



        } catch (error) {


            console.log(error);


            alert(
                error.response?.data?.detail ||
                "Registration failed"
            );



        } finally {


            setLoading(false);


        }


    };



    return (


        <div className="min-h-screen flex items-center justify-center bg-gray-100">


            <form

                onSubmit={register}

                className="bg-white p-8 rounded-xl shadow-md space-y-4 w-96"

            >


                <h1 className="text-2xl font-bold text-center">

                    Create Account

                </h1>




                <input

                    className="border p-2 w-full rounded"

                    placeholder="Name"

                    value={form.name}

                    onChange={
                        e =>
                        setForm({
                            ...form,
                            name: e.target.value
                        })
                    }

                />




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
                        ? "Creating Account..."
                        : "Register"
                    }


                </button>





                <p className="text-center text-sm">


                    Already have an account?


                    <Link

                        to="/login"

                        className="text-emerald-600 ml-1"

                    >

                        Login

                    </Link>


                </p>



            </form>


        </div>


    );

}


export default Register;