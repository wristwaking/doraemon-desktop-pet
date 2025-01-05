const axios = require('axios')
const { config } = require('dotenv')
const moment = require("moment")
config()

const fs = require('fs')

let client = {
    grant_type: "client_credentials",
    client_id: process.env.client_id,
    client_secret: process.env.client_secret
}

let axiosconfig = {
    headers: {
        "Content-Type": "application/json"
    }
}

let getAccessToken = async () => {
    try {
        let res = await axios.get(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${client.client_id}&client_secret=${client.client_secret}`, axiosconfig)
        console.log(`${moment().format("HH:mm:ss")} ${res.data.access_token}`)
        fs.writeFileSync("access_token.txt", res.data.access_token)
    } catch {
        return false;
    }
}

module.exports = {
    getAccessToken
}