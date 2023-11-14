/**
 * Names: Billy Dolny, Ben Curtis, Bronson Housmans
 * Description:
 */

function login() {
    let loginAttempt = {
        username: document.getElementById('username'),
        password: document.getElementById('password')
    }
    fetch('/user/login', {
        method:'POST',
        body: JSON.stringify(loginAttempt),
        headers: {'Content-Type': 'application/json'}
    }).then((response) => {
        return response.text();
    }).then((response) => {
        if(response == 'Succcessful') {
            window.location.href('./home.html');
        } else {
            let fail = document.getElementById('failMessage');
            fail.innerText = 'Login attempt failed';
        }
    })
}