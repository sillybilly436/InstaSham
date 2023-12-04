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

function likeSpecific(){
    let likeCom = document.getElementById(`likeCom`);
    let postbody = {
        username: document.getElementById(`specificUsername`).innerText,
        caption: document.getElementById(`specificCaption`).innerText,
        image: document.getElementById(`specificPic`).alt,
        };
    fetch(`/add/like`, {
            method: 'POST',
            body: JSON.stringify(postbody),
            headers: { 'Content-Type': 'application/json'}
        }).then((res) => {
            return res.text();
        }).then((result) => {
            console.log(result);
            return JSON.parse(result);
        }).then((retObj) => {
            console.log(likeCom);
            likeCom.innerText = `${retObj[0].likes} Likes and ${retObj[0].comments.length} Comments`

        });


}

function likePost(index){
    let likeCom = document.getElementById(`homeLikeCom${index}`)
    let postbody = {
        username: document.getElementById(`homeName${index}`).innerText,
        caption: document.getElementById(`homeCaption${index}`).innerText,
        image: document.getElementById(`postPic${index}`).alt,
        };
    fetch(`/add/like`, {
            method: 'POST',
            body: JSON.stringify(postbody),
            headers: { 'Content-Type': 'application/json'}
        }).then((res) => {
            return res.text();
        }).then((result) => {
            console.log(result);
            return JSON.parse(result);
        }).then((retObj) => {
            console.log(likeCom);
            likeCom.innerText = `${retObj[0].likes} Likes and ${retObj[0].comments.length} Comments`

        });
}

function homefeed(){
    let username = null;
    let proPic = null;
    let friendList = null;
    fetch('/find/your/user').then((res) => {
    return res.text();
    }).then((res) => {
        console.log(res);
        return JSON.parse(res);
    }).then((retObj) => {
        console.log(retObj);
        username = retObj.username;
        proPic = retObj.profilePic[0];
        friendList = retObj.friends;
        
        homefeedbody = {friends: friendList};
        console.log(`this is proPic: ${proPic}`);
        fetch(`/search/friend/posts`, {
        method:'POST',
        body: JSON.stringify(homefeedbody),
        headers: {'Content-Type': 'application/json'}
        }).then((res) => {
            return res.text();
        }).then((res) => {
            return JSON.parse(res);
        }).then((retObj) => {
            let htmlStr = '';
            htmlStr = htmlStr + `<span><img id="homeProfilePic" src="./images/${proPic}" alt="profilePic">`;
            htmlStr = htmlStr + `<p id="homeUsername">${username}</p>`
            console.log(retObj);
            let index = 0;
            for(jsonObj of retObj) {
                console.log(jsonObj);
                friendProPic = null;
                friendbody = {name: jsonObj.username};
                fetch(`/search/users`, {
                    method:'POST',
                    body: JSON.stringify(friendbody),
                    headers: {'Content-Type': 'application/json'}
                    }).then((res) => {
                        return res.text();
                    }).then((results) => {
                        console.log(results);
                        return JSON.parse(results);
                    }).then((frienduser) =>{
                        friendProPic = frienduser[0].profilePic[0];
                        console.log(friendProPic);
                        let img = document.getElementById(`homeProfilePic${index}`);
                        img.src = `./images/${friendProPic}`;
                    });

                
                htmlStr = htmlStr + `<center> <span><img class="homeProPic" id="homeProfilePic${index}" src="./images/${friendProPic}" alt="${friendProPic}"><span id="homeName${index}">${jsonObj.username}</span></span>
                <div><img id="postPic${index}" src="./images/${jsonObj.image}" alt="${jsonObj.image}"></div>
                <p id="homeCaption${index}">${jsonObj.caption}</p><p id="homeLikeCom${index}">${jsonObj.likes} Likes and ${jsonObj.comments.length} Comments</p>`
                //Add buttons for likes and specific posts
                htmlStr = htmlStr + `<input type="button" value="Like" class="homeCommentButt" onclick="likePost(${index});">`
                htmlStr = htmlStr + `<input type="button" value="See Post" class="homeCommentButt" onclick="redirectSpecific(${index});">`

            
                console.log(jsonObj);                
                // Iterate to ony have like 2 show
                for(var i = 0; i < 2; i++) {
                    var comments = jsonObj.comments;
                    htmlStr = htmlStr + `${comments[i]}`;
                }
                htmlStr = htmlStr + `<br>`;
            }
            console.log(htmlStr)
            let content = document.getElementById('homeContent')
            content.innerHTML = htmlStr;
        });
});
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
    let allCom = document.getElementById("allComments");
    let likeCom = document.getElementById("likeCom");
    console.log(allCom);
    caption = caption.replaceAll(" ", "+");
    let pic = document.getElementById("specificPic").alt;
    let newComment = document.getElementById("specificYourComment").value;
    newComment = newComment.replaceAll(" ", "+");
    fetch(`/add/comment/${username}/${caption}/${pic}/${newComment}`).then((res) => {
        return res.text();
    }).then((res) => {
        console.log(res);
        return JSON.parse(res);
    }).then((retObj) => {
        let coms = retObj.comments
        console.log(coms);
        htmlStr = ``;
        for (com of coms){
            console.log(com);
            htmlStr = htmlStr + `${com}`;
        }
        console.log(htmlStr);
        allCom.innerHTML = htmlStr;
        likeCom.innerText = `${retObj.likes} Likes and ${retObj.comments.length} Comments`;
        console.log(allCom);
    });

    
}


function redirectSpecific(index){
    console.log("redirecting to specific");
    ausername = document.getElementById(`homeName${index}`).innerText;
    acaption = document.getElementById(`homeCaption${index}`).innerText;
    apic = document.getElementById(`postPic${index}`).alt;
    window.location.href = `/app/specificPost.html?username=${encodeURIComponent(ausername)}&caption=${encodeURIComponent(acaption)}&pic=${encodeURIComponent(apic)}&index=${encodeURIComponent(index)}`;
}

function specificPost() {
    const params = new URLSearchParams(window.location.search);
    const ausername = params.get('username');
    const acaption = params.get('caption');
    const apic = params.get('pic');
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
                <p id="specificCaption">${jsonObj.caption}</p><p id="likeCom">${jsonObj.likes} Likes and ${jsonObj.comments.length} Comments</p>
                <input type="button" value="Like!" id="specificLikeButt" onclick="likeSpecific();">`
                for (tag of jsonObj.tags){
                    htmlStr = htmlStr + `${tag} `
                }
                htmlStr.substring(0,htmlStr.length-2);
                htmlStr = htmlStr + `<br>`;
                console.log(jsonObj);
                htmlStr = htmlStr + `<p><strong>COMMENTS:</strong></p><div id="allComments">`
                for(comment of jsonObj.comments) {
                    htmlStr = htmlStr + `${comment}`;
                }
                htmlStr = htmlStr + `</div><br>`;

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
        let htmlStr = '<strong>Friends:</string><br><br>';
        for(let i = 0; i < friendsList.length; i++) {
            htmlStr = htmlStr + `<a href="/app/user.html" id="friend${i}" onclick="openNewUserPage(${i})">` + friendsList[i] + `</a><br><br>`
        }
        let display = document.getElementById('userListDisplay');
        display.innerHTML = htmlStr;
    })
}

function openNewUserPage(elementNum) {
    let nextPageUser = document.getElementById(`friend${elementNum}`).innerHTML;
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