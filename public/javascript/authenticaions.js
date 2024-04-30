



document.addEventListener('DOMContentLoaded', function () {
    let userName = document.getElementById('name');
    let userEmail = document.getElementById('email');
    let userPassword = document.getElementById('password');
    let userConfirmPassword = document.getElementById('confirm-password');


    let nameError = document.getElementById('nameError');
    let emailError = document.getElementById('emailError');
    let passwordError = document.getElementById('passwordError');
    let confirmPasswordError = document.getElementById('confirmPasswordError');

    userName.addEventListener('keyup', function (event) {
       

        // if(userName.value.trim().lenght == 0) nameError.innerText = 'invalid user name'
        if (/^(?=.*\S)[a-zA-Z0-9 ]{3,30}$/.test(userName.value)) {
            userName.style.border = '';
            nameError.innerText = ''

        }

        if (!/^(?=.*\S)[a-zA-Z0-9 ]{3,30}$/.test(userName.value)) {
            userName.style.border = '1px red solid';
            nameError.innerText = 'invalid user name'

        }
        if (userName.value.trim().length == 0) {
            userName.style.border = '1px red solid';
            nameError.innerText = 'username required'

        }



    });
    userEmail.addEventListener('keyup', function (event) {

        if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userEmail.value)) {
            userEmail.style.border = '';
            emailError.innerText = ''

        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userEmail.value)) {
            userEmail.style.border = '1px red solid';
            emailError.innerText = ''

        }
        if (userEmail.value.trim().length == 0) {
            userEmail.style.border = '1px red solid';
            emailError.innerText = 'Email required'

        }
    });
    userEmail.addEventListener('blur', function (event) {
        //  userPassword.removeAttribute('style');
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userEmail.value)) {
            userEmail.style.border = '1px red solid';
            emailError.innerText = 'Invalid Email'

        }

    });

    userPassword.addEventListener('keyup', function (event) {



        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(userPassword.value)) {
            userPassword.style.border = '1px red solid';
            passwordError.classList = 'text-danger'
            passwordError.innerText = 'Week password'

        }
        if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\\\|\[\]{};:\'",.<>?]).{6,}$/.test(userPassword.value)) {
            userPassword.style.border = '1px green solid'
            passwordError.classList = 'text-success'
            passwordError.innerText = 'Strong password'


        }
        if (userPassword.value.trim().length == 0) {
            userPassword.style.border = '1px red solid';
            passwordError.innerText = 'Password is required'

        }
    });

    userPassword.addEventListener('blur', function (event) {
      
        if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\\\|\[\]{};:\'",.<>?]).{6,}$/.test(userPassword.value)) {
            userPassword.removeAttribute('style');
            

        }

    });


    userConfirmPassword.addEventListener('keyup', function (event) {

        if (!(userPassword.value === userConfirmPassword.value)) {
            userConfirmPassword.style.border = '1px red solid';
            confirmPasswordError.classList = 'text-danger'
            confirmPasswordError.innerText = 'Password mismatch'

        }
        if (!userPassword.value) {
            userPassword.style.border = '1px red solid';
            passwordError.classList = 'text-danger'
            passwordError.innerText = 'Please Enter password '
            userConfirmPassword.style.border = '1px red solid';
            confirmPasswordError.classList = 'text-danger'

        }
        if (userPassword.value === userConfirmPassword.value) {
            userConfirmPassword.style.border = '';
            confirmPasswordError.classList = ''
            confirmPasswordError.innerText = ''
        }
        if (userConfirmPassword.value.trim().length == 0) {
            userConfirmPassword.style.border = '1px red solid';
            confirmPasswordError.innerText = ''

        }

    })
    function show() {
        let x = document.getElementById("current-password");
        if (x.type === "password") {
            x.type = "text";
        } else {
            x.type = "password";
        }
    }





});

function validateAndSubmit() {
    let userName = document.getElementById('name');
    let userEmail = document.getElementById('email');
    let userPassword = document.getElementById('password');
    let userConfirmPassword = document.getElementById('confirm-password');
    let mainError = document.getElementById('main-error');


    if (!/^(?=.*\S)[a-zA-Z0-9 ]{3,30}$/.test(userName.value)) return userName.focus()

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userEmail.value)) return userEmail.focus()

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\\\|\[\]{};:\'",.<>?]).{6,}$/.test(userPassword.value)) return userPassword.focus()

    if (!(userPassword.value === userConfirmPassword.value)) return userConfirmPassword.focus()

    

    fetch('/api/v1/signup', {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({
            name: userName.value,
            email: userEmail.value,
            password: userPassword.value,
            confirmPassword: userConfirmPassword.value,
        })

    })
        .then((response) => response.json())
        .then(response => {
            if(!response.success){
                mainError.style.display = 'block';
                mainError.innerText = response.message;
                mainError.scrollIntoView({
                    behavior: "smooth",
                    block: 'center',
                    inline: "center"
                });

            setTimeout(() => {
                mainError.innerText = ""
                mainError.style.display = 'none'
            },4500);

            }else if( response.success) {
                window.location.href = `/api/v1/otp-verification`
            }

        })
            

     

}

