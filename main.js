const {app, BrowserWindow, ipcMain, globalShortcut} = require('electron')
var screen = {}
const path = require('path')
const url = require('url')

const {WindowManager} = require('./modules/WindowManager')
const {IpcConnector} = require('./modules/IpcConnector')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

const SERVER_URL = "http://localhost:55555"
var mUserName = "NoName"
var mWindowManager = null
var mSocketConnector = null
var mIpcConnector = null
var mWordManager = null

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, './public/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}


function initialize() {
  // WindowManager
  // SocketConnector <= handle "key event" and "peer connection request" and "event broadcast" with socket.io
  // IpcConnector <= ipc event handler
  // WordManager <= key event and shout event
  screen = require('electron').screen
  if(mWindowManager){
    // clear all modules
    mWindowManager.closeAllWindow()
  }
    mWindowManager = new WindowManager(SERVER_URL, screen)
    mIpcConnector = new IpcConnector(mWindowManager)
    mIpcConnector.onLoginEventListener((data)=>{
      mUserName = data.userName
    })

    setGlobalShortcut()
  
}

function setGlobalShortcut(){

    /*
       set shortcut event
     */
    globalShortcut.register('CommandOrControl+Shift+F', () => {
      console.log('CommandOrControl+Shift+F is pressed')
      mIpcConnector.messageForFront('self_shout',{})
    })

    globalShortcut.register('CommandOrControl+Shift+G', () => {
      console.log('CommandOrControl+Shift+G is pressed')
      mIpcConnector.messageForFront('member_shout',{userName:"keisukekeisuke",socketId:"aaaaaa",keywordList:["aaaa","bbbb","cccc"],animalType:"inu"})
    })

    globalShortcut.register('CommandOrControl+Shift+R', () => {
      console.log('CommandOrControl+Shift+R is pressed')
      mIpcConnector.messageForFront('change_transparent',{})
    })
    

}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initialize)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (win === null) {
  //   createWindow()
  // }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.