import DashboardLayout from "../layouts/DashboardLayout";


function Dashboard(){

    return (

        <DashboardLayout>

            <h1 className="text-3xl font-bold">
                Welcome back 👋
            </h1>

            <p className="text-gray-600 mt-2">
                Here is your financial overview.
            </p>


        </DashboardLayout>

    )

}


export default Dashboard;