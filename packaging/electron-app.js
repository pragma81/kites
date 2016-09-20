'use strict';
const electron = require('electron');

var PropertiesReader = require('properties-reader');
var path = require('path')
var fs = require('fs')
var fse = require('fs-extra')

// Module to control application life.
const {app} = electron;
// Module to create native browser window.
const {BrowserWindow} = electron;

const {session} = electron


let win;

function createWindow() {
    config()

    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['User-Agent'] = 'KiTes Agent';
        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
    // Create the browser window.
    win = new BrowserWindow({
        width: 1100, height: 768, webPreferences: {
            // nodeIntegration: false,
            webSecurity: false,
            preload: __dirname + "/preload.js"
        }
    });

    console.log(JSON.stringify(process.argv))
    var url = 'file://' + __dirname + '/index.html'
   
    config()

    var properties = getProperties(process.argv)
    global.sharedObject = { config: properties }
    //url = 'file://' + __dirname + '/www/index.html'
    // and load the index.html of the app.
    win.loadURL(url);
    win.webContents.send('config', properties)
    console.log('KiTes window opened');
    // Open the DevTools.
    if(hasParameter('debug',process.argv))
         win.webContents.openDevTools();
   

    console.log('KiTes window opened');
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

function config() {
    var userhome = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
    var sep = process.platform == 'win32' ? '\\' : '/'
    let workspaceHomeFolder = userhome + sep + 'kites'
    try {
        fs.statSync(workspaceHomeFolder)
    }catch (ex) {
        //File does not exists. New one is created
        try {
            fs.mkdirSync(workspaceHomeFolder)
        } catch (ex) {
            throw new Error(`Error while creating file [${workspaceHomeFolder}]: Nested Exception is [${ex.name}][${ex.message}]`)
        }
    }
}

function getProperties(args) {
    var filePath = findCommand('conf', args)
    if (filePath === undefined)
        throw new Error("Properties file not configured. Use --conf=path/to/file.properties to setup KiTes")
    var relativePath = process.cwd() + path.sep + filePath
    var properties = undefined
    try {
        properties = PropertiesReader(relativePath);
    } catch (err) {
        //try absolute mode
        try {
            properties = PropertiesReader(filePath);
        } catch (err) {
            throw new Error(` No file found in relative path [${filePath}] or absolute path [${relativePath}. `)
        }
    }
    return properties
}

function findCommand(parameter, args) {
    var value = undefined
    args.forEach(function (val) {
        var command = val.split('=')

        //check command format 
        if (command.length < 2)
            return

        var commandParameter = command[0]
        var commandValue = command[1]

        if ('--' + parameter === commandParameter)
            value = commandValue

    })
    return value
}

function hasParameter(name, args) {
    var value = false
    args.forEach(function (val) {
        if ('--' + name === val)
            value = true

    })
    return value
}
