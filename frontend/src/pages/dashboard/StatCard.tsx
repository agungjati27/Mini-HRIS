interface Props {

title:string;

value:string;

}



export default function StatCard({
title,
value
}:Props){


return(

<div
className="
rounded-2xl
bg-white
p-5
shadow-sm
border
border-gray-100
dark:bg-gray-800
dark:border-gray-700
"
>


<p className="
text-sm
text-gray-500
dark:text-gray-400
">

{title}

</p>



<h2 className="
mt-3
text-3xl
font-bold
text-gray-800
dark:text-white
">

{value}

</h2>


</div>

)

}