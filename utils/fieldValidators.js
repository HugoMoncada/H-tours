const Joi = require("joi");
const { updatePassword } = require("../controllers/authController");

const validate = (schema) =>  async (req,res,next) => {
    try {
        const validated = await schema.validate(req.body);
        if(validated.error){
            return res.status(400).json({
                status:"Failed", 
                message: validated.error.details[0].message
            });
        }
        return next();
    } 
    catch (error) {
        throw new Error(error);
    }
}


// TOUR Schemas
const createTourSchema = Joi.object({
    name: Joi.string().min(5).required(),
    duration: Joi.number().integer().min(1).required(),
    maxGroupSize: Joi.number().integer().min(1).required(),
    difficulty:  Joi.string().required().valid("easy","medium","difficult"),
    ratingsAverage: Joi.number(),
    ratingsQuantity:  Joi.number(),
    price: Joi.number().min(1).required(),
    priceDiscount: Joi.number(),
    summary: Joi.string().min(5).required().trim(),
    description:  Joi.string().min(5).required().trim(),
    imageCover:  Joi.string().required(),
    images: Joi.array().items(Joi.string()),
    startDates: Joi.array().items(Joi.date()),
});

const updateTourSchema = Joi.object({
    name: Joi.string().min(5),
    duration: Joi.number().integer().min(1),
    maxGroupSize: Joi.number().integer().min(1),
    difficulty:  Joi.string().valid("easy","medium","difficult"),
    ratingsAverage: Joi.number(),
    ratingsQuantity:  Joi.number(),
    price: Joi.number().min(1),
    priceDiscount: Joi.number(),
    summary: Joi.string().min(5).trim(),
    description:  Joi.string().min(5).trim(),
    // imageCover:  Joi.string(),
    images: Joi.array().items(Joi.string()),
    startDates: Joi.array().items(Joi.date()),
});


// USER Schemas
const signUpSchema = Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required().trim(),
    photo: Joi.string().trim(),
    password: Joi.string().min(8).required().trim(),
    passwordConfirm: Joi.string().min(8).required().trim().valid(Joi.ref('password')).messages({ 'any.only': '{{#label}} does not match with password' }), 
});

const logInSchema = Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().min(8).required().trim()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().trim(),
});

const resetPasswordSchema = Joi.object({
    password: Joi.string().min(8).required().trim(),
    passwordConfirm: Joi.string().min(8).required().trim().valid(Joi.ref('password')).messages({ 'any.only': '{{#label}} does not match with password' }), 
});

const updatePasswordSchema = Joi.object({
    passwordCurrent: Joi.string().min(8).required().trim(),
    password: Joi.string().min(8).required().trim(),
    passwordConfirm: Joi.string().min(8).required().trim().valid(Joi.ref('password')).messages({ 'any.only': '{{#label}} does not match with password' }), 
});

const updateMeSchema = Joi.object({
    name: Joi.string().trim().min(1).max(30),
    email: Joi.string().email().trim(),
    photo: Joi.string().trim(),
});


// REVIEW Schemas
const createReviewSchema = Joi.object({
    review: Joi.string().required().trim(),
    rating: Joi.number().min(1).max(5).required(),
    tour: Joi.string().required().trim(),
    user: Joi.string().required().trim()
});


const updateReviewSchema = Joi.object({
    review: Joi.string().trim(),
    rating: Joi.number().min(1).max(5)
});





// TOUR functions
exports.validateCreateTourFields = validate(createTourSchema);
exports.validateUpdateTourFields =  validate(updateTourSchema);

// USER functions
exports.validateSignUpFields = validate(signUpSchema);
exports.validateLogInFields = validate(logInSchema);
exports.validateForgotPasswordFields = validate(forgotPasswordSchema);
exports.validateResetPasswordFields = validate(resetPasswordSchema);
exports.validateUpdatePasswordFields = validate(updatePasswordSchema);
exports.validateUpdateMeFields = validate(updateMeSchema);


// REVIEW fuctions
exports.validateCreateReviewFields = validate(createReviewSchema);
exports.validateUpdateReviewFields = validate(updateReviewSchema);
