
document.addEventListener("DOMContentLoaded", function () {
    // Attach validation to the first form
    attachFormValidation("#exampleDiv form");

    // Attach validation to the second form
    

    function attachFormValidation(formSelector) {
      const form = document.querySelector(formSelector);

      form.addEventListener("submit", function (event) {
        // Prevent the form from submitting by default
        event.preventDefault();

        // Remove previous error messages
        clearErrorMessages(form);

        // Perform validation
        const name = form.elements.name.value.trim();
		
        const phone = form.elements.phone.value;
        const alternatePhone = form.elements.alternatePhone.value.trim();
        const district = form.elements.district.value.trim();
        const locality = form.elements.locality.value.trim();
        const pincode = form.elements.pincode.value.trim();

		const street = form.elements.street.value.trim();
       


    if (!/^[a-zA-Zà-žÀ-Ž0-9]{3,}([ '-][a-zA-Zà-žÀ-Ž0-9]+)*$/.test(name) ) {
          displayErrorMessage(form, "name", "Please enter a valid name.");
          return;
        }

       

        if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
          displayErrorMessage(
            form,
            "phone",
            "Enter a valid phone number."
          );
          return;
        }
		if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(alternatePhone)) {
          displayErrorMessage(
            form,
            "alternatePhone",
            "Enter a valid phone number."
          );
          return;
        }
        
        if (!/^[a-zA-Zà-žÀ-Ž0-9]{3,}([ '-][a-zA-Zà-žÀ-Ž0-9]+)*$/.test(district)  ) {
          displayErrorMessage(
            form,
            "district",
            "Please enter a valid district."
          );
          return;
        }
        
		if (locality.length <=4 ) {
          displayErrorMessage(
            form,
            "locality",
            "Please enter a valid locality."
          );
          return;
        }

		if (!/^[1-9][0-9]{5}$/.test(pincode)) {
          displayErrorMessage( 
            form,
            "pincode",
            "Enter a valid pincode number."
          );
          return;
        }

		if (street.length <=6 ) {
          displayErrorMessage(
            form,
            "street",
            "Please enter a valid street address."
          );
          return;
        }
      let formData = new FormData(form);
      
     

      fetch('/api/v1/profile/add-address',{
        method: 'POST',
        body: formData,
        
        

      }).then(response => response.json())
      .then(data => {
        console.log(data)
        Swal.fire({
             title: 'Sucess',
             text: data.message,
             icon: 'success',
             showConfirmButton: false,
             timer: 1500
        })
        setTimeout(() => {
          window.history.back(-1);
          
        }, 1600);

      })
      
      .catch(error => console.log(error))
        
        


       

        // Validate discount amount is a number
        

        // If all validations pass, you can submit the form
    
      });
    }

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
  });





			

			