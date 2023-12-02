/**
 * Names: Billy Dolny, Ben Curtis, Bronson Housmans
 * Description:
 */

/**
 * Javascript for createPost
 */
function previewImg() {
    let uploadImg = document.getElementById('uploadImg');
    var files = uploadImg.files;
    if (files) {
        for (i = 0; i < files.length; i++) {
            let file = files[i];
            console.log(file);
            let current = document.getElementById("previewPhotos");
            let oldHTML = current.innerHTML;
            let newHTML = '<img id="file' + i + '" class="createPostImgs" src="' + URL.createObjectURL(file) + '" alt="Your Image"></img>';
            current.innerHTML = newHTML + oldHTML;
        }
    }
}

function removeImg() {
    //used to remove a previewed img from the list of files to upload for the post
}

function recomendedTags() {
    //used on load to serve a list of tags of users friends
}

function tagSearchUser() {
    let searchName = { name: document.getElementById('userTagSearch').value };
    fetch("/search/users", {
        method:'POST',
        body: JSON.stringify(searchName),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        return res.text();
    }).then((text) => {
        console.log(text);
        let usersObj = JSON.parse(text);
        let currKeys = Object.keys(usersObj);
        let htmlStr = '';
        for(let i = 0; i < 5; i++) {
            if (currKeys[i]) {
                let currKey = currKeys[i];
                let currName = '' + usersObj[currKey];
                htmlStr +=
                '<div class="userBox" onclick="addUserTag(' + usersObj.username + ')">' +
                    '<img class="inTextPfp" src="' + userObj.profilePic + '" alt="' + userObj.username + ' pfp" for="' + userObj.username + '">' + 
                    '<div class="username">' + usersObj.username + '</div>' + 
                '</div>'; 
            } else {
                htmlStr += '<div>...<div>';
                break;
            }
        }
        document.getElementById('userTagList').innerHTML = htmlStr;
    })
}

function addUserTag(username) {
    
}

function removeUserTag(username){
    let p = fetch("/", {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json'}
    });
    p.then((data) => {
        return data.text();
    }).then((text) => {
        if (text.startsWith('Success')) {
            redirectHome();
        } else {
            //window.location.href = '/index.html';
            document.getElementById('login_error').innerText = text;
        }
    });
    p.catch((err) => {
        console.log(err);
    });
}

