function validate(event) {
    event.preventDefault()

    let one = document.getElementById('one');
    let two = document.getElementById('two');
    let three = document.getElementById('three');
    let four = document.getElementById('four');

    if (isNaN(Number(one.value.trim()))) {
        one.style.border = '1px solid red'
        setTimeout(() => {
            one.style.border = ''

        }, 1500);
        return false


    } if (isNaN(Number(two.value.trim()))) {
        two.style.border = '1px solid red'
        setTimeout(() => {
            two.style.border = ''

        }, 1500);
        return false

    } if (isNaN(Number(three.value.trim()))) {
        three.style.border = '1px solid red'
        setTimeout(() => {
            three.style.border = ''

        }, 1500);
        return false

    } if (isNaN(Number(four.value.trim()))) {
        four.style.border = '1px solid red'
        setTimeout(() => {
            four.style.border = ''

        }, 1500);
        return false

    }
    let otp = '' + one.value + two.value + three.value + four.value
    console.log(otp)
    fetch('/api/v1/otp-verification', {
        method: 'post',
        body: JSON.stringify({ otp }),
        headers: {

            'Content-type': 'application/json',
        },



    }).then(response => response.json())
        .then((response) => {
            let errorDiv = document.getElementById('error');
            if (response.error) {
                errorDiv.style.display = 'block',
                    errorDiv.innerText = response.message;

                setTimeout(() => {
                    errorDiv.style.display = 'none';
                    
                }, 3000);
            }
            if (response.success) {
                Swal.fire({
                    title: "Success",
                    text: response.message,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,

                });

                setTimeout(async function askReferrel() {
                    
                    const { value: code } = await Swal.fire({
                        title: "Do you have a referrel code",
                        input: "text",
                        inputLabel: 'Code',
                        inputPlaceholder: "Your code here",
                        showCancelButton: true,
                        cancelButtonText: 'Cancel',
                        width: '35%',
                        padding: '15px'


                    });
                    if (code) {
                        console.log(code)
                        fetch('/api/v1/referrel-apply', {
                            method: 'post',
                            body: JSON.stringify({ code }),
                            headers: {

                                'Content-type': 'application/json',
                            },



                        }).then(response => response.json())
                            .then((response) => {
                                if(response.success) {
                                    Swal.fire({
                                        title: "Success",
                                        icon: "success",
                                        showConfirmButton: false,
                                        timer: 1000,

                                            });
                                setTimeout(() => {
                                    window.location.href = '/api/v1'
                                    
                                }, 1000);

                                }else{
                                    Swal.fire({
                                        title: "Oops!",
                                        text: response.message,
                                        icon: "error",
                                        showConfirmButton: false,
                                        timer: 1000,

                                            });
                                            setTimeout(() => {
                                                askReferrel()
                                    
                                }, 1000);

                                }

                                
                            })
                        
                    }else{
                        window.location.href = '/api/v1';
                    }
    
                }, 2000);


            }
        })
}

function resendOPT() {

    fetch('/api/v1/resend-otp', {
        headers: {
            'Accept': 'application/json',
            'Contend-type': 'application/json',
        },
        method: 'PUT',


    }).then(response => response.json())
        .then((respose) => {

            let errorDiv = document.getElementById('error-div')
            if (!respose.success) {
                errorDiv.style.display = 'block'
                errorDiv.className = "alert text-danger f bg-light rounded text-center  "
                errorDiv.innerText = respose.message
                window.location.href = '/api/v1/signup'
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                    
                }, 3000);

            } else {

                errorDiv.style.display = 'block'
                errorDiv.className = "alert text-danger f bg-light rounded text-center  "
                errorDiv.innerText = "An OTP has been send again!"
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                    
                }, 3000);

            }




        }).catch((error) => {
            console.log(error)
        })



}


$(document).ready(function () {
    // Countdown timer for 3 minutes
    var timer = 60;
    var interval = setInterval(function () {
        timer--;
        var minutes = Math.floor(timer / 60);
        var seconds = timer % 60;
        $("#countdown").text(minutes + ":" + (seconds < 10 ? "0" + seconds : seconds));
        if (timer === 0) {
            clearInterval(interval);
        }
    }, 1000);

    // Focus on the next input when typing in an input box
    $(".otp-input").on("input", function (e) {
        var maxLength = parseInt($(this).attr("maxlength"));
        var currentLength = $(this).val().length;
        var currentIndex = parseInt($(this).data("index"));
        if (currentLength >= maxLength) {
            if (currentIndex < 4) {
                var nextIndex = currentIndex + 1;
                $('[data-index="' + nextIndex + '"]').focus();
            }
        } else {
            if (currentIndex > 1) {
                var prevIndex = currentIndex - 1;
                $('[data-index="' + prevIndex + '"]').focus();
            }
        }
    }).on("keydown", function (e) {
        if (e.which == 8 && $(this).val().length === 0) { // If backspace is pressed and input is empty
            var currentIndex = parseInt($(this).data("index"));
            if (currentIndex > 1) {
                var prevIndex = currentIndex - 1;
                $('[data-index="' + prevIndex + '"]').focus();
            }
        }
    });

    // Resend OTP button click handler
    $("#resend-btn").on("click", function () {
        // Restart the countdown timer
        timer = 60;
        $("#countdown").text("3:00");
        clearInterval(interval);
        interval = setInterval(function () {
            timer--;
            var minutes = Math.floor(timer / 60);
            var seconds = timer % 60;
            $("#countdown").text(minutes + ":" + (seconds < 10 ? "0" + seconds : seconds));
            if (timer === 0) {
                clearInterval(interval);
            }
        }, 1000);
    });

    // Verify OTP button click handler
    $("#verify-btn").on("click", function () {
        // Add your OTP verification logic here
    });
});