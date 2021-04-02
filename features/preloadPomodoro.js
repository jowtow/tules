const {
    contextBridge,
    ipcRenderer
} = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
}
);

window.addEventListener('DOMContentLoaded', () => {
    var frequencyInput = document.querySelector("#pfreq");
    var breakInput = document.querySelector("#pbreak");
    var startInput = document.querySelector("#pstart");
    var endInput = document.querySelector("#pend");
    var enabledInput = document.querySelector("#penabled");

    ipcRenderer.send('config-request');
    ipcRenderer.on('config-reply', function (event, data) {
        frequencyInput.value = data['pomodoro_frequency'];
        breakInput.value = data['pomodoro_breakTime'];
        startInput.value = data['pomodoro_startHour'];
        endInput.value = data['pomodoro_endHour'];
        enabledInput.checked = data['pomodoro_enabled'];
    });


    frequencyInput.addEventListener('change', (e) => {
        ipcRenderer.send("pomoUpdate", { key: 'pomodoro_frequency', val: frequencyInput.value })
    })

    breakInput.addEventListener('change', (e) => {
        ipcRenderer.send("pomoUpdate", { key: 'pomodoro_breakTime', val: breakInput.value })
    })

    startInput.addEventListener('change', (e) => {
        ipcRenderer.send("pomoUpdate", { key: 'pomodoro_startHour', val: startInput.value })
    })

    endInput.addEventListener('change', (e) => {
        ipcRenderer.send("pomoUpdate", { key: 'pomodoro_endHour', val: endInput.value })
    })

    enabledInput.addEventListener('change', (e) => {
        ipcRenderer.send("pomoUpdate", { key: 'pomodoro_enabled', val: enabledInput.checked })
    })
})
