const   fetch = require('node-fetch'),
        sanitizer = require('sanitizer'),
        API_KEY = process.env.API_KEY;
const bot = require('../utilities/bot');
// ==========
// Utility Functions
// ==========
const utils = {
    // Generate random rgb colors
    rgbGen: rgbGen = () => {
        const r = Math.floor(Math.random() * (100 - 0));
        const g = Math.floor(Math.random() * (100 - 0));
        const b = Math.floor(Math.random() * (150 - 0));
        return newColor = `rgb(${r}, ${g}, ${b})`;
    },
    // Sanitize user inputs
    sanitizeString: (data) => {
        console.log(data);
        return sanitizer.sanitize(data);
    },
    // make weather API request
    getWeather: getWeather = async (city) => {
        let rootUrl = `https://api.openweathermap.org/data/2.5/weather?q=`;
        let url = `${rootUrl}${city}&units=metric&appid=${API_KEY}`
        const reqData = await fetch(url).then(data => data.json()).then(body => {return body}).catch(e => {
            console.error(e);
        })
        return reqData;
    },
    // Generate output based on content type
    contentGenerator: contentGenerator = (type, content, startIndex) => {
        // Check starting chars
        let newString = content.substring(startIndex).split(" " , 1);
        let types = {
            img: () => {
                return  content.replace(newString[0], `<a target="_blank" href="${newString}"><br /><img class="chatImg" src="${newString}" /></a>`)
            },
            link: () =>{
                switch(newString[0].substring(0, 4)){
                case 'www.': {
                    return content.replace(newString[0], `<a class="chatLink" target="_blank" href=http://${newString}>${newString}</a>`); 
                }
            }
                    return content.replace(newString[0], `<a class="chatLink" target="_blank" href=${newString}>${newString}</a>`);
            },
            video: () => {
                let seperator = newString[0].match(/=|youtu.be/i);
                let videoId = newString[0].substring(seperator.index + seperator[0].length).split("&");
                return content.replace(newString[0], `<br /><iframe width="560" height="315" class="videoFrame" src="https://www.youtube.com/embed/${videoId[0]}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`);
            },
            default: () => {
                return content;
            }
        }
        return (types[type] || types.default)();
    },
    // Check content type
    checkContentType:  checkContentType = (data) => {
        let content = data.content;
        let linkTerms = content.match(/http:|https:|ftp:|www/i);
        let imgTerms = new RegExp(/.jpeg|.jpg|.gif|.bmp|.png/i).test(content);
        let extTerms = new RegExp(/.com|.net|.co.il|.gov|.io|.game/).test(content);
        let videoTerms = new RegExp(/youtube.com|youtu.be/).test(content);
        if(imgTerms && linkTerms) {
            return contentGenerator('img', content, linkTerms.index);
        }
        if(linkTerms && videoTerms) {
           return contentGenerator('video', content, linkTerms.index); 
        }
        if(linkTerms && extTerms) {
            return contentGenerator('link', content, linkTerms.index);
        }
        return content;
    },
    checkIfPrivateRoomIsOpen: (roomData, currentRooms) => {
        let roomState = {
            alreadyOpen: false,
            foundRoom: {}
        }
        let roomVar = `${roomData.guest.id}&${roomData.owner.id}`;
        currentRooms.filter((room)=>{
            if(roomData.id == room.id || roomVar == room.id) {
                return roomState = {
                    alreadyOpen: true,
                    foundRoom: room
                }
            }
        });
        return roomState
    },
    checkIfPublicRoomIsOpen: (roomData, currentRooms) => {
        currentRooms.filter((room)=>{
            if(roomData.id == room.id) {
                return true;
            } else {
                return false;
            }
        });
    },
    inputSanitized: (data, socket) => {
        return msg = {
            authorID: `System`,
            dest: socket.currentRoom,
            content: '<li class="danger">Hi scripter! Please play nice :) </li>'
        }
    }
}
module.exports = utils;