const mongoose = require("mongoose"); 
const dotenv = require('dotenv').config();


const DB = process.env.DB_CONNECTION.replace("<password>", process.env.DB_PASSWORD);

const DbConnection = async () => {
    try {
        const conection = await mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
          });

        if(conection){
            return console.log("Conected To The Database!!")
        }
          
    } catch (error) {
        return console.log(error);
        process.exit(1);
    }
}; 

module.exports = DbConnection; 