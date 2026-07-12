const router=require("express").Router();

const upload=require("../middleware/uploadMiddleware");


const {

registerEmployee,
loginEmployee

}=require("../controllers/authController");



// Register

router.post(

"/register",

upload.single("avatar"),

registerEmployee

);



// Login

router.post(
"/login",
loginEmployee
);



module.exports=router;