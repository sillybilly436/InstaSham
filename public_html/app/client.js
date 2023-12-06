/**
 * Names: Billy Dolny, Ben Curtis, Bronson Housmans
 * Description: Code for the final project that adds functionality to the client
 * side. Sends requests and receives information from the server.
 */

/**
 * Javascript for createPost
 */

var selectedImgs = [];

var j = 0;

function previewImg() {
    /**
     * Allows the user to preview the image that is being uploaded.
     */
    let uploadImg = document.getElementById('uploadImgs');
    var files = uploadImg.files;
    if (files) {
        for (i = 0; i < files.length; i++) {
            let file = files[i];
            j += 1;
            selectedImgs.push(file);
            let current = document.getElementById("previewPhotos");
            let oldHTML = current.innerHTML;
            let newHTML = '<img onclick="removeImg(\'' + file.name + '\')" id="' + file.name + '" class="createPostImgs toRemove" src="' + URL.createObjectURL(file) + '" alt="Your Image"></img>';
            current.innerHTML = newHTML + oldHTML;
        }
        // document.getElementById('uploadImgImg').remove();
        // document.getElementById('labels').setAttribute("class", "invis");
    }
}


function removeImg(img) {
    selectedImgs.splice(selectedImgs.indexOf(img), 1);
    document.getElementById(img).remove();
}

let taggedUsers = [];

