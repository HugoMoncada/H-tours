const mongoose = require("mongoose"); 
const slugify = require("slugify");

const tourSchema = new mongoose.Schema({
    name:{
        type: String, 
        required: [true, "A tour must have a name"],
        unique: true,
        trim: true
    }, 
    slug:{
        type: String
    },
    duration:{
        type:Number, 
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize:{
        type: Number,
        required: [true, "A tour must have a maxGroupSize"]
    },
    difficulty:{
        type: String, 
        required: [true, "A tour must have a difficulty"],
        enum: {
            values: ["easy","medium","difficult"],
            message: "Difficulty is either easy medium or difficult"
        }
    },
    ratingsAverage:{
        type: Number, 
        default: 4.5,
        min: [1, "Rating must be above or equal to 1"],
        max: [5, "Rating must below or equal to 5"],
        // To get the rounded decimal value not something like 4.66666
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity:{
        type: Number, 
        default: 0
    },
    price:{
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount:{
        type: Number
    },
    summary:{
        type: String, 
        trim: true,
        required: [true, "A tour must have a summary"],
        trim: true
    },
    description:{
        type: String, 
        required: true,
        trim: true, 
    }, 
    imageCover: {
        type: String,
        required: [true, "A tour must have a imageCover"]
    },
    images: [String],
    createdAt:{
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    secretTour:{
        type: Boolean,
        desfault: false
    },
    startLocation:{
        // GeoJson comes with mongoDB already
        type:{
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        // Logituted first latitude second 
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            // Logituted first latitude second 
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ]

}, {
    toJSON:{ virtuals:true },
    toObject:{ virtuals:true }
}); 


tourSchema.index({ price: 1, ratingsAverage:-1 }); 
tourSchema.index({ slug:1 });  
tourSchema.index({startLocation: "2dsphere"});


tourSchema.virtual("durationWeeks").get(function() {
    return this.duration / 7;
});

// To avoid child referencing here and infinite arrays 
// i create a virtual field that can populate reviews
// review is parent referencing 
// populate is done  getOne review
tourSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
});

// DOCUMENT MIDDLEWARE works on save and create only
tourSchema.pre("save", function(next){
    // this makes reference to the document 
    this.slug = slugify(this.name, { lower: true });
    next();
});


// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next){
    // return tours that are not secret
    this.find({secretTour: { $ne: true }});
    next();
});

tourSchema.pre(/^find/, function(next){
    this.populate({
        path:"guides",
        select: "-__v -passwordChangedAt"
    }); 
    next();
});



const Tour = mongoose.model("Tour", tourSchema); 

module.exports = Tour; 