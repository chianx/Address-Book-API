const mongoose = require("mongoose");
const validator = require("validator");

// mongoose Address Schema
const addressSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: [3, "Minimum length required is 3"]
    },
    lastName: {
        type: String,
        required: true,
        minLength: [3, "Minimum length required is 3"]
    },
    addressId : {
        type: Number,
        unique: [true, "Address Id is supposed to be unique"],    
    },
    address : {
        type : String,
        required: true,
    },
    city : {
        type: String
    },
    contact : {
        type: String,
        unique: [true, "This contact is already registered"],
        min: 10,
        required:true,
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
    }  
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;