function tagSearchUser() {
    if (taggedUsers.length == 0) {
        let decoded = decodeURIComponent(document.cookie);
        decoded = decoded.replace("login=j:", "");
        decoded = JSON.parse(decoded); 
        taggedUsers.push(decoded.username);
    }
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
                    if (usersObj[i].username == taggedUsers[j]) {
                        numSearch += 1;
                        skip = true;
                        break;
                    }
                }
                if (skip == false) {
                    htmlStr +=
                        '<div class="userBox toAdd" id="' + usersObj[i].username + 'ToTag" on onclick="addUserTag(\'' + usersObj[i].username + '\')">' +
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
    document.getElementById(username + "ToTag").remove();
    let htmlStr =
        '<div class="userBox toRemove" id="' + username + 'Tagged" onclick="removeUserTag(\'' + username + '\')">' +
            oldHTML +
        '</div>'; 
    document.getElementById('taggedUsers').innerHTML += htmlStr;
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

if (uploadForm != null) {
    uploadForm.addEventListener("submit", createPost);
}

function createPost(e) {
    e.preventDefault();
    if (selectedImgs.length == 0) {
        alert("Please Upload An Image");
        return;
    }

    var formData = new FormData();
    for (let i = 0; i < selectedImgs.length; i++) {
        formData.append("img", selectedImgs[i]);
    }

    let decoded = decodeURIComponent(document.cookie);
    decoded = decoded.replace("login=j:", "");
    decoded = JSON.parse(decoded); 

    formData.append('username', decoded.username);
    let files = document.getElementById("uploadImgs");
    for (let i = 0; i < files.files.length; i++) {
        formData.append('img', files.files[i]);
    }
    formData.append('caption', document.getElementById("createCaption").value);
    for (let i = 0; i < taggedUsers.length; i++) {
        formData.append('tagged', taggedUsers[i]);
    }
    fetch("/create/post", {
        method:'POST',
        body: formData
    }).then((res) => {
        return res.text();
    }).then((text) => {
        if (text == "post created") {
            window.location.href="/app/home.html";
        }
    });
    
}

function likeSpecific(){
    let likeCom = document.getElementById(`likeCom`);
    picture = document.getElementById(`specificPic`);
    idxArr = picture.alt.split(" ");
    idx = idxArr.pop();
    pic = idxArr.join(" ");
    let postbody = {
        username: document.getElementById(`specificUsername`).innerText,
        caption: document.getElementById(`specificCaption`).innerText,
        image: pic,
        };
    fetch(`/add/like`, {
            method: 'POST',
            body: JSON.stringify(postbody),
            headers: { 'Content-Type': 'application/json'}
        }).then((res) => {
            return res.text();
        }).then((result) => {
            return JSON.parse(result);
        }).then((retObj) => {
            likeCom.innerText = `${retObj[0].likes.length} Likes and ${retObj[0].comments.length} Comments`

        });
}

function likePost(index){
    let likeCom = document.getElementById(`homeLikeCom${index}`);
    picture = document.getElementById(`postPic${index}`);
    idxArr = picture.alt.split(" ");
    idx = idxArr.pop();
    pic = idxArr.join(" ");
    let postbody = {
        username: document.getElementById(`homeName${index}`).innerText,
        caption: document.getElementById(`homeCaption${index}`).innerText,
        image: pic,
        };
    fetch(`/add/like`, {
            method: 'POST',
            body: JSON.stringify(postbody),
            headers: { 'Content-Type': 'application/json'}
        }).then((res) => {
            return res.text();
        }).then((result) => {
            return JSON.parse(result);
        }).then((retObj) => {
            likeCom.innerText = `${retObj[0].likes.length} Likes and ${retObj[0].comments.length} Comments`

        });
}

function homefeed(){
    let username = null;
    let proPic = null;
    let friendList = null;
    fetch('/find/your/user').then((res) => {
    return res.text();
    }).then((res) => {
        return JSON.parse(res);
    }).then((retObj) => {
        username = retObj.username;
        proPic = retObj.profilePic;
        friendList = retObj.friends;
        
        homefeedbody = {friends: friendList};
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
            htmlStr = htmlStr + `<span><img id="homeProfilePic" src="${proPic}" alt="profilePic">`;
            htmlStr = htmlStr + `<p id="homeUsername">${username}</p>`
            let index = 0;
            for(jsonObj of retObj) {
                htmlStr = htmlStr + `<center><span><p id="homeName${index}" class="clickOnUsername" onclick="openNewUserPage(${index},'homeName')">${jsonObj.username}</p></span>
                <div><input type="button" value="<--" id="specificLikeButt" onclick="homeSwapPic(1,${index});">
                <img class="feedPics" id="postPic${index}" src="${jsonObj.image[0]}" alt="${jsonObj.image[0]} 0">
                <input type="button" value="-->" id="specificLikeButt" onclick="homeSwapPic(0,${index});"></div>
                <p id="homeCaption${index}">${jsonObj.caption}</p><p id="homeLikeCom${index}">${jsonObj.likes.length} Likes and ${jsonObj.comments.length} Comments</p>`
                //Add buttons for likes and specific posts
                htmlStr = htmlStr + `<input type="button" value="Like" class="homeCommentButt" onclick="likePost(${index});">`
                htmlStr = htmlStr + `<input type="button" value="See Post" class="homeCommentButt" onclick="redirectSpecific(${index});"><br>`
                
                htmlStr = htmlStr + `<strong>Tagged: </strong>`;
                maxtag = jsonObj.tags.length;
                if (maxtag > 5){maxtag = 5;}
                for(var i = 0; i < maxtag; i++) {
                    var tag = jsonObj.tags;
                    if (tag == null){
                        break;
                    }
                    htmlStr = htmlStr + `${tag[i]}, `;
                }
                htmlStr = htmlStr.substring(0, htmlStr.length-2) + `<br><strong>Comments:</strong><br>`
                       
                // Iterate to ony have like 2 show
                maxCom = jsonObj.comments.length;
                if (maxCom > 2){maxCom = 2;}
                for(var i = 0; i < maxCom; i++) {
                    var comments = jsonObj.comments;
                    
                    htmlStr = htmlStr + `${comments[i]}`;
                }
                htmlStr = htmlStr + `<span>...</span><br><br>`;
            index += 1;
            }
            let content = document.getElementById('homeContent')
            content.innerHTML = htmlStr;
        });
});
}
/**
 * This function is used to swap the pic on the home page 
 * if they have multiple photos to view. if you click the right
 * arrow it goes to the next picture. If you click the left arrow it 
 * does the previous picture.
 * @param {The direction (0 is the right/ 1 is the left)} dir 
 * @param {*} index 
 */
