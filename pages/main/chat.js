const axios = require('axios')
let token = process.env.WENXINTOKEN

let uri = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=" + token
let axiosconfig = {
    headers: {
        'Content-Type': 'application/json'
    }
}

let ask = async (content) => {
    let msg = {
        "messages": [
            {
                "role": "user",
                "content": content
            }
        ]
    }
    try {
        let res = await axios.post(uri, msg, axiosconfig)
        if (res.data) {
            return res.data.result
        } else {
            return "Bot in Service Error."
        }
    } catch {
        return "Bot in Axios Error."
    }
}

module.exports = {
    ask
}