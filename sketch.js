//touch interaction var
var m = {x:0, y:0};
var noises = [];


function setup() {
  createCanvas(windowWidth, windowHeight);
  grow = windowHeight;
  background(0);
  initSynth();

  //disable default touch events for mobile
  var el = document.getElementsByTagName("canvas")[0];
  el.addEventListener("touchstart", pdefault, false);
  el.addEventListener("touchend", pdefault, false);
  el.addEventListener("touchcancel", pdefault, false);
  el.addEventListener("touchleave", pdefault, false);
  el.addEventListener("touchmove", pdefault, false);


  stroke(255);
  strokeWeight(10);
  line(0,height/1.6,width, height/1.6);
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

  if(m.pressed){

   base_note = map(m.y, 0,height, 80,20);
   console.log(base_note);
    noises.forEach(function(n){
      n.setBaseNote(base_note);

    });

  background(0);
  stroke(255);
  strokeWeight(10);
  line(0,m.y,width, m.y);
  }
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
    startSynth();
  }
}


function Noise(args){
  this.note= args.base_note + args.offset;
  this.offset = args.offset;
  this.whiteNoise;
  this.filter;
  this.volume = args.volume;
  this.init = function(){
    var bufferSize = 4096; //Math.pow(2,13); //between 8 & 14
    //make this a global var so it isnt garbage collected
    this.whiteNoise = context.createScriptProcessor(bufferSize, 0, 2);
    this.whiteNoise.onaudioprocess = function(e) {
      var outputBuffer = e.outputBuffer;
      for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        var outputData = outputBuffer.getChannelData(channel);
        for (var i = 0; i < bufferSize; i++) {
          outputData[i] = Math.random()*2-1;
        }
      }
    }


    this.filter= context.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = mtof(this.note);
    this.filter.Q.value= 1;

    this.gain = context.createGain();
    this.gain.connect(context.destination);
    this.gain.gain.value = this.volume;

    this.whiteNoise.connect(this.filter);
    this.filter.connect(this.gain);

    var convolver = context.createConvolver();
    console.log('create');

  }

 this.setBaseNote = function(bn){
    this.note = bn + this.offset;
    this.filter.frequency.value = mtof(this.note);
  }

  this.init();


}

function mtof(m) {
  return Math.pow(2, (m - 69) / 12) * 440;
}

var startSynth = function(){
  base_note = 50;

  noises.push(new Noise({base_note:base_note/2, offset:0, volume: 0.9}));
  noises.push(new Noise({base_note:base_note, offset:0, volume: 0.9}));
  noises.push(new Noise({base_note:base_note,  offset:16, volume: 0.5}));
  noises.push(new Noise({base_note:base_note,  offset:12, volume: 0.5}));
}