function homeSwapPic(dir,index){
    
    picture = document.getElementById(`postPic${index}`);
    idxArr = picture.alt.split(" ");
    idx = idxArr.pop();
    pic = idxArr.join(" ");

    let comBody = {
        username: document.getElementById(`homeName${index}`).innerText,
        caption: document.getElementById(`homeCaption${index}`).innerText,
        image: pic,
    }

    fetch(`/search/post`, {
        method: 'POST',
        body: JSON.stringify(comBody),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        return res.text();
    }).then((results) => {
        return JSON.parse(results);
    }).then ((retObj) => {
        if (dir == 1){
            idx = idx - 1;
        } else { idx++;}
        if (idx < 0){
            idx = retObj[0].image.length-1;
        }else if (idx == retObj[0].image.length){
            idx = 0;
        }
        picLoc = retObj[0].image[idx];
        picture.src = picLoc;
        picture.alt = picLoc + " "+idx;

    });
}


/**
 * Javascript for _
 */
function searchFriends() {
    /**
     * @params: None
     * This function is for the user to search in the input box on the User page
     * to look up people to add as friends
     */
    let typedName = '' + document.getElementById('dmHomeSearch').value;
    if(typedName.length > 0) {
        let searchName = { name: document.getElementById('dmHomeSearch').value };
        fetch('/find/friends', {
            method:'POST',
            body: JSON.stringify(searchName),
            headers: {'Content-Type': 'application/json'}
        }).then((res) => {
            return res.text();
        }).then((text) => {
            // parses the object containing the names and then loops through them to print
            let usersObj = JSON.parse(text);
            let currKeys = Object.keys(usersObj);
            let htmlStr = '';
            for(let i = 0; i < currKeys.length; i++) {
                let currKey = currKeys[i];
                let currName = '' + usersObj[currKey];
                htmlStr = htmlStr + '<p class="dmHomeNames">' + currName + '</p>' + 
                `<input type='button' name='dmHomeNewMessage${i}' id='dmHomeNewMessage${i}'
                onclick='startMessage("${currName}")' value='Send Message'><br>`; 
            }
            let found = document.getElementById('dmHomeFriendsFound');
            found.innerHTML = htmlStr;
        });
    } else {
        let found = document.getElementById('dmHomeFriendsFound');
        found.innerHTML = '';
    }
}

function startMessage(userToMessage) {
    /**
     * @params: userToMessage- String for the name of the user to start a dm with
     * Will send a request to the server and reveive a response. Then reloads
     * the dmHome page
     */
    let otherName = { name: userToMessage };
    fetch('/dm', {
        method:'POST',
        body: JSON.stringify(otherName),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        location.reload();
    });
}
/**
 * This is the function that is used to create the 
 * feed for the global page. It should find every single 
 * post (even the users and the people who are not the users 
 * friends). Puts all of the created html into the globalContent div.
 */
