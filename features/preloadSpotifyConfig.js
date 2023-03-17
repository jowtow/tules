const {
    ipcRenderer
} = require("electron");

const moment = require("moment");
window.addEventListener('DOMContentLoaded', () => {
    var spofifyClientId = document.querySelector("#clientId");
    var spofifyClientSecret = document.querySelector("#clientSecret");
    var spofifyShortcut = document.querySelector("#shortcut");
    var spofifyAccessToken = document.querySelector("#accessToken");
    var spofifyAccessTokenSetAt = document.querySelector("#accessTokenSetAt");
    ipcRenderer.send('config-request');
    ipcRenderer.on('config-reply', function (event, data) {
        spofifyClientId.value = data['spotify_client_id'];
        spofifyClientSecret.value = data['spotify_client_secret'];
        spofifyShortcut.value = data['spotify_shortcut'];
        spofifyAccessToken.innerHTML = data['spotify_access_token'];
        spofifyAccessTokenSetAt.innerHTML = moment(data['spotify_access_token_set_at']).format("M/DD HH:mm:ss");
    });

    spofifyClientId.addEventListener('change', (e) => {
        ipcRenderer.send("spotifyConfigUpdate", { key: 'spotify_client_id', val: spofifyClientId.value })
    });

    spofifyClientSecret.addEventListener('change', (e) => {
        ipcRenderer.send("spotifyConfigUpdate", { key: 'spotify_client_secret', val: spofifyClientSecret.value })
    });

    spofifyShortcut.addEventListener('change', (e) => {
        ipcRenderer.send("spotifyConfigUpdate", { key: 'spotify_shortcut', val: spofifyShortcut.value })
    });
})
