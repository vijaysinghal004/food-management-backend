const  bcrypt  = require("bcryptjs");
const User = require("../models/userModel");
const { getToken } = require("../utils/token");

exports.signUp = async (req, res) => {
    try {
        const { fullName, email, password, mobileno, role } = req.body;
        if (!fullName || !email || !password || !mobileno || !role) {
            return res.status(401).json({
                success: false,
                message: "All field are required"
            })
        }
        let user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                success: false,
                message: "user already exist with this email"
            })
        }
        if (password.length < 6) {
            return res.status(401).json({
                success: false,
                message: "password must have more than 6 digit"
            })
        }
        if (mobileno.length < 10) {
            return res.status(401).json({
                success: false,
                message: "mobile no must have at least 10 digit"
            })
        }

        const hashpassword = await bcrypt.hash(password, 10);
        console.log(hashpassword);
        user = await User.create({
            fullName,
            email,
            password: hashpassword,
            mobileno,
            role
        })
        console.log(user);
        const token = await getToken(user._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.status(201).json({
            success: true,
            message: "user created successfully",
            user
        })


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "error in  signup " + err
        })
    }

}

exports.signIn=async(req,res)=>{
      try {
        const { email, password } = req.body;
        if ( !email || !password ) {
            return res.status(401).json({
                success: false,
                message: "All field are required"
            })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "email not found in db"
            })
        }
        const hashpass=user.password;
        const isMatch=await bcrypt.compare(password,hashpass);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: " incorrect password "
            })
        }
        console.log(user);
        const token = await getToken(user._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.status(200).json({
            success: true,
            message: "user login successfully",
            user
        })


    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "error in  signIn " + err
        })
    }
}

exports.signOut=async(req,res)=>{
    try{
    res.clearCookie("token");
    res.status(200).json({
        success:true,
        message:"log out successfully"
    })
    }catch(err){
     res.status(501).json({
        success:false,
        message:"error in logout"
     })
    }
}