function getPosts() {
    /**
     * @params: None
     * Sends a request to the server to get the posts that have been made by
     * all users on the application. Then creates HTML string to display the
     * information on the global page. Capabilities to view the specific post,
     * like, and click the underlined username to go to their page are included.
     */
    let username = null;
    let proPic = null;
    fetch('/find/your/user').then((res) => {
    return res.text();
    }).then((res) => {
        return JSON.parse(res);
    }).then((retObj) => {
        username = retObj.username;
        proPic = retObj.profilePic;
        
        
        fetch(`/get/posts`).then((res) => {
            return res.text();
        }).then((res) => {
            return JSON.parse(res);
        }).then((retObj) => {
            let htmlStr = '';
            htmlStr = htmlStr + `<span><img id="homeProfilePic" src="${proPic}" alt="profilePic">`;
            htmlStr = htmlStr + `<p id="homeUsername">${username}</p>`
            let index = 0;
            //for each post object it will display the post with the picture, likes, and comments
            for(jsonObj of retObj) {
                htmlStr = htmlStr + `<center><span><p id="homeName${index}" class="clickOnUsername" onclick="openNewUserPage(${index},'homeName')">${jsonObj.username}</p></span>
                <div><input type="button" value="<--" id="specificLikeButt" onclick="homeSwapPic(1,${index});">
                <img class="feedPics" id="postPic${index}" src="${jsonObj.image[0]}" alt="${jsonObj.image[0]} 0">
                <input type="button" value="-->" id="specificLikeButt" onclick="homeSwapPic(0,${index});"></div>
                <p id="homeCaption${index}">${jsonObj.caption}</p><p id="homeLikeCom${index}">${jsonObj.likes.length} Likes and ${jsonObj.comments.length} Comments</p>`
                //Add buttons for likes and specific posts
                htmlStr = htmlStr + `<input type="button" value="Like" class="homeCommentButt" onclick="likePost(${index});">`
                htmlStr = htmlStr + `<input type="button" value="See Post" class="homeCommentButt" onclick="redirectSpecific(${index});"><br>`
                
                htmlStr = htmlStr + `<strong>Tagged: </strong>`;
                maxtag = jsonObj.tags.length;
                if (maxtag > 5){maxtag = 5;}
                for(var i = 0; i < maxtag; i++) {
                    var tag = jsonObj.tags;
                    if (tag == null){
                        break;
                    }
                    htmlStr = htmlStr + `${tag[i]}, `;
                }
                htmlStr = htmlStr.substring(0, htmlStr.length-2) + `<br><strong>Comments:</strong><br>`
                       
                // Iterate to ony have like 2 show
                maxCom = jsonObj.comments.length;
                if (maxCom > 2){maxCom = 2;}
                for(var i = 0; i < maxCom; i++) {
                    var comments = jsonObj.comments;
                    
                    htmlStr = htmlStr + `${comments[i]}`;
                }
                htmlStr = htmlStr + `<span>...</span><br><br>`;
            index += 1;
            }
            let content = document.getElementById('globalContent')
            content.innerHTML = htmlStr;
        });
});
}

function openMessage(elementNum) {
    /**
     * @params: elementNum- Integer that represents the item number on the page
     * that the user clicks on
     * Gets the username from the document and encodes the url on dmSpecific
     */
    let encodeStr = document.getElementById(`dmHomeOpenButton${elementNum}`).value;
    let splitEncode = encodeStr.split(' ');
    let otherUser = splitEncode[3];
    window.location.href = '/app/dmSpecific.html?' + encodeURIComponent(otherUser);
}

/**
 * @params: None
 * Sends a request to the server and gets an object back with all of the 
 * users that have been messaged by the current user. Adds names and a open
 * message button to a html string. 
 */
