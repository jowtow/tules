const { Notification } = require('electron');
const path = require('path');
let pomodoro = {
    frequency: null,
    breakTime: null,
    startHour: null,
    endHour: null,
    enabled: null,
    currentTimeout: null,
    init: function (store) {
        this.refreshConfig(store);
        this.currentTimeout = this.startPomodoroClock();
    },
    refreshConfig: function(store){
        this.frequency = store.get('pomodoro_frequency');
        this.breakTime = store.get('pomodoro_breakTime');
        this.startHour = store.get('pomodoro_startHour');
        this.endHour = store.get('pomodoro_endHour');
        this.enabled = store.get('pomodoro_enabled');
    },
    startPomodoroClock: function(){
        return setTimeout(() => { this.pomodoroCheck() }, this.frequency * 60 * 1000);
    },
    pomodoroCheck: function () {
        let hours = new Date().getHours();
        if (hours >= this.startHour && hours <= this.endHour && this.enabled) {
            let notification = new Notification({ title: 'Pomodoro Time', body: 'Pomodoro Time!!!', icon: path.join(__dirname, '../favicon.ico')})
            notification.show();
        }

        this.currentTimeout = setTimeout(() => {
            this.currentTimeout = this.startPomodoroClock();
        }, this.breakTime * 60 * 1000)
    }
};
module.exports = pomodoro;
