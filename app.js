const   express = require('express'),
        app = express(),
        path = require('path'),
        fs = require('fs'),
        bodyParser = require('body-parser'),
        port = process.env.PORT || 3000,
        server = app.listen(port, ()=> console.log(`Server is running on port ${port}`)),
        io = require('socket.io')(server);

const indexRoutes = require('./routes/index');
// APP CONFIG
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/public')));
app.use(bodyParser.urlencoded({extended: true}));



// IO CONFIG

let usersCount = 0;
const users = [];

// Utility Functions

rgbGen = () => {
    const r = Math.floor(Math.random() * (100 - 0));
    const g = Math.floor(Math.random() * (100 - 0));
    const b = Math.floor(Math.random() * (150 - 0));
    return newColor = `rgb(${r}, ${g}, ${b})`;
}

io.on('connection', (socket)=>{
    console.log(`User connected`);
    usersCount ++;
    const newUser = {
        id: socket.id,
        username: `Stranger${users.length}`
    }
    io.emit(`update usersCount`, usersCount);
    users.push(newUser);
    updateUserslist();
    socket.on('disconnect', ()=>{
        usersCount--;
        users.filter((user) => {
            if(user.id == socket.id){
                console.log(`Removeing user from array ${user.username}`);
                users.splice(user, 1);
                io.emit(`update usersCount`, usersCount); 
            }
        })
        updateUserslist();
        console.log(`User disconnected`);
    });
    socket.on('choose username', (username)=>{
    const badUsername = users.find(user => user.username == username);
    if(badUsername){
        const msg = `<li class="danger">Invalid or exsisting username </li>`;
        return socket.emit(`chat message`, msg);
    } else {
        users.filter((user)=>{
            if(user.id == socket.id){
                const msg = {
                    author: `System`,
                    content: `<li class="systemMsg"><b>${username}</b> joined chat</li>`
                }
                const userColor = rgbGen()
                socket.username = username;
                socket.bgColor = userColor;
                user.username = username;
                console.log(socket.color);
                return socket.emit(`username set`, msg);
            }
        })
    }
    updateUserslist();
    });
    socket.on('chat message', (data)=>{
        if(data.length > 0){
            const formatMSG =`<li style="background-color:${socket.bgColor};" class="msgItem"><b>${socket.username}</b>: ${data}</li>`;
            io.emit('chat message', formatMSG);
        }
    });
    socket.on('isTying', ()=>{
        const msg = `${socket.username} is typing...`;
        socket.broadcast.emit(`isTyping`, msg)
    })
});

updateUserslist = () => {
    let data = [];
    users.forEach((user)=>{
        data.push(user.username);
    });
    io.emit('update usersList', data);
}

app.use(indexRoutes);