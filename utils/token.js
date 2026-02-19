const jwt=require("jsonwebtoken");
require("dotenv").config();

exports.getToken=async(userId)=>{
    try{
     const token=await jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:'7d'})
     return token;
    }catch(err){
      console.log(err);
    }
}