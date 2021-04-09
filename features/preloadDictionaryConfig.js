const {
    ipcRenderer
} = require("electron");

window.addEventListener('DOMContentLoaded', () => {
    var shortcutInput = document.querySelector("#dshortcut");
    var apiKeyInput = document.querySelector("#dapikey");
    var apiCallsElem = document.querySelector("#dapicalls");
    ipcRenderer.send('config-request');
    ipcRenderer.on('config-reply', function (event, data) {
        shortcutInput.value = data['dictionary_shortcut'];
        apiKeyInput.value = data['dictionary_apikey'];
        apiCallsElem.innerHTML = data['dictionary_apicalls'] ?? 0;
    });

    shortcutInput.addEventListener('change', (e) => {
        ipcRenderer.send("dictionaryUpdate", { key: 'dictionary_shortcut', val: shortcutInput.value })
    });

    apiKeyInput.addEventListener('change', (e) => {
        ipcRenderer.send("dictionaryUpdate", { key: 'dictionary_apikey', val: apiKeyInput.value })
    });
})
