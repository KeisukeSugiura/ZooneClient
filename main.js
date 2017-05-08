const {app, BrowserWindow, ipcMain, globalShortcut} = require('electron')
var screen = {}
const path = require('path')
const url = require('url')

const {WindowManager} = require('./modules/WindowManager')
const {IpcConnector} = require('./modules/IpcConnector')
const {SocketConnector} = require('./modules/SocketConnector')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

// const SERVER_URL = "http://localhost:55555"
//const SERVER_URL = "http://133.68.112.250:55555"
const SERVER_URL = "https://zooneserver.herokuapp.com/"
var mUserName = "NoName"
var mAnimalType = "tiger"
var mWindowManager = null
var mSocketConnector = null
var mIpcConnector = null
var mWordManager = null
const animalArray = ["inu", "inu2", "chinpan", "lion", "manbou", "neko", "neko2", "niwatori", "pengin", "risu", "taka", "tiger", "tokage", "uzura", "yagi", "zou"]


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
    mSocketConnector = new SocketConnector()

    setIpcConnectorConfiguration()
    setSocketConnectorConfiguration()

    setGlobalShortcut()
  
}

function setIpcConnectorConfiguration(){

    mIpcConnector.setOnLoginEventListener(function(event,data){
      mUserName = data.userName
      mAnimalType = getRandomAnimal()
      mIpcConnector.setUserName(mUserName)
      mIpcConnector.setAnimalType(mAnimalType)
      //mWindowManager.createChatWindow({roomName:""})
    })

    mIpcConnector.setOnShoutEventListener(function(event,data){
        // socket "shout_notification"
        // get keyword
       // fWindow ipc "self_shout"
       mSocketConnector.sendMessage("shout_notification",{animalType:mAnimalType,userName:mUserName,keywordList:["electron","透明","click"]})
    })


    mIpcConnector.setOnStartChatEventListener(function(event,data){
      // ipc start chat => socket start chat 
        mWindowManager.createChatWindow('self_shout',{roomName:"dammy"})
        mSocketConnector.sendMessage("start_chat",{roomName:"dammy"})
    })
}

function setSocketConnectorConfiguration(){
  mSocketConnector.setOnConnectEventListener(function(message){
    // nothing to do 
  })

  mSocketConnector.setOnShoutNotificationEventListener(function(message){
    //"shout_notification"
    mIpcConnector.messageForFront('member_shout',{userName:message.userName,socketId:message.socketId,keywordList:message.keywordList,animalType:mAnimalType})

    // TODO message for back to temporary stop audio and plyay animal voise
  
  })

  mSocketConnector.setOnStartChatEventListener(function(message){
      //"start_chat"
      mWindowManager.createChatWindow({roomName:message.roomName})

      // TODO message for back to stop capture audio
  
  })
}

function setGlobalShortcut(){

    /*
       set shortcut event
     */
    globalShortcut.register('CommandOrControl+Shift+F', () => {
      console.log('CommandOrControl+Shift+F is pressed')
      //mWindowManager.createChatWindow('self_shout',{animalType:mAnimalType})
        mSocketConnector.sendMessage("start_chat",{roomName:data.socketId})
     //mIpcConnector.messageForFront('self_shout',{animalType:mAnimalType})
      //mWindowManager.createChatWindow({roomName:""})

    })

    globalShortcut.register('CommandOrControl+Shift+G', () => {
      console.log('CommandOrControl+Shift+G is pressed')
      //mIpcConnector.messageForFront('member_shout',{userName:mUserName,socketId:"aaaaaa",keywordList:["cmd+shift+G"],animalType:mAnimalType})
       mSocketConnector.sendMessage("shout_notification",{animalType:mAnimalType,userName:mUserName,keywordList:["electron","透明","click"]})
    })

    globalShortcut.register('CommandOrControl+Shift+R', () => {
      console.log('CommandOrControl+Shift+R is pressed')
      mIpcConnector.messageForFront('change_transparent',{})
    })
    

}

 function getRandomAnimal(){
        var rand = getRandomInt(0, animalArray.length-1)
        return animalArray[rand]
  }

  function getRandomInt(min, max) {
    return Math.floor( Math.random() * (max - min + 1) ) + min;
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