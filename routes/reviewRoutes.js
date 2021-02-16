const router = require("express").Router({mergeParams:true});
const {createReview,getAllReviews,getOneReview,updateReview, deleteReview} = require("../controllers/reviewController");
const {validateUpdateReviewFields, validateCreateReviewFields} = require("../utils/fieldValidators");
const {authenticate, restricTo} = require("../controllers/authController");


//*@desc   Create a new review
//*@route  {host}/api/v1/reviews
/* 
    Doesn't use validation schema due to the way a review can be created from a tour route
    The create review from tours can send params or body as data, so fields are validated in the db instead.
*/
router.post("/", authenticate, restricTo("user"), validateCreateReviewFields, createReview); 


//*@desc   Get one review
//*@route  {host}/api/v1/reviews/:id
router.get("/:id", getOneReview); 


//*@desc   Get all reviews
//*@route  {host}/api/v1/reviews/
router.get("/", getAllReviews); 


//*@desc   Update a review 
//*@route  {host}/api/v1/reviews/:id
router.patch("/:id", authenticate, restricTo("user", "admin"), validateUpdateReviewFields, updateReview); 


//*@desc   Delete a review 
//*@route  {host}/api/v1/reviews/:id
router.delete("/:id", authenticate, restricTo("user", "admin"),  deleteReview); 

// 

module.exports = router; 