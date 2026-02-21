const express=require("express");
const { signUp, signIn, signOut, sendOtp, verifyOtp, resetPassword, googleAuth, googleAuthlogin } = require("../controllers/authController");

const router=express.Router();

router.post("/signUp",signUp);
router.post("/signIn",signIn);
router.get("/signOut",signOut);
router.post("/send-otp",sendOtp);
router.post("/verify-otp",verifyOtp);
router.post("/reset-password",resetPassword);
router.post("/google-auth",googleAuth);
router.post("/google-authlogin",googleAuthlogin);


module.exports=router;
