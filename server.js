/**
    Name: Bronson Housmans, Billy Dolny, and Ben Curtis
    Project: InstaSham
    Server file for the project that connects with the database and allows for saving imgs
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
    profilePic: String,
    password: String,
    salt: String,
    bio: String,
    friends: [],
    directMessages: []
});
var userData = mongoose.model('userData', usernameSchema);

var postSchema = new mongoose.Schema({
    username: String,
    image: [],
    caption: String,
    comments: [],
    tags: [],
    time: Number,
    likes: []
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
    /**
     * Checks to see if a user exists, if not creates a new user salting and hashing their
     * password before sending to the database. Default profile pic and bio are filled in for the
     * user
     */

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
          profilePic: ".\\images\\blankPic.png",
          password: newHash,
          salt: newSalt,
          friends: [],
          bio: "Fill in bio"
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
/**
 * checks login to see if it is a match with any user in the database using salt and hash.
 */
app.post('/user/login', (req, res) => {
    let u = req.body.username;
    let p1 = userData.find({username: u}).exec();
    p1.then( (results) => {
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



//setting up multer
const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public_html/app/uploads');
  }, 
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})
var upload = multer({ storage: storage });

/**
 * creates a post for the user after uploading all of their imgs. Saves the location of the imgs
 * in order to set as the src of img later. 
 */
app.post('/create/post', upload.array('img'), (req, res) => {
  
  let data = req.body;
  let imgs = req.files;
  let paths = [];
  for (let i = 0; i < imgs.length; i++) {
    let currPath = imgs[i].path;
    // changes path to be better suited for src
    currPath = currPath.replace("public_html/app", ".");
    currPath = currPath.replace("public_html\\app", ".");
    paths.push(currPath);
  }
  let newPost = new postData({
    username: data.username,
    image: paths,
    caption: data.caption,
    time: Date.now(),
    likes: [],
    comments: [],
    tags: data.tagged,
  })
  newPost.save().then( (doc) => {
    res.end("post created");
  }).catch( (err) => { 
    console.log(err);
    res.end('Failed to create new post.');
  });
})

// search users, used for finding for tags
app.post('/search/users', (req,res) => {
  let username = req.body.name;
  let p1 = userData.find({username: {$regex: username}}).exec();
  p1.then((usersFound) => {
    res.end(JSON.stringify(usersFound));
  })
});

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
      let resObj = {chats: response[0].chats};
      res.end(JSON.stringify(resObj));
    } else {
      let comboNames = user1 + user2 + user2 + user1;
      let chatObj = {chatName: comboNames, chats: []};
      let chatObj1 = {chatName: user2};
      let chatObj2 = {chatName: user1};
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
app.post('/dms/post', (req, res) => {
  let user1 = req.body.user1;
  let text = req.body.message;
  let user2 = req.cookies.login.username;
  let names = user1 + user2;
  let query = dmData.find({chatName: {$regex: names}})
  query.then((item) => {
    let currdmData = item[0];
    let toSend = new messageData({
      alias: user2,
      message: text
    });
    toSend.save();
    let dmList = currdmData.chats;
    dmList.push(toSend);
    currdmData.save();
    res.end();
  })
})
/**
 * saves the img passed for a new profile pic, then updates the user schema for the new pictire
 */
app.post("/updateProfPic", upload.single('img'), (req, res) => {
    let username = req.cookies.login.username;
    let newPic = req.file;

    let path;
    
    let currPath = newPic.path;
    // changes path before saving in order to work better for src
    currPath = currPath.replace("public_html/app", ".");
    currPath = currPath.replace("public_html\\app", ".");
    path = currPath;
    let findUser = userData.findOne({ username: username })
    findUser.then((user) => {
      user.profilePic = path;
      user.save();
    }).then(() => {
      res.end("updated");
    }).catch((err) => {
      console.log(err);
      res.end("err");
    })
})
// searches through posts with the regex of the users friends
app.post(`/search/friend/posts`, (req, res) => {
  let friendlist = req.body.friends;
  let fullArr = [];
  
  Promise.all(
    friendlist.map((friend) => {
      return postData.find({ username: { $regex: friend } });
    })
  )
    .then((results) => {
      // results is an array of items from each query
      fullArr = fullArr.concat(...results);
      // shuffle(fullArr);
      res.end(JSON.stringify(fullArr));
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

//adds a comment to the post and updates database
app.post('/add/comment', (req,res) => {
  sender = req.body.persons;
  let query = postData.find({caption:{$regex:req.body.caption}, image:req.body.image, username:{$regex:req.body.username}}).exec();
  query.then((results) => {
    let post = results[0];
    let allComments = post.comments;

    allComments.push(`<strong>${sender}: </strong>${req.body.newCom}<br>`);
    post.save();
      const formattedJSON = JSON.stringify(results[0], null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.end(formattedJSON);
  })
});

//searches through users
app.get('/search/users/:currName', (req, res) => {
  let query = userData.find({username: {$regex: req.params.currName}}).exec();
  let namesList = [];
  query.then((names) => {
    for(let i = 0; i < names.length; i++) {
      namesList.push(names[i].username);
    }
  })
  let query2 = userData.find({username: req.cookies.login.username})
  query2.then((user) => {
    let fList = user[0].friends;
    let nameSet = new Set(namesList);
    for(let i = 0; i < fList.length; i++) {
      if(nameSet.has(fList[i])) {
          namesList = namesList.filter(function (name) {
          return name != fList[i];
        });
      }
    }
    let retObj = { names: namesList };
    res.end(JSON.stringify(retObj));
  })
});

// finds users
app.get(`/find/your/user`, (req, res) => {
  let name = req.cookies.login.username;
  let query1 = userData.find({username:name}).exec();
  query1.then((person) => {
    let curUser = person[0];
    res.end(JSON.stringify(curUser));
  })
});

// adds friend to users database then saves
app.post('/add/friend', (req, res) => {
  let user2 = req.body.friend;
  let user1 = req.cookies.login.username;
  let query1 = userData.find({username:user1}).exec();
  query1.then((person) => {
    let currUser = person[0];
    let friendsList = currUser.friends;
    friendsList.push(user2);
    currUser.save();
    res.end()
  })
});

// gets users friends from the schema
app.get('/view/friends', (req, res) => {
  let currUser = req.cookies.login.username;
  let query = userData.find({username:currUser}).exec();
  query.then((person) => {
    let retObj = {people:person[0].friends};
    res.end(JSON.stringify(retObj));
  })
});

// gets users name, bio, and profile picture
app.get('/get/userInfo', (req, res) => {
  let currUser = req.cookies.login.username;
  let query = userData.find({username:currUser}).exec();
  query.then((user) => {
    let userInfo = user[0];
    let retObj = {username: userInfo.username, bio: userInfo.bio, profilePic: userInfo.profilePic}
    res.end(JSON.stringify(retObj));
  })
});

// gets user info for viewing
app.get('/get/viewUserInfo/:name', (req, res) => {
  let findName = req.params.name;
  let query = userData.find({username:findName}).exec();
  query.then((user) => {
    let userInfo = user[0];
    // WILL NEED TO COME BACK AND SEND PROFILE PIC TOO
    let retObj = {username: userInfo.username, bio: userInfo.bio, profilePic: userInfo.profilePic}
    res.end(JSON.stringify(retObj));
  })
});

// upates bio for the user and saves to db
app.post('/new/bio', (req, res) => {
  let newBio = req.body.bio;
  let currUser = req.cookies.login.username;
  let query = userData.find({username:currUser});
  query.then((user) => {
    let currPerson = user[0];
    currPerson.bio = newBio;
    currPerson.save();
    res.end();
  })
});

// gets the posts a user has created
app.get('/get/posts', (req,res) => {
  let items = postData.find({}).exec();
  items.then((results) => {
      const formattedJSON = JSON.stringify(results, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.end(formattedJSON);
  });
});

// searches through the post database for a specific post
app.post('/search/post', (req,res) => {
  let query = postData.find({caption:{$regex:req.body.caption}, image:req.body.image, username:{$regex:req.body.username}}).exec();
  query.then((results) => {
    let post = results[0];
      const formattedJSON = JSON.stringify(results, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.end(formattedJSON);
  })
});

// adds a like and saves post to database
app.post('/add/like', (req,res) => {
  myUser = req.cookies.login.username;
  
  let query = postData.find({caption:{$regex:req.body.caption}, image:req.body.image, username:{$regex:req.body.username}}).exec();
  query.then((results) => {
    let post = results[0];
    if (post.likes.includes(myUser)){
      const index = post.likes.indexOf(myUser);
      post.likes.splice(index, 1);
    } else {
      post.likes.push(myUser);
    }
    post.save()
      const formattedJSON = JSON.stringify(results, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.end(formattedJSON);
  })
});

// searches for user that is logged in with cookies
app.get('/search/own/user', (req, res) => {
  let currUser = req.cookies.login.username;
  let posts = postData.find({username: currUser}).exec();
  posts.then((postsItems) => {
      const formattedJSON = JSON.stringify(postsItems, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.end(formattedJSON);
  })

})

// searches through posts to find posts made by a user
app.get('/search/user/posts/:name', (req, res) => {
  let viewUser = req.params.name;
  let posts = postData.find({username: viewUser}).exec();
  posts.then((postsItems) => {
      const formattedJSON = JSON.stringify(postsItems, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.end(formattedJSON);
  });
});

app.listen(port, () => { console.log('server has started'); });