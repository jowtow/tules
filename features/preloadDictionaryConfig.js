const {
    ipcRenderer
} = require("electron");

window.addEventListener('DOMContentLoaded', () => {
    var shortcutInput = document.querySelector("#dshortcut");
    ipcRenderer.send('config-request');
    ipcRenderer.on('config-reply', function (event, data) {
        shortcutInput.value = data['dictionary_shortcut'];
    });

    shortcutInput.addEventListener('change', (e) => {
        ipcRenderer.send("dictionaryUpdate", { key: 'dictionary_shortcut', val: shortcutInput.value })
    })
})
