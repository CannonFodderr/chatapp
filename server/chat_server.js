const utils = require('../utilities/functions');
let publicRooms = [];
const newPublic = {
    id: 'Public',
    name: 'Public',
    privacy: `Public`,
    owner: {
        id: 'Public',
        username: 'Public'
    },
    guest: {
        id:'Public',
        username: 'Public'
    }
}
publicRooms.push(newPublic);
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
        socket.roomsArr.push(publicRooms[0]);
        socket.currentRoom = 'Public';
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
            const newUser = {
                id: socket.id,
                username: socket.username
            };
            users.push(newUser);
            usersCount ++;
            socket.join('Public')
            socket.currentRoom = `Public`;
            updateUserslist();
            updateRoomsList(socket);
            io.emit(`update usersCount`, usersCount);
            return socket.emit(`username set`, msg);
        }
        });
        // Chat messages
        socket.on('chat message', (data)=>{
            const msgDate = data.date.date;
            const msgTime = data.date.time;
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
                const formatMSG ={ 
                    authorID: socket.id,
                    dest: data.dest,
                    content:    `<li style="background-color:${socket.bgColor};" class="msgItem">
                                <b>${socket.username}</b>: ${checkedContent}
                                <br><label>${msgTime}</label></li>`};
                socket.to(data.dest).emit('chat message', formatMSG);
                const myMsg = { 
                    authorID: socket.id,
                    dest: data.dest,
                    content:    `<li style="background-color:${socket.bgColor};" class="msgItem myMsg">
                                <b>${socket.username}</b>: ${checkedContent}
                                <br><label>${msgTime}</label></li>`};
                                
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
        socket.on('isTyping', (currentRoom)=>{
            if(currentRoom !== "Public"){
                const msg = `${socket.username} is typing...`;
                socket.to(currentRoom).emit(`isTyping`, msg)
            }
            
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
        socket.on(`new public room`, (roomData)=>{
            const currentRooms = socket.roomsArr;
            let alreadyOpen = false;
            if(roomData.privacy == "Private"){
                let roomVar = `${roomData.guest.id}&${roomData.owner.id}`;
            // If it already open
            currentRooms.filter((room)=>{
                if(roomData.id == room.id || roomVar == room.id) {
                    return alreadyOpen = true;
                }
                return alreadyOpen = false;
            });
            }
            if(roomData.privacy == "Public"){
                currentRooms.filter((room)=>{
                    if(roomData.id == room.id) {
                        return alreadyOpen = true;
                    }
                    return alreadyOpen;
                });
            }
            const newRoom = {
                id: roomData.id,
                name: roomData.name,
                privacy: `Public`,
                owner: {
                    id: socket.id,
                    username: socket.username
                },
            }
            if(!alreadyOpen){
                socket.roomsArr.push(newRoom);
                socket.join(roomData.id);
                const msg  = {
                    author: newRoom.owner.username,
                    content: `<li class="systemMsg"><b>${newRoom.owner.username}</b> created a new public room: <b><span>${newRoom.name}</span></b></li>`,
                    dest: "Public"
                }
                updateRoomsList(socket);
                publicRooms.push(roomData);
                io.emit('update public rooms', publicRooms);
                io.to("Public").emit('chat message', msg);
            }
        });
        socket.on('view public room', (roomID)=>{
            const currentRooms = socket.roomsArr;
            let alreadyOpen = false;
            // If it already open
            const foundRoom = currentRooms.find((room)=>{
                return room.id == roomID;
            });
            if(!foundRoom || foundRoom == "undefind"){
                // Find in public rooms & Add room to array and update rooms
                const findRoom = publicRooms.find((room)=>{
                    return room.id == roomID
                });
                socket.roomsArr.push(findRoom);
                socket.join(roomID);
                socket.currentRoom = roomID;
                updateRoomsList(socket);
            }
        })
        socket.on('new private room', (roomData)=>{
            const currentRooms = socket.roomsArr;
            socket.currentRoom = roomData.id;
            let alreadyOpen = false;
            if(roomData.privacy == "Private"){
                let roomVar = `${roomData.guest.id}&${roomData.owner.id}`;
            // If it already open
            currentRooms.filter((room)=>{
                if(roomData.id == room.id || roomVar == room.id) {
                    return alreadyOpen = true;
                }
                return alreadyOpen = false;
            });
            }
            if(roomData.privacy == "Public"){
                currentRooms.filter((room)=>{
                    if(roomData.id == room.id) {
                        return alreadyOpen = true;
                    }
                    return alreadyOpen;
                });
            }
            // open if its not me or already open
            if(!alreadyOpen && roomData.guest.id !== socket.id) {
                socket.join(roomData.id);
                roomData.name = 'Private';
                socket.roomsArr.push(roomData);
                socket.to(roomData.guest.id).emit('Invite', roomData);
                updateRoomsList(socket);
            }
        });
        socket.on(`accept`, (roomData)=>{
            socket.join(roomData.id);
            socket.roomsArr.push(roomData);
            socket.currentRoom = roomData.id;
            socket.to(roomData.id).emit('accept', roomData);
            updateRoomsList(socket);
        });
        socket.on('reject', (data)=>{
            socket.to(data.owner.id).emit('reject', data);
        })
        socket.on('leave room', (roomID)=>{
            console.log(`leaving: ${socket.username} ${roomID}`);
            const currentRooms = socket.roomsArr;
            socket.currentRoom = socket.roomsArr[0];
            socket.leave(roomID);
            const newRooms = currentRooms.filter((room)=>{
                return room.id !== roomID;
            });
            socket.emit('room selector', currentRooms[0]);
            // Find if room is in public array
            const inPublicArr = publicRooms.find((room)=>{
                return room.id == roomID
            })
            
            if(!inPublicArr && roomID !== "Public"){
                let msg = {
                    dest: roomID,
                    counter: 5,
                    content: `<li class="systemMsg"><b>${socket.username}</b> left room closing in <span id="timer${roomID}"></span></li>`
                }
                socket.to(roomID).emit('user left', msg);
                socket.currentRoom = socket.roomsArr[0].id;
            }
            
            if(inPublicArr && inPublicArr.privacy == "Public"){
                console.log(`Leaving Public Room`);
            }
            if(inPublicArr && inPublicArr.owner.id == socket.id){
                let msg = {
                    dest: roomID,
                    counter: 5,
                    content: `<li class="systemMsg"><b>Room creator ${socket.username}</b> is closing <span id="timer${roomID}"></span></li>`
                }
                let newRooms = publicRooms.filter((room)=>{
                    return room.id !== roomID;
                });
                publicRooms = newRooms;
                socket.to(roomID).emit('user left', msg); 
                io.emit('update public rooms', publicRooms);
            }
            socket.roomsArr = newRooms;
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
        io.emit('update public rooms', publicRooms); 
    }
}


module.exports = chatListeners;