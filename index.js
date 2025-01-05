const { app, BrowserWindow, ipcMain, screen } = require('electron');
const { config } = require("dotenv");
const path = require('path');
config()
const fs = require("fs");
const axios = require('axios')
const validator = require("validator")
const { start } = require("./send.js")
let dir = process.cwd();
let screenX = null
let screenY = null
const { getAccessToken } = require('./access_token')

var uri = ""

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 920,
        height: 465,
        resizable: false,
        frame: false,
        transparent: true,
        titleBarStyle: 'hidden',
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            devTools: true,
            webSecurity: false
        }
    })
    mainWindow.webContents.loadFile(path.join(__dirname, 'pages', 'main', 'main.html'));

    mainWindow.setAlwaysOnTop({ flag: true })
    return mainWindow
}

let display = null
app.disableHardwareAcceleration()

app.whenReady().then(async () => {
    await getAccessToken()
    let token = fs.readFileSync("access_token.txt").toString()
    process.env["WENXINTOKEN"] = token
    uri = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=" + token
    mainWindow = createWindow();
    display = screen.getPrimaryDisplay();
    start()
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
});

ipcMain.on('close-app', (event, params) => {
    mainWindow.close()
})

ipcMain.on('start-schedule', (event, params) => {
    let result = start(event)
    if (result) { event.sender.send("index-state", { state: true }); }
})

ipcMain.on('get-audio', (event, params) => {
    let content = params.content
    axios({
        method: 'get',
        url: `https://api.vvhan.com/api/song?txt=${content}`,
        responseType: 'stream'
    })
        .then(res => {
            let ws = fs.createWriteStream(path.join(dir, 'audio', params.id + '.mp3'))
            res.data.pipe(ws)
            ws.on('finish', () => {
                console.log('finish')
            })
        })
        .catch(err => {
            console.log(err);
        });
})

ipcMain.on('stop-schedule', (event, params) => {
    const { stop } = require("./send.js")
    stop()
    event.sender.send("index-state", { state: false });
})

ipcMain.on('mini-app', (event, params) => {
    mainWindow.setSize(400, 400);
    if (!screenX || !screenY) {
        const height = display.bounds.height;
        const width = display.bounds.width;
        let X = parseInt((width - mainWindow.getSize()[0]) / 2)
        let Y = parseInt((height - mainWindow.getSize()[1]) / 2)
        mainWindow.setPosition(X, Y);
    } else {
        mainWindow.setPosition(screenX, screenY);
    }
    mainWindow.hide();
    mainWindow.loadFile(path.join(__dirname, 'pages', 'mini', 'mini.html'))
    mainWindow.show()
})

ipcMain.on('main-app', (event, params) => {
    const windowPosition = mainWindow.getPosition();
    screenX = windowPosition[0];
    screenY = windowPosition[1];
    mainWindow.setSize(920, 465);
    const height = display.bounds.height;
    const width = display.bounds.width;
    let X = parseInt((width - mainWindow.getSize()[0]) / 2)
    let Y = parseInt((height - mainWindow.getSize()[1]) / 2)
    mainWindow.setPosition(X, Y);
    mainWindow.hide();
    mainWindow.loadFile(path.join(__dirname, 'pages', 'main', 'main.html'))
    mainWindow.show()
})

ipcMain.on('wenxin-question', (event, params) => {
    let msg = { stream: true, messages: [{ role: "user", content: params.content }] }
    axios({
        method: 'post',
        data: msg,
        url: uri,
        responseType: "stream"
    }).then(res => {
        res.data.on('data', (chunk) => {
            let content = chunk.toString().replace("data: ", "")
            if (validator.isJSON(content)) {
                let result = JSON.parse(content).result
                event.sender.send("wenxin-answer", { result: result, isEnd: false });
            }
        })
        res.data.on('end', () => {
            event.sender.send("wenxin-answer", { isEnd: true });
        })
    }).catch(err => {
        console.log(err)
    })
})




