const mongoose = require("mongoose");

const shopOrderItemSchema = new mongoose.Schema({
    name:String ,
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    },
    price: Number,
    quantity:Number
}, { timestamps: true })
const shopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subtotal: {
        type: Number
    },
    shopOrderItems: [shopOrderItemSchema]
}, { timestamps: true })

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        required: true
    },
    deliveryAddress: {
        text: String,
        latitude: Number,
        longitude: Number
    },
    totalAmount: {
        type: Number
    },
    shopOrders: [shopOrderSchema]

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;