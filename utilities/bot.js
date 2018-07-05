const name = "<b>BOT</b>:";
const bot = {
    welcome: (socket) => {
        return `<li class="systemMsg">${name} 🚧 Under construction! 🚧 <br />
        Hi ${socket.username}, Welcome to the chat.<br />
        Type <b>@help</b> to see all available commands </li>`;
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
        return `<li class="systemMsg">${name} Sorry, I was unable to get the weather for... ${city} 😕<br />
        Make sure to add the <b>city name</b> after the <b>@weather</b> command. <br />
        this is a demo build some cities are not supported</li>`;
    } 
}


module.exports = bot;