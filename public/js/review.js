const createReview =  async (rating,review,tour, user) => {

    try {
        
        const postData = {
            review,
            rating,
            tour,
            user
        }

        const call = await fetch ("/api/v1/reviews/", {
            method: "POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        const response = await call.json(); 
        console.log(response);

        if(response.status == "Success"){
            showAlert("success", "Review created sucessfuly");
            setTimeout(() => {
                location.assign("/my-reviews"); 
            }, 1000);
        }
        else{
            showAlert("danger", response.message);
        }


    } catch (error) {
        throw new Error(error);
    }

}



const updateReview = async (rating,review, id) => {
    try {
        
        const postData = {
            review,
            rating
        }

        const call = await fetch (`/api/v1/reviews/${id}`, {
            method: "PATCH",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        const response = await call.json(); 
        console.log(response);

        if(response.status == "Success"){
            showAlert("success", "Review updated sucessfuly");
            setTimeout(() => {
                location.assign("/my-reviews"); 
            }, 1000);
        }
        else{
            showAlert("danger", response.message);
        }


    } catch (error) {
        throw new Error(error);
    }
}

if(document.getElementById("formCreateReview")){
    document.getElementById("formCreateReview").addEventListener("submit", (e) => {
        e.preventDefault(); 
        
        const rating = document.querySelector("input[name=inlineRadioOptions]:checked").value;
        const review = document.getElementById("review").value.trim();
        const tourId = document.getElementById("tourId").value;
        const userId = document.getElementById("userId").value;
        
        createReview(rating,review,tourId, userId);
       
    }); 
}


if(document.getElementById("formUpdateReview")){
    document.getElementById("formUpdateReview").addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("presionado")
        const rating = document.querySelector("input[name=inlineRadioOptions]:checked").value;
        const review = document.getElementById("review").value.trim();
        const reviewId = document.getElementById("reviewId").value;
    
        updateReview(rating,review, reviewId);
    });
}

