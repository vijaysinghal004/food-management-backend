const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const { getToken } = require("../utils/token");
const { sendOtpMail } = require("../utils/mail");

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

exports.googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobileno,password , role } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            const hashpassword=await bcrypt.hash(password,10);
            user = await User.create({ email, fullName,password:hashpassword, mobileno,role })
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

        }else{
            return res.status(201).json({
                success:true,
                message:"user exist ",
              user
            })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "ggogle auth in  signup " + err
        })
    }
}

exports.signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
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
        const hashpass = user.password;
        const isMatch = await bcrypt.compare(password, hashpass);
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

exports.signOut = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({
            success: true,
            message: "log out successfully"
        })
    } catch (err) {
        res.status(501).json({
            success: false,
            message: "error in logout"
        })
    }
}


exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "user does not exist"
            })
        }
        let otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resendOtp = otp;
        user.OtpExpires = Date.now() + 5 * 60 * 1000;
        User.isOtpVerified = false;
        await user.save();
        await sendOtpMail(email, otp);
        return res.status(200).json({
            success: true,
            message: "otp send successfully"
        })
    } catch (err) {
        return res.status(501).json({
            success: false,
            message: `send otp error ${err}`
        })
    }
}

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.resendOtp != otp || user.OtpExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "invalid or expire otp"
            })
        }
        user.isOtpVerified = true,
            user.resendOtp = undefined
        user.OtpExpires = undefined
        await user.save();
        return res.status(200).json({
            success: true,
            message: "otp verify successfully"
        })
    } catch (err) {
        return res.status(501).json({
            success: false,
            message: err.message
        })
    }

}


exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "user does not exist "
            })
        }

        if (!user.isOtpVerified) {
            return res.status(400).json({
                success: false,
                message: "otp verification required"
            })
        }
        if (!confirmPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "both password field are required"
            })
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "both password are not match"
            })
        }
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        user.isOtpVerified = false;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err
        })
    }
}