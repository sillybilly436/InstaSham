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
            window.location.href = '/app/home.html';
        } else {
            let fail = document.getElementById('failMessage');
            fail.innerText = 'Login attempt failed';
        }
    })
}

function checkCreateUser () {
    let newUserObj = {
        username: document.getElementById('newUsername').value,
        password:  document.getElementById('newPassword').value };
    //let newUsername = document.getElementById('newUsername').value;
    //let newPassword = document.getElementById('newPassword').value;
    let resMessage = document.getElementById('retMessage');
    console.log('sending now');
    fetch('/user/create', {
        method:'POST',
        body: JSON.stringify(newUserObj),
        headers: {'Content-Type': 'application/json'}
    }).then((res) => {
        return res.text();
    }).then((res) => {
        resMessage.innerText = res;
    })
}