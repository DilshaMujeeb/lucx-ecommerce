




function addToCart(prodId) {
  console.log(prodId, "productid for ajax");
  $.ajax({
    url: `/add-to-cart/${prodId}`,
    method: "GET",
    success: (response) => {
      console.log(response,"responseee");
       if (response.status) {
        console.log("kjbdewkjbfkbffk");
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
        document.getElementById("success").classList.remove("d-none");
        setTimeout(function () {
          document.getElementById("success").classList.add("d-none");
        }, 1000);
       } else if(response.status===false) {
         Swal.fire({
           title: "Out of Stock",
           text: "This product is currently out of stock.",
           icon: "warning",
           confirmButtonColor: "#3085d6",
           confirmButtonText: "OK",
         });
         // location.href = "/login";
      }
       else {
          location.href = "/login";
       }
    },
    error: (error) => {
      console.log(error);
    },
  });
  console.log("sssssssssssssssss");
}

// validation for adding products



function hideDiv() {
  document.getElementById("alert").style.display = "none";
}

setTimeout(hideDiv, 1000); // Hide the div after 1 second (1000 milliseconds)

function function5(event) {
  document.getElementById("img1").src = URL.createObjectURL(
    event.target.files[0]
  );
  document.getElementById("img2").src = URL.createObjectURL(
    event.target.files[1]
  );
  document.getElementById("img3").src = URL.createObjectURL(
    event.target.files[2]
  );
  document.getElementById("img4").src = URL.createObjectURL(
    event.target.files[3]
  );
}
