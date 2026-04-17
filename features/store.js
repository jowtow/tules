const { app } = require('electron');
const path = require('path');
const fs = require('fs');

class Store {
    constructor(opts) {
        // electron.remote was removed in Electron 14; this module only runs in
        // the main process so app is always available directly.
        const userDataPath = app.getPath('userData');
        console.log(userDataPath);
        this.path = path.join(userDataPath, opts.configName + '.json');
        this.data = parseDataFile(this.path, opts.defaults);
    }

    get(key) {
        return this.data[key];
    }

    set(key, val) {
        this.data[key] = val;
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }

    getAllData(){
        return this.data;
    }
}

function parseDataFile(filePath, defaults) {
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        return defaults;
    }
}

module.exports = Store;