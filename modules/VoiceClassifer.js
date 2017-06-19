
var mod = (function(){

	const {VoiceRecorder} = require('./VoiceRecorder.js')
	const spawn = require('child_process').spawn

	var classifyEventHandler = function(data){}

	function startObserveZooneCry(){
		VoiceRecorder.recordVoice(function(){
			classifyZooneCry()
		})
	}


	function classifyZooneCry(){
		var cp = spawn('python3', ['./modules/ZooneCry/ZooneCryClassifier.py'])

		var ev = cp.stdout
		var everr = cp.stderr
		ev.on('data',function(data){
			var className = data.toString('utf8').replace(/\r?\n/g,"");
			//console.log(className)
			classifyEventHandler(className)
			cp.kill()
		})

		everr.on('data',function(data){
			console.log("error")
			console.log(data.toString('utf8'))
		})

		ev.on('end',function(){
			console.log("end")
		})

		cp.on('close',function(data){
			console.log("close")
			startObserveZooneCry()
		})

	}

	function setClassifyEvent(callback){
		classifyEventHandler = callback
	}

	return {
		classifyZooneCry : classifyZooneCry,
		startObserveZooneCry : startObserveZooneCry,
		setClassifyEvent : setClassifyEvent
	}


})()

//module.classifyZooneCry()
	

module.exports = mod