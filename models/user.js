const mongoose = require("mongoose");


const passportLocalMongoose = require("passport-local-mongoose");




const userSchema = new  mongoose.Schema({
    email : {
        type : String,
        required :  true,
    },
    // username , password and salt value automatically added by passport local mongoose.

});


// we pass this as a plugin to the schema
userSchema.plugin(passportLocalMongoose); 
// this plugin is used b/c it automatically add hasing, salting , username , hashed password
// in this it also gives some methods to used with user models

module.exports = mongoose.model("User", userSchema);