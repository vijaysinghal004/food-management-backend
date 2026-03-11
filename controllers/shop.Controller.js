// const Shop = require("../models/shopModel");
// const uploadOnCloudinary = require("../utils/Cloudinary");

// exports.createShop = async (req, res) => {
//     try {
//         const { name, city, state, address } = req.body;
//         let image;
//         if (req.file) {
//             image = await uploadOnCloudinary(req.file.path);
//         }
//         const shop = await Shop.create({
//             name, city, state, address, image, owner: req.userId
//         })
//         await shop.populate("owner")
//         return res.status(201).json({
//             success: true,
//             message: "shop created",
//             shop
//         })
//     } catch (err) {
//         return res.status(500).json({
//             success: false,
//             message: `create shop error ${err}`
//         })
//     }
// }

const Shop = require("../models/shopModel");
const uploadOnCloudinary = require("../utils/Cloudinary");

exports.createEditShop = async (req, res) => {
    try {
        const { name, city, state, address } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        let shop=await Shop.findOne({owner:req.userId});
        if(!shop){
         shop = await Shop.create({
            name, city, state, address, image, owner: req.userId
        })
    }else{
         shop = await Shop.findByIdAndUpdate(shop._id,{
            name, city, state, address, image, owner: req.userId
        },
        {new:true}
        //   { returnDocument: "after" }

    )
    }
        await shop.populate("owner")
        await shop.populate({
               path:"items",
            options:{sort:{updatedAt:-1}}
        })
        return res.status(201).json({
            success: true,
            message: "shop created",
            shop
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `create shop error ${err}`
        })
    }
}


exports.getMyShop=async(req,res)=>{
    try{
        // console.log(userId);
        // console.log("hello")
    const shop= await Shop.findOne({owner:req.userId})
       if(!shop){
        return res.status(400).json({
            success:false,
            shop:null
        });
    }

    await shop.populate("owner")
    await shop.populate({
           path:"items",
            options:{sort:{updatedAt:-1}}
    })
 

    return res.status(201).json({
        success:true,
        message:"shop found successfully",
        shop
    })
    }catch(err){
        console.log(err);
        res.status(501).json({
            success:false,
            message:"shop found error "+err
        })
    }
}

exports.getShopByCity=async(req,res)=>{
    try{
  const {city}=req.params;
  const shops=await Shop.find({
    city:{$regex:new RegExp(`^${city}$`,"i")}
  }).populate("items");
if(!shops ||shops.length==0){
    return res.status(404).json({
        success:false,
        message:"No shopfound in your city"
    })
}
return res.status(201).json({
    success:true,
    message:`shop found in ${city}`,
    shops
})
    }catch(err){
     res.status(501).json({
            success:false,
            message:" get shop by city error "+err
        })
    }
}