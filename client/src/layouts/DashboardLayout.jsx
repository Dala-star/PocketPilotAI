import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";


function DashboardLayout({ children }) {


    return (

        <div className="min-h-screen bg-gray-100 flex">


            {/* Sidebar */}

            <Sidebar />



            <div className="flex-1">


                {/* Navbar */}

                <Navbar />



                {/* Page Content */}

                <main className="p-6">

                    {children}

                </main>


            </div>


        </div>

    );

}


export default DashboardLayout;