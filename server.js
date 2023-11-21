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

var dmSchema = new mongoose.Schema({
  chatName: String,
  chats: []
});
var dmData = mongoose.model('dmData', dmSchema);

var messageSchema = new mongoose.Schema({
    alias: String,
    message: String
});
var messageData = mongoose.model('messageData', messageSchema);

// creating an account
app.post('/user/create', (req, res) => {
    let p1 = userData.find({username: req.body.username}).exec();
    p1.then( (results) => { 
      if (results.length > 0) {
        res.end('That username is already taken.');
      } else {

        let newSalt = Math.floor((Math.random() * 1000000));
        let toHash = req.body.password + newSalt;
        var hash = crypto.createHash('sha3-256');
        let data = hash.update(toHash, 'utf-8');
        let newHash = data.digest('hex');
  
        var newUser = new userData({ 
          username: req.body.username,
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
    let usersFound = {};
    for(let i = 0; i < response.length; i++) {
      usersFound['username'+i] = response[i].username;
    }
    res.end(JSON.stringify(usersFound));
  })
});

// opening a message between users
app.post('/dm', (req,res) => {
  let user2 = req.body.name;
  let user1 = req.cookies.login.username;
  let names = user1 + user2;
  let p1 = dmData.find({chatName: {$regex: names}}).exec();
  p1.then((response) => {
    if(response.length > 0) {
      console.log(response[0].chats);
      let resObj = {chats: response[0].chats};
      res.end(JSON.stringify(resObj));
    } else {
      let comboNames = user1 + user2 + user2 + user1;
      let chatObj = {chatName: comboNames, chats: []};
      let chatObj1 = {chatName: user2, chats: []};
      let chatObj2 = {chatName: user1, chats: []};
      let newChat = new dmData(chatObj);
      newChat.save()
      .then(() => {
        let query1 = userData.find({username: user1})
        query1.then((resOne) => {
          let user = resOne[0];
          let messages1 = user.directMessages;
          messages1.push(chatObj1)
          user.save();
        })
        let query2 = userData.find({username: user2})
        query2.then((resTwo) => {
          let user = resTwo[0];
          let messages2 = user.directMessages;
          messages2.push(chatObj2)
          user.save();
          res.end("To" + user.username);
        })
      })
    }
  })
})

app.get('/user/dms', (req, res) => {
  let currUser = req.cookies.login.username;
  let p1 = userData.find({username: currUser}).exec()
  p1.then((users) => {
    let user = users[0];
    let messages = {dms: user.directMessages}
    res.end(JSON.stringify(messages));
  })
})
app.post('/add/item', (req,res) => {
  let pTitle = req.body.title;
  let pDesc = req.body.description;
  let pImg = req.body.image;
  let pTags = req.body.tags;
  let pUser = req.cookies.login.username;
  let itemObj = {title: pTitle, description: pDesc, image: pImg, tags: pTags};
      let item = new itemData(itemObj);
      item.save()
          .then(() => {
              console.log(item); // You can log the saved message here
              let query = userData.find({username:{$regex:pUser}}).exec();
              query.then((documents) => {
                  let user = documents[0];
                  console.log(user);
                  let list = user.listings
                  list.push(itemObj);
                  console.log(user);
                  user.save();
                  res.end("Successful");
              });
          })
          .catch((error) => {
              console.error("Error saving message:", error);
              res.status(500).end("Error saving message.");
          });
});

app.get('/get/items', (req,res) => {
  let items = itemData.find({}).exec();
  items.then((results) => {
      const formattedJSON = JSON.stringify(results, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.end(formattedJSON);
  });
});

// searches for messages between users
app.get('/dms/load/:name', (req, res) => {
  let user1 = req.params.name;
  let user2 = req.cookies.login.username;
  let names = user1 + user2;
  let query = dmData.find({chatName: {$regex: names}});
  query.then((item) => {
    let chatObj = item[0];
    let retObj = {chatList: chatObj.chats};
    res.end(JSON.stringify(retObj));
  })
})


//handles creation of new DM between users


app.listen(port, () => { console.log('server has started'); });