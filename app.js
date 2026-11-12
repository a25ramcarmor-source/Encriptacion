const express = require('express');
const app = express();
const fs = require('fs');
const port = 3000;
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
const http = require('http');
const {Server} = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);
const ususarios = new Map();
io.on('connection', (socket) =>{
    console.log('Usuari connectat:', socket.id);
     const username = socket.handshake.auth.username;
    usuarios.set(socket.id, username);
    actualizarUsuarios();


    socket.on('disconnect', ()=>{
        console.log('usuari desconectat: ', socket.id);
    }
    )
});


server.listen(port, console.log('Aplicacio escoltatant a http://localhost:', port));