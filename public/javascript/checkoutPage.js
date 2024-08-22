
if(!sessionStorage.getItem('allowedToCheckout')) {
    window.location.href = '/api/v1/cart'
}else {
    sessionStorage.removeItem('allowedToCheckout');
}
// window.addEventListener('beforeunload', (e) => hideSpinner())



    function hideSpinner() {
        document.getElementById('spinner-overlay').style.display = 'none';
    }
function placeOrder() {
    checkCouponValid()


    function showSpinnner() {
        document.getElementById('spinner-overlay').style.display = 'flex';
    }


    let payment = document.getElementsByName('paymentMethod');
    let address = document.getElementsByName('address');


    let addressId = Array.from(address).filter(item => item.checked)[0].value
    let paymentMethod = Array.from(payment).filter(item => item.checked)[0].value

    if (paymentMethod == 'PayPal') {
        showSpinnner()
        return true
    }

    event.preventDefault();

    fetch('/api/v1/order-place', {
        method: 'POST',
        body: JSON.stringify({ address: addressId, paymentMethod }),
        headers: {
            'Content-Type': 'application/json',

        }

    }).then(response => response.json())
        .then(data => {
            if (data.success && data.orderType == 'Wallet') {
                Swal.fire({
                    title: 'Success!',
                    text: data.message,
                    width: '300px',
                    padding: '10px',
                    icon: 'success',


                    showConfirmButton: false,
                    timer: 2000,
                });
                setTimeout(() => {
                    return location.href = `/api/v1/order-success?orderId=${data.data._id}`

                }, 2100);
            }

            if (data.success && data.orderType == 'COD') {
                return location.href = `/api/v1/order-success?orderId=${data.data._id}`
            } else if (data.success && data.paymentType == 'RazorPay') {
                let options = {
                    "key": "" + data.key_id + "",
                    "amount": "" + data.amount + "",
                    "currency": "INR",
                    "name": "Test Transaction",
                    "description": "It is a test Transaction",
                    "image": "https://dummyimage.com//600x400/000/fff",
                    "handler": function (response) {
                        console.log(response, data)
                        verifyRazorPay(response, data);
                    },
                    "prefill": {
                        "contact": "" + data.contact + "",
                        "name": "" + data.name + "",
                        "email": "" + data.email + ""
                    },
                    "notes": {
                        "description": "" + "It si test Description",
                    },
                    "theme": {
                        "color": "#c7a520"
                    }

                }

                let razorpayObject = new Razorpay(options);
                razorpayObject.on('payment.failed', (response) => {
                    console.log(response);
                    handleRazorpayFailure(response, data);
                })
                razorpayObject.open();
            } else if (data.error) {
                Swal.fire({
                    title: 'Insufficient balance!',
                    text: data.message,
                    width: '300px',
                    padding: '10px',
                    icon: 'error',


                    showConfirmButton: false,
                    timer: 2000,
                });


            }

            function verifyRazorPay(response, data) {
                let paymentId = response.razorpay_payment_id;
                let orderId = data.orderId;
                fetch('orders/razorpay-success', {
                    method: 'PUT',
                    body: JSON.stringify({ paymentId, orderId }),
                    headers: {
                        'Content-Type': 'application/json',

                    }

                }).then(response => response.json())
                    .then(data => {
                        console.log(data)
                        Swal.fire({
                            titleText: 'Order placed successfylly',
                            width: '300px',
                            padding: '10px',
                            icon: 'success',


                            showConfirmButton: false,
                            timer: 1500,
                        });
                        setTimeout(() => {
                            location.href = `/api/v1/order-success?orderId=${data.data._id}`

                        }, 1600);


                    })

                function handleRazorpayFailure(response, data) {

                    let orderId = data.orderId;
                    fetch('orders/razorpay-failure', {
                        method: 'PUT',
                        body: JSON.stringify({ orderId }),
                        headers: {
                            'Content-Type': 'application/json',

                        }

                    }).then(response => response.json())
                        .then(data => {
                            console.log(data)
                            Swal.fire({
                                titleText: 'Something went wrong',
                                width: '300px',
                                padding: '10px',
                                icon: 'error',


                                showConfirmButton: false,
                                timer: 1500,
                            });
                            setTimeout(() => {
                                location.href = `api/v1/admin//my-orders/single-orderDetails?id=${data.data._id}`

                            }, 1600);
                        })


                }

            }
        })





}




