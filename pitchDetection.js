var accessId = '2b61f518-f576-407b-8217-fb82a6d07a96';
var taskUrl = 'analyze/melody';
var parameters = { blocking: false, format: 'json', access_id: accessId };

// the values for these parameters were taken from the corresponding controls in the demo form
parameters['input_file'] = localStorage.fileID;

midi_pitches = [];
var note = function (input, scale, adjective, analyzedTones, correctAll, keepDistance) {
    var A4 = 69;
    var A4_INDEX = 57;

    var notes = [
        "C0", "C#0", "D0", "D#0", "E0", "F0", "F#0", "G0", "G#0", "A0", "A#0", "B0",
        "C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1",
        "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
        "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
        "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
        "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
        "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
        "C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
        "C8", "C#8", "D8", "D#8", "E8", "F8", "F#8", "G8", "G#8", "A8", "A#8", "B8",
        "C9", "C#9", "D9", "D#9", "E9", "F9", "F#9", "G9", "G#9", "A9", "A#9", "B9"];

    var MINUS = 0;
    var PLUS = 1;
    var frequencies = [];
    var frequency;
    var r = Math.pow(2.0, 1.0 / 12.0);
    var cent = Math.pow(2.0, 1.0 / 1200.0);
    var r_index = 0;
    var cent_index = 0;
    var side;
    var major = [2,2,1,2,2,2,1];
    var minor = [2,1,2,2,1,2,2];
    var tones = [];
    var firstScaleTone;
    var scaleTones = [];
    frequencyL = A4;
    frequencyR = A4;
    //Generate frequencies
    frequencies[A4_INDEX]=A4;
    for(i = A4_INDEX-1,j=A4_INDEX+1;i>=0;i--,j++){
        frequencyL = frequencyL-1;
        frequencyR = 1 + frequencyR;
        frequencies[i] = frequencyL;
        frequencies[j] = frequencyR;        
    } 
    for (i=0;i<frequencies.length;i++){
        tones.push({"frequency":frequencies[i],"note":notes[i]});
    }
	//console.log(JSON.stringify(tones));
    //Find KEY tones 
    for (i=0;i<12;i++){
        firstScaleTone = notes.indexOf(scale+'0');
    }
	//console.log(firstScaleTone);
    var noteCounter = firstScaleTone;
    var adj = [];
    if (adjective == 'major') adj = major;
    else if (adjective == 'minor') adj = minor;
    while (noteCounter < tones.length){
        for (i in adj){
            if (noteCounter < tones.length){
                if (i == 0 || i==2 || i==4)
                   tones[noteCounter].tonic = true;
               scaleTones.push(tones[noteCounter]);
               noteCounter = noteCounter + adj[i];
            } else{
                break;
            } 
        }
    }
    //console.log(JSON.stringify(scaleTones));
    //Tones to correct
    var resultTones = [];
	var corrected = 0;
	var times = [];
	var threshold = 0;
	//hack
	var THRESHOLD = 100;
	if (keepDistance) THRESHOLD = 0.5;
	//end of hack
    for (a=0;a<analyzedTones.length;a++){
		
        var distance = 100;
        var note;
        for (s in scaleTones){
            if (Math.abs(scaleTones[s].frequency - analyzedTones[a].midi_pitch) < distance){
                distance = Math.abs(scaleTones[s].frequency - analyzedTones[a].midi_pitch);
                note = scaleTones[s];
            }
        }
		times.push(analyzedTones[a].onset_time);
		if (a>0){
			threshold = Math.abs(Math.abs(analyzedTones[a-1].midi_pitch - analyzedTones[a].midi_pitch) - Math.abs(resultTones[a-1] - note.frequency));
		}
		//hack for all tones
		if (correctAll) note.tonic = true;
		//hack end
        if (((note.tonic == true && analyzedTones[a].duration > 0.15) || analyzedTones[a].duration > 1.2)&& threshold < THRESHOLD)
			{resultTones.push(note.frequency); corrected++;}
        else resultTones.push(analyzedTones[a].midi_pitch); 
    }
	for (i=0;i<resultTones.length;i++)
		console.log(resultTones[i]+"--"+times[i]);
	
    console.log("Number of tones "+resultTones.length);console.log("Number of corrected "+corrected);
   /* frequency = A4;

    if (input >= frequency) {
        while (input >= r * frequency) {
            frequency = r * frequency;
            r_index++;
        }
        while (input > cent * frequency) {
            frequency = cent * frequency;
            cent_index++;
        }
        if ((cent * frequency - input) < (input - frequency)) cent_index++;
        if (cent_index > 50) {
            r_index++;
            cent_index = 100 - cent_index;
            if (cent_index != 0) side = MINUS;
            else side = PLUS;
        } else side = PLUS;
    } else {
        while (input <= frequency / r) {
            frequency = frequency / r;
            r_index--;
        }
        console.log(frequency);
        while (input < frequency / cent) {
            frequency = frequency / cent;
            cent_index++;
        }
        if ((input - frequency / cent) < (frequency - input)) cent_index++;
        if (cent_index >= 50) {
            r_index--;
            cent_index = 100 - cent_index;
            side = PLUS;
        } else {
            if (cent_index != 0) side = MINUS;
            else side = PLUS;
        } 
    } 
    var result = notes[A4_INDEX + r_index];
    if (side == PLUS) result = result + " plus ";
    else result = result + " minus ";
    result = result + cent_index + " cents";
    var desiredFreq = 0;
    if (side == PLUS) desiredFreq = input - cent_index*cent;
    else desiredFreq = input + cent_index*cent; */
    //console.log(result);
	
	return JSON.stringify(resultTones.join("-"));
}

