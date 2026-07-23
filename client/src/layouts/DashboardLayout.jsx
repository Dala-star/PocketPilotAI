import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";


function DashboardLayout({children}){

    return (

        <div className="flex">

            <Sidebar/>


            <div className="flex-1">

                <Navbar/>


                <main className="p-8">

                    {children}

                </main>


            </div>


        </div>

    )

}


export default DashboardLayout;