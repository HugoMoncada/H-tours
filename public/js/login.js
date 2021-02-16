const hideAlert = () => {
    const el = document.querySelector(".alert")
    if(el) el.parentElement.removeChild(el);
}

const showAlert = (type, msg) => {
    hideAlert(); 
    const markup = `<div class="alert alert-${type} text-center fs-5">${msg}</div>`;
    document.querySelector(".container").insertAdjacentHTML("afterbegin", markup);
    window.setTimeout(hideAlert,5000);
}


const login = async (email, password) => {
    try {
        const postData ={
            email,
            password
        }
        const call = await fetch("/api/v1/users/login", {
            method: "POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })

        const response = await call.json(); 
        
        if(response.status == "Success"){
            showAlert("success", "Logged in successfully");
            setTimeout(() => {
                location.assign("/all-tours"); 
            }, 1000);
        }
        else{
            showAlert("danger", response.message);
            setTimeout(() => {
                location.assign("/login");
            }, 2500);
        }

    } catch (error) {
        throw new Error(error);
    }
}

if(document.getElementById("formLogin")){
    document.getElementById("formLogin").addEventListener("submit", e => {
        e.preventDefault();
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value
        login(email, password);
    });
    
}



