/**
 * Names: Billy Dolny, Ben Curtis, Bronson Housmans
 * Description:
 */

/**
 * Javascript for createPost
 */

var formData = new FormData();
var j = 0;

function previewImg() {
    let uploadImg = document.getElementById('uploadImgs');
    var files = uploadImg.files;
    if (files) {
        for (i = 0; i < files.length; i++) {
            let file = files[i];
            console.log(file);
            j += 1;
            formData.append('img', file);
            let current = document.getElementById("previewPhotos");
            let oldHTML = current.innerHTML;
            let newHTML = '<img id="file' + i + '" class="createPostImgs" src="' + URL.createObjectURL(file) + '" alt="Your Image"></img>';
            current.innerHTML = newHTML + oldHTML;
        }
        document.getElementById('uploadImgImg').remove();
        document.getElementById('labels').setAttribute("class", "invis");
    }
}

let taggedUsers = [];

function tagSearchUser() {
    console.log("running");
    let searchName = { name: document.getElementById('userTagSearch').value };
    fetch("/search/users", {
        method:'POST',
        body: JSON.stringify(searchName),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        return res.text();
    }).then((text) => {
        let usersObj = JSON.parse(text);
        let htmlStr = '';
        let numSearch = 5;
        for(let i = 0; i < numSearch; i++) {
            let skip = false;
            if (usersObj[i]) {
                for (let j = 0; j < taggedUsers.length; j++) {
                    console.log(taggedUsers);
                    console.log(taggedUsers[j]);
                    if (usersObj[i].username == taggedUsers[j]) {
                        numSearch += 1;
                        skip = true;
                        break;
                    }
                }
                console.log(skip);
                if (skip == false) {
                    htmlStr +=
                        '<div class="userBox" id="' + usersObj[i].username + 'ToTag" onclick="addUserTag(\'' + usersObj[i].username + '\')">' +
                            '<img class="inTextPfp" src="' + usersObj[i].profilePic + '" alt="' + usersObj[i].username + ' pfp" for="' + usersObj[i].username + '">' + 
                            '<div class="username">' + usersObj[i].username + '</div>' + 
                        '</div>';
                }
            } else {
                htmlStr += '<div>...<div>';
                break;
            }
        }
        document.getElementById('userTagList').innerHTML = htmlStr;
    })
}

function addUserTag(username) {
    taggedUsers.push(username);
    let oldHTML = document.getElementById(username + "ToTag").innerHTML;
    console.log(oldHTML);
    document.getElementById(username + "ToTag").remove();
    let htmlStr =
        '<div class="userBox" id="' + username + 'Tagged" onclick="removeUserTag(\'' + username + '\')">' +
            oldHTML +
        '</div>'; 
    document.getElementById('taggedUsers').innerHTML += htmlStr;
    console.log(document.getElementById('taggedUsers'));
    if (document.getElementById('createTagStart')) {
        document.getElementById('createTagStart').remove();
    }
    tagSearchUser();
}

function removeUserTag(username) {
    taggedUsers.splice(taggedUsers.indexOf(username), 1);
    document.getElementById(username + "Tagged").remove();
    tagSearchUser();
}

var uploadForm = document.getElementById("uploadForm");

uploadForm.addEventListener("submit", createPost);

function createPost(e) {
    console.log("Entered Create Post");
    e.preventDefault();
    formData.append('username', "temp");
    let files = document.getElementById("uploadImgs");
    console.log(files.files);
    for (let i = 0; i < files.files.length; i++) {
        console.log(files.files[i]);
        formData.append('img', files.files[i]);
    }
    formData.append('caption', document.getElementById("createCaption").value);
    for (let i = 0; i < taggedUsers.length; i++) {
        formData.append('tagged', taggedUsers[i]);
    }
    for (var key of formData.entries()) {
        console.log(key[0] + ', ' + key[1]);
    }
    fetch("/create/post", {
        method:'POST',
        body: formData
    }).then((res) => {
        console.log(res.text());
    })
}

/**
 * Javascript for _
 */
function searchFriends() {
    let searchName = { name: document.getElementById('dmHomeSearch').value };
    fetch('/find/friends', {
        method:'POST',
        body: JSON.stringify(searchName),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        return res.text();
    }).then((text) => {
        let usersObj = JSON.parse(text);
        let currKeys = Object.keys(usersObj);
        let htmlStr = '';
        for(let i = 0; i < currKeys.length; i++) {
            let currKey = currKeys[i];
            let currName = '' + usersObj[currKey];
            htmlStr = htmlStr + '<p>' + currName + '</p>' + 
            `<input type='button' name='dmHomeNewMessage${i}' id='dmHomeNewMessage${i}'
            onclick='startMessage("${currName}")' value='Send Message'><br>`; 
        }
        let found = document.getElementById('dmHomeFriendsFound');
        found.innerHTML = htmlStr;
    })
}