function provideDMs() {
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

/**
 * @params: None
 * Sends a request to the server and gets an object back with all of the 
 * messages that have been sent. Then adds all names in bold with the
 * associated message to an html string. The string is then set to the 
 * innerHTML of the dmSpecific page
 */
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


/**
 * @params: None
 * Gets the message that the current user wants to send and makes request to
 * server. On response, the page is reloaded to display the new message
 */
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
/**
 * This function is used when the person clicks Post Comments
 * It will then grab the comment written in the input field 
 * and then save the comment into the PostData on the server.
 */
function addComment(){
    let personName = null;
    let htmlStr = "";
    // Find personal user on computer.
    fetch('/find/your/user').then((res) => {
        return res.text();
        }).then((res) => {
            return JSON.parse(res);
        }).then((retObj) => {
            personName = retObj.username;

    
    let allCom = document.getElementById("allComments");
    let likeCom = document.getElementById("likeCom");
    let picture = document.getElementById("specificPic");
    idxArr = picture.alt.split(" ");
    idx = idxArr.pop();
    pic = idxArr.join(" ");


    let comBody = {
        persons: personName,
        username: document.getElementById('specificUsername').innerText,
        caption: document.getElementById('specificCaption').innerText,
        image: pic,
        newCom: document.getElementById("specificYourComment").value,
    }
    //Send comment to server to be saved
    fetch(`/add/comment`, {
        method: 'POST',
        body: JSON.stringify(comBody),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        return res.text();
    }).then((results) => {
        return JSON.parse(results);
    }).then((retObj) => {
        let coms = retObj.comments

        for (com of coms){
            htmlStr = htmlStr + `${com}`;
        }
        // Sets up the new html so it shows the new comment immediately after posting.
        allCom.innerHTML = htmlStr;
        likeCom.innerText = `${retObj.likes.length} Likes and ${retObj.comments.length} Comments`;
    });
});

    
}

/**
 * This is used when the user clicks on See Post where it sends 
 * the user to the specificPost page.
 * @param {The specific index of posts on the home/global} index 
 */
function redirectSpecific(index){
    ausername = document.getElementById(`homeName${index}`).innerText;
    acaption = document.getElementById(`homeCaption${index}`).innerText;
    apic = document.getElementById(`postPic${index}`);
    idxArr = apic.alt.split(" ");
    idx = idxArr.pop();
    apic = idxArr.join(" ");
    window.location.href = `/app/specificPost.html?username=${encodeURIComponent(ausername)}&caption=${encodeURIComponent(acaption)}&pic=${encodeURIComponent(apic)}&index=${encodeURIComponent(index)}`;
}
/**
 * This is the function that fills in the entire content of the 
 * specificPost page with the information the User was looking for.
 * It should have the user who posted then the picture, caption, tags, and
 * comments, with the view of likes and total comments.
 */
function specificPost() {
    const params = new URLSearchParams(window.location.search);
    const ausername = params.get('username');
    const acaption = params.get('caption');
    const apic = params.get('pic');
    //Make comment be created with + instead of spaces 
    let proPic = null;
    var findUserBody = {name: ausername};
    fetch('/search/users', { // Find the user to get the profile pic.
    method:'POST',
    body: JSON.stringify(findUserBody),
    headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        return res.text();
    }).then((res) => {
        return JSON.parse(res);
    }).then((retObj) => {
        proPic = retObj[0].profilePic;
    
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

                htmlStr = htmlStr + `<span><img id="specificProfilePic" src="${proPic}" alt="profilePic">
                <div id="specificUsername">${jsonObj.username}</div></span>
                <center><div><input type="button" value="<--" id="specificLikeButt" onclick="swapPic(1);">
                <img class="feedPics" id="specificPic" src="${jsonObj.image[0]}" alt="${jsonObj.image[0]} 0">
                <input type="button" value="-->" id="specificLikeButt" onclick="swapPic(0);">
                <p id="specificCaption">${jsonObj.caption}</p><p id="likeCom">${jsonObj.likes.length} Likes and ${jsonObj.comments.length} Comments</p>
                <input type="button" value="Like!" id="specificLikeButt" onclick="likeSpecific();"><br> <strong> Tagged: </strong>`
                for (tag of jsonObj.tags){
                    htmlStr = htmlStr + `${tag}, `
                }
                htmlStr.substring(0,htmlStr.length-2);
                htmlStr = htmlStr + `<br>`;
                htmlStr = htmlStr + `<p><strong>COMMENTS:</strong></p><div id="allComments">`
                for(comment of jsonObj.comments) {
                    htmlStr = htmlStr + `${comment}`;
                }
                htmlStr = htmlStr + `</div>`;

                htmlStr = htmlStr + `<input type="text" placeholder="Type your comment here!" id="specificYourComment">
                <input type="button" value="Add Comment" id="specificCommentButt" onclick="addComment();"></center>`;
                htmlStr = htmlStr + `<br>`;
            }
            let content = document.getElementById('userContent')
            content.innerHTML = htmlStr;
        });
});
}
/** ONLY USED IN SPECIFIC POST
 * This function is used when the User clicks on the arrow keys 
 * to look at the other images that were posted. If they click the 
 * left arrow it goes to the index -1 and if they click the right they
 * send it to index + 1 and also prevents index errors.
 * @param {The directions (0 is positive/ 1 is negative)} dir 
 */
