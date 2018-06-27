const   express = require('express'),
        app = express(),
        path = require('path'),
        dotenv = require('dotenv').config(),
        fs = require('fs'),
        bodyParser = require('body-parser'),
        port = process.env.PORT,
        server = app.listen(port, ()=> console.log(`Server is running on port ${port}`)),
        io = require('socket.io')(server),
        chatServer = require('./server/chat_server')(io);


const indexRoutes = require('./routes/index');
// APP CONFIG
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/public')));
app.use(bodyParser.urlencoded({extended: true}));


app.use(indexRoutes);