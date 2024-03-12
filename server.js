const express = require('express');
const app = express();
const db=require('./db');
const bodyParser=require('body-parser');
app.use(bodyParser.json()); //req.body
require('dotenv').config();

// Import the router files
const userRoutes=require('./routes/userRoutes.js');
const candidateRoutes=require('./routes/candidateRoutes.js');
// Use the routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(3000, ()=>{
    console.log("Server is running");
 });