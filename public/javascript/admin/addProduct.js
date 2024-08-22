let cropper;
  function previewImage(event) {
    const input = event.target;
    let idNumber = input.getAttribute('data-id');
    console.log(idNumber, 'id')

    const preview = document.getElementById(`imagePreview${idNumber}`);
    const imageElement = document.querySelector(`.imagecrop${idNumber}`);

    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = function (e) {

        $(document).ready(function () {
          $(`#imageModal${idNumber}`).modal ('show');

          let modal = document.getElementById(`imageModal${idNumber}`);

        });

        let img = document.createElement('img');
        img.id = `image`;
        img.src = e.target.result;
        console.log(imageElement, 'imageElemtn')

        imageElement.appendChild(img);

        cropper = new Cropper(img, {
          // aspectRatio: 1/1,
          viewMode: 0,
          dragMode: 'move',
          responsive: true,
          modal: true,
          data: null,
          guides: true,
          highlight: true,
          background: true,
          rotatable: true,
          scalable: true,
          cropBoxResizable: true,

          initialAspectRatio: 1 / 1,
          minContainerWidth: 450,
          minContainerHeight: 500,
          // minCropBoxHeight: 400,
          // minCropBoxWidth: 400,
          minCanvasHeight: 500,
          minCanvasWidth: 500,
          // crop(event) {
          //   console.log(event.detail.x);
          //   console.log(event.detail.y);
          //   console.log(event.detail.width);
          //   console.log(event.detail.height);
          //   console.log(event.detail.rotate);
          //   console.log(event.detail.scaleX);
          //   console.log(event.detail.scaleY);
          // }

        });


      }
      reader.readAsDataURL(input.files[0]);


    }
   

      const cropButton = document.getElementById(`cropButton${idNumber}`);
      cropButton.addEventListener('click', function () {
        let modal = document.getElementById(`imageModal${idNumber}`);

        let bootsrapModal = bootstrap.Modal.getInstance(modal);
        bootsrapModal.hide();

        let imgSrc = cropper.getCroppedCanvas().toDataURL('image/jpeg');
        preview.src = imgSrc;



      })



    }








  function productValidation(event) {
        let title = document.getElementById("title");
        let description = document.getElementById("description");
        let mrpPrice = document.getElementById("mrpPrice");
        let price = document.getElementById("price");


        let titleError = document.getElementById("titleError");
        let descriptionError = document.getElementById("descriptionError");
        let mrpError = document.getElementById("mrpError");
        let priceError = document.getElementById("priceError");
        let imageError = document.getElementById("imageError");


        let titleDiv = document.getElementById("titleDiv");
        let imageDiv = document.getElementById("imageDiv");


        let image1 = document.getElementById("image1");
        let image2 = document.getElementById("image2");
        let image3 = document.getElementById("image3");
        let image4 = document.getElementById("image3");




        if (title.value.trim() === "") {
          title.style.border = "solid 1px red";
          titleError.innerText = "Title is a required field"
          titleDiv.scrollIntoView({
            behavior: "smooth",
            block: 'center',
            inline: "center"
          });
          setTimeout(function () {
            title.style.border = "";
            titleError.innerText = ""
          }, 3000);


          return false
        }
        if (title.value.trim().length < 3) {
          title.style.border = "solid 1px red";
          titleError.innerText = "Title should be 3 charector long "
          titleDiv.scrollIntoView({
            behavior: "smooth",
            block: 'center',
            inline: "center"
          });
          setTimeout(function () {
            title.style.border = "";
            titleError.innerText = ""
          }, 3000);

          return false;
        }
          if (!/^[a-zA-Zà-žÀ-Ž]{3,}(?:[ '][a-zA-Zà-žÀ-Ž0-9]*)*$/.test(title.value.trim())) {
          title.style.border = "solid 1px red";
          titleError.innerText = "Title must be valid "
          titleDiv.scrollIntoView({
            behavior: "smooth",
            block: 'center',
            inline: "center"
          });
          setTimeout(function () {
            title.style.border = "";
            titleError.innerText = ""
          }, 3000);

          return false;
        
        } else if (
          description.value.trim() === "" ||
          description.value.trim().length < 20
        ) {
          if (description.value.trim() === '') {
            description.style.border = "solid 1px red";
            descriptionError.innerText = "Description should not be Empty "
            descriptionDiv.scrollIntoView({
              behavior: "smooth",
              block: 'center',
              inline: "center"
            });
            setTimeout(function () {
              description.style.border = "";
              descriptionError.innerText = ""
            }, 3000);

          }
          else if(!/^[a-zA-Zà-žÀ-Ž]{3,}(?:[ '][a-zA-Zà-žÀ-Ž0-9]*)*$/.test(description.value.trim())) {
            description.style.border = "solid 1px red";
            descriptionError.innerText = "Description should not start with number or special charector "
            descriptionDiv.scrollIntoView({
              behavior: "smooth",
              block: 'center',
              inline: "center"
            });
            setTimeout(function () {
              description.style.border = "";
              descriptionError.innerText = ""
            }, 3000);
          }
          else {
            description.style.border = "solid 1px red";
            descriptionError.innerText = "Title should be 20 charector long "
            descriptionDiv.scrollIntoView({
              behavior: "smooth",
              block: 'center',
              inline: "center"
            });
            setTimeout(function () {
              description.style.border = "";
              descriptionError.innerText = ""
            }, 3000);

          }

          return false;
        } else if (
          mrpPrice.value.trim() === "" ||
          Number(mrpPrice.value) <= 0 ||
          isNaN(mrpPrice.value)
        ) {
          if (mrpPrice.value.trim() === "") {

            mrpPrice.style.border = "solid 1px red";
            mrpError.innerText = "MRP field should not be Empty "
            mrpDiv.scrollIntoView({
              behavior: "smooth",
              block: 'center',
              inline: "center"
            });
            setTimeout(function () {
              mrpPrice.style.border = "";
              mrpError.innerText = ""
            }, 3000);


          } else if (isNaN(mrpPrice.value)) {
            mrpPrice.style.border = "solid 1px red";
            mrpError.innerText = "Invalid input!"
            mrpDiv.scrollIntoView({
              behavior: "smooth",
              block: 'center',
              inline: "center"
            });
            setTimeout(function () {
              mrpPrice.style.border = "";
              mrpError.innerText = ""
            }, 3000);

          } else {
            mrpPrice.style.border = "solid 1px red";
            mrpError.innerText = "MRP can not be less than zero "
            mrpDiv.scrollIntoView({
              behavior: "smooth",
              block: 'center',
              inline: "center"
            });
            setTimeout(function () {
              mrpPrice.style.border = "";
              mrpError.innerText = ""
            }, 3000);

          }

          return false;
        } else if (
          price.value.trim() === "" ||
          Number(price.value) <= 0 ||
          isNaN(price.value) ||
          mrpPrice.value < price.value
        ) {
          if (price.value.trim() === "") {

            price.style.border = "solid 1px red";
            priceError.innerText = "Price field should not be Empty "
            priceDiv.scrollIntoView({
              behavior: "smooth",
              block: 'center',
              inline: "center"
            });
            setTimeout(function () {
              price.style.border = "";
              priceError.innerText = ""
            }, 3000);


          } else if (isNaN(price.value)) {
            price.style.border = "solid 1px red";
            priceError.innerText = "Invalid input!"
            priceDiv.scrollIntoView({
              behavior: "smooth",
              block: 'center',
              inline: "center"
            });
            setTimeout(function () {
              price.style.border = "";
              priceError.innerText = ""
            }, 3000);

          } else if (+mrpPrice.value < +price.value) {
            price.style.border = "solid 1px red";
            priceError.innerText = "Price can not be more than MRP"
            priceDiv.scrollIntoView({
              behavior: "smooth",
              block: 'center',
              inline: "center"
            });
            setTimeout(function () {
              price.style.border = "";
              priceError.innerText = ""
            }, 3000);

          } else if (Number(price.value) <= 0) {
            price.style.border = "solid 1px red";
            priceError.innerText = "Price can not be less than zero "
            priceDiv.scrollIntoView({
              behavior: "smooth",
              block: 'center',
              inline: "center"
            });
            setTimeout(function () {
              price.style.border = "";
              priceError.innerText = ""
            }, 3000);
          }
          return false;

        } else if (image1.files.length == 0 ||
          image2.files.length == 0 ||
          image3.files.length == 0 ||
          image4.files.length == 0) {

          imageError.innerText = "Four Images is required "
          imageDiv.scrollIntoView({
            behavior: "smooth",
            block: 'center',
            inline: "center"
          });
          setTimeout(function () {

            imageError.innerText = ""
          }, 3000);


          return false

        } else {
          return true
        }



      }