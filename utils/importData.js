const dotenv = require('dotenv').config();
const mongoose = require("mongoose");
const DbConnection = require("../config/database");
const Tour = require("../models/TourModel");
const User = require("../models/UserModel");
const Review = require("../models/ReviewModel");
const file = require("../dev-data/reviews.json");

DbConnection(); 

const importData = async(Model, data) => {
    try {
        await Model.deleteMany({}); 
        await Model.create(data, {validateBeforeSave: false});
        console.log("Data imported successfully");
        process.exit();
    } catch (error) {
        console.error("Error with data import!!"); 
        console.error(error);
        process.exit(1)
    }
}

// *Change the model and the data. 
// npm run data:import
importData(Review,file); 

