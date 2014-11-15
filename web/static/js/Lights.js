LIGHTS.GUI = function( go ) {
  this.initialize( go );
};

LIGHTS.GUI.prototype = {

  shareLeft:          49,

  // _______________________________________________________________________________________ Constructor

  initialize: function( go ) {

    LIGHTS.GUI.instance = this;

    this.setup();

    if( go )
      this.setupGo();
    else
      this.setupFail();
  },

  setup: function() {

    this.logo = document.getElementById( 'lights_logo' );

    this.logo.style.visibility = 'hidden';

  },

  setupGo: function() {

    this.info = document.getElementById( 'lights_info' );
    this.info.style.visibility = 'hidden';

    this.div = document.getElementById( 'lights_outer' );
    this.active = false;
  },

  setupFail: function() {

    document.body.style.backgroundImage = "url('images/home/background.jpg')";

    this.logo.style.visibility =
      this.hey.style.visibility =
      this.share.style.visibility =
      this.credits.style.visibility = 'visible';

    document.getElementById( 'lights_fail' ).style.visibility = 'visible';

    this.share.style.display = 'inline';
    this.share.style.left = this.shareLeft + 'px';
  },

  fade: function( alpha ) {

    if( alpha > 0 ) {

      this.logo.style.visibility = 'visible';

      this.setOpacity( this.logo, Math.max( 0, Math.min( 1, alpha * 2 ) ) );
    }
    else {

      this.logo.style.visibility = 'hidden';
    }
  },

  setOpacity: function( div, opacity ) {

    div.style.opacity = opacity;

    if( div.filters !== undefined )
      div.filters.alpha.opacity = opacity * 100;
  }
};

LIGHTS.releaseBuild = true;
//LIGHTS.releaseBuild = false;

LIGHTS.time = 0;
LIGHTS.deltaTime = 0;

LIGHTS.colors = [ 0xFF1561, 0xFFF014, 0x14FF9D, 0x14D4FF, 0xFF9D14 ];
LIGHTS.hues = [ 341/360, 56/360, 155/360, 191/360, 35/360 ];

LIGHTS.colorBlack = new THREE.Color( 0x000000 );
LIGHTS.colorWhite = new THREE.Color( 0xFFFFFF );

function bind( scope, fn ) { return function() { fn.apply( scope, arguments ); }; }

// _______________________________________________________________________________________ Lights

LIGHTS.Lights = function() {

  LIGHTS.Lights.instance = this,

  this.initialize();
};

LIGHTS.Lights.prototype = {

  initialize: function() {
    if( Detector.webgl ) {
      this.renderManager = new LIGHTS.RenderManager();
      this.input = new LIGHTS.Input();
      this.gui = new LIGHTS.GUI( true );
      this.home = new LIGHTS.Home( this.renderManager, this.gui, bind( this, this.launchHome ) );
      this.loader = new LIGHTS.Loader( bind( this, this.launch ) );
    } else {
      this.gui = new LIGHTS.GUI( false );
    }
  },

  // _______________________________________________________________________________________ Launch

  launchHome: function() {
    this.home.launchIntro();
    this.experiencePlaying = false;
    this.animateLights();
  },

  launch: function() {
    LIGHTS.stopwatch = new LIGHTS.Stopwatch();
    this.view = new LIGHTS.View( this.renderManager );
    this.director = new LIGHTS.Director( this.view );
    this.home.launchPlay();
  },

  playExperience: function(item) {
    this.home.stop();
    this.director.start();
    this.experiencePlaying = true;
  },

  playHome: function() {
    this.director.stop();
    this.home.start();
    this.experiencePlaying = false;
  },

  animateLights: function() {
    requestAnimationFrame( bind( this, this.animateLights ) );
    if( this.experiencePlaying ) {
      this.view.clear();
      this.director.update();
      this.view.update();
      this.director.postUpdate();
    } else {
      this.home.update();
    }
  }
};

var rad45 = Math.PI / 4,
rad90 = Math.PI / 2,
rad180 = Math.PI,
rad360 = Math.PI * 2,
deg2rad = Math.PI / 180,
rad2deg = 180 / Math.PI,
phi = 1.618033988749;

