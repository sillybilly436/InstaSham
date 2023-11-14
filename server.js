/**
 * Names: Billy Dolny, Ben Curtis, Bronson Housmans
 * Description:
 */

const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const parser = require('body-parser');
const app = express();
const port = 3000;
app.use(cookieParser());
app.use(express.json());
app.use(parser.json());

// Sets up the mongoose database
const db  = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/instaSham';
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var usernameSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    friends: []
});
var userData = mongoose.model('userData', usernameSchema);

var postSchema = new mongoose.Schema({
    username: String,
    image: String,
    caption: String,
    tags: [],
    time: Number,
    likes: Number
});
var postData = mongoose.model('postData', postSchema);

var messageSchema = new mongoose.Schema({
    username1: String,
    username2: String,
    messages: []
});
var messageData = mongoose.model('messageData', messageSchema);

app.post('/user/login', (req, res) => {
    let currAttempt = req.body;
    let p1 = userData.find({username: currAttempt.username}).exec();
    let unhashedPass = currAttempt.password;
});