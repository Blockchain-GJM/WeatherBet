const express = require('express')
//const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv/config')


//const DB_URI  ="mongodb+srv://admin:Blockchain123456@cluster0.yr4jd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
//const PORT = 3001

//const data_name = require("./models/data_name")

const app = express()
app.use(cors())

//mongoose.connect(
//    DB_URI
//)

app.get('/', async (req, res) => {

    console.log("Testing Server Connect")
    res.send("Test Send")
})

//req.query will equal the below
//{rain_chosen: true or false}
app.get('/odds', async (req, res) => {

    console.log(req.query)

    res.send("0.55555")
})

//req.query will equal the below
//{input: 0, choose_rain: true, wallet: null, network_id: null, odds: null}
//input is how much computeCoin they bet
//not sure what network id is
//can ignore odds
app.post('/bet', async (req, res) => {

    console.log(req.query)

    res.send("Bet Retrieved")
})


app.listen(3001, ()=>{
    console.log("Server running on port 3001")
});