// In case the image file doesnt exist replace with default
document.getElementById('photo-account-img').onerror = function() { 
  document.getElementById('photo-account-img').src = "/img/users/default.jpg"; 
}


// const hideAlert = () => {
//   const el = document.querySelector(".alert")
//   if(el) el.parentElement.removeChild(el);
// }

// const showAlert = (type, msg) => {
//   hideAlert(); 
//   const markup = `<div class="alert alert-${type} text-center">${msg}</div>`;
//   document.querySelector(".container").insertAdjacentHTML("afterbegin", markup);
//   window.setTimeout(hideAlert,5000);
// }



// Change preview photo
document.getElementById("photo").addEventListener("click", (e) => {
  e.target.value = null; 
});

// Here only use change ... if i create and element and call the event on it then i use ONchange
document.getElementById("photo").addEventListener("change", (e) => {
    let reader = new FileReader();
    reader.onload = function(){
      let img = document.getElementById('photo-account-img');
      img.src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

// --------------------------------------------------


const updateData = async (data) => {
  try {
      // Using axios here because of the photo file 
      const url = `/api/v1/users/updateMe`
      
      const response = await axios({
        method: "PATCH",
        url,
        data
      });

      if( response.data.status == "Success"){
        showAlert("success", "Data updated sucessfuly");
        setTimeout(() => {
            location.assign("/account"); 
        }, 1000);
      }
      else{
        showAlert("danger", `${response.message}`);
      }

  } catch (error) {
      // console.log(error)
      showAlert("danger", `${error}`);
      
  }
}


const updatePassword = async (currentPassword,newPassword,confirmPassword) => {
  try {
    const updateData={
      passwordCurrent: currentPassword, 
      password: newPassword, 
      passwordConfirm: confirmPassword
    }
    const call = await fetch("/api/v1/users/updateMyPassword", {
      method: "PATCH",
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    }); 
    const response = await call.json(); 
    if(response.status == "Success"){
      showAlert("success", "Password updated sucessfuly");
      setTimeout(() => {
          location.assign("/account"); 
      }, 1000);
    }
    else{
      showAlert("danger", `${response.message}`);
    }

  } catch (error) {
    showAlert("danger", `${error}`);
  }
}


document.getElementById("accoutDataForm").addEventListener("submit", (e) => {
  e.preventDefault()

  // Recreate a form when sending files
  const form = new FormData();
  form.append("name", document.getElementById("name").value );
  form.append("email", document.getElementById("email").value );
  form.append("photo", document.getElementById("photo").files[0]);

  updateData(form); 
}); 


document.getElementById("accoutPasswordForm").addEventListener("submit", (e) => {
  e.preventDefault(); 

  const currentPassword = document.getElementById("currentPassword").value
  const newPassword =     document.getElementById("newPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  
  updatePassword(currentPassword,newPassword,confirmPassword);

});