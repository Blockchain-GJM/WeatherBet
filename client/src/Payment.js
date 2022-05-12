//import contract from "./contract"
import Big from 'bignumber.js'

export async function approve(wallet, limit, password, rain_chosen, contract_address){

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

    const approveAmount = new Big(limit).times('1e18').toString()
    
    try{
        var response;
        if(rain_chosen){
            const response = await contract.methods.enterWithRain().sendBlock({
                from: wallet,
                password: password,
                amount: new Big(approveAmount).toString(),
                gas_price: "20000000000",
                gas: "2000000"
            })
        } else {
            const response = await contract.methods.enterWithNoRain().sendBlock({
                from: wallet,
                password: password,
                amount: new Big(approveAmount).toString(),
                gas_price: "20000000000",
                gas: "2000000"
            })
        }
        return response

    } catch (err) {
        console.log(err)
        return(err)
    }


    
};
