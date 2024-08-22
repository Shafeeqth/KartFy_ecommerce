
function printInvoice(orderId) {
    const downloadButton = document.getElementById('download');
       downloadButton.innerHTML = '   <span class="spinner-border spinner-border-md mx-3" role="status" style="" aria-hidden="true"></span> Downloading...'

    fetch('/api/v1/my-orders/single-orderDetails/order-invoice-download', {
        method: "POST",
        body: JSON.stringify({orderId}),
        headers: {
                'Content-Type': 'application/json'
            },
    }).then(response=> response.blob())
    .then(data => {
        console.log(data)
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(data);
        link.download = `invoice${orderId}.pdf`;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        downloadButton.innerHTML = '<i class="fas fa-file-invoice"></i>	Download Invoice';




    })
    .catch(error =>{
        Swal.fire({
            icon: 'error',
            title:'Oops!',
            text:'something went wrong'
        })
         console.log(error)
});

}

document.addEventListener('DOMContentLoaded', (event) => {

    function addRating() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating');

    stars.forEach(star => {
        star.addEventListener('click', function () {
            const rating = parseInt(this.getAttribute('data-rating'));
            ratingInput.value = rating;
            highlightStars(rating);
            
            
        });
    });

    function highlightStars(rating) {
        stars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= rating) {
                star.classList.add('filled');
            } else {
                star.style.background = 'white';
                star.style.color = 'lightgoldenrodyellow';
            }
            addRating()
        });
        
    }

}
addRating();
})


function reviewModalLogic(orderId, productId, size, orderedItemId) {


    let reviewModal = document.getElementById('reviewModal');
    reviewModal.classList.add('show');
    reviewModal.style.display = 'block';
    document.body.classList.add('modal-open');


    

    // //hide the unfilled stars
    // const maxRating = 5; // Maximum rating
    // stars.forEach(star => {
    // 	const starRating = parseInt(star.getAttribute('data-rating'));
    // 	if (starRating > maxRating) {

    // 	}
    // });

    const reviewForm = document.getElementById('reviewForm');
    reviewForm.addEventListener('submit', function (event) {
        let form = document.forms['reviewForm']
        let reviewInput = form.elements.reviewInput;
        let comment = form.elements.comment;
        let rate = form.elements.rating

        if (!rate.value) {
            displayErrorMessage(form, "rating", "rating is requred!.");
            return;
        }

        if (reviewInput.value.trim().length <= 2) {
            displayErrorMessage(form, "reviewInput", "Please enter a valid review.");
            return;
        }
        if (comment.value) {

            if (comment.value.trim().length <= 5) {
                displayErrorMessage(form, "comment", "Please enter a valid comment.");
                return;
            }
        }





        // let reveiw = form.elements.reviewInput.value.trim();
        // let comment = form.elements.comment.innerText.trim();
        // console.log(review , comment);




        event.preventDefault();

        const formData = new FormData(reviewForm);
        formData.append('orderId', orderId);
        formData.append('productId', productId);
        formData.append('review', reviewInput.value);
        formData.append('orderedItemId', orderedItemId);
        formData.append('size', size)

        const data = Object.fromEntries(formData.entries());


        fetch('/api/v1/product-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Review submitted successfully:', data);
                setTimeout(() => {
                    window.location.reload();

                }, 1600);
                Swal.fire({
                    title: 'Success',
                    icon: 'success',
                    text: data.message,
                    //  toast:true,

                    showConfirmButton: false,
                    timer: 1500,

                });



            })
            .catch(error => {
                console.error('Error submitting review:', error);
            });
    });


    function displayErrorMessage(form, fieldName, message) {
        const field = form.elements[fieldName];
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.style.color = "red"; // Set color to red
        errorDiv.textContent = message;
        field.parentNode.insertBefore(errorDiv, field);

        // Remove error message after 3000 milliseconds (3 seconds)
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    function clearErrorMessages(form) {
        const errorMessages = form.querySelectorAll(".error-message");
        errorMessages.forEach((errorMessage) => {
            errorMessage.remove();
        });
    }


};

function returnProduct(orderId, size, productId,quantity, price, orderedItemId) {
    let returnOrderButton = document.getElementById('confirmReturnOrder');
    returnOrderButton.addEventListener('click', function () {
        var reason = document.getElementById('returnReason').value;
        var comments = document.getElementById('returnComments').value;


        fetch('/api/v1/orders/order-return', {
            method: "POST",
            body: JSON.stringify({
                reason,
                comments,
                orderId,
                size,
                productId,
                quantity,
                price,
                orderedItemId
            }),
            headers: {
                'Content-Type': 'application/json',

            }

        }).then(response => response.json())
            .then(response => {
                
                    setTimeout(() => {
                        window.location.reload(true)
                        
                    }, 1600);
                    
                
                console.log(response);
                Swal.fire({
                    
                    icon: 'success',
                    text: data.message,
                    //  toast:true,

                    showConfirmButton: false,
                    timer: 1500,

                });
                
            })









        document.body.classList.remove('modal-open');
    });
}



document.addEventListener('DOMContentLoaded', function () {
    // Get modal elements
    let returnOrderModal = document.getElementById('returnOrderModal');

    // Get buttons to trigger modals
    let returnOrderButton = document.getElementById('confirmReturnOrder');

    // Example trigger events
    // Replace these with your own trigger logic
    let returnOrderTrigger = document.querySelectorAll('.returnOrderTrigger');

    // Function to open cancel order modal

    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', (event) => {
            returnOrderModal.classList.remove('show');
            document.body.classList.remove('modal-open');

        })
    })


    // Function to open return order modal
    function openReturnOrderModal() {
        returnOrderModal.classList.add('show');
        returnOrderModal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
    console.log(returnOrderTrigger)

    // Add event listener to cancel order button


    // Add event listener to return order button


    // Example trigger events
    // Replace these with your own trigger logic


    returnOrderTrigger.forEach(item => item.addEventListener('click', openReturnOrderModal));
});