const express=require("express");
const { addItem, editItem, getItemById, deleteItem, getItemByCity, getItemByShop, searchItems, rating } = require("../controllers/ItemController");
const { upload } = require("../middlewares/multer");
const { isAuth } = require("../middlewares/isAuth");


const itemRoute=express.Router();

itemRoute.post("/add-item",isAuth,upload.single("image") ,addItem);
itemRoute.post("/edit-item/:itemId",isAuth,upload.single("image") ,editItem);
itemRoute.get("/get-item-by-id/:itemId",isAuth,getItemById);
itemRoute.get("/get-item-by-city/:city",isAuth,getItemByCity);
itemRoute.get("/get-item-by-shop/:shopId",isAuth,getItemByShop);
itemRoute.get("/delete/:itemId",isAuth,deleteItem);
itemRoute.post("/rating",isAuth,rating);



module.exports=itemRoute;