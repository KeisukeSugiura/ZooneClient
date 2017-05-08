const {ipcMain} = require('electron')

class IpcConnector {
	constructor(windowManager){
		this.windowManager = windowManager
		this.userName = "NoName"
		this.initIpcEvent()
		this.initEventListener()
	}

	initIpcEvent(){
		const self = this
		ipcMain.on("login",(data)=>{
			// close window and create f-b windows
			console.log("login")
			self.windowManager.closeLoginWindow()
			self.windowManager.createBackWindow()
			self.windowManager.createFrontWindow()
			self.userName = data.userName

			self.onLoginEvent(data)
		})
	}


	/*
		message method
	 */
	
	messageForFront(eventName,data){
		if(this.windowManager.fWindow){
			console.log(data)
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
		this.onLoginEventListener = function(data){}

	}


	onLoginEvent(data){
		this.onLoginEventListener(data)
	}


	
}

module.exports = {
	IpcConnector : IpcConnector
}