function createPost() {

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
    fetch(`/get/posts`).then((res) => {
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

function addComment(){
    let username = document.getElementById("specificUsername").innerText;
    let caption = document.getElementById("specificCaption").innerText;
    caption = caption.replaceAll(" ", "+");
    let pic = document.getElementById("specificPic").alt;
    let newComment = document.getElementById("specificYourComment").value;
    newComment = newComment.replaceAll(" ", "+");

    fetch(`/add/comment/${username}/${caption}/${pic}/${newComment}`).then((res) => {
        return res.text();
    });
    redirectSpecific();
}

function redirectSpecific(){
    console.log("redirecting to specific");
    window.location.href = '/app/specificPost.html'
}

function specificPost() {
    // let username = Document.getElementById("specificUsername");
    // let caption = Document.getElementById("specificCaption");
    // caption = caption.replaceAll(" ", "+");
    // let pic = Document.getElementById("specificPic");
    let ausername = "billy";
    let acaption = "hello";
    let apic = "kirby.png";
    //Make comment be created with + instead of spaces 
    let proPic = null;
    var findUserBody = {name: ausername};
    fetch('/search/users', {
    method:'POST',
    body: JSON.stringify(findUserBody),
    headers: {'Content-Type': 'application/json'}
    }).then((res) => {
    return res.text();
    }).then((res) => {
        console.log(res);
        return JSON.parse(res);
    }).then((retObj) => {
        console.log(retObj);
        console.log(retObj[0].profilePic[0]);
        proPic = retObj[0].profilePic[0];
    
        console.log(`this is proPic: ${proPic}`);
        var specificPostBody = {caption: acaption, image: apic, username: ausername};
        fetch(`/search/post`, {
        method:'POST',
        body: JSON.stringify(specificPostBody),
        headers: {'Content-Type': 'application/json'}
        }).then((res) => {
            return res.text();
        }).then((res) => {
            return JSON.parse(res);
        }).then((retObj) => {
            let htmlStr = '';
            for(jsonObj of retObj) {
                console.log(jsonObj);

                // WILL NEED TO ADD USER INFO TO POST DATA
                // ALSO WILL PROB NEED LOOP TO SEE ALL COMMENTS.
                //MAKE ANOTHER FUNCTION TO CREATE THE SPECIFIC POST
                htmlStr = htmlStr + `<span><img id="specificProfilePic" src="./images/${proPic}" alt="profilePic">
                <div id="specificUsername">${jsonObj.username}</div></span>
                <center><img id="specificPic" src="./images/${jsonObj.image}" alt="${jsonObj.image}">
                <p id="specificCaption">${jsonObj.caption}</p><p>${jsonObj.likes} Likes and ${jsonObj.comments.length} Comments</p>`
                for (tag of jsonObj.tags){
                    htmlStr = htmlStr + `${tag} `
                }
                htmlStr.substring(0,htmlStr.length-2);
                htmlStr = htmlStr + `<br>`;
                console.log(jsonObj);
                htmlStr = htmlStr + "<p><strong>COMMENTS:</strong></p>"
                for(comment of jsonObj.comments) {
                    htmlStr = htmlStr + `${comment}`;
                }
                htmlStr = htmlStr + `<br>`;

                htmlStr = htmlStr + `<input type="text" placeholder="Type your comment here!" id="specificYourComment">
                <input type="button" value="Add Comment" id="specificCommentButt" onclick="addComment();"></center>`;
                htmlStr = htmlStr + `<br>`;
                console.log(jsonObj);
            }
            console.log(htmlStr)
            let content = document.getElementById('userContent')
            content.innerHTML = htmlStr;
        });
});
}




function fillUserPage() {
    
}

function searchPeople() {
    let currName = document.getElementById('userSearchFriend').value;
    currName = '' + currName;
    if(currName.length > 0) {
        fetch(`/search/users/${currName}`).then((res) => {
            return res.text()
        }).then((jsonStr) => {
            let jsonObj = JSON.parse(jsonStr);
            let namesList = jsonObj.names;
            let htmlStr = '';
            for(let i = 0; i < namesList.length; i++) {
                htmlStr = htmlStr + `<p><strong id='user${i}'>` + namesList[i] + `</strong></p>`
                + `<input type="button" value="Add ${namesList[i]} as a friend" id="userNameList${i}"
                name = "userNameList${i}" onclick="addFriend(${i})"><br>`
            }
            let results = document.getElementById('userSearchResults');
            results.innerHTML = htmlStr;
        });
    } else {
        let results = document.getElementById('userSearchResults');
        results.innerHTML = '';
    }
}

function addFriend(elementNum) {
    let friend2add = {friend: document.getElementById(`user${elementNum}`).innerText};
    fetch('/add/friend', {
        method:'POST',
        body: JSON.stringify(friend2add),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        let addButton = document.getElementById(`userNameList${elementNum}`);
        addButton.value = 'Added!';
    })
}

function seeFriends() {
    fetch('/view/friends').then((res) => {
        return res.text();
    }).then((jsonStr) => {
        let jsonObj = JSON.parse(jsonStr);
        let friendsList = jsonObj.people;
        let htmlStr = '<strong>Friends:</string><br>';
        for(let i = 0; i < friendsList.length; i++) {
            htmlStr = htmlStr + `<p><strong id='friend${i}'>` + friendsList[i] + `</strong></p>`
        }
        let display = document.getElementById('userListDisplay');
        display.innerHTML = htmlStr;
    })
}

function fillUserPage() {
    fetch('/get/userInfo').then((res) => {
        return res.text();
    }).then((jsonStr) => {
        let jsonObj = JSON.parse(jsonStr);
        let nameSpot = document.getElementById('userUsernameSpot')
        nameSpot.innerText = jsonObj.username;
        let bioSpot = document.getElementById('userBioSpot');
        bioSpot.innerText = jsonObj.bio;
    })
}

function openChangeBio() {
    let bioSpot = document.getElementById('userBioSpot')
    bioSpot.innerHTML = '<textarea id="userBio"></textarea>'
    let bioButton = document.getElementById('userButtonSpot')
    bioButton.innerHTML = `<input type="button" value="Click to confirm bio change" id="userChangeBio"
                    name="userChangeBio" onclick="closeChangeBio()">`
}

function closeChangeBio() {
    let newBioWords = document.getElementById('userBio').value
    let newBio = {bio: newBioWords};
    fetch('/new/bio', {
        method:'POST',
        body: JSON.stringify(newBio),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        let bioSpot = document.getElementById('userBioSpot')
        bioSpot.innerHTML = newBioWords;
        let bioButton = document.getElementById('userButtonSpot')
        bioButton.innerHTML = `<input type="button" value="Click to change bio" id="userChangeBio"
        name="userChangeBio" onclick="openChangeBio()">`
        location.reload();
    })
}