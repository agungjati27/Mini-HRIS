import useAuth 
from "../hooks/useAuth";


function Header(){


const {
user,
logout
}
=
useAuth();



return(

<header
className="
bg-white
shadow
h-16
flex
items-center
justify-between
px-4
">


<h1
className="
font-bold
text-xl
">

Mini HRIS

</h1>



<div className="
flex
items-center
gap-3
">


<span>

{
user?.email
}

</span>



<button

onClick={logout}

className="
bg-red-500
text-white
px-3
py-2
rounded
"

>

Logout

</button>


</div>


</header>

)


}


export default Header;