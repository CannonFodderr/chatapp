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
display.scrollTop = display.scrollHeight;
//  Utility Functions
noDefault = (event) => {
    event.preventDefault();
}
scrollToLastMsg = () =>{
    messages.scrollTo(0,messages.scrollHeight);
}

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
msgTextInput.addEventListener('keypress', (e)=>{
        socket.emit(`isTyping`, e);
});

usersList.addEventListener('click', (element)=>{
    const currentElement = element.target;
    console.log(currentElement);
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
        if(currentList == msg.dest){
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
})
socket.on(`isTyping`, (msg)=>{
    broadcasts.innerHTML = msg;
    setTimeout(()=>{
        broadcasts.innerHTML = '';
    }, 2000);
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
            msgBoards.innerHTML += `<ul name="${currentRoom}" class="msgList displayMe"></ul>`;   
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
            roomStr = `${room.guest.username || room.name}<i class="material-icons tabClose">close</i></li>`;
            addCloser(roomStr);
        } else {
            roomStr = `${room.owner.username || room.name}<i class="material-icons tabClose">close</i></li>`;
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
// Reset stuff on resize
window.addEventListener('resize', ()=>{
    messages.style.opacity = 1;
    messages.style.zIndex = 0;
    menuOn = false;
});