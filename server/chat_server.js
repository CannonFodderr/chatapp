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
        socket.roomsArr = [];
        socket.currentRoom = 'Public';
        updateRoomsList(socket);
        socket.on('set username', (username)=>{
        // Sanitize username
        const sanitizedUsername = utils.sanitizeString(username);
        if(!sanitizedUsername){
            return console.log(`Bad username`);
        }
        const badUsername = users.find(user => user.username.toLowerCase() == username.toLowerCase());
        if(badUsername){
            const msg = {
                content: `Invalid or exsisting username`
            };
            return socket.emit(`username err`, msg);
        } else {
            const msg = {
                author: `System`,
                username: username,
                dest: 'Public',
                content: `<li class="systemMsg"><b>${username}</b> joined</li>`
            }
            const userColor = utils.rgbGen()
            socket.username = username;
            socket.bgColor = userColor;
            socket.join('Public');
            socket.roomsArr = [{
                id: 'Public',
                name: 'Public',
                privacy: `Public`,
                owner: {
                    username: 'Public'
                },
                guest: {
                    username: 'Public'
                }
            }];
            const newUser = {
                id: socket.id,
                username: socket.username
            };
            users.push(newUser);
            usersCount ++;
            socket.currentRoom = `Public`;
            updateUserslist();
            updateRoomsList(socket);
            io.emit(`update usersCount`, usersCount);
            return socket.emit(`username set`, msg);
        }
        });
        // Chat messages
        socket.on('chat message', (data)=>{
            // Sanitize text Input
            const sanitizedInput = utils.sanitizeString(data.content); 
            if(!sanitizedInput){
            const msg = {
                authorID: `System`,
                dest: data.dest,
                content: '<li class="danger">Hi scripter! Please play nice :) </li>'
            }
            socket.emit('chat message', msg);
            return console.log(`Bad Input!`)
            }
            if(data.content.length > 0){
                let checkedContent = utils.checkContentType(data);
                const timestamp = utils.getTimeStamp();
                const formatMSG ={ 
                    authorID: socket.id,
                    dest: data.dest,
                    content:    `<li style="background-color:${socket.bgColor};" class="msgItem">
                                <b>${socket.username}</b>: ${checkedContent}
                                <br><label>${timestamp}</label></li>`};
                socket.to(data.dest).emit('chat message', formatMSG);
                const myMsg = { 
                    authorID: socket.id,
                    dest: data.dest,
                    content:    `<li style="background-color:${socket.bgColor};" class="msgItem myMsg">
                                <b>${socket.username}</b>: ${checkedContent}
                                <br><label>${timestamp}</label></li>`};
                socket.emit('chat message', myMsg);
            }
        });
        socket.on('msg exceeds', ()=>{
            const msg = {
                authorID: `System`,
                content: '<li class="systemMsg"> Your message is waaaay to long, keep it short ♥</li>'
            };
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
        socket.on('new private room', (roomData)=>{
            const currentRooms = socket.roomsArr;
            let alreadyOpen = false;
            let roomVar = `${roomData.guest.id}&${roomData.owner.id}`;
            // If it already open
            currentRooms.filter((room)=>{
                if(roomData.id == room.id || roomVar == room.id) {
                    socket.emit('room selector', room);
                    return alreadyOpen = true;
                }
            });
            // open if its not me or already open
            if(!alreadyOpen && roomData.guest.id !== socket.id) {
                socket.join(roomData.id);
                roomData.name = 'Private'
                let newRoom = roomData;
                socket.roomsArr.push(roomData);
                socket.to(roomData.guest.id).emit('Invite', roomData);
                updateRoomsList(socket);
            }
        });
        socket.on(`accept`, (roomData)=>{
            socket.join(roomData.id);
            socket.roomsArr.push(roomData);
            socket.currentRoom = roomData.id;
            updateRoomsList(socket);
            socket.to(roomData.id).emit('accept', roomData);
        });
        socket.on('reject', (data)=>{
            socket.to(data.owner.id).emit('reject', data);
        })
        socket.on('leave room', (roomID)=>{
            console.log(`leaving: ${roomID}`);
            const currentRooms = socket.roomsArr;
            socket.currentRoom = socket.roomsArr[0];
            socket.leave(roomID);
            const newRooms = currentRooms.filter((room)=>{
                return room.id !== roomID;
            });
            socket.emit('room selector', currentRooms[0]);
            socket.roomsArr = newRooms;
            socket.currentRoom = socket.roomsArr[0].id;
            updateRoomsList(socket);
        });
        // Change Rooms
        socket.on('change room', (room)=>{
            socket.currentRoom = room;
            updateRoomsList(socket);
        });
        socket.on('disconnect', ()=>{
            users.filter((user) => {
                if(user.id == socket.id){
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
            data.push(user);
        });
        io.emit('update usersList', data);
    }

    updateRoomsList = (socket) => {
        let data = {
            currentRoom: socket.currentRoom,
            rooms: socket.roomsArr
        };
        socket.emit('update roomsList', data);
    }
}


module.exports = chatListeners;