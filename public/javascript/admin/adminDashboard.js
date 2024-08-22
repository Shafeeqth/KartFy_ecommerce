async function applyFilter() {
    console.log("hiiiii");
    const filter = document.getElementById("filter").value;
    console.log(filter);
    if (filter) {
      const response = await axios.post("/api/v1/admin/get-fiter-data", {
        data: filter,
      });
      console.log("heloo", response.data);
      document.getElementById('removeFilter').style.display = 'inline-block';
      updateChart(response.data.data, response.data.newData);
    }
  }

  function clearFilter() {
    console.log('hello')
    window.location.reload();
  }

  function createMonthArray(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    console.log(daysInMonth);
    const monthArray = Array.from(
      { length: daysInMonth },
      (_, index) => index + 1
    );
    return monthArray;
  }

  const data = JSON.parse(
    document.getElementById("gragh").getAttribute("data-monthlyData")
  );
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  console.log(labels);
  const ctx = document.getElementById("monthlySalesChart").getContext("2d");

  const monthlySalesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "2024",
          data: data,
          backgroundColor: "rgba(75, 192, 192, 0.5)", // Bar color
          borderColor: "rgba(75, 192, 192, 1)", // Border color
          borderWidth: 2, // Border width
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Monthly Sales Overview",
          font: {
            size: 16,
            weight: "bold",
          },
        },
      },
    },
  });

  function updateChart(month, newData) {
    const monthData = month.toString().split("-");
    const day = createMonthArray(monthData[0], monthData[1]);
    // Ensure monthlySalesChart exists before updating
    if (monthlySalesChart) {
      monthlySalesChart.data.labels = day;
      monthlySalesChart.data.datasets[0].data = newData;
      monthlySalesChart.update();
    } else {
      console.error("Chart instance not found. Cannot update.");
    }
  }