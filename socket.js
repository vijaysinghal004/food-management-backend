const User = require("./models/userModel");

exports.socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log("hii");
        console.log(socket.id)
        socket.on("identity", async ({ userId }) => {
            try {
                console.log(userId);
                const user = await User.findByIdAndUpdate(userId, {
                    socketId: socket.id,
                    isOnline: true
                },
                { returnDocument: 'after' }
                // { new: true }
            )
                console.log(user)
            console.log("connect")
            } catch (err) {
                console.log("error accure")
                console.log(err.message)
            }
        })
        socket.on("disconnect", async () => {
            try {
                        console.log("disconnect");
                await User.findOneAndUpdate({ socketId: socket.id }, {
                    socketId: null,
                    isOnline: false
                })
            } catch (err) {
                console.log(err.message)
            }


        })
    })
}