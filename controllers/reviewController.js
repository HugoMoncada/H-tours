const Review = require("../models/ReviewModel");

exports.createReview = async (req,res,next) => {
    try {
        if(!req.body.tour) req.body.tour = req.params.tourId;
        if(!req.body.user) req.body.user = req.user.id

        const newTourReview = await Review.create({
            review: req.body.review,
            rating: req.body.rating,
            tour: req.body.tour,
            user: req.body.user
        }); 

        return res.status(201).json({
            status: "Success",
            data:{
                newTourReview
            }
        });
    } catch (error) {
        if(error.code === 11000){
            return res.status(400).json({
                status: "Fail",
                message: "There is a review to this tour from this user already created!, Only 1 review per user to a tour is allowed"
            });
        }
        return res.status(400).json({
            status: "Fail",
            message: error
        });
    }
};

exports.getAllReviews = async (req,res,next) => {
    try {
        let filter = {};
        if(req.params.tourId) filter= {tour: req.params.tourId};

        const reviews = await Review.find(filter); 
        return res.status(200).json({
            status: "Success", 
            resulsts: reviews.length,
            data:{
                reviews
            }
        });
    } catch (error) {
        // console.log(error)
        return res.status(400).json({
            status: "Fail",
            message: error
        })
    }
}

exports.getOneReview = async (req,res,next) => {
    try {
        const review = await Review.findById(req.params.id); 
        if(!review){
            return res.status(400).json({
                status: "Fail",
                message: "Document not found"
            });
        }
        return res.status(200).json({
            status: "Success", 
            data:{
                review
            }
        });
    } catch (error) {
        return res.status(400).json({
            status: "Fail",
            message: error
        });
    }
};

exports.updateReview = async (req,res,next) => {
    try {
        const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        }); 

        if(!updatedReview){
            return res.status(400).json({
                status: "Fail", 
                message: "Review not found!"
            });
        }

        return res.status(200).json({
            status: "Success", 
            data: {
                updatedReview
            }
        });

    } catch (error) {
        // console.log(error)
        return res.status(400).json({
            status: "Fail", 
            message: error
        });
    }
}

exports.deleteReview = async (req, res, next) => {
    try {
        
        const deletedTour = await Review.findByIdAndDelete(req.params.id);
        if(!deletedTour){
            return res.status(400).json({
                status: "Fail", 
                message: "Review not found"
            });
        }

        return res.status(204).json({
            status: "Success", 
            data: null
        });
    } catch (error) {
        // console.log(error)
        return res.status(400).json({
            status: "Fail", 
            message: error
        });
    }        
}