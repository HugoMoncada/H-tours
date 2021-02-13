const Tour = require("../models/TourModel"); 
const Booking = require("../models/BookingModel");



exports.getOverview = async (req,res,next) => {

    const tours = await Tour.find(); 

    return res.status(200).render("overview", {
        tittle: "All tours",
        pageTitle: "Welcome",
        tours
    });
}

exports.getMyTours = async (req,res,next) => {
    // TODO:terminar esto 
    const bookings = await Booking.find({user: req.user.id}); 

    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
   

    return res.status(200).render("overview", {
        tittle: "My tours", 
        pageTitle: "My Tours",
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
        title: "Sign Up"
    });
}