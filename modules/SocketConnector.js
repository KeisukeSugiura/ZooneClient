const io = require("socket.io-client")
//const SERVER_URL = 'http://133.68.112.250:55555'
// const SERVER_URL = 'http://localhost:55555'
const SERVER_URL = 'https://zooneserver.herokuapp.com'

class SocketConnector{
	constructor(){
		this.socket = null


		this.connect()
		this.initEventListener()
		this.initSocketEvent()
	}

	connect() {
        if(!this.socket) {
            this.socket = io(SERVER_URL);
        }
    }

    sendMessage(eventName,message){
    	this.socket.emit(eventName, message)
    }

    initSocketEvent(){
    	const self = this
    	this.socket.on('connect',function(message){
    		// nothing to do 
    		self.onConnectEvent(message)
    	})

    	this.socket.on('start_chat',function(message){
    		// open new chat window
    		self.onStartChatEvent(message)
    	})

    	this.socket.on('shout_notification',function(message){
    		// ipc renderer message for front and back
    		self.onShoutNotificationEvent(message)
    	})

        this.socket.on('state_notification', function(message){
            self.onStateNotificationEvent(message)
        })
    }

    /*
    	event listener
     */

    initEventListener(){
    	this.onConnectEventListener = function(message){}
    	this.onStartChatEventListener = function(message){}
    	this.onShoutNotificationEventListener = function(message){}
    }

    setOnConnectEventListener(callback){
    	this.onConnectEventListener = callback
    }

    setOnStartChatEventListener(callback){
    	this.onStartChatEventListener = callback
    }

    setOnShoutNotificationEventListener(callback){
    	this.onShoutNotificationEventListener = callback
    }

    setOnStateNotificationEventListener(callback){
        this.onStateNotificationEvent = callback
    }

    onConnectEvent(message){
    	this.onConnectEventListener(message)
    }

    onStartChatEvent(message){
    	this.onStartChatEventListener(message)
    }

    onShoutNotificationEvent(message){
    	this.onShoutNotificationEventListener(message)
    }

    onStateNotificationEvent(message){
        this.onStateNotificationEvent(message)
    }

}

module.exports = {
	SocketConnector : SocketConnector
}