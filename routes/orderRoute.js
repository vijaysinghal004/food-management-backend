const express=require("express");
const { placeOrder, getMyOrders, updateOrdersStatus, getDeliveryBoyAssignment, acceptOrder, getCurrentOrder,  } = require("../controllers/order.Controller");
const { isAuth } = require("../middlewares/isAuth");
const orderRoute=express.Router();
orderRoute.post("/place-order",isAuth,placeOrder);
orderRoute.get("/my-orders",isAuth,getMyOrders);
orderRoute.get("/get-assignments",isAuth,getDeliveryBoyAssignment);
orderRoute.get("/get-current-order",isAuth,getCurrentOrder);
orderRoute.get("/accept-order/:assignmentId",isAuth,acceptOrder);
orderRoute.post("/update-status/:orderId/:shopId",isAuth,updateOrdersStatus);

module.exports=orderRoute;

