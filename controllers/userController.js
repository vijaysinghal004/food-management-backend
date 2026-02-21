const User = require("../models/userModel");

exports.getCurrentUser=async(req,res)=>{
    try{
   const userId=req.userId;
   if(!userId){
    return res.status(400).json({
        success:false,
        message:"userId is not found"
    })
}
    const user=await User.findById(userId);
   if(!user){
    return res.status(400).json({
        success:false,
        message:"user is not found"
    })
}
return res.status(200).json({
    success:true,
    message:"user found",
    user
})
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"get current user error "+err
        })
        }
}