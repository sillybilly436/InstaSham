/**
 * Names: Billy Dolny, Ben Curtis, Bronson Housmans
 * Description:
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
    let keyword = document.getElementById('searchInput').value;
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
        let right = document.getElementById('rightSide')
        right.innerHTML = htmlStr;
    })
}

function openMessage() {
    
}