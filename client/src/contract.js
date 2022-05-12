let Mcp = require("mcp.js");
const abi = require("./abi.json");

const options = {
    host:"https://test-huygens.computecoin.info",
    //port:8765
}

let mcp = new Mcp(options);

//mcp.Contract.setProvider("http://18.182.45.18:8765");
//mcp.Contract.setProvider("http://13.212.177.203:8765");


mcp.request.status().then(function (res) {
    console.log(`status`,res);
}).catch(function(error){
    console.log("accountList catch",error)
});

const tokenAddress = "0x13Bd352EcbbfD9Ccc7D4150d57D835600FB18c00";
const coreAddress = "0x13Bd352EcbbfD9Ccc7D4150d57D835600FB18c00";

/*

const Instance = new mcp.Contract(
    abi,
    tokenAddress
);


const Contract = {
    tokenAddress,
    Instance,
    coreAddress
};
*/


const Contract = new mcp.Contract(abi, coreAddress)

export default Contract;