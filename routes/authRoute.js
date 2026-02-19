const express=require("express");
const { signUp, signIn, signOut, sendOtp, verifyOtp, resetPassword } = require("../controllers/authController");

const router=express.Router();

router.post("/signUp",signUp);
router.post("/signIn",signIn);
router.post("/logout",signOut);
router.post("/send-otp",sendOtp);
router.post("/verify-otp",verifyOtp);
router.post("/reset-password",resetPassword);


module.exports=router;
