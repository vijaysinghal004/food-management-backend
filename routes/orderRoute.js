const express=require("express");
const { placeOrder } = require("../controllers/order.Controller");
const { isAuth } = require("../middlewares/isAuth");
const orderRoute=express.Router();
orderRoute.post("/place-order",isAuth,placeOrder);

module.exports=orderRoute;

