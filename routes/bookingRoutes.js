const router = require("express").Router()
const {restricTo, authenticate} = require("../controllers/authController");
const {getCheckOutSession} = require("../controllers/bookingController");


//*@desc   Get 
//*@route  host/api/v1/bookings/:tourId
router.get("/check-out-session/:tourId", authenticate, getCheckOutSession); 




module.exports = router; 