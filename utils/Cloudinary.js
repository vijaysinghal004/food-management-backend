const cloudinary = require('cloudinary').v2;
require("dotenv").config();
const fs=require("fs");

const uploadOnCloudinary=async (file)=>{


cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});
try{
   const result=await cloudinary.uploader.upload(file);
   await fs.unlinkSync(file)
   return result.secure_url
}catch(err){
   fs.unlinkSync(file);
   console.log(err);
}
}

module.exports=uploadOnCloudinary;