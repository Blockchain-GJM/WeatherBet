const Big = require("bignumber.js")

const express = require('express')
const cors = require('cors')
const schedule = require('node-schedule-tz')
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv/config')

const SERVER_PORT = 3001
const CONTRACTS = {"A": {address: "0x639eaA95905F141ff1d43B08D287C8d21789E582", state: "", state_count: 0}, "B": {address: "0x29a83915F25BB3092EbdDb8eC47c92f3C3D62AEA", state: "", state_count: 0}, "C": {address: "0x8D586141605C08002E3c87f9c6aF31282528413F", state: "", state_count: 0}}
let CURRENT_CONTRACT = CONTRACTS["A"].address

const app = express()
app.use(cors())

// CONNECT TEST
app.get('/', async (req, res) => {
    console.log("Testing Server Connect")
    res.send("Test Send")
})

// GET DATA REQUEST
app.get('/data', async (req, res) => {
    // TODO fetch odds variables: totalBetsonRain, totalBetsonNoRain from Smart Contract
    console.log("getting odds")

    const odds = await getOdds(CURRENT_CONTRACT)

    // create JSON object
    let data = {contract: CURRENT_CONTRACT, rain: odds[0], norain: odds[1]}

    console.log("SENDING: " + JSON.stringify(data))
    res.send(JSON.stringify(data))
})

async function getOdds(contract_ad){
    
    const contract = createContract(contract_ad)

    const rainBet = Promise.resolve(contract.methods.totalBetsonRain().call())
    const noRainBet = Promise.resolve(contract.methods.totalBetsonNoRain().call())

    console.log(promiseToFloat(rainBet))

    return [promiseToFloat(rainBet), promiseToFloat(noRainBet)]
}

function promiseToFloat(val){
    const str = val.toString()

    if(str.length > 1){
        var val = parseInt(str.substring(0, str.length-16))
        val = val / 100.0
        return val
    }

    return parseInt(str)
}

function createContract(contract_address){
    let Mcp = require("mcp.js");
    const abi = require("./abi.json");

    const options = {
        host:"18.182.45.18",
        port:8765
    }

    let mcp = new Mcp(options);

    mcp.Contract.setProvider("http://18.182.45.18:8765/");

    console.log(mcp.request.status())

    const coreAddress = contract_address;

    const contract = new mcp.Contract(abi, coreAddress)

    return contract
}



app.listen(SERVER_PORT, ()=>{
    console.log("Server running on port 3001")
});



//////////////////////////////////////
/// SCHEDULER
//////////////////////////////////////

// Scheduler Ruleset for payout
const ruleMidnight = new schedule.RecurrenceRule();
ruleMidnight.hour = 23;
ruleMidnight.minute = 59;
ruleMidnight.tz = 'America/New_York'

const ruleNoon = new schedule.RecurrenceRule();
ruleNoon.hour = 11;
ruleNoon.minute = 59;
ruleNoon.tz = 'America/New_York'

// Test rule, run every minute when seconds == 4
const ruleTest = new schedule.RecurrenceRule();
ruleTest.second = 4

const jobMidnight = schedule.scheduleJob(ruleMidnight, function(){
    contractTimeStep();
});

const jobNoon = schedule.scheduleJob(ruleNoon, function(){
    contractTimeStep();
});



// TODO DELETE THIS
// TESTER
let i = 0;

//*/10 * * * * *
var event = schedule.scheduleJob("*/5 * * * *", function() {
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

async function doReset(contract_ad){
    // TODO
    // reset and open smartcontract call resetBet() as manager
    const contract = createContract(contract_ad)

    try{

        contract.methods.resetBet().sendBlock({
            from: "0xe05D6eaA0A0302CB0Dad1cb1b3FEC2B9839afe31",
            password: "12121212",
            amount: new Big("0").toString(),
            gas_price: "20000000000",
            gas: "2000000"
        }).then(res => {console.log(res)})

    } catch(err) {
        console.log("ERROR")
        console.log(err)
    }

    return 0
}
//////////////////////////////////////



//////////////////////////////////////
/// EXPIRE LOGIC
/////////////////////////////////////

function doExpire(contract_ad){
    // TODO
    // expire smartcontract call setExpired() as manager

    const contract = createContract(contract_ad)

    try{

        contract.methods.setExpired().sendBlock({
            from: "0xe05D6eaA0A0302CB0Dad1cb1b3FEC2B9839afe31",
            password: "12121212",
            amount: new Big("0").toString(),
            gas_price: "20000000000",
            gas: "2000000"
        }).then(res => {console.log(res)})

    } catch(err) {
        console.log("ERROR")
        console.log(err)
    }


    return 0
}
//////////////////////////////////////



//////////////////////////////////////
/// PAYOUTS LOGIC
/////////////////////////////////////

async function doPayouts(contract_ad){
    console.log("======= RUNNING PAYOUT SCRIPT =======")
    
    let rainStatus = await checkRainStatus()
    console.log("RAIN STATUS: ", rainStatus)
    
    let arg = 0 // follow logic
    if (rainStatus == true) {
        arg = 1
    }
    
    // TODO
    // do payouts on blockchain call payout(arg)
    const contract = createContract(contract_ad)

    try{

        contract.methods.payout(arg).sendBlock({
            from: "0xe05D6eaA0A0302CB0Dad1cb1b3FEC2B9839afe31",
            password: "12121212",
            amount: new Big("0").toString(),
            gas_price: "20000000000",
            gas: "2000000"
        }).then(res => {console.log(res)})

    } catch(err) {
        console.log("ERROR")
        console.log(err)
    }
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