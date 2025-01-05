const ipcRenderer = require("electron").ipcRenderer;
const { v4: uuidv4 } = require('uuid');
const { exec, execSync } = require('child_process');
const path = require('path')
const moment = require("moment")
const { ask } = require("./chat")
const axios = require('axios')

let token = process.env.WENXINTOKEN
let uri = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=" + token


const fs = require("fs")
let dir = process.cwd();

new Vue({
    el: '#app',
    data: {
        date: "",
        schedules: [],
        time: "",
        content: "",
        disabled: false,
        question: "",
        answer: "亲爱的主人您好，我是边缘骇客机器猫，请问您有什么问题吗？",
        menu: "wenxin",
        state: false
    },
    methods: {
        SetTime(flag) {
            if (!flag) {
                this.time = moment().format("HH:mm")
            } else {
                this.time = moment().format("yyyy.MM.DD HH:mm")
            }
        },
        ChooseMenu(menu) {
            this.menu = menu
        },
        TestDir() {
            execSync('start chrome https://space.bilibili.com/3537110885730658')
        },
        CloseApp() {
            ipcRenderer.send("close-app")
        },
        MiniApp() {
            ipcRenderer.send("mini-app")
        },
        StopSchedule() {
            ipcRenderer.send("stop-schedule")
        },
        StartSchedule() {
            ipcRenderer.send("start-schedule")
        },
        DeleteSchedule(id) {
            let errorAudio = document.getElementById("error-audio")
            errorAudio.play()
            const recordToDelete = { id: id };
            const index = this.schedules.findIndex(item => item.id === recordToDelete.id);
            if (index !== -1) { this.schedules.splice(index, 1); }
            let updatedSchedulesData = JSON.stringify(this.schedules, null, 2);
            fs.writeFileSync(path.join(dir, 'config.json'), updatedSchedulesData, 'utf8');
            this.StartSchedule()
        },
        AddSchedule() {
            if (this.time === "" || this.content === "") { return }
            let successAudio = document.getElementById("success-audio")
            successAudio.play()
            const newRecord = { id: uuidv4(), time: this.time, content: this.content };
            this.schedules.push(newRecord);
            let updatedSchedulesData = JSON.stringify(this.schedules, null, 2);
            fs.writeFileSync(path.join(dir, 'config.json'), updatedSchedulesData, 'utf8')
            ipcRenderer.send("get-audio", {content: this.content, id: newRecord.id})
            this.StartSchedule()
        },
        RestartSchedule() {
            this.content = ""
            this.time = ""
        },
        AskWenXinModel() {
            if (this.question) {
                this.answer = ""
                this.disabled = true
                ipcRenderer.send("wenxin-question", { content: this.question })
            }
        }
    },
    mounted() {
        const data = fs.readFileSync(path.join(dir, 'config.json'), 'utf8');
        const jsonData = JSON.parse(data);
        this.schedules = jsonData
        ipcRenderer.on('wenxin-answer', (event, param) => {
            if (param.isEnd) {
                this.question = ""
                this.disabled = false
            } else {
                this.answer = this.answer + param.result
            }
        })
        ipcRenderer.on('index-state', (event, param) => {
            this.state = param.state
        })
        this.date = moment().format("yyyy.MM.DD HH:mm:ss")
        setInterval(() => {
            this.date = moment().format("yyyy.MM.DD HH:mm:ss")
        }, 1000)

    }
})