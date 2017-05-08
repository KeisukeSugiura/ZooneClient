/**
 * Window Manager
 * 	required BrowserWindow, ipcMain, Socket.io-client, screen
 */

const {BrowserWindow} = require('electron')

class WindowManager {
	// foreground => notification
	// background => webrtc -> api -> ipc
	// clickable => 汎用ウィンドウ複数存在可能 login call chat
	constructor(serverUrl, screen){
		this.lWindow = null
		this.fWindow = null
		this.bWindow = null
		this.cWindow = null
		this.eWindows = new Map()
		this.serverUrl = serverUrl
		this.screen = screen
		this.width = screen.getPrimaryDisplay().workAreaSize.width
		this.height = screen.getPrimaryDisplay().workAreaSize.height
		this.createLoginWindow()
	}

	/*
		close window method
	 */

	closeAllWindow(){
		this.closeLoginWindow()
		this.closeFrontWindow()
		this.closeFrontWindow()
		this.closeChatWindow()
		this.closeAllEventWindow()	
	}

	closeLoginWindow(){
		if(this.lWindow){
			this.lWindow.close()	
			this.lWindow = null
		}
	}

	closeFrontWindow(){
		if(this.fWindow){
			this.fWindow.close()
			this.fWindow = null
		}
	}

	closeBackWindow(){

		if(this.bWindow){
			this.bWindow.close()
			this.bWindow = null
		}
	}

	closeChatWindow(){
		if(this.cWindow){
			this.cWindow.close()
			this.cWindow = null
		}
	}

	closeEventWindow(key){
		this.eWindows.get(key).close()
		this.eWindows.set(key,null)
	}

	closeAllEventWindow(){
		this.eWindows.forEach((value, key, map)=>{
			value.close()
		})
		this.eWindows = new Map()
	}

	/*
		create window method
	 */

	createLoginWindow(){
		const self = this
		this.lWindow = new BrowserWindow({width: 800, height: 600})

		// and load the index.html of the app.
		this.lWindow.loadURL(this.serverUrl+"/login")

		  // Open the DevTools.
		this.lWindow.webContents.openDevTools()

		  // Emitted when the window is closed.
		this.lWindow.on('closed', () => {
		    // Dereference the window object, usually you would store windows
		    // in an array if your app supports multi windows, this is the time
		    // when you should delete the corresponding element.
		    self.lWindow = null
		})
	}

	createFrontWindow(){
		const self = this

		this.fWindow = new BrowserWindow({
			x:0,
			y:0,
			width:self.width,
			height:self.height,
			frame:false,
			focusable: false,
			hasShadow: false,
			transparent: true,
			fullscreen:false
		})

		this.fWindow.loadURL(this.serverUrl+"/front")

		this.fWindow.setIgnoreMouseEvents(true)
		this.fWindow.webContents.openDevTools()
		this.fWindow.setAlwaysOnTop(true,"normal",20)
		this.fWindow.on('close', ()=>{
			self.fWindow = null
		})
	}

	createBackWindow(){
		const self = this

		this.bWindow = new BrowserWindow({
			x:0,
			y:0,
			width:self.width,
			height:self.height,
			frame:false,
			focusable: false,
			hasShadow: false,
			transparent: true,
			fullscreen:false
		})

		this.bWindow.loadURL(this.serverUrl+"/back")

		this.bWindow.setIgnoreMouseEvents(true)
		this.bWindow.setAlwaysOnTop(false,"normal",-1)

		this.bWindow.on('close', ()=>{
			self.bWindow = null
		})

	}

	createChatWindow(data){
		const self = this

		this.cWindow = new BrowserWindow({
			width:800,
			height:600,
			frame:false,
			focusable: true,
			hasShadow: false,
			titleBarStyle: "hidden",
			transparent: true,
			fullscreen:false
		})

		this.cWindow.loadURL(this.serverUrl+"/chat"+"?"+String(data.roomName))
		this.cWindow.webContents.openDevTools()

		this.cWindow.on('close', ()=>{
			self.cWindow = null
		})
	}

	createEventWindow(eventData,option){

	}


}

module.exports = {
	WindowManager : WindowManager
}