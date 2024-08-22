
function sendMessage() {
    let title = document.getElementById("title")
    let description = document.getElementById("description")

    let titleError = document.getElementById("titleError")
    let descriptionError = document.getElementById("descriptionError")

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


      return false;
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
      titleError.innerText = "Title must be a valid titel "
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
      description.value.trim() === "" 
      // ||
      
      // !/^[a-zA-Zà-žÀ-Ž]{10,}(?:[ '][a-zA-Zà-žÀ-Ž0-9]*)*$/.test(description.value.trim())
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
      else {
        description.style.border = "solid 1px red";
        descriptionError.innerText = "Description should be 10 charector long and valid "
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
    }

    console.log(title, description)

    let data =  { title: title.value, description: description.value };

    

      fetch("/api/v1/admin/category/add-category", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',

        }

      }).then(response => response.json())
        .then(response => {
          console.log(response)
          if (response.success) {
            Swal.fire({
              title: "Saved!",
              text: response.message,
              icon: "success",
              showConfirmButton: false,
              timer: 3000,
            });

            setTimeout(() => {
              window.history.back(-1);
            },3100)

          }else if(response.error) {
            
              Swal.fire({
                title: 'Oops',
                text: response.message,
                icon: "warning",
                showConfirmButton: false,
                timer: 1500,
              })
          }
        })

      
    

  }
