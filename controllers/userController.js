const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require('fs'); 
const sharp = require("sharp"); 
const Email = require("../utils/email");

// Upload to disk
// const multerStorage = multer.diskStorage({
//     destination: (req,file,cb) => {
//         cb(null,  "public/img/users")
//     }, 
//     filename: (req, file, cb) => {
//         // this "file" is added once the middleware is called
//         const ext = file.mimetype.split("/")[1]; 
//         // this img will have the name 234234-1253424.jpg
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     } 
// }); 

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

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = async (req,res,next) => {
    if(!req.file) return next(); 

    // created here manually cause saving the file in memory doest do it 
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    // image in memory - buffer
    // Saving to disk now
    await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`); 

    next();
}


const createSendTokenAndCookie  = (user, statusCode, req, res) => {
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.cookie("jwt", token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true, 
        // !UNCOMMENT THIS ON PROD, check git hub is different on his end
        //secure: true
    });

    // Remove from output ...select false on the schema is not working. 
    user.password = undefined; 
    user.active = undefined; 

    return res.status(statusCode).json({
        status: "Success", 
        token,
        data: {
            user
        }
    }); 
}


// Return a new obj with only the allowed fields
const filterObj = (body, ...allowedFields) => {
    const newObj = {}

    Object.keys(body).forEach(el => {
        if(allowedFields.includes(el)){
            newObj[el] = body[el]
        }
    })

    return newObj;
}

exports.getMe= async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id); 
        return res.status(200).json({
            status: "Success", 
            data: {
                user
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


exports.getOne= async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id); 
        if(!user){
            return res.status(400).json({
                status: "Fail", 
                message: "User not found"
            });
        }

        return res.status(200).json({
            status: "Success", 
            data: {
                user
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


exports.getAll = async (req,res, next) => {
    try {
        const users = await User.find(); 
        return res.status(200).json({
            status:"Success",
            results: users.length,
            data: {
                users
            }
        });
    } catch (error) {
        return res.status(400).json({
            status: "Fail", 
            message: error
        });
    }

}


exports.signUp = async (req, res, next) => {
    try {
        // Its not ok to just accept the body as it comes. 
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email, 
            // Password encryption is done in the model.
            password : req.body.password,
            passwordConfirm: req.body.passwordConfirm
        }); 

        // SEnd welcome email if error is prob here
        const url = `${req.protocol}://${req.get('host')}/account`;
        try {
            await new Email(newUser, url).sendWelcome(); 
        } catch (error) {
            // console.log(error)
            throw new Error(error)
        }

        // log in user after signup
        createSendTokenAndCookie(newUser, 201, req, res);

    } catch (error) {
        const msg = {...error};
        if(msg.code == 11000){
            return res.status(400).json({
                status: "Fail",
                message: "This email aready exist"
            });
        }
        return res.status(400).json({
            status: "Fail",
            message: error
        });
    }

}


exports.logIn = async (req, res, next) => {
    try {
        // A middleare is validating this fields already
        const {email, password} = req.body; 

        // Find user
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return res.status(401).json({
                status: "Fail",
                message: "Incorrect email or password"
            });
        }
        
        // Decript password
        const correct = await bcrypt.compare(password, user.password);
        if(!correct){
            return res.status(401).json({
                status: "Fail",
                message: "Incorrect email or password"
            });
        }

        // log in user 
        createSendTokenAndCookie(user, 200, req, res);

    } catch (error) {
        // console.error(error)
        return res.status(400).json({
            status: "Fail",
            message: error
        });
    }
}


exports.updateMe = async(req,res,next) => {
    try {
        // 1. Create error if user POST's password data
        if(req.body.password || req.body.passwordConfirm){
            return res.status("400").json({
                stauts: "Fail",
                message: "This route is not for password updates. Please use /updateMyPassword."
            })
        }


        // Delete previous photo from the server
        const {photo} = await User.findOne({_id: req.user.id}); 

        // Prevents new users to delete the "default.jpg" img
        if(!photo.match("default.jpg")){
            // If its not a new user delete the previous photo
            fs.unlink(`./public/img/users/${photo}`, (err) => {
                if(err){
                    // console.log(err)
                    throw new Error(error)
                }
                else{
                    // console.log("Old user photo was deleted.");
                }
            });
        }   

        // 2. "Sanitize" data to allow specific values only
        const filteredBody = filterObj(req.body, "name", "email"); 
        if( req.file ){
            filteredBody.photo = req.file.filename
        }

        // 3.Update user
        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true, 
            runValidators: true
        });

        return res.status(200).json({
            status: "Success",
            data:{
                user: updatedUser
            }
        })

    } catch (error) {
        return res.status(400).json({
            status: "Fail",
            message: error
        });
    }
}


exports.deleteMe = async (req,res,next) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, {active:false}); 

        res.status(204).json({
            status: "Success",
            data: null
        });
    } catch (error) {
        return res.status(400).json({
            status: "Fail",
            message: error
        });
    }
}