function onTaskStarted(data) {
    var fileId = data.file.file_id;
    
    // request task progress every 500ms
    var polling = setInterval(pollTaskProgress, 500);
   
    function pollTaskProgress() {
        $.ajax({ url: 'https://api.sonicAPI.com/file/status?file_id=' + fileId + '&access_id=' + accessId + '&format=json', 
                 crossDomain: true, success: function(data) {
            if (data.file.status == 'ready') {
                onTaskSucceeded(fileId);
                clearInterval(polling);
            } else if (data.file.status == 'working') {
                $('#result').text(data.file.progress + '% done');
            }
        }});
    }
}

function onTaskSucceeded(fileId) {
    var downloadUrl = 'https://api.sonicAPI.com/file/download?file_id=' + fileId + '&access_id=' + accessId + '&format=json';
    
    $.ajax({ url: downloadUrl, crossDomain: true, success: function(data) {
		var freqs = data.melody_result.notes;
		var notes = [];
		/* for (freq in freqs){	
			var temp = convertToNote(freqs[freq].midi_pitch);
			notes.push(temp);
			midi_pitches.push(freqs[freq].midi_pitch);
		} */
		var scale = document.getElementById('scale').value;
		var adjective = document.getElementById('adjective').value;
        var correctAll = document.getElementById('allTones').checked;
		var keepDistance = document.getElementById('keepDistance').checked;
		localStorage.midi_pitches = note(67, scale, adjective, freqs, correctAll, keepDistance);
		$('#result').html('Task succeeded. Found '+JSON.stringify(data.melody_result.key)+' key. If you proceed tones will be corrected in regards to Reference key');
        var element = document.createElement("button");
		var text = document.createTextNode("Proceed to correction");
		element.appendChild(text);  
		element.onclick = function() { 
			window.location.href = "pitchCorrection.html";
		};

		var foo = document.getElementById("result");
		//Append the element in page (in span).  
		foo.appendChild(element);
		//$('#result').html('Task succeeded, analysis result:<pre>' + JSON.stringify(data, null, 4)+ JSON.stringify(notes, null, 4) + JSON.stringify(midi_pitches, null, 4) + '</pre>'); 
		}});
}

function onTaskFailed(response) {
    var data = $.parseJSON(response.responseText);
    var errorMessages = data.errors.map(function(error) { return error.message; });
 
    $('#result').text('Task failed, reason: ' + errorMessages.join(','));
}

// start task when clicking on the "Start task" button
$(document).ready(function() {
    $('#start').click(function() {
    	// execute an HTTP GET using the task's URL, the parameters and callback functions defined above
        $.ajax({ url: 'https://api.sonicAPI.com/' + taskUrl, data: parameters, 
                 success: onTaskStarted, error: onTaskFailed, crossDomain: true });
    });
});