const   express = require('express'),
        app = express(),
        path = require('path'),
        dotenv = require('dotenv').config(),
        fs = require('fs'),
        fetch = require('node-fetch'),
        bodyParser = require('body-parser'),
        sanitizer = require('sanitizer'),
        port = process.env.PORT,
        API_KEY = process.env.API_KEY,
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

// ==========
// Utility Functions
// ==========
rgbGen = () => {
    const r = Math.floor(Math.random() * (100 - 0));
    const g = Math.floor(Math.random() * (100 - 0));
    const b = Math.floor(Math.random() * (150 - 0));
    return newColor = `rgb(${r}, ${g}, ${b})`;
}
sanitizeString = (data) => {
    return sanitizer.sanitize(data);
}
getWeather = async (city) => {
    let rootUrl = `https://api.openweathermap.org/data/2.5/weather?q=`;
    let url = `${rootUrl}${city}&units=metric&appid=${API_KEY}`
    const reqData = await fetch(url).then(data => data.json()).then(body => {return body}).catch(e => {
        console.error(e);
    })
    return reqData;
}

// ====================
// Websockets Listeners
// ====================
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
    // Sanitize username
    const sanitizedUsername = sanitizeString(username);
    if(!sanitizedUsername){
        return console.log(`Bad username`)
    }
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
        // Sanitize text Input
        const sanitizedInput = sanitizeString(data);
        if(!sanitizedInput){
           return console.log(`Bad Input!`)
        }
        if(data.length > 0){
            const formatMSG =`<li style="background-color:${socket.bgColor};" class="msgItem"><b>${socket.username}</b>: ${data}</li>`;
            socket.broadcast.emit('chat message', formatMSG);
            const myMsg =`<li style="background-color:${socket.bgColor};" class="msgItem myMsg"><b>${socket.username}</b>: ${data}</li>`;
            socket.emit('chat message', myMsg);
        }
    });
    socket.on('isTyping', ()=>{
        const msg = `${socket.username} is typing...`;
        socket.broadcast.emit(`isTyping`, msg)
    });
    // Weather report
    socket.on('weather report', (city)=>{
        const addonArr = ['stay cool 💦', 'enjoy the sun 🌞', 'keep warm 🍵'];
        getWeather(city)
        .then((data)=>{
            let msgAddon = '';
            let maxTemp = data.main.temp_max;
            if(maxTemp >= 27){
                msgAddon = addonArr[0];
            } else if(maxTemp <= 26 && maxTemp >= 19){
                msgAddon = addonArr[1];
            } else {
                msgAddon = addonArr[2];
            }
            const msg = 
            `<li class="systemMsg">Hi ${socket.username},
             Weather indicates ${ data.weather[0].main } 
             in ${data.name} with temperatures up to ${data.main.temp_max}° ${msgAddon}</li>`;
            socket.emit('weather report', msg);
        })
    })
    socket.on('getTime', ()=>{
        let currentDate = new Date();
        let currentTime = currentDate.toLocaleTimeString();
        const msg = `<li class="systemMsg">${currentTime} local time</li> `;
        socket.emit('getTime', msg);
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