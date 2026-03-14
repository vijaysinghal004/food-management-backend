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
        }),
            socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
                try {
                    const user = await User.findByIdAndUpdate(userId, {
                        location: {
                            type: 'Point',
                            coordinates: [longitude, latitude],
                        },
                        isOnline: true,
                        socketId: socket.id
                    })
                    if (user) {
                        io.emit('updateDeliveryLocation', {
                            deliveryBoyId: userId,
                            latitude, longitude
                        })
                    }
                } catch (err) {
                    console.log("update delivery location error",err.message)
                    return
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