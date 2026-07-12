import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";


export default function DashboardLayout({children}){


return (

<div className="flex min-h-screen bg-gray-100">


<Sidebar/>


<div className="flex flex-col flex-1">


<Header/>


<main className="
p-4
md:p-6
lg:p-8
">

{children}

</main>


<Footer/>


</div>


</div>

);


}