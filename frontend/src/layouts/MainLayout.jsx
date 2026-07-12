import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";


function MainLayout({children}){


return(

<div className="min-h-screen bg-gray-100">


<Header/>


<div className="flex">


<Sidebar/>


<main className="
flex-1
p-4
md:p-6
">


{children}


</main>


</div>


<Footer/>


</div>


)

}


export default MainLayout;