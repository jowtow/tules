var querystring = require('querystring');
const { BrowserWindow, session } = require('electron');
const { default: axios } = require('axios');

var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

async function GetAccessToken(client_id, client_secret, callbackToMain) {
    var authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        'node-integration': false,
        'web-security': false
    });
    var scope = 'user-read-private user-read-email app-remote-control user-modify-playback-state user-read-playback-state';
    var state = generateRandomString(16);
    authWindow.loadURL('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: "http://localhost:8888/callback",
            state: state
        }));
    authWindow.show();
    const redirectUri = 'http://localhost:8888/callback'
    const filter = {
        urls: [redirectUri + '*']
    };
    session.defaultSession.webRequest.onBeforeRequest(filter, async function (details, callback) {
        const url = details.url;
        let code = querystring.parse(url.slice(url.indexOf("?") + 1)).code;
        let options = {
            url: 'https://accounts.spotify.com/api/token',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${(new Buffer(client_id + ':' + client_secret).toString('base64'))}`
            },
            params: {
                code: code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            }
        }
        var response = await axios(options).catch((foo) => console.log(foo));
        callbackToMain(response.data.access_token);
        authWindow.close();
    });

    authWindow.on('closed', function () {
        authWindow = null;
    });
}

module.exports = { GetAccessToken }