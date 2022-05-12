const express = require('express')
//const mongoose = require('mongoose')
const cors = require('cors')
const schedule = require('node-schedule-tz')
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv/config')

const SERVER_PORT = 3001
const CONTRACTS = {"A": {address: "0x13Bd352EcbbfD9Ccc7D4150d57D835600FB18c00", state: "", state_count: 0}, "B": {address: "2", state: "", state_count: 0}, "C": {address: "3", state: "", state_count: 0}}
let INIT_FLAG = false

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
/// SCHEDULER
//////////////////////////////////////

// Scheduler Ruleset for payout
const rule = new schedule.RecurrenceRule();
rule.hour = 23;
rule.minute = 59;
rule.tz = 'America/New_York'

// Test rule, run every minute when seconds == 4
// const ruleTest = new schedule.RecurrenceRule();
// ruleTest.second = 4

const job = schedule.scheduleJob(rule, function(){
    contractTimeStep();
});

// TODO DELETE THIS
// TESTER
let i = 0;
var event = schedule.scheduleJob("*/10 * * * * *", function() {
    console.log("TIME: ", i)
    contractTimeStep();
    i += 1
});
// TESTER

//////////////////////////////////////



//////////////////////////////////////
/// CONTRACT ROTATION LOGIC
//////////////////////////////////////
function contractInit(){
    CONTRACTS.A.state = "stale"
    CONTRACTS.A.state_count = 0


    CONTRACTS.B.state = "close"
    CONTRACTS.B.state_count = 1

    CONTRACTS.C.state = "open"
    CONTRACTS.C.state_count = 1

}

// Time Step for contract
// open == open for betting
// close == closed for betting, holding money
// stale == paid out, waiting to be opened
// Called at 11:59pm and at 11:59am EST
function contractTimeStep(){
    console.log(CONTRACTS)
    for (const contract in CONTRACTS){
        CONTRACTS[contract].state_count += 1
        if (CONTRACTS[contract].state == "stale" && CONTRACTS[contract].state_count == 1){
            console.log("RESET: ", contract)
            doReset(contract);
            CONTRACTS[contract].state = "open"
            CONTRACTS[contract].state_count = 0
            CURRENT_CONTRACT = CONTRACTS[contract].address
        }
        else if (CONTRACTS[contract].state == "open" && CONTRACTS[contract].state_count == 2){
            console.log("EXPIRE: ", contract)
            doExpire(contract)
            CONTRACTS[contract].state = "close"
            CONTRACTS[contract].state_count = 0
        }
        else if (CONTRACTS[contract].state == "close" && CONTRACTS[contract].state_count == 3){
            console.log("PAYOUT: ", contract)
            doPayouts(contract)
            CONTRACTS[contract].state = "stale"
            CONTRACTS[contract].state_count = 0
        }
    }
}
//////////////////////////////////////



//////////////////////////////////////
/// RESET LOGIC
/////////////////////////////////////

function doReset(contract){
    // reset and open smartcontract
    return 0
}
//////////////////////////////////////



//////////////////////////////////////
/// EXPIRE LOGIC
/////////////////////////////////////

function doExpire(contract){
    // expire smartcontract
    return 0
}
//////////////////////////////////////



//////////////////////////////////////
/// PAYOUTS LOGIC
/////////////////////////////////////

async function doPayouts(contract){
    console.log("======= RUNNING PAYOUT SCRIPT =======")
    
    let rainStatus = await checkRainStatus()
    console.log("RAIN STATUS: ", rainStatus)
    
    // do payouts on blockchain
};
 

async function checkRainStatus(){
    var lower
    var upper
    [lower, upper] = getDateStrings();

    let rainTypes = ["drizzle", "hail", "snow_pellets", 
    "ice_crystals", "ice_pellets",
    "rain", "snow_grains", "snow"]

    // console.log(lower)
    // console.log(upper)
    
    let url = "https://api.weather.gov/stations/KNYC/observations"
    let settings = {method: "Get"}


    let data = await fetch(url,settings)
    let transformed = await data.json()
    let rainStatus = false
            for (const item of transformed.features){
                checkDate = Date.parse(item.properties.timestamp)
                if (lower.getTime() <= checkDate && checkDate <= upper.getTime()){
                    for (const description of item.properties.presentWeather){
                        for (const rain of rainTypes){
                            if (description.weather.includes(rain)){
                                // console.log(item.properties.timestamp, ": found rain")
                                rainStatus = true
                            }
                        }
                    }
                }
            }
    return rainStatus
}

// Gets the upperbound and lowerboudn date objects
function getDateStrings(){
    let now = new Date(Date.parse((new Date()).toUTCString()))
    
    // TODO DELETE THIS
    // Test for May 6-7
    now.setDate(6)
    
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

//////////////////////////////////////

// initialize first contract on startup
contractInit()