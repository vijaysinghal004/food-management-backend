const jwt = require("jsonwebtoken")
require("dotenv").config();

exports.isAuth=async(req,res,next)=>{
    try{
   const token=req.cookies.token
   if(!token){
    return res.status(400).json({
        success:false,
        message:"token not found in cookie"
    })
   }
   const decoded=await jwt.verify(token,process.env.JWT_SECRET);
   if(!decoded){
    return res.status(400).json({
        success:true,
        message:"token not verify"
    })
   }
   console.log(decoded)
   req.userId=decoded.userId;
   next();
    }catch(err){
      return res.status(500).json({
        success:false,
        message:"isAuth error"
      })
    }
}