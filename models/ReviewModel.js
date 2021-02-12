const mongoose = require("mongoose"); 
const Tour = require("./TourModel"); 

const reviewSchema = new mongoose.Schema({
    review:{
        type: String, 
        required: [true, "A review must have a review ..."],
        trim: true
    },
    rating:{
        type: Number,
        required: [true, "A review must have a rating."], 
        min: 1,
        max: 5,
        required: [true, "A review must have a rating ..."]
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId, 
        ref: "Tour",
        required: [true, "A review must belong to a tour."], 
    },
    user: {
        type: mongoose.Schema.ObjectId, 
        ref: "User",
        required: [true, "A review must belong to an user."], 
    }
},{
    toJSON:{ virtuals:true },
    toObject:{ virtuals:true }
}); 


reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: "user",
        select: "name photo"
    }); 
    next();
});

// Calc rating to a tour
reviewSchema.statics.calcAverageRatings = async function (tourId) {
    // "this" points to the MODEL thats why statics is used
    const stats= await this.aggregate ([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: "$tour",
                nRating: { $sum: 1 },
                avgRating: { $avg: "$rating" }
            }
        }
    ]);

    if(stats.length > 0 ){
        // Persist in the database
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    }
    else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

// Prevent the user from writing 2 reviews for the same tour
reviewSchema.index({tour:1, user:1}, {unique: true});

// To use the calcAverage
reviewSchema.post("save", function() {
    this.constructor.calcAverageRatings(this.tour);
});


// findByIdAndUpdate
// findByIdAndDelete 
// use findOne undernet
//Update and delete average
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.review = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function(){
    // this.review comes from the pre function 
    // await this.findOne doesnt work here query has already executed
    await this.review.constructor.calcAverageRatings(this.review.tour);
});



const Review = mongoose.model("Review", reviewSchema); 

module.exports = Review;