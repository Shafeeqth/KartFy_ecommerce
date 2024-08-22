document.addEventListener('DOMContentLoaded' , function(e) {

    document.querySelectorAll('.edit-btn').forEach(item => {
        item.addEventListener('click', function editProduct(e) {
    let element = e.target;
    let inputElem = element.parentNode.children[1]
    let submitElem = element.parentNode.children[2]
    console.log(element, inputElem, submitElem);
   
    element.classList.replace('btn-dark', 'btn-danger');
    element.innerText = 'Cancel'
   
    element.removeEventListener('click', editProduct)
    element.addEventListener('click', function() {
        inputElem.style.display = 'none'
        submitElem.style.display = 'none'
        element.innerText = 'Edit'

        element.addEventListener('click',editProduct);
        element.classList.replace( 'btn-danger','btn-dark');


    })


    inputElem.style.display = 'inline-block'
    submitElem.style.display = 'inline-block'


    submitElem.addEventListener('click', function () {
        let count = inputElem.value;
        console.log(inputElem.value)
        if (!/^-?\d+$/.test(count)) {
            showMessage(
                'Error! invalid count!',
                element
            )
            return

        }
        if (+count.trim() < 0) {
            showMessage(
                "Count cant't be less than 0",
                element
            )
            return

        }
        if (+count > 1000) {
            showMessage(
                "Count must be less than 1000",
                element
            )
            return


        }
        let itemId = inputElem.getAttribute('data-itemId');
        let productId = inputElem.getAttribute('data-productId');
        console.log(itemId)
        let size = inputElem.dataset.size;
            fetch('/api/v1/admin/products/edit-product-stock', {
            method: 'PATCH',
            body: JSON.stringify({count,itemId, productId ,size, }),
            headers: {
                     'Content-Type': 'application/json'
                     }
        }).then(response => response.json())
            .then(response => {
                console.log(response);
                Swal.fire({
                    title: 'Success!',
                    text: response.message,
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                });
              
               window.location.reload()
            })



        function showMessage(message, element) {
            const errorDiv = document.createElement("div");
            errorDiv.className = "error-message";
            errorDiv.style.color = "red";
            errorDiv.textContent = message;
            console.log(errorDiv)
            element.parentNode.insertBefore(errorDiv, element);
            setTimeout(() => {
                errorDiv.remove()

            }, 3000);


        }

    })


} )
    })
})



try {

    document.addEventListener('DOMContentLoaded', function () {

        let openModalButton = document.getElementById('openAddStockModal');
        let submitButton = document.getElementById('submitStock');
        let modal = document.getElementById('addStockModal');
        let bootstrapModal = new bootstrap.Modal(modal);

        openModalButton.addEventListener('click', function () {
            bootstrapModal.show();
            bootstrapModal.hide();
        });

        submitButton.addEventListener('click', function () {
            let id = document.querySelector('.product-row').getAttribute('data-target')

            let sizeInput = document.getElementById('size');
            let quantityInput = document.getElementById('quantity');
            let quantityError = document.getElementById('quantityError');
            let size = sizeInput.value;
            let quantity = quantityInput.value;

            if (quantity.trim().length < 1 || Number(quantity) <= 0 || Number(quantity) >= 1500 || isNaN(Number(quantity))) {
                quantityInput.style.border = '1px red solid';
                quantityError.innerText = 'Invalid quantity! try agin'


                setTimeout(() => {
                    quantityInput.style.border = '';
                    quantityError.innerText = ''


                }, 3000);
                return false

            }

            // AJAX request to add stock
            let xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/v1/admin/products/add-stock', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        let response = JSON.parse(xhr.responseText);
                        console.log(response)
                        if (response.success == true) {
                            // Reload the product list or do any other necessary actions


                            // Close the modal
                            bootstrapModal.hide();
                            // Show success message
                            Swal.fire({
                                title: 'Stock Added!',
                                icon: 'success',
                                text: 'Stock has been successfully added.',
                                showCancelButton: false,
                                showConfirmButton: false,
                                timer: 1000,
                            });
                            setTimeout(() => {
                                window.location.reload(true);
                            }, 100)
                        } else {
                            // Handle error response
                            Swal.fire({
                                title: 'Error!',
                                icon: 'error',

                                text: 'Failed to add stock. Please try again later.',
                                timer: 1500,
                            });
                        }
                    }
                }
            };
            xhr.send(JSON.stringify({ quantity, size, id }));
        });
    });
} catch (error) {
    console.log(error)

}

