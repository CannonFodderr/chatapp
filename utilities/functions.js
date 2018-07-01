const   fetch = require('node-fetch'),
        sanitizer = require('sanitizer'),
        API_KEY = process.env.API_KEY;
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
    // Check content for images and links
    checkContent:  checkContent = (data) => {
        let content = data.content;
        let linkTerms = content.match(/http|https|ftp|www/i);
        let imgTerms = content.match(/jpeg|jpg|gif|bmp/i);
        if(imgTerms) {
            let imgString = content.substring(linkTerms.index).split(" " , 1);
            let injectImage = content.replace(imgString[0], `<a target="_blank" href="${imgString}"><br /><img class="chatImg" src="${imgString}" /></a>`)
            return injectImage;
        }
        if(linkTerms) {
            let linkString = content.substring(linkTerms.index).split(" ", 1);
            if(linkString[0].substring(0, 3) == "www"){
                let injectLink = content.replace(linkString[0], `<a class="chatLink" target="_blank" href=http://${linkString}>${linkString}</a>`);
                return injectLink;
            } else {
                let injectLink = content.replace(linkString[0], `<a class="chatLink" target="_blank" href=${linkString}>${linkString}</a>`);
                return injectLink;
            };
        }
        return data.content;
    }
}

module.exports = utils;