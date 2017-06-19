const {app, BrowserWindow, ipcMain, globalShortcut} = require('electron')
var screen = {}
const path = require('path')
const url = require('url')

const {WindowManager} = require('./modules/WindowManager')
const {IpcConnector} = require('./modules/IpcConnector')
const {SocketConnector} = require('./modules/SocketConnector')

const MickrClient = require('./modules/MickrClient.js')
const MickrWindow = require('./modules/MickrWindow.js')
const SetMickrClientWindow = require('./modules/SetMickrClientWindow.js')
const WindowAnimator = require('./modules/WindowAnimator.js')
const ClipboardHandler = require('./modules/ClipboardHandler.js')

const VoiceClassifier = require('./modules/VoiceClassifer.js')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

// const SERVER_URL = "http://localhost:55555"
//const SERVER_URL = "http://133.68.112.250:55555"
const SERVER_URL = "https://zooneserver.herokuapp.com"
var mUserName = "NoName"
var mAnimalType = "tiger"
var mWindowManager = null
var mSocketConnector = null
var mIpcConnector = null
var mWordManager = null
const animalArray = ["inu", "inu2", "chinpan", "lion", "manbou", "neko", "neko2", "niwatori", "pengin", "risu", "taka", "tiger", "tokage", "uzura", "yagi", "zou", "dog", "cat"]

const mMickrWindowManager = new MickrWindow()
const mMickrWindowAnimator = new WindowAnimator()
var mMickrWindow = null
var d = null


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
    setMickrWindow()
  
    startObserveVoice()
}

function startObserveVoice(){
   VoiceClassifier.setClassifyEvent(function(className){
    console.log(className)
    if(String(className) != "noise"){
      //mMickrWindow.webContents.send('clip', {text:className})
       mSocketConnector.sendMessage("shout_notification",{animalType:String(className),userName:mUserName,keywordList:["electron","透明","click"]})
       mIpcConnector.messageForFront('self_shout',{animalType:String(className)})

    }
  })
   VoiceClassifier.startObserveZooneCry()
}

function setMickrWindow(){
  d = screen
    mMickrWindow = mMickrWindowManager.buildWindow({
      page: 'land.html',
      x: 0,
      y: 0,
      width: d.getPrimaryDisplay().workAreaSize.width,
      height: d.getPrimaryDisplay().workAreaSize.height,
      transparent: true,
      ignoreMouseEvent: true,
      AlwaysOnTop: true
    });

    mMickrWindow.focus()

    mMickrWindowAnimator.setWindow(mMickrWindow);
    mMickrWindowAnimator.initAnimation()
    mMickrWindowAnimator.addGoAround()

    ClipboardHandler.on('update', (data) => {
      if(mMickrWindow){
        data.around = true
        //console.log(data);

       // mMickrWindow.webContents.send('clip', data)
      }
    })
    //mMickrWindow.openDevTools()
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
        mWindowManager.createChatWindow({roomName:data.socketId})
        mSocketConnector.sendMessage("start_chat",{roomName:data.socketId,socketId:data.socketId})
    })
}

function setSocketConnectorConfiguration(){
  mSocketConnector.setOnConnectEventListener(function(message){
    // nothing to do 
  })

  mSocketConnector.setOnShoutNotificationEventListener(function(message){
    //"shout_notification"
    mIpcConnector.messageForFront('member_shout',{userName:message.userName,socketId:message.socketId,keywordList:message.keywordList,animalType:message.animalType})

    // TODO message for back to temporary stop audio and plyay animal voise
  
  })

  mSocketConnector.setOnStartChatEventListener(function(message){
      //"start_chat"
      var timeout = function(){
        mWindowManager.createChatWindow({roomName:message.roomName})
      }

      setTimeout(timeout, 5000)
      // TODO message for back to stop capture audio
  
  })

  mSocketConnector.setOnStateNotificationEventListener(function(message){
      mMickrWindow.webContents.send('clip',message)
  })

}

function setGlobalShortcut(){

    /*
       set shortcut event
     */
      var i = 0
     var shoutArray = [
          {userName:"kyoshida",socketId:"0",keywordList:["electron", "透明"],animalType:animalArray[0]},
          {userName:"tatsuom",socketId:"1",keywordList:["音声認識"],animalType:animalArray[1]},
          {userName:"tobe",socketId:"2",keywordList:["言語処理"],animalType:animalArray[2]},
          {userName:"hisatoshi",socketId:"3",keywordList:["投票"],animalType:animalArray[3]},
          {userName:"iwasato",socketId:"4",keywordList:["マウスイベント"],animalType:animalArray[4]},

          {userName:"amanom",socketId:"55",keywordList:["楽器"],animalType:animalArray[5]},
          {userName:"moroz",socketId:"5",keywordList:["VR", "言語処理"],animalType:animalArray[6]},
          {userName:"aratomo",socketId:"11",keywordList:["感情極性","チャット"],animalType:animalArray[7]},
          {userName:"ashun",socketId:"0d",keywordList:["高速化","リアルタイム"],animalType:animalArray[8]},
          {userName:"rando",socketId:"0adfa",keywordList:["electron","バスケ"],animalType:animalArray[9]},

          {userName:"okayoshi",socketId:"ffd0",keywordList:["野球"],animalType:animalArray[10]},
          {userName:"kakudat",socketId:"0aaa",keywordList:["shift control"],animalType:animalArray[11]},
          {userName:"hikaruk",socketId:"0ggg",keywordList:["機械学習"],animalType:animalArray[12]},
          {userName:"takatomo",socketId:"0des",keywordList:["Android"],animalType:animalArray[13]},
          {userName:"kyoshida",socketId:"0asd",keywordList:["electron", "透明"],animalType:animalArray[14]},

          {userName:"hatosho",socketId:"0fafa",keywordList:["地図"],animalType:animalArray[15]},
          {userName:"takisho",socketId:"0ddddd",keywordList:["WebRTC"],animalType:animalArray[5]},
          {userName:"zkun",socketId:"0eee",keywordList:["ビリヤード"],animalType:animalArray[6]},
          {userName:"momy",socketId:"0gaga",keywordList:["まぜそば","採点"],animalType:animalArray[7]}

      ] 

    globalShortcut.register('CommandOrControl+Shift+F', () => {
      console.log('CommandOrControl+Shift+F is pressed')
     // mWindowManager.createChatWindow({roomName:"demo"})
     //   mSocketConnector.sendMessage("start_chat",{roomName:"demo"})
     
      mIpcConnector.messageForFront('member_shout',shoutArray[i])
      if(i < shoutArray.length -1){
        i = i+1
      }else{
        i = 0
      }

    })

    globalShortcut.register('CommandOrControl+Shift+G', () => {
      console.log('CommandOrControl+Shift+G is pressed')
      //mIpcConnector.messageForFront('member_shout',{userName:mUserName,socketId:"aaaaaa",keywordList:["cmd+shift+G"],animalType:mAnimalType})
       mIpcConnector.messageForFront('self_shout',{animalType:mAnimalType})
       mSocketConnector.sendMessage("shout_notification",{animalType:mAnimalType,userName:mUserName,keywordList:["electron","透明","click"]})
    })

    globalShortcut.register('CommandOrControl+Shift+R', () => {
      console.log('CommandOrControl+Shift+R is pressed')
      mIpcConnector.messageForFront('change_transparent',{})
      mWindowManager.changeIgnoreMouseEvents()
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