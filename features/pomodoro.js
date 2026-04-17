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
    refreshConfig: function (store) {
        this.frequency = store.get('pomodoro_frequency');
        this.breakTime = store.get('pomodoro_breakTime');
        this.startHour = store.get('pomodoro_startHour');
        this.endHour = store.get('pomodoro_endHour');
        this.enabled = store.get('pomodoro_enabled');
    },
    startPomodoroClock: function () {
        return setTimeout(() => { this.pomodoroCheck() }, this.frequency * 60 * 1000);
    },
    pomodoroCheck: function () {
        let hours = new Date().getHours();
        if (hours >= this.startHour && hours <= this.endHour && this.enabled) {
            let notification = new Notification({ toastXml: this.getToastXML("Pomodoro", "Take a short break") })
            notification.show();
        }

        this.currentTimeout = setTimeout(() => {
            this.currentTimeout = this.startPomodoroClock();
        }, this.breakTime * 60 * 1000)
    },
    getToastXML: function (title, body) {
        // When packaged, the image is unpacked from the ASAR to the
        // app.asar.unpacked directory alongside the app.  We resolve via
        // process.resourcesPath so the path is valid in all environments
        // (dev and packaged).
        const iconPath = path.join(
            process.resourcesPath || path.join(__dirname, '..'),
            'app.asar.unpacked',
            'android-chrome-512x512.png'
        );
        return `
        <toast branding="logo">
            <visual >
                <binding template="ToastImageAndText04">
                    <text id="1">${title}</text>
                    <text id="2">${body}</text>
                    <image id="1" src="${iconPath}"/>
                </binding>
            </visual>
            <audio src="ms-winsoundevent:Notification.Looping.Alarm3"/>
        </toast>`
    }
};
module.exports = pomodoro;
