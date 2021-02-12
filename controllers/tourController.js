const Tour = require("../models/TourModel");
const Review = require("../models/ReviewModel");
const APIFeatures = require("../utils/apiFeatures");
const sharp = require("sharp"); 
const multer = require("multer");


// upload to memory to resize and then upload to disk
const multerStorage = multer.memoryStorage(); 

// To check that the file is actually an image
const multerFilter = (req,file,cb) => {
    if(file.mimetype.startsWith("image")){
        cb(null, true)
    }
    else{
        cb(new Error("File must be an image"), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    {
        name: "imageCover", maxCount: 1
    },
    {
        name: "images", maxCount: 3
    }
]); 

exports.resizeTourImages = async (req,res,next)  => {
    if(!req.files) return next()

    // adding this field into the req so the next middleware has it 
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    
    // Cover image 
    // 3 / 2 ratio 2000/1333
    await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`public/img/tours/${req.body.imageCover}`); 


    // Images
    req.body.images = []; 

    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

            await sharp(file.buffer).resize(2000, 1333).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`public/img/tours/${filename}`); 

            req.body.images.push(filename);
        })

    );

    next(); 
}



// In order for this to work its neccesary to create an index for start location in the model
exports.getTourNearYou = async (req,res) => {

    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(",");
  
    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1; 
  
  
    if(!lat, !lng){
      return res.status(400).json({
        status: "Fail",
        message: "Latitude and Longitud are required"
      });
    }
  
    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng,lat], radius] }}});
  
    return res.status(200).json({
      status: "Success",
      results: tours.length,
      data: {
        tours
      }
    });
};
  


exports.getAllTours = async (req,res) => {
    try {
        // *All this code was turned into a class apiFeatures...keep it here for understanding purposes
        // // *Filtering
        // // 1. Create copy 
        // const queryCopy = {...req.query};
        // const excludeFileds = ["page","sort","limit","fields"];
        
        // // 1a. Remove fields that are not part of the filtering process 
        // excludeFileds.forEach( el =>  delete queryCopy[el]);
        
        // // 1b. Advance filtering
        // let copyToString = JSON.stringify(queryCopy);
        // // Regular expression replace {gte} with {$gte} so mongo understand it 
        // // b = exactly that word
        // // g = do it for every match not just once
        // copyToString = copyToString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // // 1c. Create a query to chain things to 
        // let query = Tour.find(JSON.parse(copyToString));

        // // 2. NOW we can check if SORT exists in the query
        // if(req.query.sort){
        //     const sortBy = req.query.sort.split(",").join(" ");
        //     query = query.sort(sortBy);
        // }
        // else{
        //     query = query.sort("-createdAt")
        // }

        // // 3. Check if it has field limiting / specific fields to show
        // if(req.query.fields){
        //     const fields = req.query.fields.split(",").join(" "); 
        //     query = query.select(fields);
        // }
        // else{
        //     query = query.select("-__v");
        // }

        // // 3. Pagination and limit 
        // // DEFAULT PAGE= 1 DEFAULT LIMIT =100 
        // // req.query.page * 1 This cast into a number
        // const page = req.query.page * 1 || 1; 
        // const limit = req.query.limit *1 || 100; 
        // // ex: page 5 limit 3
        // // page 5 - 1 = 4  * 3  = 12
        // // skip 12 results and show only 5
        // const skip = (page - 1) * limit; 

        // query = query.skip(skip).limit(limit);

        // if(req.query.page){
        //     const numTours = await Tour.countDocuments();
        //     if(skip >= numTours){
        //         return res.status(400).json({
        //             status: "Fail",
        //             message: "This page doesn't exist"
        //         });
        //     } 
        // }
        
        // 5. Excecute query with await
        // If query has something valid it will filter 
        // otherwise the query will be an empty obj so it will find all
        const features = new APIFeatures(Tour,req.query).filter().sort().limitFields();
        const tours = await features.query; 

        if(!tours){
            return res.status(400).json({
                status:"Fail",
                message: "No tours"
            });
        }
        return res.status(200).json({
            status: "Success",
            results: tours.length,
            data: {
                tours
            }
        });

    } catch (error) {
        return res.status(400).json({
            status: "Fail",
            message: error
        });
    }
};

exports.getOneTour = async (req,res) => {
    try {
        const tour = await Tour.findById(req.params.id).populate("reviews");
        if(!tour){
            return res.status(400).json({
                status:"Fail",
                message: "Can't find this document"
            });
        }
        return res.status(200).json({
            status: "Success",
            data: {
                tour
            }
        });

    } catch (error) {
        // console.error(error);
        return res.status(400).json({
            status: "Fail",
            message: error
        });
    }
};

exports.createTour = async (req,res) => {
    try {
        const newTour = await Tour.create(req.body); 
        return res.status(201).json({
            status: "Success",
            data: {
                tour: newTour
            }
        }); 
    } 
    catch (error) {
        if(error.keyValue){
            return res.status(400).json({
                status: "Fail", 
                message: "Duplicate value NAME"
            });
        }
        return res.status(400).json({
            status: "Fail", 
            message: error
        });
    }
}; 


exports.updateTour = async (req,res) => {
    try {
        const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true});
        if(!updatedTour){
            return res.status(400).json({
                status:"Fail",
                message: "Can't find this document"
            });
        }
        return res.status(200).json({
            status: "Success",
            data: {
                updatedTour
            }
        });

    } catch (error) {
        // console.error(error);
        return res.status(400).json({
            status: "Fail",
            message: error
        });
    }
};

exports.deleteTour = async (req,res) => {
    try {
        const deletedTour = await Tour.findByIdAndDelete(req.params.id);
        if(!deletedTour){
            return res.status(400).json({
                status:"Fail",
                message: "Can't find this document"
            });
        }
        return res.status(204).json({
            status: "Success",
            data: null
        });

    } catch (error) {
        // console.error(error);
        return res.status(400).json({
            status: "Fail",
            message: error
        });
    }
};

