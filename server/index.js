const express = require('express')
//const mongoose = require('mongoose')
const cors = require('cors')
const schedule = require('node-schedule-tz')
const fetch = require('node-fetch');
require('dotenv/config')

const SERVER_PORT = 3001


const app = express()
app.use(cors())

// CONNECT TEST
app.get('/', async (req, res) => {
    console.log("Testing Server Connect")
    res.send("Test Send")
})

// GET DATA REQUEST
app.get('/data', async (req, res) => {

    console.log(req.query)

    // TODO fetch odds
    // TODO determine contract address

    // create JSON object
    let data = {contract: "0xdeadbeef", rain: 100, norain: 80}
    console.log("SENDING: " + JSON.stringify(data))
    res.send(JSON.stringify(data))
})

app.listen(SERVER_PORT, ()=>{
    console.log("Server running on port 3001")
});

//////////////////////////////////////
/// CONTRACT ROTATION LOGIC
//////////////////////////////////////


//////////////////////////////////////
/// PAYOUTS LOGIC
/////////////////////////////////////

// Scheduler Ruleset for payout
const rule = new schedule.RecurrenceRule();
rule.hour = 23;
rule.minute = 59;
rule.tz = 'America/New_York'

// Test rule, run every minute when seconds == 4
// const ruleTest = new schedule.RecurrenceRule();
// ruleTest.second = 4

const job = schedule.scheduleJob(rule, function(){
    doPayouts();
});


function getDateStrings(){
    let now = new Date(Date.parse((new Date()).toUTCString()))
    

    // Test for May 6-7
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
 
//////////////////////////////////////