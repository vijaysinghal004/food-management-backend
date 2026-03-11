const Item = require("../models/itemModel");
const Shop = require("../models/shopModel");
const uploadOnCloudinary = require("../utils/Cloudinary");

exports.addItem = async (req, res) => {
    try {
        const { name, category, foodType, price } = req.body;
        let image;
        if (req.file) {
            const path = req.file.path;
            image = await uploadOnCloudinary(path)
        }
        const shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(400).json({
                success: false,
                message: "shop not found"
            })
        }
        const item = await Item.create({
            name, category, foodType, price, image, shop: shop._id
        })
        shop.items.push(item._id);
        await shop.save();
        await shop.populate([
            { path: "owner" },
            { path: "items", options: { sort: { updatedAt: -1 } } }
        ]);

        return res.status(201).json({
            success: true,
            message: "item is add in shop",
            shop
        })
    } catch (err) {
        return res.status(501).json({
            success: false,
            message: "add item error " + err
        })
    }
}


exports.editItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { name, category, foodType, price } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        const item = await Item.findByIdAndUpdate(itemId,
            { name, category, foodType, price, image },
            { new: true }
            //   { returnDocument: "after" }
            
        )
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "item not found"
            })
        }
        const shop = await Shop.findOne({ owner: req.userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })

        res.status(200).json({
            success: true,
            message: "item updated successfully",
            shop
        })
    }
    catch (err) {
        return res.status(501).json({
            success: false,
            message: "edit item error " + err.message
        })
    }
}

exports.getItemById = async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(400).json({
                success: false,
                message: "item not found .Create Item first"
            })
        }
        return res.status(200).json({
            success: true,
            message: "item found successfully",
            item
        })

    } catch (err) {
        return res.status(501).json({
            success: false,
            message: "item found err" + err
        })
    }
}

exports.deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findByIdAndDelete(itemId);
        if (!item) {
            return res.status(400).json({
                success: false,
                message: "item not found"
            })
        }
        let shop = await Shop.findOne({ owner: req.userId })
        shop.items = shop.items.filter(i => i._id !== itemId)
        await shop.save();
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(201).json({
            success: true,
            message: "item deleted",
            shop
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "delete item error" + err.message
        })
    }
}

exports.getItemByCity = async (req, res) => {
    try {
        const { city } = req.params;
        if (!city) {
            return res.status(404).json({
                success: false,
                message: "city is required"
            })
        }

        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        })
        if (!shops || shops.length == 0) {
            return res.status(404).json({
                success: false,
                message: "No shopfound in your city"
            })
        }
        const shopId = shops.map((shop) => shop._id);

        const items = await Item.find({ shop: { $in: shopId } });
        return res.status(200).json({
            success: true,
            message: `item found in ${city}`,
            items
        })
    } catch (err) {
        res.status(501).json({
            success: false,
            message: " get item by city error " + err
        })
    }
}



exports.getItemByShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        const shop = await Shop.findById(shopId).populate("items")
        if (!shop) {
            return res.status(400).json({
                success: false,
                message: "shop not found"
            })
        }
        return res.status(201).json({
            shop, items: shop.items
        })
    } catch (err) {
        res.status(501).json({
            success: false,
            message: "get item by shop error " + err.message
        })
    }
}

exports.searchItems = async (req, res) => {
    try {

        const { query, city } = req.query
        if (!query || !city) {
            return res.status(401).json({
                success: false,
                message: "Query and city are required"
            })
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
            // city: { $regex: city, $options: "i" }
        }).populate("items");
        if (!shops || shops.length == 0) {
            return res.status(404).json({
                success: false,
                message: "shops not found"
            })
        }
        const shopIds = shops.map(s => s._id)
        const items = await Item.find({
            shop: { $in: shopIds },
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ]
        }).populate("shop", "name image")

        return res.status(200).json({
            suceees:true,
            items
        });

    } catch (err) {
        return res.status(501).json({
            success: false,
            message: "searchItems error" + err.message
        })
    }
}