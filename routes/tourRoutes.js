const router = require("express").Router();
const {getAllTours,getOneTour, createTour,updateTour,deleteTour,getTourNearYou, uploadTourImages, resizeTourImages} = require("../controllers/tourController");
const {createReview} = require("../controllers/reviewController");
const {validateCreateTourFields,validateUpdateTourFields} = require("../utils/fieldValidators");
const {authenticate, restricTo} = require("../controllers/authController");
const reviewRoutes = require("./reviewRoutes");

// In case you want to create a new review
router.use("/:tourId/reviews", reviewRoutes); 


//*@desc   Get Tour Near You
//*@route  {host}/api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit"
router.get("/tours-within/:distance/center/:latlng/unit/:unit", getTourNearYou); 


//*@desc   Get one tour from the DB
//*@route  {host}/api/v1/tours/:id
router.get("/:id", getOneTour); 


//*@desc   Get all tours 
//*@route  {host}/api/v1/tours
router.get("/", getAllTours); 


//*@desc   Create a new tour
//*@route  {host}/api/v1/tours
router.post("/", authenticate, restricTo("admin", "lead-guide"), validateCreateTourFields, createTour); 


// //*@desc   Create a new tour review
// //*@route  {host}/api/v1/tours/:tourId/reviews
// router.post("/:tourId/reviews",protect, restricTo("user"), createReview); 


//*@desc   Update one tour
//*@route  {host}/api/v1/tours/:id
router.patch("/:id", authenticate, restricTo("admin", "lead-guide"), validateUpdateTourFields, uploadTourImages, resizeTourImages, updateTour); 


//*@desc   Update one tour
//*@route  {host}/api/v1/tours/:id
router.delete("/:id", authenticate, restricTo("admin", "lead-guide"), deleteTour); 

module.exports = router; 