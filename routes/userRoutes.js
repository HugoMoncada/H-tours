const router = require("express").Router();
const {signUp, logIn, updateMe,deleteMe, getAll, getOne, getMe, uploadUserPhoto, resizeUserPhoto} = require("../controllers/userController");
const {forgotPassword,resetPassword, updatePassword, restricTo, authenticate} = require("../controllers/authController");
const {validateSignUpFields, validateLogInFields,validateForgotPasswordFields,validateUpdatePasswordFields,validateUpdateMeFields, validateResetPasswordFields} = require("../utils/fieldValidators");


//*@desc   Sign up (create) a new user 
//*@route  {host}/api/v1/users/signUp
router.post("/signUp", validateSignUpFields, signUp); 


//*@desc   Log in  
//*@route  {host}/api/v1/users/logIn
router.post("/logIn", validateLogInFields, logIn);


//*@desc   Forgot password 
//*@route  {host}/api/v1/users/forgotPassword
router.post("/forgotPassword", validateForgotPasswordFields, forgotPassword);


//*@desc   Reset password 
//*@route  {host}/api/v1/users/resetPassword/:token
router.patch("/resetPassword/:token", validateResetPasswordFields, resetPassword);



//*@desc   Update password 
//*@route  {host}/api/v1/users/updateMyPassword
router.patch("/updateMyPassword", authenticate, validateUpdatePasswordFields, updatePassword);


//*@desc   Update logged in user data 
//*@route  {host}/api/v1/users/updateMe
router.patch("/updateMe", authenticate, validateUpdateMeFields, uploadUserPhoto, resizeUserPhoto, updateMe);
 

//*@desc   Delete user 
//*@route  {host}/api/v1/users/deleteMe
router.delete("/deleteMe", authenticate,  deleteMe);


//*@desc   Get logged in user info
//*@route  {host}/api/v1/users/:id
router.get("/me", authenticate, getMe);


//*@desc   Get one user
//*@route  {host}/api/v1/users/:id
router.get("/:id", authenticate, restricTo("admin"), getOne);


//*@desc   Get all users 
//*@route  {host}/api/v1/users
router.get("/",authenticate, restricTo("admin"), getAll);


module.exports = router; 