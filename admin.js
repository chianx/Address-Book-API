const mongoose = require("mongoose");
const validator = require("validator");

// mongoose Admin Schema
const adminSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        unique: [true, "Email is already present"],
        required: false,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid Email")
            }
        }
    },
    username : {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type : String,
        required : true
    },
    contact : {
        type: Number,
        unique: true,
        required : true,
        min : [10, "Number is invalid"] 
    }
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;