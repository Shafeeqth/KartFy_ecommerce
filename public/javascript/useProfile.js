document.addEventListener('DOMContentLoaded', function () {
    let currentPassword = document.getElementById('password');
    let newPassword = document.getElementById('new-password');
    let confirmtPassword = document.getElementById('confirm-password');

    let curPassword = currentPassword.value;
    let nPassword = newPassword.value;
    let conPassword = confirmtPassword.value;

    let newError = document.getElementById('newError');
    let confirmError = document.getElementById('confirmError');

    newPassword.addEventListener('keyup', function (event) {



        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(newPassword.value)) {
            newPassword.style.border = '1px red solid';
            newError.classList = 'text-danger'
            newError.innerText = 'Week password'

        }
        if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\\\|\[\]{};:\'",.<>?]).{6,}$/.test(newPassword.value)) {
            newPassword.style.border = '1px green solid'
            newError.classList = 'text-success'
            newError.innerText = 'Strong password'


        }
        if (newPassword.value.trim().length == 0) {
            newPassword.style.border = '1px red solid';
            newError.innerText = 'Password is required'

        }
    });

    newPassword.addEventListener('blur', function (event) {

        if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\\\|\[\]{};:\'",.<>?]).{6,}$/.test(newPassword.value)) {
            newPassword.removeAttribute('style');


        }

    });


    confirmtPassword.addEventListener('keyup', function (event) {

        if (!(newPassword.value === confirmtPassword.value)) {
            confirmtPassword.style.border = '1px red solid';
            confirmError.classList = 'text-danger'
            // confirmError.innerText = 'Password mismatch'

        }
        if (!newPassword.value) {
            newPassword.style.border = '1px red solid';
            passwordError.classList = 'text-danger'
            passwordError.innerText = 'Please Enter password '
            confirmtPassword.style.border = '1px red solid';
            confirmError.classList = 'text-danger'

        }
        if (newPassword.value === confirmtPassword.value) {
            confirmtPassword.style.border = '';
            confirmError.classList = ''
            confirmError.innerText = ''
        }
        if (confirmtPassword.value.trim().length == 0) {
            confirmtPassword.style.border = '1px red solid';
            confirmError.innerText = ''

        }

    })
})
function showReferrel(event) {
let element = event.target;
let referrelElement = document.getElementById('referrel-div')
if(referrelElement.style.display == 'block') {
    referrelElement.style.display = 'none'
}else {
    referrelElement.style.display = 'block'
}

}