function swapPic(dir){
    picture = document.getElementById("specificPic");
    idxArr = picture.alt.split(" ");
    idx = idxArr.pop();
    pic = idxArr.join(" ");
    let comBody = {
        username: document.getElementById('specificUsername').innerText,
        caption: document.getElementById('specificCaption').innerText,
        image: pic,
    }

    fetch(`/search/post`, {
        method: 'POST',
        body: JSON.stringify(comBody),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        return res.text();
    }).then((results) => {
        return JSON.parse(results);
    }).then ((retObj) => {
        if (dir == 1){
            idx = idx - 1;
        } else { idx++;}
        if (idx < 0){
            idx = retObj[0].image.length-1;
        }else if (idx == retObj[0].image.length){
            idx = 0;
        }
        picLoc = retObj[0].image[idx];
        picture.src = picLoc;
        picture.alt = picLoc + " "+idx;
    });
}

/**
 * Searches the users in the server that have usernames that match partially
 * what is typed in the input bar. It then displays the usernames with buttons
 * to start a message with them.
 * @param {id name of element containing username} searchFriend 
 * @param {id name of element of where to fill in with the html string} searchResults 
 */
function searchPeople(searchFriend, searchResults) {
    let currName = document.getElementById(searchFriend).value;
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
            let results = document.getElementById(searchResults);
            results.innerHTML = htmlStr;
        });
    } else {
        let results = document.getElementById(searchResults);
        results.innerHTML = '';
    }
}

/**
 * Allows the user to add a friend on the User page after looking up their name.
 * The button that says add friend becomes added! after the click
 * @param {gives the number of the element that the user click on} elementNum 
 */
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

/**
 * Allows the user to click a button to see all of their friends added in a list.
 * They can then click on the name that is underlined to open their specific user
 * page.
 * @param {id name for the page that the current user of the website is on} pageName 
 */
function seeFriends(pageName) {
    fetch('/view/friends').then((res) => {
        return res.text();
    }).then((jsonStr) => {
        let jsonObj = JSON.parse(jsonStr);
        let friendsList = jsonObj.people;
        let htmlStr = '<strong>Friends (click on name to view their page):</string><br><br>';
        for(let i = 0; i < friendsList.length; i++) {
            htmlStr = htmlStr + `<p id="friend${i}" class="clickOnUsername" onclick="openNewUserPage(${i}, 'friend')">` + friendsList[i] + `</p><br><br>`
        }
        let display = document.getElementById(pageName);
        display.innerHTML = htmlStr;
    })
}

/**
 * When the user clicks on a button the function gets the corresponding username
 * and encoded it in the url of the viewUser page.
 * @param {gives the number of the element that the user click on. Is based
 * on the order of the names on the page} elementNum 
 * @param {name of the id for the page that the user is on} idName 
 */
function openNewUserPage(elementNum, idName) {
    let nextPageUser = '' + document.getElementById(`${idName}${elementNum}`).innerHTML;
    window.location.href = '/app/viewUser.html?' + encodeURIComponent(nextPageUser);
}

/**
 * Fills the content of the viewUser.html page with their username, profile
 * pic, bio, and then calls a function to fill the page with posts
 */
