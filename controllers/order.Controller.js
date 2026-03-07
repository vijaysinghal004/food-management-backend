const DeliveryAssignment = require("../models/deliveryAssignment.model");
const Order = require("../models/OrderModel");
const Shop = require("../models/shopModel");
const User = require("../models/userModel");


exports.placeOrder = async (req, res) => {
    try {
        const { cardItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
        if (!cardItems || cardItems.length == 0) {
            return res.status(401).json({
                success: false,
                message: "cart is empty"
            })
        }
        if (!deliveryAddress || !deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(401).json({
                success: false,
                message: "send complete delivery Address"
            })
        }
        const groupItemsByShop = {}
        cardItems.forEach(item => {
            const shopId = item.shop
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = []
            }
            groupItemsByShop[shopId].push(item);
        });
        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
            const shop = await Shop.findById(shopId).populate("owner");
            if (!shop) {
                return res.status(401).json({
                    success: false,
                    message: "shop not found"
                })
            }
            const shopItems = groupItemsByShop[shopId]
            const subTotal = shopItems.reduce((sum, i) => sum += Number(i.price * i.quantity), 0)
            return {
                shop: shop._id,
                owner: shop.owner._id,
                subtotal: subTotal,
                shopOrderItems: shopItems.map((i) => ({
                    name: i.name,
                    item: i.id,
                    price: i.price,
                    quantity: i.quantity
                }))
            }
        }))

        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        })

        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
        await newOrder.populate("shopOrders.shop", "name")

        return res.status(201).json({
            success: true,
            message: "order place successfully",
            newOrder
        })
    } catch (err) {
        return res.status(501).json({
            success: false,
            message: "Place Order error " + err
        })
    }
}
// groupItemsByShop={
// shopId1:[item1]
// shopId2:[]
// }

exports.getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role === 'user') {
            const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "name email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")
            return res.status(201).json({
                success: true,
                message: "order get by user successfully",
                orders
            })
        } else if (user.role == 'owner') {
            const orders = await Order.find({ "shopOrders.owner": req.userId }).sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("user")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy", "fullName mobileno")


            const filterOrder = orders.map(order => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                shopOrders: order.shopOrders.filter(o => o.owner == req.userId),
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress
            }
            ))
            // console.log(filterOrder);
            return res.status(201).json({
                success: true,
                message: "order get successfully",
                orders: filterOrder
            })
        }

    } catch (err) {
        res.status(501).json({
            success: false,
            message: "getOrders error accure " + err
        })
    }
}



exports.updateOrdersStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params;
        const { status } = req.body;
        const order = await Order.findById(orderId);
        const shopOrder = order.shopOrders.find(o => o.shop == shopId);
        if (!shopOrder) {
            return res.status(400).json({
                success: false,
                message: "shop order not found"
            })
        }
        shopOrder.status = status;
        let deliveryBoyPayload = [];
        if (status === 'out of delivery' && !shopOrder.assignment) {
            const { longitude, latitude } = order.deliveryAddress;
            const nearByDeliveryBoys = await User.find({
                role: "deliveryBoy",
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [Number(longitude), Number(latitude)],
                        },
                        $maxDistance: 5000

                    }
                }
            })
            console.log(nearByDeliveryBoys)
            const nearByIds = nearByDeliveryBoys.map(b => b._id);
            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: { $nin: ["brodcasted", "completed"] }
            }).distinct("assignedTo")


            const busyIdSet = new Set(busyIds.map(id => String(id)))

            const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)));
            const candidates = availableBoys.map(b => b._id)

            if (candidates.length == 0) {
                await order.save();
                return res.json({
                    success: false,
                    message: "order status updated but there is no available delivery boys "
                })
            }


            const deliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                brodCastedTo: candidates,
                status: "brodcasted",

            })


            shopOrder.assignment = deliveryAssignment._id
            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo
            deliveryBoyPayload = availableBoys.map(b => ({
                id: b._id,
                fullName: b.fullName,
                longitude: b.location.coordinates?.[0],
                latitude: b.location.coordinates?.[1],
                mobileno: b.mobileno
            }))


        }


        // await shopOrder.save();
        await order.save();
        const updatedShopOrder = order.shopOrders.find(o => o.shop == shopId)
        await order.populate("shopOrders.shop", "name ")
        await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobileno")


        res.status(200).json({
            success: true,
            message: "order place successfully",
            shopOrderStatus: status,
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
            availableBoys: deliveryBoyPayload,
            assignment: updatedShopOrder?.assignment._id
        })
    } catch (err) {
        res.status(501).json({
            success: false,
            message: "updateOrdersStatus error accure " + err
        })
    }
}