function checkCouponValid() {



    fetch('/api/v1/check-valid-coupon', {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',

        }

    }).then(response => response.json())

        .then(data => {
            console.log(data)
            if (!data.success) {
                Swal.fire({
                    title: 'Do you want to remove',
                    text: data.message,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!',
                }).then((decision) => {
                    if (decision.isConfirmed) {
                        let discount = document.getElementById('remove-button').getAttribute('data-discount');
                        removeCoupon(discount);


                    } else {
                        return false

                    }
                })


            }
        })


}


window.addEventListener('load', () => {

    fetch('/api/v1/check-valid-coupon', {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',

        }

    }).then(response => response.json())

        .then(data => {
            console.log(data)
            if (!data.success) {
                Swal.fire({
                    title: 'Do you want to remove Coupon',
                    text: data.message,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!',
                }).then((decision) => {
                    if (decision.isConfirmed) {
                        let discount = document.getElementById('remove-button').getAttribute('data-discount');
                        removeCoupon(discount);


                    }
                })

            }
        })


})










function checkCoupon(event) {
    event.preventDefault();

    let codeInput = document.getElementById('coupon-input');
    let code = codeInput.value.trim();
    if (code.length < 2) {
        codeInput.style.border = '1px solid red';
        setTimeout(() => {
            codeInput.style.border = ''

        }, 2000);

        return false
    }

    fetch('/api/v1/apply-coupon', {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: {
            'Content-Type': 'application/json',

        }

    }).then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    text: data.message,
                    width: '300px',
                    padding: '10px',
                    icon: 'success',


                    showConfirmButton: false,
                    timer: 1500,
                });
                setTimeout(() => {
                    $("#Reload").load(`/api/v1/checkout #Reload`)

                }, 1500);

            } else {
                Swal.fire({
                    title: 'Oops!',
                    text: data.message,
                    width: '300px',
                    padding: '10px',
                    icon: 'error',


                    showConfirmButton: false,
                    timer: 1500,
                });

            }
        })
}



function removeCoupon(discount) {
    console.log(discount)

    fetch('/api/v1/remove-coupon', {
        method: "put",
        body: JSON.stringify({ discount }),
        headers: {
            'Content-Type': 'application/json',

        }

    }).then(response => response.json())
        .then(data => {
            if (!data.success) {
                Swal.fire({
                    text: data.message,
                    width: '300px',
                    padding: '10px',
                    icon: 'error',


                    showConfirmButton: false,
                    timer: 1500,
                });

            } else {
                Swal.fire({
                    icon: 'success',
                    titleText: "Removed!",
                    showConfirmButton: false,
                    timer: 1000,
                });


                setTimeout(() => {
                    $("#Reload").load(`/api/v1/checkout #Reload`)

                }, 1000);


            }
        })
}

document.addEventListener('DOMContentLoaded', () => {


    let coupons = document.querySelectorAll('.coupon-code');

    coupons.forEach(coupon => {
        coupon.addEventListener('click', (event) => {

            let couponValue = event.target.innerText;

            let tempInput = document.createElement('input');
            tempInput.value = couponValue;

            document.body.appendChild(tempInput);

            tempInput.select();
            tempInput.setSelectionRange(0, 99999);
            let range = document.createRange();
            range.selectNode(coupon);
            window.getSelection().removeAllRanges(); // Clear previous selections
            window.getSelection().addRange(range);


            document.execCommand('copy');

            document.body.removeChild(tempInput);

            let copyMessage = document.getElementById('copyMessage');
            copyMessage.style.display = 'block';

            setTimeout(() => {
                copyMessage.style.display = 'none';

            }, 2000)

        })

    })


})