function fillViewUserPage() {
    var urlParam = new URLSearchParams(window.location.search);
    urlParam = '' + urlParam;
    urlParam = urlParam.substring(0, urlParam.length-1);
    fetch(`/get/viewUserInfo/${urlParam}`).then((res) => {
        return res.text();
    }) .then((jsonStr) => {
        let jsonObj = JSON.parse(jsonStr);
        let nameSpot = document.getElementById('viewUserUsernameSpot')
        nameSpot.innerText = jsonObj.username;
        let bioSpot = document.getElementById('viewUserBioSpot');
        bioSpot.innerText = jsonObj.bio;
        let profilePicSpot = document.getElementById('viewUserProfilePic')
        profilePicSpot.src = jsonObj.profilePic;
        let uName = '' + jsonObj.username;
        viewUserFeed(uName);
    })
}

var profFormData = new FormData();

/**
 * Reloads the current page
 */
function reload() {
    location.reload();
}

function viewChangeProfPic() {
    document.getElementById("newProfFormButton").remove();
    let picBox = document.getElementById("profPicBox");
    picBox.innerHTML += 
    '<form id="newProfPicForm">' +
        '<input type="file" name="newProfPic" id="newProfilePic" onchange="previewProfPic()" required/>' +
        '<button value="upload" class="invis" id="confButton">Confirm Changes</button>' +
    '</form>' + 
    '<button onclick="reload()" class="invis" id="discButton">Discard Changes</button>';
}

function previewProfPic() {
    document.getElementById("userProfilePic").setAttribute("class", "invis");
    let inPic = document.getElementById("newProfilePic");
    let file = inPic.files[0];
    profFormData.append('img', inPic.files[0]);
    let profBox = document.getElementById("profPicBox");
    let currHTML = profBox.innerHTML;
    let newHTML = '<img id="tempProfilePic" class="userProfilePic" src="' + URL.createObjectURL(file) + '" alt="Your Image"></img>';
    profBox.innerHTML = newHTML + currHTML;
    document.getElementById("confButton").classList.remove("invis");
    document.getElementById("discButton").classList.remove("invis");
    document.getElementById("newProfilePic").remove();
    var newProfPicForm = document.getElementById("newProfPicForm");
    newProfPicForm.addEventListener("submit", updateProfilePic);
}

var newProfPicForm = document.getElementById("newProfPicForm");

if (newProfPicForm != null) {
    newProfPicForm.addEventListener("submit", updateProfilePic);
}

function updateProfilePic(e) {
    e.preventDefault();
    fetch("/updateProfPic", {
        method: "POST",
        body: profFormData,
    }).then((res) => {
        reload()
        return res.text();
    }).catch((err) => {
    })
}

/**
 * fills the user.html page with their username, profile pic, bio, and then
 * calls a function to load their posts
 */
function fillUserPage() {
    fetch('/get/userInfo').then((res) => {
        return res.text();
    }).then((jsonStr) => {
        let jsonObj = JSON.parse(jsonStr);
        let userProfilePic = document.getElementById("userProfilePic");
        userProfilePic.src = jsonObj.profilePic;
        let nameSpot = document.getElementById('userUsernameSpot')
        nameSpot.innerText = jsonObj.username;
        let bioSpot = document.getElementById('userBioSpot');
        bioSpot.innerText = jsonObj.bio;
        userfeed();
    }) 
}

/**
 * When a button is clicked, the function opens a textarea for the user to put
 * in a new bio.
 */
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

/**
 * Fills the user page with all of their posts
 */
