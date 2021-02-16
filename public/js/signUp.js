
const signUp = async (name,email,password,passwordConfirm) => {

    const postData = {
        name,
        email, 
        password,
        passwordConfirm
    }

   try {
        const call = await fetch("/api/v1/users/signUp",  {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(postData)
        });

        const response = await call.json();
        console.log(response)

        if(response.status == "Success"){
            showAlert("success", "Welcome To Natours");
            setTimeout(() => {
                location.assign("/all-tours"); 
            }, 1000);
        }
        else{
            showAlert("danger", response.message);
            setTimeout(() => {
                location.assign("/signUp");
            }, 2500);
        }
   } catch (error) {
        throw new Error(error)
   }

}



if(document.getElementById("formSignUp")){
    
    document.getElementById("formSignUp").addEventListener("submit", (e) => {
        e.preventDefault();
        
        document.getElementById("signUpButton").innerText = "Loading...";

        const name = document.getElementById("name").value; 
        const email = document.getElementById("email").value; 
        const password = document.getElementById("password").value; 
        const passwordConfirm = document.getElementById("passwordConfirm").value; 

        signUp(name,email,password,passwordConfirm);

    });

}

