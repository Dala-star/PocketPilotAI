import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";


function Navbar(){

    const { logout } = useContext(AuthContext);


    return (

        <header className="
            h-16
            bg-white
            border-b
            flex
            items-center
            justify-between
            px-8
        ">


            <h2 className="font-semibold">
                Dashboard
            </h2>


            <button
                onClick={logout}
                className="
                bg-red-500
                text-white
                px-4
                py-2
                rounded-lg
                "
            >
                Logout
            </button>


        </header>

    )

}


export default Navbar;