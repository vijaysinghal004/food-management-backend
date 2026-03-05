const express=require("express");
const { placeOrder, getMyOrders, updateOrdersStatus,  } = require("../controllers/order.Controller");
const { isAuth } = require("../middlewares/isAuth");
const orderRoute=express.Router();
orderRoute.post("/place-order",isAuth,placeOrder);
orderRoute.get("/my-orders",isAuth,getMyOrders);
orderRoute.post("/update-status/:orderId/:shopId",isAuth,updateOrdersStatus);

module.exports=orderRoute;

