const schedule = require('node-schedule');
const { config } = require("dotenv")
const fs = require('fs');
const path = require('path');
const moment = require("moment")

config()

let start = (event) => {
    stop()

    let flag = true

    let dir = process.cwd();
    let configData = fs.readFileSync(path.join(dir, 'config.json'), 'utf8');
    let jsonData = JSON.parse(configData);
  
    let jobs = schedule.scheduledJobs;
    for (let jobName in jobs) { jobs[jobName].cancel(); }

    jsonData.forEach(item => {
        try {
            const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/; 
            if (timePattern.test(item.time)) {
                item.time = moment().format("yyyy.MM.DD") + " " + item.time
            }
            schedule.scheduleJob(item.time, () => {
                event.sender.send("schedule-show", { id: item.id, time: item.time, content: item.content });
            })
        } catch { flag = false }
    });
    
    return flag
}

let stop = () => {
    let jobs = schedule.scheduledJobs;
    for (let jobName in jobs) { jobs[jobName].cancel(); }
}

module.exports = {
    start, stop
}