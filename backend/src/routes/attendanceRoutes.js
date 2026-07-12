const express =
require("express");


const router =
express.Router();


const authMiddleware =
require("../middleware/authMiddleware");


const {

generateAttendanceQR,

scanAttendance,

checkoutAttendance,

getTodayAttendance,

getAttendanceHistory

}=require("../controllers/attendanceController");





router.get(

"/qr",

authMiddleware,

generateAttendanceQR

);

router.post(

"/scan",

authMiddleware,

scanAttendance

);

router.post(

"/checkout",

authMiddleware,

checkoutAttendance

);

router.get(

"/today",

authMiddleware,

getTodayAttendance

);



router.get(

"/history",

authMiddleware,

getAttendanceHistory

);


module.exports=router;