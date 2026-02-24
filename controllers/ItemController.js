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
            { new: true })
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