function startMessage(userToMessage) {
    console.log(userToMessage);
    let otherName = { name: userToMessage };
    fetch('/dm', {
        method:'POST',
        body: JSON.stringify(otherName),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        location.reload();
    });
}

function addItem() {
    let item = {
        description: document.getElementById('createCaption').value,
        image: document.getElementById('previewPhotos').value,
        tags: document.getElementById('tags').value,
        likes: 0,
        comments : null, 
    }
    fetch(`/add/item`, {
        method: 'POST',
        body: JSON.stringify(item),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        window.location.href = '/home.html';
        return res.text();
    }).then((text) => {
        window.location.href = '/home.html';
        return;
    }).catch((err) => {
        console.log(err);
    });
}

function getPosts() {
    fetch(`/get/items`).then((res) => {
        return res.text();
    }).then((res) => {
        return JSON.parse(res);
    }).then((retObj) => {
        let htmlStr = '';
        let buttonIndex = 0;
        for(jsonObj of retObj) {
            htmlStr = htmlStr + `<div class='allPosts'><p id='title${buttonIndex}'>${jsonObj.username}</p><p>
            ${jsonObj.image}</p><p>${jsonObj.description}</p><p>${jsonObj.likes} Likes and ${jsonObj.comments} Comments</p>`;
            console.log(jsonObj);
            htmlStr = htmlStr + `<input type='button' id='buyButton name='buyButton' value='View Post' onclick='buyNow(${buttonIndex})'></div>`;
            buttonIndex++;
        }
        console.log(htmlStr)
        let content = document.getElementById('userContent')
        content.innerHTML = htmlStr;
    })
}

function openMessage(elementNum) {
    let encodeStr = document.getElementById(`dmHomeOpenButton${elementNum}`).value;
    let splitEncode = encodeStr.split(' ');
    let otherUser = splitEncode[3];
    window.location.href = '/app/dmSpecific.html?' + encodeURIComponent(otherUser);
}

function provideDMs() {
    console.log('about to fetch');
    fetch('/user/dms').then((res) => {
        return res.text();
    }).then((jsonStr) => {
        let jsonObj = JSON.parse(jsonStr);
        let dmList = jsonObj.dms;
        let htmlStr = '';
        for(let i = 0; i < dmList.length; i++) {
            htmlStr = htmlStr + `<p><strong>` + dmList[i].chatName + `</strong></p>`
            + `<input type="button" value="Open messages with ${dmList[i].chatName}" id="dmHomeOpenButton${i}"
            name = "dmHomeOpenButton${i}" onclick="openMessage(${i})"><br>`
        }
        let content = document.getElementById('dmHomeExistingMessages');
        content.innerHTML = htmlStr;
    })
}

function refreshDMs() {
    setInterval(loadDMPage, 2000);
}

function loadDMPage() {
    var specificFriend = document.getElementById('dmSpecificFriend');
    var urlParam = new URLSearchParams(window.location.search);
    urlParam = '' + urlParam;
    urlParam = urlParam.substring(0, urlParam.length-1);
    specificFriend.innerText = urlParam;
    fetch(`/dms/load/${urlParam}`).then((res) => {
        return res.text();
    }).then((jsonStr) => {
        let jsonObj = JSON.parse(jsonStr);
        let messageChats = jsonObj.chatList;
        let htmlStr = '';
        for(let i = 0; i < messageChats.length; i++) {
            htmlStr = htmlStr + `<p><strong>` + messageChats[i].alias + `: </strong>` +
            messageChats[i].message + `</p>`
        }
        let dmSpecificContent = document.getElementById('dmSpecificMessages');
        dmSpecificContent.innerHTML = htmlStr;
    })
}

function sendDM() {
    var dmBody = {user1: document.getElementById('dmSpecificFriend').innerText,
                message: document.getElementById('dmSpecificInputMessage').value};
    fetch('/dms/post', {
        method:'POST',
        body: JSON.stringify(dmBody),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        loadDMPage();
        return res.text();
    });
}

function addComment() {
    let comment = Document.getElementById("specificCommentButt");
    let username = Document.getElementById("specificUsername");
    let caption = Document.getElementById("specificCaption");
    let pic = Document.getElementById("specificPic");
    //Make comment be created with + instead of spaces 
    fetch(`/search/posts/${username}/${caption}/${pic}/${newComment}`).then((res) => {
        return res.text();
    })

}