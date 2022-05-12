import contract from "./contract"
import Big from 'bignumber.js'

export async function approve(wallet, limit){

        console.log(contract.methods)

        const approveAmount = new Big(limit).times('1e18').toString()

        /*
        const temp = await contract.Instance.methods.enterWithRain().call()
            .then(data => {console.log(data)})
        
        console.log(contract.Instance.options.account)
        console.log(contract.Instance.methods.createdTime.call())
        console.log(contract.Instance.methods.totalBetsonRain.call())
        console.log(contract.Instance.methods.totalBetsonNoRain.call())
        */
        
        console.log(contract.methods.enterWithNoRain())

        contract.methods.enterWithNoRain().sendBlock({
            from: wallet.toString(),
            password: "password",
            amount: new Big(approveAmount).toString(),
            gas_price: "200000000000",
            gas: "20000000000000"
        })
        .then(res => {console.log(res)})
        .catch(res => {console.log(res)})
    };
