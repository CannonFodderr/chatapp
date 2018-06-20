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
    }
}

module.exports = utils;