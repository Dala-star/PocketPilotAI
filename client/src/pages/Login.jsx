import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";


function Login(){

    const { login } = useContext(AuthContext);

    const navigate = useNavigate();

    const [form,setForm] = useState({
        email:"",
        password:""
    });


    const submit = async(e)=>{

        e.preventDefault();

        try{

            const response = await api.post(
                "/auth/login",
                form
            );


            login(
                response.data.access_token
            );


            navigate("/dashboard");


        }catch(error){

            console.log(error);
            alert("Invalid login");

        }

    };


    return (

        <div className="min-h-screen flex items-center justify-center">


            <form
                onSubmit={submit}
                className="bg-white p-8 rounded-xl shadow-md space-y-4"
            >

                <h1 className="text-2xl font-bold">
                    Login
                </h1>


                <input
                    className="border p-2 w-full"
                    placeholder="Email"
                    onChange={
                        e=>setForm({
                            ...form,
                            email:e.target.value
                        })
                    }
                />


                <input
                    className="border p-2 w-full"
                    type="password"
                    placeholder="Password"
                    onChange={
                        e=>setForm({
                            ...form,
                            password:e.target.value
                        })
                    }
                />


                <button
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
                >
                    Login
                </button>


            </form>


        </div>

    )
}


export default Login;