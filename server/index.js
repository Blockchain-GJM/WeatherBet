const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv/config')


const ETFModel = require("./models/Etf")
const userModel = require("./models/User")

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect(
    process.env.DB_URI
)

//add ETF to database
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
app.get('/alllETFs', async (req, res) => {

    ETFModel.find({}, (err, result) =>{
        if (err) {
            res.send(err)
        }
        res.send(result)

    });
})


const PORT = proceess.env.PORT || 3001
app.listen(PORT, ()=>{
    console.log("Server running on port ${PORT}")
});