LIGHTS.Music = {

  startTime: 0,   //  0 A1
  //    startTime: 6,   //  1 B1
//      startTime: 20,  //  2 B1a
  //    startTime: 36,  //  3 C1
  //    startTime: 42,  //  4 C1a
  //    startTime: 50,  //  5 C1c
  //    startTime: 54,  //  5 C1c+
  //    startTime: 68,  //  7 B2
  //    startTime: 82,  //  9 B2c
  //    startTime: 98, // 11 C2
  //    startTime: 116, // 13 C2c
  //    startTime: 124, // 14 C2d
  //    startTime: 130, // 15 D1
  //    startTime: 142, // 16 S!
  //    startTime: 149, // 17 C3
  //    startTime: 161, // 19 C3c
  //    startTime: 178, // 21 D2
  //    startTime: 195, // 22 A2

  //    mute: true,
  mute: false,

  /*
     A1: 0
     B1: 1,2
     C1: 3,4,5,6
     B2: 7,8,9,10
     C2: 11,12,13,14
     D1: 15
     S!: 16
     C3: 17,18,19,20
     D2: 21
     A2: 22
     */
  phase: {
    //   A1  B1       C1                B2              C2                  D1   S!      C3                  D2   A2   END
    times: [ 7, 24.5, 40, 48, 55.5, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 149.75, 152, 160, 168, 176, 184, 200, 210 ],
    index: 0
  },

  beatData: {
    start:      7,
    go:         24,
    end:        204,
    freq:       0.5,
    excluded:   [ 40, 48, 55.5, 64, 70, 70.5, 71, 104, 112, 120, 128, 136, 150, 150.5, 151, 151.5, 152, 160, 168, 176, 184, 200 ],
    included:   [ 69.75, 71.25, 71.375, 71.75, 149.75  ]
  },

  loadPhase: function(data) {
    this.phase = {
      times: [],
      index: 0
    }
    this.phaseConfig = [
      {
        phase: 0,
        beatfreq: 0
      }
    ]
    for (var i = 0; i < data.phases.length; i ++) {
      this.phase.times.push(data.phases[i].start)
      this.phaseConfig.push(data.phases[i].config)
    }
  }
}

LIGHTS.Input = function() {
  this.initialize();
};

LIGHTS.Input.mouseX = 0;
LIGHTS.Input.mouseY = 0;
LIGHTS.Input.mouseDown = false;
LIGHTS.Input.mouseClick = false;

LIGHTS.Input.keyUp = false;
LIGHTS.Input.keyDown = false;
LIGHTS.Input.keyRight = false;
LIGHTS.Input.keyLeft = false;
LIGHTS.Input.keySpace = false;
LIGHTS.Input.keyReturn = false;

LIGHTS.Input.prototype = {

  // _______________________________________________________________________________________ Constructor

  initialize: function() {

    window.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
    window.addEventListener( 'keyup',   bind( this, this.onKeyUp ), false );

    this.domElement = document;
    this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
    this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
    this.domElement.addEventListener( 'mouseup',   bind( this, this.onMouseUp ), false );
  },

  // _______________________________________________________________________________________ Events

  onMouseMove: function( event ) {

    event.preventDefault();

    var domElement = this.domElement,
    isDom = (domElement != document),
    containerOffsetX = isDom? domElement.offsetLeft : 0,
    containerOffsetY = isDom? domElement.offsetTop : 0,
    containerWidth = isDom? domElement.offsetWidth : window.innerWidth,
    containerHeight = isDom? domElement.offsetHeight : window.innerHeight,
    containerHalfWidth = containerWidth / 2,
    containerHalfHeight = containerHeight / 2;

    LIGHTS.Input.pointerX = Math.max( 0, Math.min( containerWidth, event.clientX - containerOffsetX ) ) - containerHalfWidth;
    LIGHTS.Input.pointerY = Math.max( 0, Math.min( containerHeight, event.clientY - containerOffsetY ) ) - containerHalfHeight;
    LIGHTS.Input.mouseX = LIGHTS.Input.pointerX / containerHalfWidth;
    LIGHTS.Input.mouseY = LIGHTS.Input.pointerY / containerHalfHeight;
  },

  onMouseDown: function( event ) {

    LIGHTS.Input.mouseDown = true;
    LIGHTS.Input.mouseClick = true;
  },

  onMouseUp: function( event ) {

    LIGHTS.Input.mouseDown = false;
  },

  onKeyDown: function( event ) {

    var key = event.keyCode;

    //        console.log( key );

    if ( key == 38 || key == 87 )
      LIGHTS.Input.keyUp = true;
    else if( key == 40 || key == 83 )
      LIGHTS.Input.keyDown = true;
    else if( key == 37 || key == 65 )
      LIGHTS.Input.keyRight = true;
    else if( key == 39 || key == 68 )
      LIGHTS.Input.keyLeft = true;
    else if( key == 32 )
      LIGHTS.Input.keySpace = true;
    else if( key == 13 )
      LIGHTS.Input.keyReturn = true;
  },

  onKeyUp: function( event ) {

    var key = event.keyCode;

    if( key == 38 || key == 87 )
      LIGHTS.Input.keyUp = false;
    else if( key == 40 || key == 83 )
      LIGHTS.Input.keyDown = false;
    else if( key == 37 || key == 65 )
      LIGHTS.Input.keyRight = false;
    else if( key == 39 || key == 68 )
      LIGHTS.Input.keyLeft = false;
    else if( key == 32 )
      LIGHTS.Input.keySpace = false;
    else if( key == 13 )
      LIGHTS.Input.keyReturn = false;
  },
};


LIGHTS.Stopwatch = function() {

  this.initialize();
};

LIGHTS.Stopwatch.prototype = {

  // _______________________________________________________________________________________ Constructor

  initialize: function() {

    this.date = new Date();
  },

  // _______________________________________________________________________________________ Public

  start: function() {

    this.startTime = this.date.getTime();
  },

  stop: function() {

    this.time = this.date.getTime() - this.startTime;
    console.log( this.time );
  }
}

