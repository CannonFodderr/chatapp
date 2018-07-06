var socket = io();
let msgSubmitBtn = document.getElementById('msgSubmitBtn');
let msgTextInput = document.getElementById('msgTextInput');
let userControls = document.getElementById('userControls');
let usernameSubmit = document.getElementById('usernameSubmit');
let userNameSection = document.getElementById('userNameSection');
let usernameInput = document.getElementById('usernameInput');
let usersCount = document.getElementById('usersCount');
let usersList = document.getElementById('usersUL');
let broadcasts = document.getElementById('broadcasts');
let display = document.getElementById('display');
let messages = document.getElementById('messages');
let menu = document.getElementById('menu');
let info = document.getElementById('info');
let msgBoards = document.getElementById('msgBoards');
let currentRoom = 'Public';
// tabs
let tabsList = document.getElementById('tabsList');
// let tabItems = [document.getElementsByClassName('tabItem')];
let tabClose = [document.getElementsByClassName('tabClose')];

let menuOn = false;
let isMobile = false;
display.scrollTop = display.scrollHeight;
//  Utility Functions
window.mobilecheck = function() {
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return isMobile = true;
};


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
        messages.style.zIndex = -100;
        messages.style.opacity = 0;
        menuOn = true;
    } else {
        messages.style.opacity = 1;
        messages.style.zIndex = 100;
        menuOn = false;
    }
    
}

trimMe = (string) => {
    return string.trim();
}

roomSelector = (data) =>{
    const tabItems = tabsList.childNodes;
    let msgLists = msgBoards.childNodes;
    let roomVar  = `${data.guest.id}&${data.owner.id}`;
        tabItems.forEach((tab)=>{
            tab.classList.remove('selected');
            if(tab.id == currentRoom || tab.id == roomVar){
                tab.classList.add('selected');
            }
        })
        msgLists.forEach((list)=>{
            const ulName = list.getAttribute('name');
            if(ulName == currentRoom){
                list.style.display = "block";
            } else {
                list.style.display = "none";
            }
        })
        socket.emit('change room', currentRoom);
}
getDate = () => {
    const newDate = new Date;
    const time = newDate.toLocaleTimeString();
    const date = newDate.toLocaleDateString();
    return { date: date, time: time };
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
            case `@help`: socket.emit('help')
            return msgTextInput.value = '';
        }
        
        socket.emit('chat message', (msg));
        msgTextInput.value = '';
    // if Message is too long 
    } else if(msg.content.length > 200){
        socket.emit('msg exceeds');
    }
});

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
msgTextInput.addEventListener('keypress', ()=>{
        socket.emit(`isTyping`, currentRoom);
});

usersList.addEventListener('click', (element)=>{
    const currentElement = element.target;
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
    socket.emit('new private room', room);
})

menu.addEventListener('click', displayMenu);

