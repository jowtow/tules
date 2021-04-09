const pomodoro = require('./features/pomodoro');
const launcher = require('./launcher.js');
const { app, BrowserWindow, Menu, Tray, MenuItem, ipcMain, globalShortcut } = require('electron')
const path = require('path')
const Store = require('./features/store.js');
let tray;

app.whenReady().then(() => {
  setupBackgroundProcesses();
  setupMessageListeners();
  setupKeyboardShortcuts();
  setupTray();
});

const store = new Store({
  configName: 'user-preferences',
  defaults: {
    pomodoro_frequency: 25,
    pomodoro_breakTime: 5,
    pomodoro_startHour: 8,
    pomodoro_endHour: 17,
    pomodoro_enabled: true,
    dictionary_shortcut: 'Alt+D'
  }
});

function setupBackgroundProcesses(){
  pomodoro.init(store);
}

function setupMessageListeners() {
  ipcMain.on('config-request', (event, args) =>{
    event.sender.send('config-reply', store.getAllData());
  })

  ipcMain.on('pomoUpdate', (event, args) => {
    store.set(args.key, args.val);
    pomodoro.refreshConfig(store);
  })

  ipcMain.on('dictionaryUpdate', (event, args) => {
    store.set(args.key, args.val);
    setupKeyboardShortcuts();
  })

  ipcMain.on('dictionaryApiCall', (event, args) => {
    let today = new Date()
    let todayString = `${today.getMonth() + 1}_${today.getDate()}_${today.getFullYear()}`;
    let callCount = store.get("dictionary_apicalls");
    let date = store.get("date");
    if(!date || date != todayString){
      callCount = 0;
      date = todayString;
    }
    if(!callCount) callCount = 0;
    store.set("dictionary_apicalls", callCount + 1);
    store.set("date", date);
  })

  ipcMain.on('pomoNotification', (event, args) =>{
    launchPomodoroNotification(args.title, args.body)
  });
}

function setupKeyboardShortcuts(){
  globalShortcut.unregisterAll();
  let dictionaryShortcut = store.get("dictionary_shortcut");
  if(dictionaryShortcut){
    globalShortcut.register(dictionaryShortcut, () => { launcher.launchDictionarySearch() });
  }
}

function setupTray(){
  tray = new Tray(path.join(__dirname, "favicon.ico"));
  tray.setToolTip("tules are not rules");

  var trayMenu = new Menu();
  var guidGeneratorMenuItem = new MenuItem({ label: 'Clipboard: Random Guid', type: 'normal', click: launcher.launchGuidGenerator });
  var emptyGuidGeneratorMenuItem = new MenuItem({ label: 'Clipboard: Empty Guid', type: 'normal', click: launcher.launchEmptyGuidGenerator });
  var configurePomodoroMenuItem = new MenuItem({ label: 'Pomodoro: Configure', type: 'normal', click: launcher.launchPomodoroConfiguration});
  var configureDictionaryMenuItem = new MenuItem({label: 'Dictionary: Configure', type: 'normal', click: launcher.launchDictionaryConfiguration});
  var quitMenuItem = new MenuItem({ label: 'Quit', type: 'normal', click: quitApp });

  trayMenu.append(guidGeneratorMenuItem);
  trayMenu.append(emptyGuidGeneratorMenuItem);
  trayMenu.append(configurePomodoroMenuItem);
  trayMenu.append(configureDictionaryMenuItem);
  trayMenu.append(quitMenuItem);
  tray.setContextMenu(trayMenu);
  tray.on("click", () => tray.popUpContextMenu(trayMenu))
}

function quitApp() {
  app.isQuitting = true;
  app.quit()
}