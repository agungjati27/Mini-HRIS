const express = require("express");
const cors = require("cors");


const app = express();


app.use(cors());


// WAJIB DI ATAS ROUTE
app.use(express.json());

app.use((req,res,next)=>{

    console.log(
        "METHOD:",
        req.method
    );


    console.log(
        "BODY:",
        req.body
    );


    next();

});

app.use(express.urlencoded({
    extended:true
}));



// ROUTE
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const adminAttendanceRoutes = require("./routes/adminAttendanceRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");


app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/profile",
    profileRoutes
);


app.use(
    "/api/attendance",
    attendanceRoutes
);

app.use(
    "/api/admin",
    adminAttendanceRoutes
);

app.use(
    "/api/employee",
    employeeRoutes
);

app.use(
    "/api/leave",
    leaveRoutes
);


module.exports = app;