import {
    FiHome,
    FiDollarSign,
    FiCreditCard,
    FiTarget,
    FiFileText,
    FiSettings
} from "react-icons/fi";


function Sidebar(){

    const links = [
        {
            name:"Dashboard",
            icon:<FiHome/>
        },
        {
            name:"Income",
            icon:<FiDollarSign/>
        },
        {
            name:"Expenses",
            icon:<FiCreditCard/>
        },
        {
            name:"Savings",
            icon:<FiTarget/>
        },
        {
            name:"Reports",
            icon:<FiFileText/>
        },
        {
            name:"Settings",
            icon:<FiSettings/>
        }
    ];


    return (

        <aside className="
            w-64
            min-h-screen
            bg-white
            border-r
            p-6
        ">


            <h1 className="
                text-2xl
                font-bold
                text-emerald-600
                mb-8
            ">
                PocketPilot AI
            </h1>


            <nav className="space-y-4">

                {
                    links.map((link,index)=>(

                        <div
                            key={index}
                            className="
                            flex
                            items-center
                            gap-3
                            text-gray-600
                            hover:text-emerald-600
                            cursor-pointer
                            "
                        >

                            {link.icon}

                            <span>
                                {link.name}
                            </span>

                        </div>

                    ))
                }

            </nav>


        </aside>

    )

}


export default Sidebar;