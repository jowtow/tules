const pomodoro = require('./features/pomodoro');
const { app, BrowserWindow, Menu, Tray, MenuItem, clipboard, ipcMain, screen } = require('electron')
const path = require('path')
const Store = require('./features/store.js');
let tray = null;


const store = new Store({
  configName: 'user-preferences',
  defaults: {
    pomodoro_frequency: 25,
    pomodoro_breakTime: 5,
    pomodoro_startHour: 8,
    pomodoro_endHour: 17,
    pomodoro_enabled: true
  }
});


function launchGuidGenerator() {
  // http://guid.us/GUID/JavaScript
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
  clipboard.writeText(guid)
}

function launchEmptyGuidGenerator() {
  clipboard.writeText('00000000-0000-0000-0000-000000000000')
}

function launchPomodoroConfiguration() {
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
  preventCloseFromQuittingApp(win1);
  win1.loadFile("./pages/pomodoroConfig.html");
  win1.on('blur', () => win1.close());
}

function preventCloseFromQuittingApp(win) {
  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      win.hide();
    }
    return false;
  });
}

function setMessageListeners() {
  ipcMain.on('config-request', (event, args) =>{
    event.sender.send('config-reply', store.getAllData());
  })

  ipcMain.on('pomoUpdate', (event, args) => {
    store.set(args.key, args.val);
    pomodoro.refreshConfig(store);
  })
}

app.whenReady().then(() => {
  setMessageListeners()

  pomodoro.init(store);

  tray = new Tray("favicon.ico")
  tray.setToolTip("tules are not rules");

  var trayMenu = new Menu();
  var guidGeneratorMenuItem = new MenuItem({ label: 'Clipboard: Random Guid', type: 'normal', click: launchGuidGenerator });
  var emptyGuidGeneratorMenuItem = new MenuItem({ label: 'Clipboard: Empty Guid', type: 'normal', click: launchEmptyGuidGenerator });
  var configurePomodoroMenuItem = new MenuItem({ label: 'Pomodoro: Configure', type: 'normal', click: launchPomodoroConfiguration });
  var quitMenuItem = new MenuItem({ label: 'Quit', type: 'normal', click: quitApp });

  trayMenu.append(guidGeneratorMenuItem);
  trayMenu.append(emptyGuidGeneratorMenuItem);
  trayMenu.append(configurePomodoroMenuItem);
  trayMenu.append(quitMenuItem);
  tray.setContextMenu(trayMenu);
  tray.on("click", () => tray.popUpContextMenu(trayMenu))
})

function quitApp() {
  app.isQuitting = true;
  app.quit()
}
