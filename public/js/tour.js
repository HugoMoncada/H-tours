// this comes from appending the stripe js to the head in the tours page
// makes stripe global 
// this is the public key
const stripe = Stripe("pk_test_51IAdDFI9znJDnl3ssH4pWJPAv6yXhdvx5JJNRRvNTjiqQRwHv40XUML6nLQCrF8PoYzUchp9VwIP3KkATs0sXjUV009micrB2o");


const bookTour = async (tourId) => {
    try {
         // 1 get check out session from the server
        const session = await axios(`/api/v1/bookings/check-out-session/${tourId}`); 

        // 2 Create checkout form  + charce credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

    } catch (error) {
        throw new Error(error);
    }

}


document.getElementById("bookTourBtn").addEventListener("click", (e) => {
    e.target.textContent = "Processing..."
    const {tourId} = e.target.dataset;
    bookTour(tourId)
}); 