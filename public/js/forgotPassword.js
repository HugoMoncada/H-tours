
const sendForgotPasswordEmail = async (email) => {

    const postData = {
        email
    }

    try {

        const call = await fetch ("/api/v1/users/forgotPassword", {
            method: "POST", 
            headers:{
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(postData)
        });
    
        const response = await call.json(); 
    
        if(response.status == "Success"){
            showAlert("success", `We have send you an Email to ${email} to reset your password`);
            setTimeout(() => {
                location.assign("/"); 
            }, 2000);
        }
        else{
            console.log(response)
            showAlert("danger", response.message);
            setTimeout(() => {
                location.assign("/forgotPassword");
            }, 2500);
        }

    } catch (error) {
        throw new Error(error)
    }

} 

if(document.getElementById("forgotMyPasswordForm")){
    document.getElementById("forgotMyPasswordForm").addEventListener("submit", (e) => {
        e.preventDefault(); 
        
        document.getElementById("btnForgotPassword").innerText = "Loading..."
    
        const email = document.getElementById("email").value; 
    
        sendForgotPasswordEmail(email); 
    
    });
}

