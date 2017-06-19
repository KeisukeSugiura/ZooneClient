
var mod = (function(){
	var record = require('node-record-lpcm16')
	var fs = require('fs')


	function recordVoice(callback){
	var file = fs.createWriteStream('./modules/ZooneCry/data/wav/test.wav', { encoding: 'binary' })

		record.start({
		  sampleRate : 44100,
		  thresholdStart : 0.8,
		  thresholdEnd: 0.8,
		  silence: '0.5',
		  verbose : true
		},callback)
		.pipe(file)
	}
	return {
		recordVoice:recordVoice
	}
})()

// mod.recordVoice(function(){})
module.exports = {
	VoiceRecorder : mod
}