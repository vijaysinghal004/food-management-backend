const express=require("express");
const { signUp, signIn, signOut, sendOtp, verifyOtp, resetPassword, googleAuth } = require("../controllers/authController");

const router=express.Router();

router.post("/signUp",signUp);
router.post("/signIn",signIn);
router.post("/logout",signOut);
router.post("/send-otp",sendOtp);
router.post("/verify-otp",verifyOtp);
router.post("/reset-password",resetPassword);
router.post("/google-auth",googleAuth);


module.exports=router;
