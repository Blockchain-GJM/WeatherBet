const express = require('express')
//const mongoose = require('mongoose')
const cors = require('cors')
const schedule = require('node-schedule-tz')
const fetch = require('node-fetch');
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

// Scheduler Ruleset
const rule = new schedule.RecurrenceRule();
rule.hour = 23;
rule.minute = 59;
rule.tz = 'America/New_York'

// Test rule, run every minute when seconds = 4
const ruleTest = new schedule.RecurrenceRule();
ruleTest.second = 4

const job = schedule.scheduleJob(rule, function(){
    doPayouts();
});


function getDateStrings(){
    let now = new Date(Date.parse((new Date()).toUTCString()))
    

    // test for May 6-7
    // now.setDate(6)
    
    let upperBound = new Date(now)
    // upperbound is New York 11:59pm
    upperBound.setUTCHours(3)
    upperBound.setUTCMinutes(59)
    upperBound.setUTCSeconds(59)
    upperBound.setUTCDate(upperBound.getUTCDate()+1)

    // lowerbound is New York 5:50am to get 5:51am weather report for past 6 hour rain
    let lowerBound = new Date(now)
    lowerBound.setUTCHours(9)
    lowerBound.setUTCMinutes(50)
    upperBound.setUTCSeconds(0)

    return [lowerBound, upperBound]
}

function doPayouts(){
    console.log("======= RUNNING PAYOUT SCRIPT =======")
    
    var lower
    var upper
    [lower, upper] = getDateStrings();
    
    
    let rainTypes = ["drizzle", "hail", "snow_pellets", 
                    "ice_crystals", "ice_pellets",
                    "rain", "snow_grains", "snow"]
    
    console.log(lower)
    console.log(upper)
    allTimeStamps = []

    let url = "https://api.weather.gov/stations/KNYC/observations"
    let settings = {method: "Get"}

    let rainStatus = fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            let wasRain = false
            for (const item of json.features){
                checkDate = Date.parse(item.properties.timestamp)
                if (lower.getTime() <= checkDate && checkDate <= upper.getTime()){
                    for (const description of item.properties.presentWeather){
                        for (const rain of rainTypes){
                            if (description.weather.includes(rain)){
                                console.log(item.properties.timestamp, ": found rain")
                                wasRain = true
                            }
                        }
                    }
                }
            }
            return wasRain
        })
        .then(rainStatus => {
            console.log(rainStatus)
            // PAYOUT INIT GOES HERE
        })
        .catch(error => console.error(error));
    

    return rainStatus
};