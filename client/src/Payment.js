import contract from "./contract"
import Big from 'bignumber.js'

export async function approve(wallet, limit, password, rain_chosen){

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
