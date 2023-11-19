/**
 * Names: Billy Dolny, Ben Curtis, Bronson Housmans
 * Description:
 */

const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const parser = require('body-parser');
const app = express();
const port = 3000;
const cm = require('./customsessions');

cm.sessions.startCleanup();

app.use(cookieParser());
app.use(express.json());
app.use(parser.json());

app.use(express.static('public_html'))

// Sets up the mongoose database
const db  = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/instaSham';
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var usernameSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    friends: [],
    directMessages: []
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
    alias: String,
    message: String
});
var messageData = mongoose.model('messageData', messageSchema);

// creating an account
app.get('/user/create/:username/:password', (req, res) => {
    let p1 = userData.find({username: req.params.username}).exec();
    p1.then( (results) => { 
      if (results.length > 0) {
        res.end('That username is already taken.');
      } else {
  
        let newSalt = Math.floor((Math.random() * 1000000));
        let toHash = req.params.password + newSalt;
        var hash = crypto.createHash('sha3-256');
        let data = hash.update(toHash, 'utf-8');
        let newHash = data.digest('hex');
  
        var newUser = new userData({ 
          username: req.params.username,
          password: newHash,
          salt: newSalt,
          friends: []
        });
        newUser.save().then( (doc) => { 
            res.end('Created new account!');
          }).catch( (err) => { 
            console.log(err);
            res.end('Failed to create new account.');
          });
      }
    });
    p1.catch( (error) => {
      res.end('Failed to create new account.');
    });
  });

// logging in to an existing account
app.post('/user/login', (req, res) => {
    let u = req.body.username;
    let p1 = userData.find({username: u}).exec();
    p1.then( (results) => {
        console.log(results);
        for(let i = 0; i < results.length; i++) {
    
          let existingSalt = results[i].salt;
          let toHash = req.body.password + existingSalt;
          var hash = crypto.createHash('sha3-256');
          let data = hash.update(toHash, 'utf-8');
          let newHash = data.digest('hex');
          
          if (newHash == results[i].password) {
            let id = cm.sessions.addOrUpdateSession(u);
            res.cookie("login", {username: u, sid: id}, {maxAge: 60000*60*24});
            res.end('Successful');
            return;
          } 
        } 
        res.end('login failed');
      });
      p1.catch( (error) => {
        res.end('login failed');
      });
});

/*
Testing multer to add img
*/

//const multer = require('multer');
//const upload = multer({dest: 'public_html/app/uploads/images'});
/** 
app.post('/upload', upload.single('photo'), (req, res) => {
  if(req.file) {
    res.json(req.file);
  } else {
    throw 'error';
  }
})
*/

// searches users for match with input string
app.post('/find/friends', (req,res) => {
  let currName = req.body.name;
  let p1 = userData.find({username: {$regex: currName}}).exec();
  p1.then((response) => {
    console.log(response);
    let usersFound = {};
    for(let i = 0; i < response.length; i++) {
      usersFound['username'+i] = response[i].username;
    }
    res.end(JSON.stringify(usersFound));
  })
})

//handles creation of new DM between users


app.listen(port, () => { console.log('server has started'); });