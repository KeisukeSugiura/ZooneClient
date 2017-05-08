const {ipcMain} = require('electron')

class IpcConnector {
	constructor(windowManager){
		this.windowManager = windowManager
		this.userName = "NoName"
		this.animalType = "inu"
		this.initIpcEvent()
		this.initEventListener()
	}

	initIpcEvent(){
		const self = this
		ipcMain.on("login",(event,data)=>{
			// close window and create f-b windows
			self.windowManager.closeLoginWindow()
			self.windowManager.createBackWindow()
			self.windowManager.createFrontWindow()
			self.userName = data.userName

			self.onLoginEvent(event,data)
		})

		ipcMain.on("start_chat",(event,data)=>{
			// create chat window and send to
			// ipc start chat => socket start chat 
      		// this.windowManager.createChatWindow({roomName:""})
			self.onStartChatEvent(event,data)
		})

		ipcMain.on("shout", (event, data)=>{
			// socket "shout_notification"
			// get keyword
			// fWindow ipc "self_shout"
			self.onShoutEvent(event,data)
		})


	}

	setUserName(userName){
		this.userName = userName
	}

	setAnimalType(animalType){
		this.animalType = animalType
	}


	/*
		message method
	 */
	
	messageForFront(eventName,data){
		if(this.windowManager.fWindow){
			this.windowManager.fWindow.webContents.send(eventName,data)
		}
	}

	messageForBack(eventName,data){
		if(this.windowManager.bWindow){
			this.windowManager.bWindow.webContents.send(eventName,data)
		}
	}

	messageForLogin(eventName,data){
		if(this.windowManager.lWindow){
			this.windowManager.lWindow.webContents.send(eventName,data)
		}
	}

	messageForEvent(windowId, eventName, data){
		if(this.windowManager.cWindows.get(windowId)){
			this.windowManager.cWindows.get(windowId).webContents.send(eventName,data)
		}
	}

	broadcastMessageForEvent(eventName, data){
		this.windowManager.cWindows.forEach((value,key,map)=>{
			value.webContents.send(eventName,data)
		})
	}

	broadcastMessage(eventName, data){
		this.messageForFront(eventName, data)
		this.messageForBack(eventName, data)
		this.messageForLogin(eventName, data)
		this.broadcastMessageForEvent(eventName, data)
	}

	/*
		event listener
	 */
	
	initEventListener(){
		this.onLoginEventListener = function(event,data){}
		this.onShoutEventListener = function(event,data){}
		this.onStartChatEventListener = function(event,data){}
	}

	setOnLoginEventListener(callback){
		this.onLoginEventListener = callback
	}

	setOnShoutEventListener(callback){
		this.onShoutEventListener = callback
	}

	setOnStartChatEventListener(callback){
		this.onStartChatEventListener = callback
	}

	onLoginEvent(event,data){
		this.onLoginEventListener(event,data)
	}

	onShoutEvent(event,data){
		this.onShoutEventListener(event, data)
	}

	onStartChatEvent(event,data){
		this.onStartChatEventListener(event,data)
	}
	
}

module.exports = {
	IpcConnector : IpcConnector
}