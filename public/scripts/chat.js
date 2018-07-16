var socket = io();
let msgSubmitBtn = document.getElementById('msgSubmitBtn');
let msgTextInput = document.getElementById('msgTextInput');
let userControls = document.getElementById('userControls');
let usernameSubmit = document.getElementById('usernameSubmit');
let userNameSection = document.getElementById('userNameSection');
let usernameInput = document.getElementById('usernameInput');
let usersCount = document.getElementById('usersCount');
let usersList = document.getElementById('usersUL');
let display = document.getElementById('display');
let messages = document.getElementById('messages');
let menu = document.getElementById('menu');
let fullscreenBtn = document.getElementById('fullscreenBtn');
let info = document.getElementById('info');
let msgBoards = document.getElementById('msgBoards');
let currentRoom = 'Public';
let menuOn = false;
// let isMobile = false;
let isFullscreen = false;
const roomsUL = document.getElementById('roomsUL');
// New Room Form
const newRoomBtn = document.getElementById('newRoomBtn');
const displayForm = document.getElementById('displayForm');
display.scrollTop = display.scrollHeight;
window.addEventListener("load",function() {
    setTimeout(function(){
        // This hides the address bar:
        window.scrollTo(0, 1);
    }, 0);
});

noDefault = (event) => {
    event.preventDefault();
}
scrollToLastMsg = () =>{
    messages.scrollTo(0,messages.scrollHeight);
}
getTimeStamp = () => {  
    const newDate = new Date;
    const date = newDate.getDate();
    const hours = newDate.getUTCHours();
    const minutes = newDate.getUTCMinutes();
    const newStamp = `${hours}:${minutes}`;
    return newStamp;
},
// hide & Show inputs
hideElement = (elem) => {
    elem.style.opacity = 0;
    elem.style.height = 0;
    setTimeout(()=>{
        elem.style.display = "none";
    }, 400)
}

showElement = (elem) => {
    elem.style.display = "block";
    elem.style.opacity = 1;
    elem.style.height = "fit-content";
    setTimeout(()=>{
        hideElement(elem);
    }, 3000)
}

displayMenu = () => {
    if(menuOn == false){
        info.style.opacity = `1`
        info.style.zIndex = 100;
        info.style.display = "block"
        messages.style.zIndex = -100;
        messages.style.opacity = 0;
        messages.style.display = "none";
        menu.style.color = "#5ac6cc"
        menuOn = true;
    } else {
        info.style.opacity = 0
        info.style.zIndex = -100;
        info.style.display = "none"
        messages.style.opacity = 1;
        messages.style.zIndex = 100;
        menu.style.color = "#fff"
        messages.style.display = "block";
        menuOn = false;
    }
    
}

trimMe = (string) => {
    return string.trim();
}
setInputPlaceholder = (name) => {
    msgTextInput.setAttribute('placeholder', `to ${name}:`);
}

roomSelector = (data) =>{
    currentRoom = data.id;
    
    showMsgList = () => {
        let msgLists = msgBoards.childNodes;
        msgLists.forEach((list)=>{
            const ulName = list.getAttribute('name');
            if(ulName == currentRoom){
                list.style.display = "block";
            } else {
                list.style.display = "none";
            }
        })
    }
    selectPrivate = (data) => {
        let inputText = data.owner.username;
        if(socket.username !== data.guest.username){
            inputText = data.guest.username
        }
        msgTextInput.setAttribute('placeholder', `To ${inputText}:`);
        showMsgList();
    }
    selectPublic = (data) => {
            msgTextInput.setAttribute('placeholder', `To ${data.name}:`);
            showMsgList();
        }
    switch(data.privacy){
        case "Public": selectPublic(data)
        break;
        case "Private": selectPrivate(data)
        break;
    }
}

