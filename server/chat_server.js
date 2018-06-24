const utils = require('../utilities/functions');
// IO CONFIG


const users = [];
let usersCount = 0;
chatListeners = (io) => {
    io.on('connection', (socket)=>{
        console.log(`User connected`);
        io.emit(`update usersCount`, usersCount); 
        updateUserslist();
        // Add public room
        socket.rooms = [];
        socket.currentRoom = 'Public';
        updateRoomsList(socket);
        socket.on('set username', (username)=>{
        // Sanitize username
        const sanitizedUsername = utils.sanitizeString(username);
        if(!sanitizedUsername){
            return console.log(`Bad username`);
        }
        const badUsername = users.find(user => user.username == username);
        if(badUsername){
            const msg = `<li class="danger">Invalid or exsisting username </li>`;
            return socket.emit(`chat message`, msg);
        } else {
            const msg = {
                author: `System`,
                content: `<li class="systemMsg"><b>${username}</b> joined</li>`
            }
            const userColor = utils.rgbGen()
            socket.username = username;
            socket.bgColor = userColor;
            socket.rooms = ['Public'];
            const newUser = {
                id: socket.id,
                username: socket.username
            }
            users.push(newUser);
            usersCount ++;
            updateUserslist();
            updateRoomsList(socket);
            io.emit(`update usersCount`, usersCount);
            return socket.emit(`username set`, msg);
        }
        });
        // Chat messages
        socket.on('chat message', (data)=>{
            // Sanitize text Input
            const sanitizedInput = utils.sanitizeString(data);
            if(!sanitizedInput){
            const msg = '<li class="danger">Hi scripter! Please play nice :) </li>'
            socket.emit('chat message', msg);
            return console.log(`Bad Input!`)
            }
            if(data.length > 0){
                const timestamp = utils.getTimeStamp();
                const formatMSG =`<li style="background-color:${socket.bgColor};" class="msgItem">
                <b>${socket.username}</b>: ${data}
                <br><label>${timestamp}</label></li>`;
                socket.broadcast.emit('chat message', formatMSG);
                const myMsg =`<li style="background-color:${socket.bgColor};" class="msgItem myMsg">
                <b>${socket.username}</b>: ${data}
                <br><label>${timestamp}</label></li>`;
                socket.emit('chat message', myMsg);
            }
        });
        socket.on('msg exceeds', ()=>{
            const msg = '<li class="systemMsg"> Your message is waaaay to long, keep it short ♥</li>';
            socket.emit('chat message', msg);
        });
        socket.on('isTyping', ()=>{
            const msg = `${socket.username} is typing...`;
            socket.broadcast.emit(`isTyping`, msg)
        });
        // Weather report
        socket.on('weather report', (city)=>{
            const addonArr = ['stay cool 💦', 'enjoy the sun 🌞', 'keep warm 🍵'];
            utils.getWeather(city)
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
        });
        socket.on('new private room', (user)=>{
            const currentRooms = socket.rooms;
            let alreadyOpen = false;
            currentRooms.find((room)=>{
                if(user == room){
                    return alreadyOpen = true;
                } 
            })
            if(!alreadyOpen && socket.username !== user){
                socket.rooms.push(user);
                updateRoomsList(socket);
            }
        });
        socket.on('leave room', (tabName)=>{
            const currentRooms = socket.rooms;
            const newRooms = currentRooms.filter((room)=>{
                return room !== tabName;
            })
            socket.rooms = newRooms;
            updateRoomsList(socket);
        });
        socket.on('disconnect', ()=>{
            users.filter((user) => {
                if(user.id == socket.id){
                    console.log(`Removeing ${user.username} from users array `);
                    users.splice(user, 1);
                    usersCount --;
                    updateUserslist();
                    const msg = {
                        author: `System`,
                        content: `<li class="systemMsg"><b>${user.username}</b> left</li>`
                    }
                    io.emit('username set', msg);
                    io.emit(`update usersCount`, usersCount); 
                }
            })
            console.log(`User disconnected`);
        });
    });
    updateUserslist = () => {
        let data = [];
        users.forEach((user)=>{
            data.push(user.username);
        });
        io.emit('update usersList', data);
    }

    updateRoomsList = (socket) => {
        let data = [];
        const roomsList = socket.rooms;
        roomsList.forEach((room)=>{
            data.push(room)
        })
        socket.emit('update roomsList', data);
    }
}


module.exports = chatListeners;