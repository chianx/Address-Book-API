// requiring mongoose and connecting to out database
const mongoose = require("mongoose");
require("dotenv").config();

const MongoDB_Address = process.env.db
// mongoose.connect("mongodb://localhost:27017/AddressBook", {
mongoose.connect(MongoDB_Address, {
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() => {
    console.log("Connected to database");
}).catch((e) => {
    console.log("connection to database failed");
    console.log(e);
});
