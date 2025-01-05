const ipcRenderer = require("electron").ipcRenderer;
const path = require('path')
const axios = require('axios')
const fs = require('fs')
let dir = process.cwd();

new Vue({
    el: '#app',
    data: {
        time: "",
        content: "",
        menustate: false,
        state: false,
        mp3: "",
        id: ""
    },
    methods: {
        OpenMenu() {
            this.menustate = !this.menustate
        },
        EnterMain() {
            ipcRenderer.send("main-app")
        },
        CloseContent() {
            this.state = false
        }
    },
    mounted() {
        ipcRenderer.on('schedule-show', (event, param) => {
            this.content = param.content
            this.time = param.time
            this.id = param.id
            this.mp3 = path.join(dir, 'audio', this.id + '.mp3')
            setTimeout(() => {
                let audio =  document.getElementById("audio")
                audio.play()
                this.state = true
            }, 5000)
        })
    }
})