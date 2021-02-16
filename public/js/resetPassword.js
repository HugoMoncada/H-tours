

const resetPassword = async (token,password,passwordConfirm) => {

    try {
        const postData= {
            password, 
            passwordConfirm
        }

        const call = await fetch(`/api/v1/users/resetPassword/${token}`, {
            method: "PATCH",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })

        const response = await call.json(); 
        console.log(response)
        
        if(response.status == "Success"){
            showAlert("success", "Password Reset Completed");
            setTimeout(() => {
                location.assign("/"); 
            }, 2000);
        }
        else{
            showAlert("danger", response.message);
        }

    } catch (error) {
        throw new Error(error);
    }

}

if(document.getElementById("resetMyPasswordForm")){
    document.getElementById("resetMyPasswordForm").addEventListener("submit", (e) => {
        e.preventDefault()
        const password = document.getElementById("password").value
        const passwordConfirm = document.getElementById("passwordConfirm").value    
        const resetToken = document.getElementById("resetToken").innerHTML   
        
    
        resetPassword(resetToken, password,passwordConfirm);
    });
}
