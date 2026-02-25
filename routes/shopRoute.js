const express=require("express");
const { createEditShop, getMyShop, getShopByCity } = require("../controllers/shop.Controller");
const { upload } = require("../middlewares/multer");
const { isAuth } = require("../middlewares/isAuth");


const shopRoute=express.Router();

shopRoute.post("/create-edit",isAuth,upload.single("image"),createEditShop);
shopRoute.get("/get-myShop",isAuth,getMyShop);
shopRoute.get("/get-by-city/:city",isAuth,getShopByCity);

module.exports=shopRoute;