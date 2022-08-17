// Creating an Express app
const express = require("express");
const app = express();
app.use(express.json());

//Requiring other node packages
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Setting the mongoDB connecting using mongoose and requiring mongoose 
require("./connection");

// Requiring mongoose models
const Address = require("./address");
const Admin = require("./admin");

let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}

const secretKey = process.env.SecretKey; //you can put your secret key here for JWT

// Route for login (Requires Username and passsword of Admin)
// Returns JSON Web Token (JWT) which is to be used for insertion, updation and deletion operations further
app.post("/api/login", async (req, res) => {
    
    let pass = req.body.password;
    let user = req.body.username; 

    Admin.findOne({username : user}, async (err, result) => {
        if(err) {
            console.log(err);
            res.json(err);
        }else {
            if(result === null) {
                res.json({
                    message: "Username not found"
                });
            }else {
                const savedPass = result.password;  
                const valid = await bcrypt.compare(pass, savedPass);
                check = valid
                console.log("valid", valid); 
                if(valid) {
                    console.log("password match");
                    jwt.sign({result}, secretKey, (err, token) => {
                        if(err) {
                            console.log(err);
                        }else {
                            res.json({ 
                                token : token,
                                message : "Save this toke to Insert, Update and Delete from DataBase"
                            });
                        }
                    });
                }else {
                    res.json({
                        message: "Incorrect Password"
                    });
                }
            }    
        }
    }); 
});

// Middleware for Verifying the JWT Token
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {

        // seperating jwt from bearerHeader
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        // verifying secretKey and validity of token here
        jwt.verify(req.token, secretKey , async (error, adminData) => {
            if(error) {
                res.json({error: error, key :secretKey});
            }else {
                try {
                    // Fetching admin details and checking password
                    const result = await Admin.findOne({username : adminData.result.username});
                    if(adminData.result.password === result.password) {
                        next();
                    }else {
                        res.json({message : "Invalid JWT"});
                    }

                }catch(err) {
                    console.log(err);
                    res.json({error : "Invalid token"});
                }
            }
        })
        next();
    }else {
        res.json({
            message : "Login to get a JSON Web Token"
        });
    }
}

// Helping function for regular Exp.
// to be used for phrase search in database
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// Route for adding One address
// Reqires JWT
app.post("/api/addOne", verifyToken, (req, res) => {
    const address = new Address(req.body);
    try {
        const status = address.save();
        if(status) {
            res.json({message: "One Address added successfully"}); 
        }
    }catch(err) {
        console.log(err);
        res.json({err});
    }
    
});

// Route for adding multiple Addresses at once
// Accepts an array of JSON of address
// Reqires JWT
app.post("/api/addMany", verifyToken, (req, res) => {
    const array = req.body;
            
    for(let i = 0; i<array.length; i++) {
        const address = new Address(array[i]);
        try {
            const status = address.save();
            if(status) {
                res.json({message: "All Addresses added successfully"}); 
            }
        }catch(err) {
            console.log(err);
            res.json({err});
        }
    }  
});

// Route for getting a particular address document using an ID (addressID)
// Does NOT Reqires JWT
app.get("/api/fetchOne/:id", (req, res) => {
    var id = req.params.id;
    console.log(id);
    Address.findOne({addressId : id}, (err, result) => {
        if(err) {
            console.log(err);
            res.json(err);
        }else {
            if(result === null) {
                res.json({
                    message : "No address found" 
                })
            }else {
                res.json(result);
            }
        }
    })
});

// Route for getting multiple records that matches the criteria
// Does NOT Reqires JWT
app.get("/api/fetchMany", (req, res) => {
    var query = req.query;
    console.log(query);
    Address.find((query), (err, result) => {
        if(err) {
            console.log(err);
            res.json({error : err});
        }else {
            console.log(result);
            res.send(result);
        }
    })
});

// Route for phrase search (fizzy search), Returns all the address records contating the searched keyword
// Does NOT Reqires JWT
app.get("/api/search", (req, res) => {
    if(req.query.key) {
        // Creating a RegExp
        const regex = new RegExp(escapeRegex(req.query.key), 'gi');

        // object for find query for phrase search in DB
        const search = {
            $or: [
                {firstName : regex},
                {lastName : regex},
                {address : regex},
                {city : regex},
                {contact : regex},   
                {email : regex}
            ]
        }

        Address.find((search), (err, result) => {
            if(err) {
                console.log(err);
                res.json({error : err});
            }else {
                res.json(result);
            }
        });
    }
});

// Route for fetching all the records (Uses pagination)
// Does NOT Reqires JWT
app.get("/api/fetchAll", async (req, res) => {
    try {
        // Setting default values for page and limit if req.query is nor passed
        const { page = 1, limit = 10 } = req.query;
        // Using given conditons(Limit and page) 
        const result = await Address.find().limit(limit).skip((page -1)*limit);
        res.json({
            total : result.length,
            result
        })
    }catch(err) {
        console.log(err);
        res.json({error : err})
    }  
});

// Route for updating the details of an address record by using AddressID
// Reqires JWT
app.patch("/api/update/:id", verifyToken, (req, res) => {
    const id = req.params.id;
    const update = req.body;
    Address.updateOne({addressId : id}, update, (err, result) => {
        if(err) {
            console.log(err);
            res.json({error : err});
        }else {
            res.json({ message : "Updated Succesfully", result});
        }
    })
});

// Route for deleting the details of an address record by using AddressID
// Reqires JWT
app.delete("/api/delete/:id", verifyToken, (req, res) => {
    const id = req.params.id;
    Address.deleteOne({addressId : id}, (error, result) => {
        if(err) {
            console.log(err);
            res.json({error : err});
        }else {
            console.log(result);
            res.json({ meesage : "1 Address Deleted Succesfully"});
        }
    });
})

app.get("/", (req, res) => {
    res.send("Welcome to Address Book Api - made by chianx");
})

app.listen(port, function() {
    console.log("Server is running at port 3000");
});

// Dummy Address (to be put in body for addOne)
// {
//     "firstName": "Chandler",
//     "lastName": "Bing",
//     "addressId": 10,
//     "address": "Central Perk",
//     "city": "New York",
//     "contact": "1 3738987136",
//     "email": "chandlerbing@gmail.com"
// }