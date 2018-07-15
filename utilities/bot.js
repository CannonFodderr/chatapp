const name = "<b>BOT</b>:";
const bot = {
    welcome: (socket) => {
        return `<li class="systemMsg">${name} 🚧 Under construction! 🚧 <br />
        Hi ${socket.username}, Welcome to the chat.<br />
        Type <b>@help</b> to see all available features </li>`;
    },
    help: () => {
        return `<li class="systemMsg">${name} Click an online user to start a private chat,<br /> the room will open after the user confirmed the request</li>
        <li class="systemMsg">${name} Add @ to ask me something. for example:
        <br />You can get weather reports by typing "@weather city name", <br />
        <i>@weather amsterdam</i> will give you the current weather in amsterdam. <br />
        <br />
        <b>please note</b> this is a demo build some cities are not supported. <br /></li>`;
    },
    noWeatherData: (city) => {
        return `<li class="systemMsg">${name} Sorry, I was unable to get the weather for: <b>${city}</b> 😕<br />
        Make sure to add the <b>city name</b> after the <b>@weather</b> command. <br />
        this is a demo build some cities are not supported</li>`;
    },
    weatherReport: (socket, data) => {
        const addonArr = ['stay cool 💦', 'enjoy the sun 🌞', 'keep warm 🍵'];
        let msgAddon = '';
                let maxTemp = data.main.temp_max;
                if(maxTemp >= 27){
                    msgAddon = addonArr[0];
                } else if(maxTemp <= 26 && maxTemp >= 19){
                    msgAddon = addonArr[1];
                } else {
                    msgAddon = addonArr[2];
                }
        return msg = `<li class="systemMsg">${name} Hi ${socket.username},
                        Weather indicates ${ data.weather[0].main } 
                        in ${data.name} with temperatures up to ${data.main.temp_max}° ${msgAddon}</li>`;
    },
    inputSanitized: (data, socket) => {
        return msg = {
            authorID: `System`,
            dest: socket.currentRoom,
            content: `<li class="danger">${name} Hi scripter! Please play nice :) </li>`
        }
    }, 
    msgExceeds: () => {
        return msg = {
            authorID: `System`,
            content: `<li class="systemMsg">${name} Your message is waaaay to long, keep it short ♥</li>`
        };
    }
}


module.exports = bot;