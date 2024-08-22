function listOrUnlist(id) {
  const data = { id: id };

  Swal.fire({
    text: "Are you sure",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes!",
  }).then((decision) => {
    if (decision.isConfirmed) {
      $.ajax({
        method: "put",
        url: "/api/v1/admin/coupons/list-unlist-coupon",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: (response) => {
          if (response.success === true) {
            $("#Reload").load("/api/v1/admin/coupons #Reload", null, () => {
              Swal.fire({
                title: `success`,
                icon: "success",
                width: "300px",
                showConfirmButton: false,
                timer: 1500,
              });
            });
          }
        },
      });
    }
  });
}

function editCoupon(id, name, description, edate, discount, limit, minCost) {
  console.log("function is called");
  console.log(edate);

  let date = new Date(edate);
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate()).padStart(2, "0");
  edate = `${year}-${month}-${day}`;
  console.log(`${year}-${month}-${day}`);

  document.getElementById("couponId").value = id;
  document.getElementById("name").value = name;
  document.getElementById("minCost").value = minCost;
  document.getElementById("edate").value = edate;
  document.getElementById("description").value = description;
  document.getElementById("discount").value = discount;
  document.getElementById("limit").value = limit;
  return;
}

document.addEventListener("DOMContentLoaded", function () {
  // Attach validation to the first form
  attachFormValidation("#exampleModal form");

  // Attach validation to the second form
  attachFormValidation("#exampleModal2 form");

  function attachFormValidation(formSelector) {
    const form = document.querySelector(formSelector);

    form.addEventListener("submit", function (event) {
      // Prevent the form from submitting by default
      event.preventDefault();

      // Remove previous error messages
      clearErrorMessages(form);

      // Perform validation
      const name = form.elements.name.value.trim();
      const edate = form.elements.edate.value;
      const description = form.elements.description.value.trim();
      const limit = form.elements.limit.value.trim();
      const discount = form.elements.discount.value.trim();
      const minOrder = form.elements.minOrder.value.trim();

      if (!/^(?=.*\S)[a-zA-Z0-9 ]{3,30}$/.test(name)) {
        displayErrorMessage(form, "name", "Please enter a valid coupon name.");
        return;
      }

      if (!/^(?=.*\S)[a-zA-Z0-9 ]{10,30}$/.test(name)) {
        displayErrorMessage(
          form,
          "description",
          "Description must be 10 charectors."
        );
        return;
      }

      if (isNaN(Number(discount)) || discount.length <= 0 || discount <= 0) {
        displayErrorMessage(
          form,
          "discount",
          "Please enter a valid discount percentage."
        );
        return;
      }
      if (discount > 95) {
        displayErrorMessage(form, "discount", "Discount maximum is 95.");
        return;
      }

      if (isNaN(Number(minOrder)) || minOrder.length < 1 || minOrder < 1) {
        displayErrorMessage(form, "minOrder", "Please enter a valid amount.");
        return;
      }

      const dateRegex =
        /^(?:19|20)\d\d-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/;
      console.log(edate);

      if (edate.length < 1 || !dateRegex.test(edate)) {
        displayErrorMessage(
          form,
          "edate",
          "Invalid date format. Please use dd-mm-yyyy."
        );
        return;
      }

      if (isNaN(Number(limit)) || limit < 1 || limit > 1000) {
        displayErrorMessage(form, "limit", "Please enter a limit of use.");
        return;
      }

      // Validate discount amount is a number

      // If all validations pass, you can submit the form
      form.submit();
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
