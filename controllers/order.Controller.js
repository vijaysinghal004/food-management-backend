const Order = require("../models/OrderModel");
const Shop = require("../models/shopModel");

exports.placeOrder = async (req, res) => {
    try {
        const { cardItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
        if (!cardItems || cardItems.length == 0) {
         return   res.status(401).json({
                success: false,
                message: "cart is empty"
            })
        }
        if (!deliveryAddress || !deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
           return  res.status(401).json({
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
