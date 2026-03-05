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
        shopOrder.status = status
        await shopOrder.save();
        await order.save();
        // await shopOrder.populate("shopOrderItems.item", "name image price")
        res.status(200).json({
            success: true,
            message: "order place successfully",
            shopOrderStatus: shopOrder.status
        })
    } catch (err) {
        res.status(501).json({
            success: false,
            message: "updateOrdersStatus error accure " + err
        })
    }
}

