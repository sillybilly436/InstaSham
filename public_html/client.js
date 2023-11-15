/**
 * Names: Billy Dolny, Ben Curtis, Bronson Housmans
 * Description:
 */

function login() {
    let loginAttempt = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    }
    fetch('/user/login', {
        method:'POST',
        body: JSON.stringify(loginAttempt),
        headers: {'Content-Type': 'application/json'}
    }).then((response) => {
        return response.text();
    }).then((response) => {
        if(response == 'Successful') {
            window.location.href = '/home.html';
        } else {
            let fail = document.getElementById('failMessage');
            fail.innerText = 'Login attempt failed';
        }
    })
}

function checkCreateUser () {
    let newUsername = document.getElementById('newUsername').value;
    let newPassword = document.getElementById('newPassword').value;
    let resMessage = document.getElementById('retMessage');
    fetch(`user/create/${newUsername}/${newPassword}`).then((res) => {
        return res.text();
    }).then((res) => {
        resMessage.innerText = res;
    })
}