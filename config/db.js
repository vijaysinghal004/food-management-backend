const mongoose=require("mongoose");
require("dotenv").config();

const connnectDB= async ()=>{
    try{
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✓ MongoDB connected successfully");
    }catch(err){
        console.log("❌ MongoDB Connection Error:", err.message);
        console.log("MongoDB URL:", process.env.MONGO_URL);
    }
}
module.exports=connnectDB;
