
       
      
        function resendOPT() {
            console.log('comes here')
            fetch('/api/v1/resend-otp',{
                headers:{
                    'Accept': 'application/json',
                    'Contend-type': 'application/json',
                },
                method: 'PUT',


            })
            .then((respose) => {
                let errorDiv = document.getElementById('error-div')
                errorDiv.style.display = 'block'
                errorDiv.className = "alert text-danger f bg-light rounded text-center  "
                errorDiv.innerText = "An OTP has been send again!"




            }).catch((error) => {
                console.log(error)
            })



        }


        $(document).ready(function() {
    // Countdown timer for 3 minutes
    var timer = 180;
    var interval = setInterval(function() {
        timer--;
        var minutes = Math.floor(timer / 60);
        var seconds = timer % 60;
        $("#countdown").text(minutes + ":" + (seconds < 10 ? "0" + seconds : seconds));
        if (timer === 0) {
            clearInterval(interval);
        }
    }, 1000);

    // Focus on the next input when typing in an input box
    $(".otp-input").on("input", function(e) {
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
    }).on("keydown", function(e) {
        if (e.which == 8 && $(this).val().length === 0) { // If backspace is pressed and input is empty
            var currentIndex = parseInt($(this).data("index"));
            if (currentIndex > 1) {
                var prevIndex = currentIndex - 1;
                $('[data-index="' + prevIndex + '"]').focus();
            }
        }
    });

    // Resend OTP button click handler
    $("#resend-btn").on("click", function() {
        // Restart the countdown timer
        timer = 180;
        $("#countdown").text("3:00");
        clearInterval(interval);
        interval = setInterval(function() {
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
    $("#verify-btn").on("click", function() {
        // Add your OTP verification logic here
    });
});