tabsList.addEventListener('click', (e)=>{
    const tabElement = e.target;
    let msgLists = msgBoards.childNodes
    const parentElement = tabElement.parentElement;
    const elementId = parentElement.id;
    const openBoards = msgBoards.childNodes;
    let currentOnlineUsers = usersList.childNodes;
    if(tabElement.classList.value == "material-icons tabClose" && elementId !== "Public"){
        openBoards.forEach((board)=>{
            const boardName = board.getAttribute('name');
            if(boardName == elementId){
                board.remove();
            }
        });
        socket.emit('leave room', elementId);
    } else {
        const tabItems = tabsList.childNodes;
        const selectedTab = e.target;
        const tabId = e.target.id;
        tabItems.forEach((tab)=>{
            tab.classList.remove('selected');
        });
        selectedTab.classList.add('selected');
        currentRoom = tabId;
        msgLists.forEach((list)=>{
            const ulName = list.getAttribute('name');
            if(ulName == currentRoom){
                list.style.display = "block";
            } else {
                list.style.display = "none";
            }
        })
        socket.emit('change room', tabId)
    }
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
    socket.username = msg.username;
    msgTextInput.focus();
});
socket.on(`update usersCount`, (data)=>{
    usersCount.innerHTML = data;
});
socket.on('update usersList', (list)=>{
    usersList.innerHTML ='';
    list.forEach((item)=>{
        if(item.id == socket.id){
            usersList.innerHTML += `<li id="${item.id}"class="user currentUser">${item.username}</li>`
        } else {
            usersList.innerHTML += `<li id="${item.id}"class="user">${item.username}</li>`
        }
    });
});
socket.on('chat message', (msg)=>{
    let msgLists = msgBoards.childNodes;
    msgLists.forEach((list)=>{
        const currentList = list.getAttribute('name');
        if(currentList == msg.dest && currentList == currentRoom){
            list.innerHTML += msg.content;
        } else if(currentList == msg.dest) {
            list.innerHTML += msg.content;
            let unreadCount = document.getElementById(`unread${msg.dest}`);
            let counter = Number(document.getElementById(`unread${msg.dest}`).innerHTML) + 1;
            unreadCount.innerHTML = counter++;
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
        if(currentList == currentRoom){
            list.innerHTML += msg.content;
        }
    })
})
socket.on(`isTyping`, (msg)=>{
    broadcasts.innerHTML = msg;
    setTimeout(()=>{
        broadcasts.innerHTML = '';
    }, 3000);
});
//  ROOMS
socket.on('update roomsList', (data)=>{
    const openBoards = msgBoards.childNodes;
    const currentOnlineUsers = usersList.childNodes;
    currentOnlineUsers.forEach((user)=>{
        user.classList.remove('active')
    })
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
    tabsList.innerHTML = '';
    // Update Tabs & Boards
    data.rooms.forEach((room)=>{
        let roomStr = '';
        addCloser = (closer) => {
            if(room.id == currentRoom){
                tabsList.innerHTML += `<li id="${room.id}" class="tabItem selected">${closer}`;
            } else {
                tabsList.innerHTML += `<li id="${room.id}" class="tabItem">${closer}`;
            }
        }
        markSelectedUsers = () => {
            currentOnlineUsers.forEach((user) => {
                switch(user.id){
                    case socket.id: break;
                    case room.owner.id: user.classList.add('active');
                    break;
                    case room.guest.id: user.classList.add('active');
                    break;
                }
            })
        }
        if(room.id == "Public"){
            roomStr = `${room.name}`;
            addCloser(roomStr); 
        }
        else if(room.owner && room.owner.id == socket.id){
            roomStr = `${room.guest.username || room.name}<span id="unread${room.id}" class="unread"></span><i class="material-icons tabClose">close</i></li>`;
            addCloser(roomStr);
        } else {
            roomStr = `${room.owner.username || room.name}<span id="unread${room.id}" class="unread"></span><i class="material-icons tabClose">close</i></li>`;
            addCloser(roomStr);
            
        }
        markSelectedUsers();
    })
});
socket.on('Invite', (data)=>{
    if(confirm(`${data.owner.username} invites you to chat`)){
        currentRoom = data.id;
        roomSelector(data);
        socket.emit('accept', data);
    } else {
        socket.emit('reject', data);
    }
});
socket.on('accept', (data)=>{
    currentRoom = data.id;
    roomSelector(data);
});
socket.on('reject', (data)=>{
    alert(`${data.guest.username} rejected the invite leaving room`);
    socket.emit('leave room', data.id);
});
socket.on('room selector', (data)=>{
    currentRoom = data.id;
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
    console.log('got disconnected');
    if(confirm(`ooops you got disconnected :( try to reconnect ?`)){
        location.reload();
    } else {
        msgTextInput.setAttribute('disabled', true);
        broadcasts.innerHTML = "You are offline"
        msgSubmitBtn.setAttribute(`disabled`, true);
    }
})
// Reset stuff on resize
window.addEventListener('resize', ()=>{
    messages.style.opacity = 1;
    messages.style.zIndex = 0;
    menuOn = false;
});