exports.getDeliveryBoyAssignment = async (req, res) => {
    try {
        const deliveryBoyId = req.userId
        const assignment = await DeliveryAssignment.find({
            brodCastedTo: deliveryBoyId,
            status: "brodcasted"
        }).populate("order")
            .populate("shop")

        // console.log(assignment);
        // console.log(assignment[0].order.shopOrders);
        const formated = assignment.map(a => ({
            assignmentId: a._id,
            orderId: a.order._id,
            shopName: a.shop.name,
            deliveryAddress: a.order.deliveryAddress,
            // items:a.order.shopOrders.find(so=>so._id==a.shopOrderId).shopOrderItems || [],
            // subTotal:a.order.shopOrders.find(so=>so._id==a.shopOrderId)?.subtotal || [],
            items: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId)).shopOrderItems || [],
            subTotal: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId))?.subtotal || [],
        }))

        return res.status(201).json({
            // success: true,
            formated
        })
    } catch (err) {
        res.status(501).json({
            success: false,
            message: "getDeliveryBoyAssignment error accure " + err
        })
    }
}

exports.acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params
        console.log(assignmentId);
        console.log("sjsdkjnsnfkj");
        const assignment = await DeliveryAssignment.findById(assignmentId);
        if (!assignment) {
            return res.status(400).json({
                success: false,
                message: "assignment not found"
            })
        }
        if (assignment.status !== "brodcasted") {
            return res.status(400).json({
                success: false,
                message: "assignment not expired"
            })
        }
        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: { $nin: ["brodcasted", "completed"] }
        })
        if (alreadyAssigned) {
            return res.status(400).json({
                success: false,
                message: "You are already Assigned to another order"
            })
        }
        assignment.assignedTo = req.userId
        assignment.status = 'assigned'
        assignment.acceptAt = new Date()
        await assignment.save()

        const order = await Order.findById(assignment.order)
        if (!order) {
            return res.status(400).json({
                success: false,
                message: "Order not found"
            })
        }

        const shopOrder = order.shopOrders.find(so => so._id.equals(assignment.shopOrderId))
        shopOrder.assignedDeliveryBoy = req.userId

        await order.save();
        await order.populate("shopOrders.assignedDeliveryBoy")

        return res.status(201).json({
            success: true,
            message: "order accepted"
        })
    } catch (err) {
        res.status(501).json({
            success: false,
            message: "acceptOrder error accure " + err
        })
    }
}



exports.getCurrentOrder = async (req, res) => {
    try {
        console.log(req.userId);
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: "assigned"
        })
        .populate("shop", "name")
            .populate("assignedTo", "fullName email mobileno location")
            .populate({
                path: "order",
                populate: [
                    {
                        path: "user",
                        select: "fullName email location mobileno"
                    },
                    {
  path:"shopOrders.shop",
  select:"name"
                    }
                ]
            })
            console.log(assignment)
        if (!assignment) {
            return res.status(400).json({
                success: false,
                message: "assignment not found"
            })
        }
        if (!assignment.order) {
            return res.status(400).json({
                success: false,
                message: "order not found"
            })
        }
        const shopOrder = assignment.order.shopOrders.find(so => so._id.equals(assignment.shopOrderId))
        if (!shopOrder) {
            return res.status(400).json({
                success: false,
                message: "shopOrder not found"
            })
        }
// await assignment.order.populate("shopOrders.shop", "name")  
      let deliveryBoyLocation = { lat: null, lon: null }
        if (assignment?.assignedTo?.location?.coordinates.length == 2) {
            deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1]
            deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0]
        }
        let customerLocation = { lat: null, lon: null }
        if (assignment?.order?.deliveryAddress) {
            customerLocation.lat = assignment.order.deliveryAddress.latitude
            customerLocation.lon = assignment.order.deliveryAddress.longitude
        }
return res.status(200).json({
    _id:assignment.order._id,
    user:assignment.order.user,
    shopOrder,
    deliveryAddress:assignment.order.deliveryAddress,
    deliveryBoyLocation,
    customerLocation
})

    } catch (err) {
        res.status(501).json({
            success: false,
            message: "getCurrentOrder error accure " + err
        })
    }
}
