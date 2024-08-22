function Pshow() {
    let x = document.getElementById("singin-password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
    i
}
function enterSubmit(event) {
    if(event.keyCode == 13) {
        CheckUser();
    }
}

function CheckUser() {
    let email = document.getElementById('singin-email');
    let password = document.getElementById('singin-password');

    let emailError = document.getElementById('emailError');
    let passwordError = document.getElementById('passwordError');

    let emailDiv = document.getElementById('emailDiv');
    let passwordDiv = document.getElementById('passwordDiv');

    let mainDiv = document.getElementById('mainDiv');
    let mainError = document.getElementById('mainError');

    if (email.value.trim().length <= 1) {

        emailError.innerText = 'Email is required'
        email.style.border = '1px red solid';
        email.scrollIntoView({
            behavior: "smooth",
            block: 'center',
            inline: "center"
        });


        setTimeout(() => {
            emailError.innerText = ""
            email.style.border = ''
        }, 3000);
        return false
    }
    if (password.value.trim().length <= 1) {

        passwordError.innerText = 'Password is required'
        password.style.border = '1px red solid';
        password.scrollIntoView({
            behavior: "smooth",
            block: 'center',
            inline: "center"
        });


        setTimeout(() => {
            passwordError.innerText = ""
            password.style.border = ''
        }, 3000);
        return false

    }

    fetch('/api/v1/signin', {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({
            email: email.value,
            password: password.value,

        })

    })
        .then((response) => response.json())
        .then(response => {
            if (response.error == true) {
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
                }, 4500);

            } else if(response.success) {
                window.location.href = '/api/v1/'

            }
        })

}