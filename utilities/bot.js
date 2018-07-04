const name = "BOT";
const bot = {
    welcome: (socket) => {
        return `<li class="systemMsg">Hi ${socket.username}, Welcome to the chat. Type @help to see all available commands </li>`;
    },
    help: () => {
        return `<li class="systemMsg"><b>${name}</b>: Add @ to ask me something. for example:
        <br />You can get weather reports by typing "@weather city name", <br />
        @weather amsterdam will give you the current weather in amsterdam <br />
        please note this is a demo build some cities are not supported <br />
        <br />
        <b>Commands:</b> @weather | @time</li>`;
    }
}


module.exports = bot;