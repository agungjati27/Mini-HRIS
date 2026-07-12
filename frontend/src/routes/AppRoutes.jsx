import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";


import Login from "../pages/Login";

import Register from "../pages/Register";

import Dashboard from "../pages/dashboard/Dashboard";

import Attendance from "../pages/Attendance";
import AttendanceSettingsPage from "../pages/AttendanceSettings";
import Profile from "../pages/Profile";
import Employees from "../pages/Employees";
import Approvals from "../pages/Approvals";
import Reports from "../pages/Reports";

import AppLayout from "../layout/AppLayout";


import ProtectedRoute from "./ProtectedRoute";




function AppRoutes(){


return (

<BrowserRouter>


<Routes>



{/* =====================
    AUTH
===================== */}


<Route

path="/"

element={<Login/>}

/>



<Route

path="/register"

element={<Register/>}

/>





{/* =====================
    PRIVATE AREA
===================== */}



<Route


element={


<ProtectedRoute>


<AppLayout/>


</ProtectedRoute>


}



>


<Route

path="/dashboard"

element={<Dashboard/>}

/>

<Route

path="/attendance"

element={<Attendance/>}

/>

<Route

path="/settings"

element={<AttendanceSettingsPage/>}

/>

<Route
  path="/employees"
  element={
    <ProtectedRoute requiredRole="admin">
      <Employees />
    </ProtectedRoute>
  }
/>

<Route

path="/profile"

element={<Profile/>}

/>

<Route

path="/approvals"

element={<Approvals/>}

/>

<Route
  path="/reports"
  element={
    <ProtectedRoute requiredRole="admin">
      <Reports />
    </ProtectedRoute>
  }
/>


</Route>




</Routes>


</BrowserRouter>


)


}


export default AppRoutes;
