var socket = io();
let msgSubmitBtn = document.getElementById('msgSubmitBtn');
let msgTextInput = document.getElementById('msgTextInput');
let msgList = document.getElementById('msgList');
let userControls = document.getElementById('userControls');
let usernameSubmit = document.getElementById('usernameSubmit');
let userNameSection = document.getElementById('userNameSection');
let usernameInput = document.getElementById('usernameInput');
let usersCount = document.getElementById('usersCount');
let usersList = document.getElementById('usersList');
let broadcasts = document.getElementById('broadcasts');
let display = document.getElementById('display');
let messages = document.getElementById('messages');
let menu = document.getElementById('menu');
let info = document.getElementById('info');

display.scrollTop = display.scrollHeight;
//  Utility Functions
noDefault = (event) => {
    event.preventDefault();
}
scrollToLastMsg = () =>{
    messages.scrollTo(0,messages.scrollHeight);
}


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
    
    if(messages.style.opacity == 0){
        console.log('clicked')
        messages.style.opacity = 1;
        messages.style.height = "90vh";
        info.style.height = "15vh";
    } else {
        messages.style.opacity = 0;
        messages.style.height = "0";
        info.style.height = "90vh";
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
    const msg = msgTextInput.value;
    if(msg.length > 0){
        const msgArr = msg.split(" ");
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
        
    }
});
usernameSubmit.addEventListener('click', (e)=>{
    noDefault(e)
    const username = usernameInput.value;
    if(username.length > 3){
        socket.emit('choose username', username);
        usernameInput.value = '';
    }
});
msgTextInput.addEventListener('keypress', (e)=>{
        socket.emit(`isTyping`, e);
});

menu.addEventListener('click', displayMenu);
// IO Setup
socket.on('username err', (msg)=>{
    flashMessages.innerHTML = `<p class="danger">${msg}</p>`;
    showElement(flashMessages);
    setTimeout(()=> {
        flashMessages.innerHTML = '';
    }, 5000)
});
socket.on('username set', (msg)=>{
    msgList.innerHTML += msg.content;
    userControls.style.display = "block";
    userNameSection.style.display = "none";
    msgTextInput.removeAttribute('disabled');
    msgSubmitBtn.removeAttribute('disabled');
    msgTextInput.focus();
});
socket.on(`update usersCount`, (data)=>{
    usersCount.innerHTML = data;
});
socket.on('update usersList', (list)=>{
    usersList.innerHTML ='';
    list.forEach((item)=>{
        usersList.innerHTML += `<li class="user">${item}</li>`
    });
});
socket.on('chat message', (msg)=>{
    msgList.innerHTML += msg;
    scrollToLastMsg()
});
socket.on('weather report', (msg)=>{
    msgList.innerHTML += msg;
    scrollToLastMsg();
});
socket.on('getTime', (msg)=>{
    msgList.innerHTML += msg;
    scrollToLastMsg();
})
socket.on(`isTyping`, (msg)=>{
    broadcasts.innerHTML = msg;
    setTimeout(()=>{
        broadcasts.innerHTML = '';
    }, 2000);
})