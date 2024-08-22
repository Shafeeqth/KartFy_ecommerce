
sessionStorage.setItem('allowedToCheckout', 'true')

function proceedToCheckout(event) {
    event.preventDefault()
    fetch('/api/v1/proceed-to-checkout', {
        method: "get",
        headers: {
            'Content-Type': 'application/json',

        }

    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data.error) {
                Swal.fire({
                    title: 'Error',
                    text: data.message + '\n remove them first',
                    icon: 'error',
                    showCancelButton: false,
                    timer: 3500,
                })

                data.errorData.forEach((element, row) => {

                    row = document.getElementById(element)
                    row.classList.add('notification');
                    row.querySelectorAll('*').forEach(item => item.classList.add('changeBg'))
                    row.querySelectorAll('input').forEach(item => item.style.backgroundColor = '#e0edeb')
                    setTimeout(() => {
                        row.classList.remove('notification')


                    }, 4000);

                });



            }
            if (data.success) {
                location.href = "/api/v1/start-checkout"

            }
        })

}



function findDeliveryCharge(event) {
    if (event.key == 'Enter' || event.keyCode == 13 ||
        event.target.dataset?.id == 'good') {
        let butn = document.getElementById('find-delivery');
        console.log(butn)
        let showDelivery = document.getElementById('delivery-span');
        let outerDelivery = document.getElementById('delivery-outer')
        let element = document.getElementById("deliveryCharge");
        let pincode = element.value
        let pincodeError = document.getElementById('pincodeError');
        let messageMain = document.getElementById('message-main');
        let messageNumber = document.getElementById('message-number');
        let outputSpan = document.getElementById('output-span');
        let outputDiv = document.getElementById('output-div');

        if (!/^[1-9][0-9]{5}$/.test(pincode) ||
            pincode.trim().length != 6 ||
            isNaN(Number(pincode))
        ) {

            pincodeError.innerText = 'invalid pincode'
            setTimeout(() => {
                element.style.border = '';
                pincodeError.innerText = '';

            }, 2000);
            return false

        }
        butn.innerHTML = `<span class="spinner-border spinner-border-md mx-2" role="status" aria-hidden="true"></span> Checking...`

        fetch('/api/v1/find-delivery-charge', {
            method: "POST",
            body: JSON.stringify({ pincode }),
            headers: {
                'Content-Type': 'application/json',

            }

        })
            .then(response => response.json())
            .then(data => {

                if (data.success) {
                    messageMain.style.visibility = 'visible'
                    messageNumber.innerHTML = `<b> ${data.data}</b>`;
                    outputDiv.style.display = 'block';
                    outputSpan.innerHTML = `${data.data}`
                    butn.innerHTML = 'Check';



                    setTimeout(() => {
                        messageMain.style.visibility = 'hidden'
                        messageNumber.innerHTML = ``

                    }, 2000);
                } else {
                    Swal.fire({
                        title: 'Oops..',
                        text: data.message,
                        width: '300px',
                    
                        icon: 'error',


                        showConfirmButton: false,
                        timer: 2300,
                    });
                    butn.innerHTML = 'Check';
                }


            })

    }


}