

function retryPayment(orderId, paymentMethod) {
    console.log(orderId,)
    fetch('/api/v1/retry-order-payment', {
        method: 'PUT',
        body: JSON.stringify({ orderId }),
        headers: {
            'Content-Type': 'application/json',

        }

    }).then(response => response.json())
        .then(data => {
            console.log(data)


            if (data.success) {
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
                fetch('orders/razorpay-retry-success', {
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
                    fetch('orders/razorpay-retry-failure', {
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



function orderDetails(id) {
    window.location.href = '/api/v1/my-orders/single-orderDetails?id=' + id;
}

document.addEventListener('DOMContentLoaded', function () {
    // Get modal elements
    var cancelOrderModal = document.getElementById('cancelOrderModal');


    // Get buttons to trigger modals
    var cancelOrderButton = document.getElementById('confirmCancelOrder');


    // Example trigger events
    // Replace these with your own trigger logic
    var cancelOrderTrigger = document.querySelectorAll('.cancelOrderTrigger');


    document.querySelectorAll('.closeButton').forEach(item => {
        item.addEventListener('click', () => {

            cancelOrderModal.classList.remove('show');
            document.body.classList.remove('modal-open');
        })

    })
    // Function to open cancel order modal
    function openCancelOrderModal() {
        cancelOrderModal.classList.add('show');
        cancelOrderModal.style.display = 'block';
        document.body.classList.add('modal-open');


    }
    // Example trigger events
    // Replace these with your own trigger logic
    var cancelOrderTrigger = document.querySelectorAll('.cancelOrderTrigger');


    cancelOrderTrigger.forEach(item => {
        item.addEventListener('click', () => {
            openCancelOrderModal()

            // Add event listener to cancel order button
            cancelOrderButton.addEventListener('click', function () {
                var reason = document.getElementById('cancelReason').value;
                var comments = document.getElementById('cancelComments').value;
                let id = item.getAttribute("data-orderId");

                fetch('/api/v1/order-cancel', {
                    method: "PUT",
                    body: JSON.stringify({
                        reason,
                        comments,
                        id,
                    }),
                    headers: {
                        'Content-Type': 'application/json',

                    }

                }).then(response => response.json())
                    .then(response => {
                        console.log(response);
                        if (response.success == true) {
                        Swal.fire({
                            titleText: 'Success',
                            width: '300px',
                            padding: '10px',
                            icon: 'success',


                            showConfirmButton: false,
                            timer: 1500,
                        });
                        setTimeout(() => {
                            window.location.reload(true)

                        }, 1600);
                        
                            
                        }
                    })
            });


        });

    });

    cancelOrderModal.classList.remove('show');
    document.body.classList.remove('modal-open');
});

