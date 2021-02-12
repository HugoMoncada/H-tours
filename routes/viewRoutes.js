const router = require("express").Router(); 
const {getOverview, getTour, loginForm, logOut, accountView,getMyTours} = require("../controllers/viewsController");
const {isLoggedIn, authenticate} = require("../controllers/authController");


router.use(isLoggedIn);


router.get("/", getOverview); 

router.get("/my-tours", authenticate ,getMyTours); 

// router.get("/tour", getTour);
router.get("/tour/:slug", getTour); 

// Redirect to loging view
router.get("/login", loginForm);

router.get("/logout", logOut);


router.get("/account", accountView)

module.exports = router; 