const express=require("express");
const { addItem, editItem, getItemById, deleteItem } = require("../controllers/ItemController");
const { upload } = require("../middlewares/multer");
const { isAuth } = require("../middlewares/isAuth");


const itemRoute=express.Router();

itemRoute.post("/add-item",isAuth,upload.single("image") ,addItem);
itemRoute.post("/edit-item/:itemId",isAuth,upload.single("image") ,editItem);
itemRoute.get("/get-item-by-id/:itemId",isAuth,getItemById);
itemRoute.get("/delete/:itemId",isAuth,deleteItem);

module.exports=itemRoute;