const nodemailer=require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   // port: 465,
//   // secure: true, // Use true for port 465, false for port 587
//   port:587,
//   secure:false,
//     family: 4,
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.PASS,
//   },
//   connectionTimeout: 10000,
// greetingTimeout: 10000
   service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

exports.sendOtpMail=async(to,otp)=>{
    await transporter.sendMail({
        from:process.env.EMAIL,
        to,
        subject:"Reset your Password",
        html:`<p>Your otp for password reset is <b>${otp}</b>.It is expires in 5 minutes. </p>`
    })
}

exports.sendDeliveryOtpMail=async(user,otp)=>{
    await transporter.sendMail({
        from:process.env.EMAIL,
       to: user.email,
        subject:"Delivery OTP",
        html:`<p>Your otp for delivery is <b>${otp}</b>.It is expires in 5 minutes. </p>`
    })
}
