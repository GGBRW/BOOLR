const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

//app.disableHardwareAcceleration();
app.commandLine.appendSwitch('ignore-gpu-blacklist');

let window;

function createWindow () {
    window = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: __dirname + '../build/icon.png',
        show: false
    });

    window.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    window.once('ready-to-show', () => {
        window.maximize();
        window.show();
    });

    window.on('closed', () => {
        window = null
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (window === null) {
        createWindow()
    }
});
