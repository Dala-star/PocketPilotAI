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

        <div className="min-h-screen flex items-center justify-center">


            <form
                onSubmit={submit}
                className="passbook-card p-8 space-y-4 w-96"
            >


                <h1 className="text-2xl font-bold text-center">
                    PocketPilot AI
                </h1>

                <p className="eyebrow text-center">
                    Log in to your account
                </p>



                <input

                    className="input-field"

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

                    className="input-field"

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

                    className="btn-primary w-full"

                >

                    {
                        loading
                        ? "Logging in..."
                        : "Login"
                    }


                </button>




                <p className="text-center text-sm text-ink-soft">


                    Don't have an account?


                    <Link

                        to="/register"

                        className="text-mint ml-1 font-medium"

                    >

                        Register

                    </Link>


                </p>



            </form>


        </div>

    );

}


export default Login;
