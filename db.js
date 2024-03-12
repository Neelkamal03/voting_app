const mongoose=require('mongoose');
require('dotenv').config();

//const mongoURL=process.env.MONGODB_URL;
const mongoURL=process.env.MONGO_URL_LOCAL;
mongoose.connect(mongoURL, {})

//Get the default connection
//Mongoose maintains a default connection object representing the MongoDB connection.
const db=mongoose.connection;

//Define event listeners for database connection

db.on('connected', ()=>{
    console.log("Connected to MongoDb server");
});

// db.on('error', ()=>{
//  console.log("MongoDb connection error:", err);
// });
db.on('error', (err) => {
    console.error("MongoDB connection error:", err);
    console.error(err.stack);  // Add this line to print the stack trace
});

db.on('disconnected', ()=>{
    console.log("MongoDb disconnected");
});

//Export database connection to server file
module.exports=db;