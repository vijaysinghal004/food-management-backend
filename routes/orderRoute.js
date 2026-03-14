const express = require("express");
const { placeOrder, getMyOrders, updateOrdersStatus, getDeliveryBoyAssignment, acceptOrder, getCurrentOrder, getOrderById, sendDeliveryOtp, verifyDeliverydOtp, verifyPayment, getTodayDeliveries, } = require("../controllers/order.Controller");
const { isAuth } = require("../middlewares/isAuth");
const orderRoute = express.Router();
orderRoute.post("/place-order", isAuth, placeOrder);
orderRoute.get("/my-orders", isAuth, getMyOrders);
orderRoute.post("/verify-payment", isAuth, verifyPayment);
orderRoute.get("/get-assignments", isAuth, getDeliveryBoyAssignment);
orderRoute.get("/get-current-order",isAuth,getCurrentOrder)
orderRoute.post("/send-delivery-otp", isAuth, sendDeliveryOtp);
orderRoute.post("/verify-delivery-otp", isAuth, verifyDeliverydOtp);

orderRoute.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRoute.post("/update-status/:orderId/:shopId", isAuth, updateOrdersStatus);
orderRoute.get("/get-order-by-id/:orderId", isAuth, getOrderById);
orderRoute.get("/get-today-deliveries", isAuth, getTodayDeliveries);

module.exports = orderRoute;


