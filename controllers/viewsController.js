const Tour = require("../models/TourModel"); 
const Review = require("../models/ReviewModel"); 
const Booking = require("../models/BookingModel");


exports.getWelcome =  (req,res,next) => {
    return res.status(200).render("welcome", {
        tittle: "Welcome"
    });
}

exports.getOverview = async (req,res,next) => {

    const tours = await Tour.find(); 

    return res.status(200).render("overview", {
        tittle: "All tours",
        pageTitle: "Welcome",
        tours
    });
}

exports.getMyTours = async (req,res,next) => {

    const bookings = await Booking.find({user: req.user.id}); 

    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
   

    return res.status(200).render("myBookings", {
        tittle: "My Bookings", 
        pageTitle: "My Bookigs",
        tours
    });
}


exports.getTour = async (req,res,next) => {

    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: "reviews", 
        fields: "review rating user"
    }); 

    if(!tour){
        return res.status(404).render("error", {
            tittle: "Not found", 
            message: "Tour not found"
        });        
    }

    return res.status(200).render("tour", {
        tittle: tour.name,
        tour
    });
}


exports.reviewTour = async(req,res,next) => {
    try {

        const tour = await Tour.findOne({_id: req.params.tourId}); 

        if(!tour){
            return res.status(404).json({
                status: "Fail", 
                message: "Tour not found"
            });
        }
        
        res.status(200).render("reviewTour", {
            tittle: "Create Review", 
            tour
        });

    } catch (error) {
        return res.status(400).json({
                status: "Fail", 
                message: error
        });
    }
}


exports.getMyReviews = async (req,res,next) => {
    
    try {
        const reviews = await Review.find({user: req.user.id}); 
        
        if(reviews){
            const tourIDs = reviews.map(el => el.tour);
            const tours = await Tour.find({ _id: { $in: tourIDs } });
            return res.status(200).render("myReviews", {
                tittle: "My Reviews",
                pageTitle: "My Reviews",
                tours,
                reviews
            });        
        }
        
        return res.status(200).render("myReviews", {
            tittle: "My Reviews",
            pageTitle: "My Reviews",
            reviews
        });  

    } catch (error) {
        throw new Error(error)
    }
   
            
}


exports.updateReview = async(req, res, next) => {
    const review = await Review.findOne({_id: req.params.id}); 

    return res.status(200).render("updateReview", {
        tittle: "Update Review",
        review
    });
}


exports.deleteReview = async (req,res,next) => {
    try {
        
        const reviewDeleted = await Review.findOneAndDelete({_id: req.params.id }); 
        if(reviewDeleted){
            return res.status(200).render("myReviews",);
        }   
        else{
            return res.status(400).json({
                status: "Failed", 
                message: "Error deleting review"
            });
        }

    } catch (error) {
        return res.status(500).json({
            status: "Failed", 
            message: error
        });
    }


}


exports.loginForm = (req, res,next) => {
    res.status(200).render("login", {
        tittle: "Log In"
    });
}


exports.logOut = (req,res) => {
    res.clearCookie("jwt");

    return res.status(200).redirect("/");
};


exports.accountView = (req,res) => {
    return res.status(200).render("account",  {
        tittle: "Account", 
    }); 
}


exports.signUpForm = (req,res) => {
    return res.status(200).render("signUp", {
        tittle: "Sign Up"
    });
}

exports.forgotPassword  = (req,res) => {
    return res.status(200).render("forgotPassword", {
        tittle: "Forgot Password"
    });
}

exports.resetPassword = (req,res) => {
    const {token} = req.params;
    return res.status(200).render("resetPassword", {
        tittle: "Reset Password", 
        token
    });
}


exports.getAboutUs = (req, res) => {
    return res.status(200).render("aboutUs",{
        tittle: "About Us"
    }); 
}