# Anonymous Chat APP
## Basic Chat APP with nodeJS server, Socket IO and vanilla JS.
This project goal is to create an independet chat app with no need for any DB.
I would love to hear your suggestions for features refining / code refactoring etc...
*Feel free to fork*

#### Setup
* Clone
* npm install
* Create a .env file with Open Weather API key and Port number.
* Enjoy chatting.

#### Dependencies
* body-parser
* dotenv
* ejs
* express
* node-fetch
* sanitizer
* socket.io

*Please note - This is a VERRRRY early build - before any refactoring.*

#### main Features

* Anonymous chat app with no database or log collections.
* All chat data is deleted upon closing the app.
* Public room for global chat.
* Private rooms - click on an online user to start a private chat.
* Chat rooms - User can open new PUBLIC chat rooms or join one.
* Location indicator - current room is marked with an indicator.
* Message input indicates current room.
* emojis - Currently not available.

#### User inputs

* All text inputs are sanitized.

#### Chat features
* Chat messages display timestamps.
* Basic implementation of help bot with @ commands
* type @help to get current available commands
* type @weather city name to get a weather report via open weather api (API key required);
* Basic implementation of video sharing - chat will recognize YouTube videos and reform an iframe element. works will regular YouTube url and youtube short url.

#### Design
* Utilizing Materialize - https://materializecss.com/
* Desktop and Mobile views are CSS Grid based.
* CSS colors for elements with css variables for future themes.

