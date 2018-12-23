const express = require('express')
const path = require('path');
const app = express()
const port = process.env.PORT || 3000
const mongoose = require('mongoose')
const socketIO = require('socket.io');
const http = require('http');
let Users = new Object();
const session = require('express-session');
const publicPath = path.join(__dirname, './public');
const SessionIdentifier = 'AAET'

/////////////////////////////to maintain sessions///////////////////////////
// const MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: SessionIdentifier,
    resave: true,
    saveUninitialized: true
}));
/////////////////////////////to maintain sessions///////////////////////////


//allow cross origin sharing
const cors = require('cors');
app.use(cors());
app.options('*', cors());



const bodyParser = require('body-parser')
//Do not include the rich text formats by setting it to false
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

const mongoDB = 'mongodb://localhost:27017/student-info';
mongoose.connect(mongoDB, {
    useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);

const studentRoutes = require('./routes/student')
const assignmentEvalRoutes = require('./routes/assignment_eval')
const mailRoutes = require('./routes/send_mail')

var server = http.createServer(app);
var io = socketIO(server);
//socket IO with server
// var io = socketIO(server);
//listen to a specific event

app.set('socketio', io);
app.use(express.static(publicPath));
app.use('/student', studentRoutes);
app.use('/assignment', assignmentEvalRoutes);
app.use('/mail', mailRoutes);

server.listen(port, () => console.log(`Example app listening on port ${port}!`))