const mongoose = require("mongoose"); 
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: [true, "A user must have a name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "A user must have an email"],
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
        lowercase: true,
        trim: true
    },
    role: {
        type: String,
        enum: ["user", "lead-guide", "guide", "admin"],
        default: "user"
    },
    photo:{
        type: String, 
        default: "default.jpg"
    },
    password: {
        type: String, 
        required: [true, "A user must have a password"],
        trim: true,
        min: 8,
        select: false
    },
    passwordConfirm: {
        type: String, 
        required: [true, "Please confirm your password"],
        trim: true,
        min: 8 ,
        // This only works on SAVE and CREATE not update
        validate: {
            validator: function(el){
                return el === this.password
            },
            message: "Passwords Do Not Match"
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    active:{
        type: Boolean,
        default: true,
        select: false
    }

}); 


// HASH PASSWORD
userSchema.pre("save", async function(next){
    // Run only if password is modified
    if(!this.isModified("password")) return next(); 

    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Password confirm is no longe necessary so we dont persist it 
    this.passwordConfirm = undefined;

    next();
});

// Dont show inactive users
userSchema.pre(/^find/, async function(next) {
    this.find({active:{ $ne: false }});
    next();
}); 

// False means password not changed TRue has to trow error 
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000 , 10);
        return JWTTimestamp < changedTimeStamp; 
        // token issued at 100 password changed at 200 .. 100 < 200 true
        // token issued at 300 password changed at 200 -- 300 < 200 false
    }
    return false; 
}


userSchema.methods.createPasswordResetToken = function () {
    
    // Create token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Encrypt token to save into the db
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // + 10 minutes * 60 intoseconds * 1000 into milisenconds
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken;
}


const User = mongoose.model("User", userSchema); 

module.exports = User;