const express=require("express");
const { signUp, signIn, signOut } = require("../controllers/authController");

const router=express.Router();

router.post("/signUp",signUp);
router.post("/signIn",signIn);
router.post("/logout",signOut);

module.exports=router;
