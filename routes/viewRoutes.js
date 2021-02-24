const router = require("express").Router(); 
const {
    getOverview, getTour, loginForm, logOut, accountView,
    getMyTours, signUpForm, getWelcome, forgotPassword, 
    resetPassword, reviewTour, getMyReviews, updateReview, 
    deleteReview, getAboutUs, becomeGuide} = require("../controllers/viewsController");
const {isLoggedIn, authenticate} = require("../controllers/authController");


router.use(isLoggedIn);

router.get("/", getWelcome); 

router.get("/all-tours", getOverview)

router.get("/my-bookings", authenticate ,getMyTours); 

router.get("/review-tour/:tourId", reviewTour);

router.get("/my-reviews",authenticate, getMyReviews);

router.get("/update-review/:id", authenticate, updateReview);

router.get("/delete-review/:id", authenticate, deleteReview);

// router.get("/tour", getTour);
router.get("/tour/:slug", getTour); 

// Redirect to loging view
router.get("/login", loginForm);

router.get("/logout", logOut);

router.get("/account", accountView);

router.get("/signUp", signUpForm);

router.get("/forgotPassword", forgotPassword);

router.get("/resetPassword/:token", resetPassword)


// Footer pages
router.get("/aboutUs", getAboutUs);

router.get("/become-a-guide", becomeGuide );


module.exports = router; 