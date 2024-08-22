function previewImage(event) {
  const input = event.target.files[0];
  // let idNumber = input.getAttribute('data-id');
  console.log(input, "id");

  const reader = new FileReader();

  reader.onload = function (e) {
    console.log(input);

    document.getElementById(`imagePreview`).src = e.target.result;
  };

  reader.readAsDataURL(input);
}

function previewImage1(event) {
  const input = event.target.files[0];
  // let idNumber = input.getAttribute('data-id');
  console.log(input, "id");

  const reader = new FileReader();

  reader.onload = function (e) {
    console.log(input);

    document.getElementById(`imagePreview1`).src = e.target.result;
  };

  reader.readAsDataURL(input);
}

function listOrUnlist(id) {
  const data = { bannerId: id };

  Swal.fire({
    titleText: "Are you sure",
    width: "400px",

    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes!",
  }).then((decision) => {
    if (decision.isConfirmed) {
      $.ajax({
        method: "put",
        url: "/api/v1/admin/banners/list-unlist-banner",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: (response) => {
          if (response.success === true) {
            $("#Reload").load("/api/v1/admin/banners #Reload", null, () => {
              Swal.fire({
                title: `Success`,
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

function editCoupon(id, name, description, url, image) {
  console.log("function is called");
  // console.log(edate);

  // let date = new Date(edate)
  // let year = date.getFullYear();
  // let month = String(date.getMonth() + 1).padStart(2, '0');
  // let day = String(date.getDate()).padStart(2, '0');
  // edate = `${year}-${month}-${day}`
  // console.log(`${year}-${month}-${day}`)

  document.getElementById("bannerId").value = id;
  document.getElementById("name").value = name;
  document.getElementById("url").value = url;

  document.getElementById("description").value = description;
  document.getElementById("imagePreview1").src =
    "/Data/banners/sharped/" + image;

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
      const description = form.elements.description.value.trim();
      const url = form.elements.url.value.trim();
      const id = form.elements.id?.value;

      const image = form.elements.image ?? null;

      if (!/^(?=.*\S)[a-zA-Z0-9 ]{3,30}$/.test(name)) {
        displayErrorMessage(form, "name", "Please enter a valid coupon name.");
        return;
      }

      if (
        !/^[a-zA-Zà-žÀ-Ž]{10,}(?:[ '][a-zA-Zà-žÀ-Ž0-9]*)*$/.test(description)
      ) {
        displayErrorMessage(
          form,
          "description",
          "Description must be 10 charectors. and valid"
        );
        return;
      }

      if (url.length <= 3 && !/[^\s/$.?#].[^\s]*$/.test(url)) {
        displayErrorMessage(form, "url", "url must be valid.");
        return;
      }
      if (!id) {
        if (image.files.length == 0) {
          displayErrorMessage(form, "image", "image is required.");
          return;
        }
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

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".product-row").forEach((row) => {
    row.addEventListener("dblclick", (event) => {
      console.log("comes here");
      try {
        let targetId = event.currentTarget.dataset.target;
        console.log(targetId);
        window.location.href = `/api/v1/admin/products/product-detail?id=${targetId}`;
      } catch (error) {
        console.log(error);
      }
    });
  });
});

function listProduct(id, title, isListed) {
  const data = {
    id: id,
  };
  let status = isListed ? "Unlist" : "List";

  Swal.fire({
    text: `Do you want to ${status} ${title}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "3085d6",
    cancelButtonColor: "d33",
    confirmButtonText: "Yes",
  }).then((response) => {
    if (response.isConfirmed) {
      $.ajax({
        type: "put",
        url: "/api/v1/admin/products/list-product",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: (response) => {
          if (response.ok) {
            $("#Reload").load("/api/v1/admin/products #Reload");
            Swal.fire({
              title: `${status}ed!`,
              icon: "success",
              text: `Successfully ${status}ed ${title}`,
              times: 1500,
            });
          }
        },
      });
    }
  });
}

function Delete(id, title) {
  const data = { id: id };
  Swal.fire({
    title: "Are you sure!",
    text: `Do you want to delete ${title}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "3085d6",
    cancelButtonColor: "d33",
    confirmButtonText: "Yes",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "delete",
        url: "/api/v1/admin/products/delete-product",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: (response) => {
          if (response.ok) {
            $("#Reload").load("/api/v1/admin/products #Reload", () => {
              Swal.fire({
                title: "Deleted!",
                icon: "success",
                text: "Successfully deleted!",
                times: 1500,
              });
            });
          }
        },
      });
    }
  });
}
