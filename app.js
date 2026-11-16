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
const  usuarios = new Map();
const clausPubliques = new Map();
io.on('connection', (socket) =>{
    console.log('Usuari connectat:', socket.id);
     const username = socket.handshake.auth.username;
    usuarios.set(socket.id, username);

    socket.on('clave', (datos)=> {
        const usuario = {
            id: socket.id,
            nom: datos.nom,
            publicKey: datos.PublicKey
        };


        clausPubliques.set(datos.PublicKey,datos.nom);
        
        socket.broadcast.emit('clave',datos);
    });
    socket.on('mensaje_cifrado', (datos) => {
    // Reenvía el objeto { username, mensaje } a los demás navegadores
    socket.broadcast.emit('mensaje_cifrado', datos);
});


    socket.on('disconnect', ()=>{
        clausPubliques.delete(socket.id);
        usuarios.delete(socket.id);
        console.log('usuari desconectat: ', socket.id);
    }
    )
});


server.listen(port, console.log('Aplicacio escoltatant a http://localhost:', port));