
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
    profilePic: [],
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

const multer = require('multer');
//const upload = multer({ dest: 'public_html/app/uploads'});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public_html/app/uploads');
  }, 
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})
var upload = multer({ storage: storage });

// app.use('/create/post', express.static('uploads'));

app.post('/create/post', upload.array('img'), (req, res) => {
  console.log("Entered Create Post");
  let data = req.body;
  let imgs = req.files;
  let paths = [];
  for (let i = 0; i < imgs.length; i++) {
    let currPath = imgs[i].path;
    currPath = currPath.replace("public_html\\app", ".");
    paths.push(currPath);
  }
  console.log(data);
  console.log(imgs);
  let newPost = new postData({
    username: data.username,
    image: paths,
    caption: data.caption,
    time: Date.now(),
    likes: 0,
    comments: [],
    tags: data.tagged,
  })
  newPost.save().then( (doc) => {
    console.log(doc);
    res.end("post created");
  }).catch( (err) => { 
    console.log(err);
    res.end('Failed to create new post.');
  });
})


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
      console.log(response[0].chats);
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

app.post(`/search/friend/posts`, (req, res) => {
  let friendlist = req.body.friends;
  console.log(friendlist);
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
      console.log(fullArr);
      res.end(JSON.stringify(fullArr));
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

app.get('/search/posts/:username/:caption/:image/:newComment', (req,res) => {
  let query = postData.find({caption:{$regex:req.params.caption}, image:{$regex:req.params.image}, username:{$regex:req.params.username}}).exec();
  query.then((results) => {
    let post = results[0];
    let allComments = post.comments;
    allComments.push(req.params.newComment);
      const formattedJSON = JSON.stringify(results, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.end(formattedJSON);
  })
});

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
})

app.get(`/find/your/user`, (req, res) => {
  let name = req.cookies.login.username;
  let query1 = userData.find({username:name}).exec();
  query1.then((person) => {
    let curUser = person[0];
    console.log(curUser)
    res.end(JSON.stringify(curUser));
  })
});



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

app.get('/view/friends', (req, res) => {
  let currUser = req.cookies.login.username;
  let query = userData.find({username:currUser}).exec();
  query.then((person) => {
    let retObj = {people:person[0].friends};
    res.end(JSON.stringify(retObj));
  })
})

app.get('/get/userInfo', (req, res) => {
  let currUser = req.cookies.login.username;
  let query = userData.find({username:currUser}).exec();
  query.then((user) => {
    let userInfo = user[0];
    // WILL NEED TO COME BACK AND SEND PROFILE PIC TOO
    let retObj = {username: userInfo.username, bio: userInfo.bio}
    res.end(JSON.stringify(retObj));
  })
})

app.get('/get/viewUserInfo/:name', (req, res) => {
  let findName = req.params.name;
  let query = userData.find({username:findName}).exec();
  query.then((user) => {
    let userInfo = user[0];
    // WILL NEED TO COME BACK AND SEND PROFILE PIC TOO
    let retObj = {username: userInfo.username, bio: userInfo.bio}
    res.end(JSON.stringify(retObj));
  })
})

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
})
app.get('/get/posts', (req,res) => {
  let items = itemData.find({}).exec();
  items.then((results) => {
      const formattedJSON = JSON.stringify(results, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.end(formattedJSON);
  });
});
app.get('/add/comment/:username/:caption/:image/:newComment', (req,res) => {
  let mainName = req.cookies.login.username;
  let query = postData.find({caption:{$regex:req.params.caption}, image:{$regex:req.params.image}, username:{$regex:req.params.username}}).exec();
  console.log("ADD COMMENT SECTION");
  console.log(query);
  query.then((results) => {
    console.log(results);
    let post = results[0];
    console.log(post);
    let allComments = post.comments;
    let com = req.params.newComment.replaceAll("+", " ");
    let newCom = `<strong>${mainName}:</strong> ${com}`;
    allComments.push(` <div id="specificComments">${newCom}</div>`);
    post.comments = allComments;
    post.save()
    .then(() => {
    const formattedJSON = JSON.stringify(post, null, 2);
    console.log(formattedJSON);
      res.setHeader('Content-Type', 'application/json');
      res.end(formattedJSON);
    });
  })

});

app.post('/search/post', (req,res) => {
  console.log(`caption: ${req.body.caption}`);
  console.log(`image: ${req.body.image}`);
  console.log(`username: ${req.body.username}`);
  let query = postData.find({caption:{$regex:req.body.caption}, image:{$regex:req.body.image}, username:{$regex:req.body.username}}).exec();
  query.then((results) => {
    let post = results[0];
      const formattedJSON = JSON.stringify(results, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.end(formattedJSON);
  })
});

app.post('/add/like', (req,res) => {
  console.log(`caption: ${req.body.caption}`);
  console.log(`image: ${req.body.image}`);
  console.log(`username: ${req.body.username}`);
  let query = postData.find({caption:{$regex:req.body.caption}, image:{$regex:req.body.image}, username:{$regex:req.body.username}}).exec();
  query.then((results) => {
    let post = results[0];
    post.likes = post.likes+1;
    post.save()
    console.log(post);
      const formattedJSON = JSON.stringify(results, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.end(formattedJSON);
  })
});

app.listen(port, () => { console.log('server has started: http://127.0.0.1:3000/'); });