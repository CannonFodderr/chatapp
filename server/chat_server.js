const utils = require('../utilities/functions');
const bot = require('../utilities/bot');
let publicRooms = [];
const newPublic = utils.newRoom("Public", "Public", "Public", { id: "Public", username: "Public" }, { id: "Public", username: "Public" })
publicRooms.push(newPublic);
// IO CONFIG
const users = [];
let usersCount = 0;
chatListeners = (io) => {
    io.on('connection', (socket)=>{
        console.log(`User connected`);
        io.emit(`update usersCount`, usersCount);
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
            socket.bgColor = utils.rgbGen()
            socket.username = username;
            // Add & Join public room
            socket.roomsArr = [];
            socket.roomsArr.push(publicRooms[0]);
            socket.join("Public");
            socket.currentRoom = "Public";   
            const newUser = {
                id: socket.id,
                username: socket.username
            };
            users.push(newUser);
            usersCount ++;
            const msg = {
                author: `System`,
                username: username,
                dest: socket.currentRoom,
                content: bot.welcome(socket)
            }
            io.emit(`update usersCount`, usersCount);
            updateRoomsList(socket);
            socket.emit(`username set`, msg);
            return socket.emit('chat message', msg);
        }
        });
        // Chat messages
        socket.on('chat message', (data)=>{
            const msgDate = data.date.date;
            const msgTime = data.date.time;
            // Sanitize text Input
            const sanitizedInput = utils.sanitizeString(data.content); 
            if(!sanitizedInput){
            const msg = bot.inputSanitized(data, socket);
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
            const msg = bot.msgExceeds();
            socket.emit('chat message', msg);
        });
        socket.on('help', (currentRoom)=>{
            socket.currentRoom = currentRoom;
            const msg = {
                author: `BOT`,
                dest: socket.currentRoom,
                content: bot.help()
            }
            socket.emit('chat message', msg);
        })
        // Weather report
        socket.on('weather report', (city)=>{
            const noWeather = {
                author: 'BOT',
                dest: socket.currentRoom,
                content: bot.noWeatherData(city),
            }
            if(city.length === 0){
                return socket.emit('chat message', noWeather);
            }
            utils.getWeather(city)
            .then((data)=>{
                if(!data || data.cod == '404' || data.message == 'city not found'){
                    return socket.emit('chat message', msg);
                }
                const msg = bot.weatherReport(socket, data);
                socket.emit('weather report', msg);
            }).catch((e)=>{
                console.error(e);
                return socket.emit('chat message', noWeather); 
            })
        })
        socket.on(`new public room`, (roomData)=>{
            let sanitizedInput = utils.sanitizeString(roomData.name);
            if(!sanitizedInput){
                const msg = bot.inputSanitized(roomData, socket);
                console.log('Bad Input');
                return socket.emit('chat message', msg);
            }
            const currentRooms = socket.roomsArr;
            checkIfOpen = () => {
                switch(roomData.privacy){
                    case "Private": return utils.checkIfPrivateRoomIsOpen(roomData, currentRooms)
                    break;
                    case "Public": return utils.checkIfPublicRoomIsOpen(roomData, currentRooms);
                    break;
                    default: return false;
                }
            } 
            let alreadyOpen = checkIfOpen();
            if(!alreadyOpen){
                const newRoom = utils.newRoom(roomData.id, roomData.name, roomData.privacy, { id: socket.id, username: socket.username})
                socket.roomsArr.push(newRoom);
                socket.join(roomData.id);
                socket.currentRoom = roomData.id;
                const msg  = {
                    author: newRoom.owner.username,
                    content: `<li class="systemMsg"><b>${newRoom.owner.username}</b> created a new public room: <b><span>${newRoom.name}</span></b></li>`,
                    dest: "Public"
                }
                updateRoomsList(socket);
                publicRooms.push(roomData);
                io.emit('update public rooms', publicRooms);
                socket.emit('room selector', roomData);
                io.to("Public").emit('chat message', msg);
            }
        });
        socket.on('view room', (roomID)=>{
            const currentRooms = socket.roomsArr;
            let alreadyOpen = false;
            // If it already open
            const foundRoom = currentRooms.find((room)=>{
                socket.currentRoom = room.id;
                updateRoomsList(socket);
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
        socket.on('private room', (roomData)=>{
            const currentRooms = socket.roomsArr;
            checkIfOpen = () => {
                switch(roomData.privacy){
                    case "Private": return utils.checkIfPrivateRoomIsOpen(roomData, currentRooms)
                    case "Public": return utils.checkIfPublicRoomIsOpen(roomData, currentRooms);
                    default: return false;
                }
            } 
            let roomState = checkIfOpen();
            if(!roomState.alreadyOpen && roomData.guest.id !== socket.id) {
                socket.join(roomData.id);
                socket.currentRoom = roomData.id;
                roomData.name = 'Private';
                socket.roomsArr.push(roomData);
                socket.to(roomData.guest.id).emit('Invite', roomData);
            }
            if(roomState.alreadyOpen){
                socket.currentRoom = roomState.foundRoom.id;
            }
            updateRoomsList(socket)

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
            console.log(`leaving: ${socket.username} ${roomID}`);
            const currentRooms = socket.roomsArr;
            socket.currentRoom = socket.roomsArr[0];
            socket.leave(roomID.id);
            const newRooms = currentRooms.filter((room)=>{
                return room.id !== roomID.id;
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
            socket.currentRoom = room.id;
            updateRoomsList(socket);
        });
        socket.on('disconnect', ()=>{
            users.filter((user) => {
                if(user.id == socket.id){
                    users.splice(user, 1);
                    usersCount --;
                    updateUserslist(socket);
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
    updateUserslist = (socket) => {
        const roomData = socket.roomsArr.find((room)=>{
            return room.id == socket.currentRoom;
        });
        let currentUsersState = {
            list: [],
            currentRoom: roomData
        }
        users.forEach((user)=>{
            currentUsersState.list.push(user);
        });
        socket.emit('update usersList', currentUsersState);
    }

    updateRoomsList = (socket) => {
        const roomData = socket.roomsArr.find((room)=>{
            return room.id == socket.currentRoom;
        });
        if(roomData){
            let data = {
                currentRoom: socket.currentRoom,
                roomData: roomData,
                rooms: socket.roomsArr
            };
            // Send current rooms data to socket 
            socket.emit('update roomsList', data);
            updateUserslist(socket);
            // Send public rooms to all users
            io.emit('update public rooms', publicRooms); 
        }
        
    }
}


module.exports = chatListeners;