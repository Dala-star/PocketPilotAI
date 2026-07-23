import {
    FiHome,
    FiDollarSign,
    FiCreditCard,
    FiList,
    FiSettings
} from "react-icons/fi";

import { NavLink } from "react-router-dom";


function Sidebar() {


    const links = [

        {
            name: "Dashboard",
            icon: <FiHome />,
            path: "/dashboard"
        },

        {
            name: "Income",
            icon: <FiDollarSign />,
            path: "/income"
        },

        {
            name: "Expenses",
            icon: <FiCreditCard />,
            path: "/expenses"
        },

        {
            name: "Categories",
            icon: <FiList />,
            path: "/categories"
        },

        {
            name: "Settings",
            icon: <FiSettings />,
            path: "/settings"
        }

    ];



    return (

        <aside
            className="
                w-64
                min-h-screen
                bg-white
                border-r
                p-6
            "
        >


            <h1
                className="
                    text-2xl
                    font-bold
                    text-emerald-600
                    mb-8
                "
            >
                PocketPilot AI
            </h1>



            <nav className="space-y-2">


                {
                    links.map((link) => (

                        <NavLink

                            key={link.name}

                            to={link.path}

                            className={({isActive}) => `

                                flex
                                items-center
                                gap-3
                                p-3
                                rounded-lg
                                transition

                                ${
                                    isActive
                                    ?
                                    "bg-emerald-100 text-emerald-600"
                                    :
                                    "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
                                }

                            `}

                        >

                            {link.icon}


                            <span>
                                {link.name}
                            </span>


                        </NavLink>

                    ))
                }


            </nav>


        </aside>

    );

}


export default Sidebar;