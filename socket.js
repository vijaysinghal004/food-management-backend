const User = require("./models/userModel");

exports.socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log("hii");
        console.log(socket.id)
        socket.on("identity", async ({ userId }) => {
            try {
                const user = await User.findByIdAndUpdate(userId, {
                    socketId: socket.id,
                    isOnline: true
                }, { new: true })
            } catch (err) {
                console.log(err.message)
            }
        })
        socket.on("disconnect",async()=>{
try{
  await User.findOneAndUpdate({socketId:socket.id},{
                socketId:null,
                isOnline:false
            })
}catch(err){
console.log(err.message)
}

          
        })
    })
}