import { Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import { hasRole } from "../utils/auth";


function ProtectedRoute({ children, requiredRole }) {


const {
    user,
    loading
}
=
useAuth();



if(loading){

    return (

        <div className="
        min-h-screen
        flex
        items-center
        justify-center
        ">

            Loading...

        </div>

    )

}



if(!user){

    return (

        <Navigate 
        to="/"
        replace
        />

    )

}

if(requiredRole && !hasRole(requiredRole)){
    return <Navigate to="/dashboard" replace />;
}

return children;


}


export default ProtectedRoute;