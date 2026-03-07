const mongoose = require("mongoose");

const deliveryAsssignmentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    shopOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    brodCastedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    status:{
        type:String,
        enum:["brodcasted","assigned","expired","completed"],
        default:"brodcasted"
    },
    acceptAt:Date
}, { timestamps: true })

const DeliveryAssignment=mongoose.model("DeliveryAssignment",deliveryAsssignmentSchema);
module.exports=DeliveryAssignment;