function userfeed(){
    fetch('/search/own/user/').then((res) => {
    return res.text();
    }).then((res) => {
        return JSON.parse(res);
    }).then((retObj) => {
        let htmlStr = '';
        let index = 0;
        //for each post object returned from server the picture, comments, likes, and buttons
        //are added to a html string that is set to the innerHTML of the posts div
        for(jsonObj of retObj) {
            htmlStr = htmlStr + `<center> <span id="homeName${index}">${jsonObj.username}</span>
            <div><input type="button" value="<--" id="specificLikeButt" onclick="homeSwapPic(1,${index});">
            <img class="feedPics" id="postPic${index}" src="${jsonObj.image[0]}" alt="${jsonObj.image[0]} 0">
            <input type="button" value="-->" id="specificLikeButt" onclick="homeSwapPic(0,${index});"></div>
            <p id="homeCaption${index}">${jsonObj.caption}</p><p id="homeLikeCom${index}">${jsonObj.likes.length} Likes and ${jsonObj.comments.length} Comments</p>`
            htmlStr = htmlStr + `<input type="button" value="Like" class="homeCommentButt" onclick="likePost(${index});">`
            htmlStr = htmlStr + `<input type="button" value="See Post" class="homeCommentButt" onclick="redirectSpecific(${index});"><br>`
            
            htmlStr = htmlStr + `<strong>Tagged: </strong>`;
            maxtag = jsonObj.tags.length;
            if (maxtag > 5){maxtag = 5;}
            for(var j = 0; j < maxtag; j++) {
                var tag = jsonObj.tags;
                if (tag == null){
                    break;
                }
                htmlStr = htmlStr + `${tag[j]}, `;
            }
            htmlStr = htmlStr.substring(0, htmlStr.length-2) + `<br><strong>Comments:</strong><br>`
                      
            // Iterate to ony have like 2 show
            maxCom = jsonObj.comments.length;
            if (maxCom > 2){maxCom = 2;}
            for(var j = 0; j < maxCom; j++) {
                var comments = jsonObj.comments;
                
                htmlStr = htmlStr + `${comments[j]}`;
            }
            htmlStr = htmlStr + `<span>...</span><br>`;
            index+=1;
        }
        let content = document.getElementById('userPostsSpot')
        content.innerHTML = htmlStr;
    });
}

function viewUserFeed(viewName) {
    let strName = '' + viewName;
    fetch(`/search/user/posts/${strName}`).then((res) => {
        return res.text();
        }).then((res) => {
            return JSON.parse(res);
        }).then((retObj) => {
            let htmlStr = '';
            let index = 0;
            for(jsonObj of retObj) {
                htmlStr = htmlStr + `<center> <span id="homeName${index}">${jsonObj.username}</span>
                <div><input type="button" value="<--" id="specificLikeButt" onclick="homeSwapPic(1,${index});">
                <img class="feedPics" id="postPic${index}" src="${jsonObj.image[0]}" alt="${jsonObj.image[0]} 0">
                <input type="button" value="-->" id="specificLikeButt" onclick="homeSwapPic(0,${index});"></div>
                <p id="homeCaption${index}">${jsonObj.caption}</p><p id="homeLikeCom${index}">${jsonObj.likes.length} Likes and ${jsonObj.comments.length} Comments</p>`
                //Add buttons for likes and specific posts
                htmlStr = htmlStr + `<input type="button" value="Like" class="homeCommentButt" onclick="likePost(${index});">`
                htmlStr = htmlStr + `<input type="button" value="See Post" class="homeCommentButt" onclick="redirectSpecific(${index});"><br>`
                
                htmlStr = htmlStr + `<strong>Tagged: </strong>`;
                maxtag = jsonObj.tags.length;
                if (maxtag > 5){maxtag = 5;}
                for(var j = 0; j < maxtag; j++) {
                    var tag = jsonObj.tags;
                    if (tag == null){
                        break;
                    }
                    htmlStr = htmlStr + `${tag[j]}, `;
                }
                htmlStr = htmlStr.substring(0, htmlStr.length-2) + `<br><strong>Comments:</strong><br>`
                          
                // Iterate to ony have like 2 show
                maxCom = jsonObj.comments.length;
                if (maxCom > 2){maxCom = 2;}
                for(var j = 0; j < maxCom; j++) {
                    var comments = jsonObj.comments;
                    
                    htmlStr = htmlStr + `${comments[j]}`;
                }
                htmlStr = htmlStr + `<span>...</span><br>`;
                index+=1;
            }
            let content = document.getElementById('viewUserPostsSpot')
            content.innerHTML = htmlStr;
        });
}