const express=require("express");
const { getCurrentUser } = require("../controllers/userController");
const { isAuth } = require("../middlewares/isAuth");

const userRoute=express.Router();
userRoute.get("/current", isAuth,getCurrentUser);

module.exports=userRoute;   