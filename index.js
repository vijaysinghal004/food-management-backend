const express=require("express");
const connnectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const app=express();
require("dotenv").config();
const authrouter=require("./routes/authRoute")
const cors=require("cors");

connnectDB();
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authrouter);
app.get("/",(req,res)=>{
    res.send("hello from server");
})
app.listen(process.env.PORT,()=>{
    console.log("server is running at port no 8080");
})