getDate = () => {
    const newDate = new Date;
    const time = newDate.toLocaleTimeString();
    const date = newDate.toLocaleDateString();
    return { date: date, time: time };
}
setFullScreen = () => {
    if(!document.webkitCurrentFullScreenElement){
        return display.webkitRequestFullscreen();
    }
        document.webkitExitFullscreen();
}
updatePublicRoomsList = (publicRoomsArr) => {
    roomsUL.innerHTML = '';
    publicRoomsArr.forEach((room)=>{
        if(room.id == currentRoom){
            return roomsUL.innerHTML += `<li id="${room.id}" name="${room.name}" class="roomItem currentRoom">#${room.name}</li>`;
        }
        roomsUL.innerHTML += `<li id="${room.id}" name="${room.name}" class="roomItem">#${room.name}</li>`;
    })
}
updateUsersList = (data) => {
    usersList.innerHTML ='';
    let currentRoomArr = currentRoom.split('&');
    let Roomvariation = `${currentRoomArr[1]}&${currentRoom[0]}`
    data.users.forEach((item)=>{
        if(item.id == socket.id){
            return usersList.innerHTML += `<li id="${item.id}"class="user currentUser">${item.username}</li>`
        }
        if(`${item.id}&${socket.id}` == currentRoom || `${socket.id}&${item.id}` == currentRoom ){
            return  usersList.innerHTML += `<li id="${item.id}"class="user currentRoom">${item.username}</li>`
        } else {
            return usersList.innerHTML += `<li id="${item.id}"class="user">${item.username}</li>`
        }
    });
}
setCookie = (name, value, numDays) => {
    let expires = '';
    if(numDays){
        let date = new Date;
        date.setTime(date.getTime() + (numDays*24*60*60*1000));
        expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ""}${expires};path="/"`;
}
getCookie = (name) => {
    let nameEQ = `${name}=`;
    let cookiesArr = document.cookie.split(';');
    for(let i = 0; i < cookiesArr.length; i++){
        let arrIndex = cookiesArr[i];
        while(arrIndex.charAt(0) == ' ') arrIndex = arrIndex.substring(1, arrIndex.length);
        if(arrIndex.indexOf(nameEQ) == 0) return arrIndex.substring(nameEQ.length, arrIndex.length);
    }
    return null;
}

eraseCookie = (name) => {
    document.cookie = `${name}=;`;
}
window.onload = () => {
    let username = getCookie('username')
    if(username){
        usernameInput.value = username;
    }
}
// Listeners
usernameInput.addEventListener('keydown', (e)=>{
    let currentValue = usernameInput.value;
    if(currentValue.length >= 3){
        usernameSubmit.classList.remove('grey');
        usernameSubmit.classList.add('orange');
        return
    }
})
msgSubmitBtn.addEventListener('click', (e)=>{
    noDefault(e);
    const msg = {
        authorId: socket.id,
        dest: currentRoom,
        date: getDate(),
        content: msgTextInput.value,
    };
    if(msg.content.length > 0 && msg.content.length <= 200){
        const msgArr = msg.content.split(" ");
        let city ='';
        for(i = 1; i <= msgArr.length - 1; i++){
            city += ` ${msgArr[i]}`
        }
        switch(msgArr[0]){
            case '@weather': socket.emit('weather report', city);
            return msgTextInput.value = '';
            case '@time' : socket.emit('getTime')
            return msgTextInput.value = '';
            case `@help`: socket.emit('help', currentRoom);
            return msgTextInput.value = '';
        }
        
        socket.emit('chat message', (msg));
        msgTextInput.value = '';
    // if Message is too long 
    } else if(msg.content.length > 200){
        socket.emit('msg exceeds');
    }
});
usernameInput.addEventListener('keypress', ()=>{
    value = usernameInput.value;
    setCookie("username", value, 7)
})
usernameSubmit.addEventListener('click', (e)=>{
    noDefault(e)
    const username = usernameInput.value;
    const trimmed = trimMe(username)
    if(trimmed.length > 3){
        socket.emit('set username', trimmed);
        usernameInput.value = '';
    } else {
        broadcasts.innerHTML = 'username should be longer';
        setTimeout(()=>{
            broadcasts.innerHTML = '';
        }, 3000);
    }
});

usersList.addEventListener('click', (element)=>{
    const room = {
        id:`${socket.id}&${element.target.id}`,
        privacy: `Private`,
        owner: { 
            username: socket.username,
            id: socket.id
        },
        guest: { 
            username: element.target.innerText,
            id: element.target.id
        }
    };

    currentRoom == room.id;
    socket.emit('private room', room);
})

menu.addEventListener('click', displayMenu);

newRoomBtn.addEventListener('click', (e)=>{
    noDefault(e);
    const roomName = document.getElementById('newRoomInput').value;
    if(roomName.length < 4){
        return alert('Room Name should be 4 chars or longer');
    }
    const newRoom =  {
        owner: {
            id: socket.id,
            username: socket.username
        },
        id: `Public${roomName}`,
        name: roomName,
        privacy: `Public`
    }
    document.getElementById('newRoomInput').value = '';
    const form = document.getElementById('newRoomForm');
    form.classList.toggle('showForm');
    socket.emit('new public room', newRoom);
});
roomsUL.addEventListener('click', (e)=>{
    const publicRoomView = e.target.id;
    currentRoom = publicRoomView;
    socket.emit(`view room`, publicRoomView);
})
displayForm.addEventListener('click', (e)=>{
    noDefault(e)
    const form = document.getElementById('newRoomForm');
    form.classList.toggle('showForm');
    document.getElementById('newRoomInput').focus();
})
// =========
// IO Setup
// =========
socket.on('welcome', (msg)=>{
    const publicBoard = document.getElementById(`board${msg.dest}`);
    publicBoard.innerHTML += msg.content;
});
socket.on('username err', (msg)=>{
    broadcasts.innerHTML = `${msg.content}`;
    setTimeout(()=> {
        broadcasts.innerHTML = '';
    }, 5000)
});
socket.on('username set', (msg)=>{
    userControls.style.display = "block";
    userNameSection.style.display = "none";
    msgTextInput.removeAttribute('disabled');
    msgSubmitBtn.removeAttribute('disabled');
    displayForm.removeAttribute('disabled');
    newRoomBtn.removeAttribute('disabled');
    socket.username = msg.username;
    msgTextInput.focus();
});
socket.on(`update usersCount`, (data)=>{
    usersCount.innerHTML = data.usersCount;
    updateUsersList(data);
});
// User list generator
socket.on('update usersList', (data)=>{
    updateUsersList(data);
});
// Got chat messages
socket.on('chat message', (msg)=>{
    let msgLists = msgBoards.childNodes;
    msgLists.forEach((list)=>{
        const currentList = list.getAttribute('name');
        if(currentList == msg.dest && currentList == currentRoom){
            list.innerHTML += msg.content;
        } else if(currentList == msg.dest) {
            list.innerHTML += msg.content;
        }
    });
    scrollToLastMsg();
});
socket.on('weather report', (msg)=>{
    let msgLists = msgBoards.childNodes;
    msgLists.forEach((list)=>{
        const currentList = list.getAttribute('name');
        if(currentList == currentRoom){
            list.innerHTML += msg;
        }
    })
    scrollToLastMsg();
});
socket.on('getTime', (msg)=>{
    let msgLists = msgBoards.childNodes;
    msgLists.forEach((list)=>{
        const currentList = list.getAttribute('name');
        if(currentList == currentRoom){
            list.innerHTML += msg;
        }
    })
    scrollToLastMsg();
});
socket.on('help', (msg)=>{
    let msgLists = msgBoards.childNodes;
    msgLists.forEach((list)=>{
        const currentList = list.getAttribute('name');
        if(currentList == msg.dest){
            list.innerHTML += msg.content;
        }
    })
})
//  ROOMS
socket.on('update roomsList', (data)=>{
    currentRoom = data.currentRoom;
    const openPublicRooms = document.getElementById('roomsUL');
    const CurrentMsgBoards = document.getElementById('msgBoards');
    openPublicRooms.innerHTML = '';
    const openBoards = CurrentMsgBoards.childNodes;
        const boardsArr = [];
        openBoards.forEach((board)=>{
            const boardName = board.getAttribute('name');
            boardsArr.push(boardName);
        });
        let isOpen = false
        boardsArr.filter((board)=>{
            if(board == currentRoom){
                return isOpen = true;
            }
        })
        if(!isOpen){
            msgBoards.innerHTML += `<ul id="board${currentRoom}" name="${currentRoom}" class="msgList displayMe"></ul>`;   
        }
    
    roomSelector(data.roomData);
});
socket.on('update public rooms', (roomsArr)=>{
    updatePublicRoomsList(roomsArr)
})
socket.on('Invite', (data)=>{
    if(confirm(`${data.owner.username} invites you to chat`)){
        const dataToServer = data;
        socket.emit('change room', dataToServer);
        socket.emit('accept', data);
    } else {
        socket.emit('reject', data);
    }
});
socket.on('accept', (data)=>{
    socket.emit('change room', currentRoom);
    roomSelector(data);
});
socket.on('reject', (data)=>{
    alert(`${data.guest.username} rejected the invite leaving room`);
    socket.emit('leave room', data);
});
socket.on('room selector', (data)=>{
    roomSelector(data);
});
socket.on('user left', (msg)=>{
    let msgLists = msgBoards.childNodes;
    msgLists.forEach((list)=>{
        const currentList = list.getAttribute('name');
        if(currentList == msg.dest){
            list.innerHTML += msg.content;
            let counter = msg.counter;
            setInterval(()=>{
                if(counter >= 0){
                    let countdown = document.getElementById(`timer${msg.dest}`);
                    countdown.innerHTML = counter;
                    counter --;
                }
                return
            }, 1000);
            setTimeout(()=>{
                socket.emit('leave room', msg.dest);
            }, counter * 1000 + 1000);
        }
    });
})
socket.on('disconnect', ()=>{
    if(confirm(`ooops you got disconnected :( try to reconnect ?`)){
        location.reload();
    } else {
        msgTextInput.setAttribute('disabled', true);
        msgTextInput.setAttribute("Placeholder", "You are offline");
        msgSubmitBtn.setAttribute(`disabled`, true);
    }
})
// Reset stuff on resize
window.addEventListener('resize', ()=>{
    messages.style.opacity = 1;
    messages.style.zIndex = 0;
    menuOn = false;
});