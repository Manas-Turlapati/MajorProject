const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const  passportLocalMongoose = require("passport-local-mongoose").default;
const userSchema = new Schema({
    email:{
        type:String,
        required:true
    }//passport-local-mongoose automatically creates the field of username and password no need to give them extra field 
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',userSchema);