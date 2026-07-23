import { useState } from "react";
import api from "../api/axios";


function Register(){

    const [form, setForm] = useState({
        name:"",
        email:"",
        password:""
    });


    const register = async(e)=>{

        e.preventDefault();

        try{

            const response = await api.post(
                "/auth/register",
                form
            );

            console.log(response.data);

            alert("Account created!");

        }catch(error){

            console.log(error);

            alert("Registration failed");

        }

    };


    return(

        <div className="min-h-screen flex items-center justify-center">

            <form
                onSubmit={register}
                className="bg-white p-8 rounded-xl shadow-md space-y-4"
            >

                <h1 className="text-2xl font-bold">
                    Create Account
                </h1>


                <input
                    className="border p-2 w-full"
                    placeholder="Name"
                    onChange={
                        e=>setForm({
                            ...form,
                            name:e.target.value
                        })
                    }
                />


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
                    placeholder="Password"
                    type="password"
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
                    Register
                </button>


            </form>

        </div>

    )
}


export default Register;