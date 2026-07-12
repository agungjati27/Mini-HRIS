import useEmployee from "../../hooks/useEmployee";


export default function EmployeeProfile(){


const {
employee,
loading
}=useEmployee();



if(loading){

return (

<div className="bg-white p-5 rounded-xl">

Loading...

</div>

)

}



return(

<div
className="
rounded-2xl
bg-white
p-5
shadow-sm
dark:bg-gray-800
"
>


<h3
className="
text-sm
text-gray-500
"
>

Profile Pegawai

</h3>



<h2
className="
mt-3
text-xl
font-semibold
dark:text-white
"
>

{employee?.full_name}

</h2>



<p className="text-gray-500">

{employee?.position}

</p>



<div className="mt-4 text-sm">


<p>
NIK : {employee?.nik}
</p>


<p>
Department : {employee?.department}
</p>


</div>


</div>


)

}