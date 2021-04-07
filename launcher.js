const { app, BrowserWindow, clipboard, screen } = require('electron');
const path = require('path');
let launcher = {
    launchGuidGenerator: function () {
        // http://guid.us/GUID/JavaScript
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
        clipboard.writeText(guid)
    },
    launchEmptyGuidGenerator: function () {
        clipboard.writeText('00000000-0000-0000-0000-000000000000')
    },
    launchPomodoroConfiguration: function () {
        let display = screen.getPrimaryDisplay();
        let width = display.bounds.width;
        let height = display.bounds.height;
        const win1 = new BrowserWindow({
            x: width - (300 + 10),
            y: height - (210 + 10),
            width: 300,
            height: 210,
            movable: false,
            frame: false,
            skipTaskbar: true,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, './features/preloadPomodoro.js'),
            }
        });
        launcher.preventCloseFromQuittingApp(win1);
        win1.loadFile("./pages/pomodoroConfig.html");
        win1.on('blur', () => win1.close());
    },
    launchDictionaryConfiguration: function () {
        let display = screen.getPrimaryDisplay();
        let width = display.bounds.width;
        let height = display.bounds.height;
        const win1 = new BrowserWindow({
            x: width - (300 + 10),
            y: height - (210 + 10),
            width: 300,
            height: 210,
            movable: false,
            frame: false,
            skipTaskbar: true,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, './features/preloadDictionaryConfig.js'),
            }
        });
        launcher.preventCloseFromQuittingApp(win1);
        win1.loadFile("./pages/dictionaryConfig.html");
        win1.on('blur', () => win1.close());
    },
    launchDictionarySearch: function () {
        let win = new BrowserWindow({
            width: 600,
            height: 600,
            frame: false,
            transparent: true,
            autoHideMenuBar: true,
            movable: false,
            skipTaskbar: true,
            webPreferences:{
                preload: path.join(__dirname, './features/preloadDictionary.js'),
            }
        });
        launcher.preventCloseFromQuittingApp(win);
        win.loadFile('./pages/dictionary.html');
        win.on('blur', () => win.close());
    },
    preventCloseFromQuittingApp: function (win) {
        win.on('close', (event) => {
            if (!app.isQuitting) {
                event.preventDefault();
                win.hide();
            }
            return false;
        });
    }
}

module.exports = launcher;