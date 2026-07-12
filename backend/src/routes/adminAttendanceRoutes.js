const express = require("express");

const router = express.Router();


const {

getAllAttendance

}=require("../controllers/adminAttendanceController");



const authMiddleware =
require("../middleware/authMiddleware");



router.get(

"/attendance",

authMiddleware,

getAllAttendance

);



module.exports=router;