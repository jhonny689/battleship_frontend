const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.Port || 5000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

// set static folder public
app.use(express.static(path.join(__dirname, "public")))

// start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

//handle a socket connection request from web client
const connections = [null, null]

//handle a socket connection request from web client
io.on('connection', socket => {
    console.log('New WS Connection:');
    server.getConnections((error, count) => console.log(`count=${count}`))

    //Find an available player number
    let playerIndex = -1;
    for (const i = 0; i < connections.length; i++){
        console.log("i = ", i , " connections[i] = ", connections[i], " my condition is: ", !!!connections[i]);
        if (!!!connections[i]){
            connections[i]=true;
            console.log(connections[i])
            playerIndex = i
            break
        }
    }
        
        // tell the connecting client what player number they are
        socket.emit('player-number', playerIndex)
        
        console.log(`player ${playerIndex} has connected`)
        
        // ignore player 3
        if (playerIndex === -1) return;

        connections[playerIndex] = false;

        // Tell everyone what player number just connected
        socket.broadcast.emit('player-connection', playerIndex);
})