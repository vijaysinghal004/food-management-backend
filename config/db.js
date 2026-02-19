const mongoose=require("mongoose");
require("dotenv").config();

const connnectDB= async ()=>{
    try{
    await mongoose.connect(process.env.MONGO_URL);
    console.log("mongodb conneted");
    }catch(err){
        console.log(err.message);
    }
}
module.exports=connnectDB;
