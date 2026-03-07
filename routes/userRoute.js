const express=require("express");
const { getCurrentUser, updateUserLocation } = require("../controllers/userController");
const { isAuth } = require("../middlewares/isAuth");

const userRoute=express.Router();
userRoute.get("/current", isAuth,getCurrentUser);
userRoute.post("/update-location",isAuth,updateUserLocation )

module.exports=userRoute;   