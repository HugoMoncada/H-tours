const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Email = require("../utils/email");
const bcrypt = require("bcryptjs"); 
const crypto = require("crypto");


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


exports.authenticate = async(req,res,next) => {
    let token; 
    
    // 1. Verify if token exists from api call
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
      token= req.headers.authorization.split(" ")[1];
    }
    else if(req.cookies.jwt){
        token = req.cookies.jwt
    }

    if(!token){
        return res.status(401).json({
            status:"Fail",
            message: "You are not logged in! please log in to get access."
        });
    }

    try {
        // 2. Verify the token 
        const valid = await jwt.verify(token, process.env.JWT_SECRET);
       
        // EXTRA FEATURES 
        // 3. verify if user still exists
        const user = await User.findById(valid.id);
        if(!user){
            return res.status(401).json({
                status: "Fail",
                message: "The user with this token no longer exists"
            });
        }

         // 4) check if user change password after the token was issued
         // --changedPasswordAfter is on the model 
         if(user.changedPasswordAfter(user.iat)){
            return res.status(401).json({
                status: "Fail",
                message: "User recently changed password, please log in again!!!"
            });
        }

        // Everything went ok 
        req.user = user; 
        res.locals.user = user; 
        next();

    } catch (error) {
        const msg = {...error};
        if(msg.name == "JsonWebTokenError"){
            return res.status(401).json({
                status: "Fail",
                message: "Invalid token"
            });
        }
        return res.status(401).json({
            status: "Fail",
            message: error
        });
       
    }
}


// USED ONLY BY VIEWS ROUTE
// THROWS NO ERROS
exports.isLoggedIn = async(req,res,next) => {
    let token; 
    
    // 1. Verify if token exists from api call
    if(req.cookies.jwt){
        token = req.cookies.jwt
    
        // 2. Verify the token 
        const valid = await jwt.verify(token, process.env.JWT_SECRET);
    
        // EXTRA FEATURES 
        // 3. verify if user still exists
        const user = await User.findById(valid.id);
        if(!user){
            return next();
        }

        // 4) check if user change password after the token was issued
        // --changedPasswordAfter is on the model 
        if(user.changedPasswordAfter(user.iat)){
            return next();
        }

        // Everything went ok 
        // LOCALS FOR PUG, SO PUG CAN USE THIS USER IN THE INTERFACE. 
        res.locals.user = user; 
        return next();
    }
    
    return next();
}


exports.restricTo = (...roles) => async(req,res, next) => {
    if(!roles.includes(req.user.role)){
        return res.status(403).json({
            status: "Fail",
            message: "you don't have permission to perform this action"
        });
    }
    next();
}


exports.forgotPassword = async (req,res,next) => {
    
    // 1. Get the user based on the email 
    const user = await User.findOne({email: req.body.email}); 
    if(!user){
        return res.status(400).json({
            status: "Fail",
            message: "There is no user with this email"
        }); 
    }
    
    // 2. Generate random reset token from the model
    const resetToken  = user.createPasswordResetToken(); 
    // To actually create and save the token
    await user.save({validateBeforeSave:false});

    // Send token to email
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();
        
        res.status(200).json({
            status: 'Success',
            message: 'Token sent to email!'
        });

    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500).json({
            status: 'Error',
            message: 'There was an error sending the email, Try again later'
        });
    }
}


exports.resetPassword = async (req,res,next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        
        return res.status(400).json({
            status: 'Fail',
            message: 'Token is invalid or has expired!!'
        });
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendTokenAndCookie(user, 200, req, res); 
}


exports.updatePassword = async (req, res, next) => {
    try {
       
        // 1. Get user 
        const user = await User.findById(req.user._id).select("+password");

        // 2.Check if posted current password is correct
        const correct = await bcrypt.compare( req.body.passwordCurrent, user.password);
        if(!correct){
            return res.status(401).json({
                status: "Fail",
                message: "Incorrect current password"
            });
        }

        // 3. if so, update password
        user.password = req.body.password
        user.passwordConfirm = req.body.passwordConfirm
        await user.save();
    
        // 4. Log user in, send jwt 
       createSendTokenAndCookie(req.user, 200, req, res); 
  

    } catch (error) {
        return res.status(400).json({
            status: "Fail",
            message: error
        });
    }
}
