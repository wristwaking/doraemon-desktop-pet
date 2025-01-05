const fs = require('fs')
const axios = require('axios')
const path = require('path')


function craeteAudio(content) {
    axios({
        method: 'get',
        url: `https://api.vvhan.com/api/song?txt=${content}`,
        responseType: 'stream',
    })
        .then(async res => {
            await res.data.pipe(fs.createWriteStream(path.join(__dirname, 'test.mp3')))
        })
        .catch(err => {
            console.log(err);
        });
}