//touch interaction var
var m = {x:0, y:0};


function setup() {
  createCanvas(windowWidth, windowHeight);
  grow = windowHeight;
  background(0);


  //disable default touch events for mobile
  var el = document.getElementsByTagName("canvas")[0];
  el.addEventListener("touchstart", pdefault, false);
  el.addEventListener("touchend", pdefault, false);
  el.addEventListener("touchcancel", pdefault, false);
  el.addEventListener("touchleave", pdefault, false);
  el.addEventListener("touchmove", pdefault, false);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function pdefault(e){
  e.preventDefault()
}

function draw() {
  update();
  render();
}

function update(){
  //normalize interaction
  m.x = max(touchX, mouseX);
  m.y = max(touchY, mouseY);
  m.pressed = mouseIsPressed || touchIsDown;

  if(m.y>0){
    audiofilter.frequency.value = height-m.y;
  }
//  audiofilter.Q.value= m.y;
}

function render(){

}




function initSynth(){
  try{
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();

    var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
    if (iOS) {
      window.addEventListener('touchend', function() {
        var buffer = context.createBuffer(1, 1, 22050);
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
      }, false);
    }

  }
  catch (err){
    alert('web audio not supported');
  }

  if(typeof(context)!="undefined"){

  }
}


var whiteNoiseGen = function(){

  var bufferSize = 4096; //Math.pow(2,13); //between 8 & 14

  //make this a global var so it isnt garbage collected
  whiteNoise = context.createScriptProcessor(bufferSize, 0, 2);
  whiteNoise.onaudioprocess = function(e) {
    var outputBuffer = e.outputBuffer;
    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      var outputData = outputBuffer.getChannelData(channel);
      for (var i = 0; i < bufferSize; i++) {
        outputData[i] = Math.random()*2-1;
      }
    }
  }


  var gain = context.createGain();
  gain.gain.value = 0.8;

  audiofilter = context.createBiquadFilter();
  var convolver = context.createConvolver();

  audiofilter.type = "bandpass";
  audiofilter.frequency.value = 600;
  audiofilter.Q.value= 1;
  audiofilter.gain.value = 100;

  whiteNoise.connect(audiofilter);
  audiofilter.connect(gain);
  gain.connect(context.destination);


}


initSynth();
whiteNoiseGen();
