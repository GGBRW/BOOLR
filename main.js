const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

//app.disableHardwareAcceleration();
app.commandLine.appendSwitch('ignore-gpu-blacklist');

let win;

function createWindow () {
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        icon: "./img/icon.png"
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'pws.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.on('closed', () => {
        win = null
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
