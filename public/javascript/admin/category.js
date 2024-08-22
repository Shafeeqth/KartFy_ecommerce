function list(id, isListed, title) {
  const data = { id: id };
  console.log(data);
  let status = isListed ? "Unlist" : "List";
  if (id) {
    Swal.fire({
      title: "Are you sure",
      text: `You want to ${status} ${title}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!",
    })
      .then((res) => {
        if (res.isConfirmed) {
          console.log("ajax");
          $.ajax({
            type: "POST",
            url: "/api/v1/admin/category/listUnlist-category",
            data: JSON.stringify(data),
            contentType: "application/JSON",
            success: (res) => {
              if (res.ok) {
                $("#AreaReload").load("/api/v1/admin/category #AreaReload");
              }
            },
          });
        } else {
          console.log("Error in list");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

function edit(value, id) {
  document.getElementById("editmodal").style.display = "flex";
  const btn = document.getElementById("edit");

  console.log(value);
  console.log(id);
  const idInput = document.getElementById("id");
  const input = document.getElementById("editFeild");
  input.value = value;
  idInput.value = id;
}

function closeUpdate() {
  document.getElementById("editmodal").style.display = "none";
}

function editCetagory() {
  const id = document.getElementById("id");
  const input = document.getElementById("editFeild");

  var data = {
    id: id.value,
    data: input.value,
  };

  console.log(input.value, "POST");

  if (data) {
    $.ajax({
      type: "POST",
      url: "/api/v1/admin/editCetagory",
      data: JSON.stringify(data),
      contentType: "application/JSON",
      success: (res) => {
        if (res.updated) {
          $("#AreaReload").load("/api/v1/admin/category #AreaReload");
        } else if (res.fail) {
          Swal.fire({
            title: "Same name is not allowed",
            icon: "error",
            showConformButton: false,
            timer: 1500,
          });
        } else {
          return console.log("error");
        }
      },
    });
  } else {
    console.log("did not received data from edit cetagory");
  }
  closeUpdate();
}

document.addEventListener("DOMContentLoaded", function () {
  let searchInput = document.getElementById("searchInput");
  let noResultRow = document.createElement("tr");

  // Create the "no result found" row
  noResultRow.innerHTML =
    '<td colspan="4" class="text-center">No result found</td>';
  noResultRow.style.display = "none";
  noResultRow.style.fontSize = "20px";
  document.querySelector("#catTable tbody").appendChild(noResultRow);

  searchInput.addEventListener("keyup", function () {
    let searchTerm = searchInput.value.toLowerCase();
    let tableRows = document.querySelectorAll("#catTable tbody tr");

    let hasResults = false;

    tableRows.forEach((row) => {
      let nameColumn = row.querySelector("td:nth-child(2)"); // Adjust the index based on your table structure

      if (nameColumn) {
        let nameText = nameColumn.textContent.toLowerCase();
        row.style.display = nameText.includes(searchTerm) ? "" : "none";

        // Check if there are matching results
        if (nameText.includes(searchTerm)) {
          hasResults = true;
        }
      }
    });

    // Toggle the display of the "no result found" row based on search results
    noResultRow.style.display = hasResults ? "none" : "block";
  });
});
