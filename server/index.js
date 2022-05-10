const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv/config')


const DB_URI  ="mongodb+srv://admin:Blockchain123456@cluster0.yr4jd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const PORT = 3001

//const data_name = require("./models/data_name")

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect(
    DB_URI
)

//add ETF to database
//remove later
app.post('/addETF', async (req, res) => {

    const ETFname = req.body.name;
    const ETFcreatedBy = req.body.createdBy;
    const ETFdata = req.body.data

    const etf = new ETFModel({name:ETFname, createdBy:ETFcreatedBy, data:ETFdata})

    try{
        await etf.save();
    } catch (err) {
        console.log(err)
    }

})

//parse all ETFs
//dummy etf stuff
app.get('/alllETFs', async (req, res) => {

    ETFModel.find({}, (err, result) =>{
        if (err) {
            res.send(err)
        }
        res.send(result)

    });
})


app.listen(PORT, ()=>{
    console.log("Server running on port ${PORT}")
});