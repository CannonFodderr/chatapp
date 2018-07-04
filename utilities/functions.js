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
    sanitizeString: sanitizeString = (data) => {
        return sanitizer.sanitize(data);
    },
    // make weather API request
    getWeather: getWeather = async (city) => {
        let rootUrl = `https://api.openweathermap.org/data/2.5/weather?q=`;
        let url = `${rootUrl}${city}&units=metric&appid=${API_KEY}`
        const reqData = await fetch(url).then(data => data.json()).then(body => {return body}).catch(e => {
            console.error(e);
            return bot.noWeatherData();
        })
        return reqData;
    },
    // Get timestamp
    getTimeStamp: getTimeStamp = () => {  
        const newDate = new Date;
        const date = newDate.getDate();
        const hours = newDate.getUTCHours();
        const minutes = newDate.getUTCMinutes();
        const newStamp = `${hours}:${minutes}`;
        return newStamp;
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
    }
}
module.exports = utils;