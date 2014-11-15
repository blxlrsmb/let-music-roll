
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
		this.hey = document.getElementById( 'lights_helloenjoy' );
		this.share = document.getElementById( 'lights_share' );
		this.credits = document.getElementById( 'lights_credits' );

		this.logo.style.visibility =
		this.hey.style.visibility =
		this.share.style.visibility =
		this.credits.style.visibility = 'hidden';

		this.share.style.display = 'none';
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

			this.logo.style.visibility =
			this.hey.style.visibility =
			this.info.style.visibility =
			this.share.style.visibility =
			this.credits.style.visibility = 'visible';

			this.setOpacity( this.logo, Math.max( 0, Math.min( 1, alpha * 2 ) ) );
			this.setOpacity( this.hey, Math.max( 0, Math.min( 1, alpha * 2 - 0.5 ) ) );
			this.setOpacity( this.info, Math.max( 0, Math.min( 1, alpha * 2 - 0.25 ) ) );
			this.setOpacity( this.share, Math.max( 0, Math.min( 1, alpha * 2 - 1 ) ) );
			this.setOpacity( this.credits, Math.max( 0, Math.min( 1, alpha * 2 - 0.75 ) ) );

			this.share.style.display = 'inline';
			this.share.style.left = this.shareLeft + 'px';
		}
		else {

			this.logo.style.visibility =
			this.hey.style.visibility =
			this.info.style.visibility =
			this.share.style.visibility =
			this.credits.style.visibility = 'hidden';
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

// _______________________________________________________________________________________ Start

document.onselectstart = function() { return false; }; // ie
document.onmousedown = function() { return false; }; // mozilla

function bind( scope, fn ) {

    return function() {

        fn.apply( scope, arguments );
    };
}

window.onload = function() {
	this.lights = new LIGHTS.Lights();
}

// _______________________________________________________________________________________ Lights

LIGHTS.Lights = function() {

  LIGHTS.Lights.instance = this,

	this.initialize();
};

LIGHTS.Lights.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function() {

        if( Detector.webgl ) {

	        this.renderManager = new LIGHTS.RenderManager();
	        this.input = new LIGHTS.Input();
	        this.gui = new LIGHTS.GUI( true );
            this.api = new LIGHTS.API('api');
	        this.home = new LIGHTS.Home( this.renderManager, this.gui, bind( this, this.launchHome ) );
	        this.loader = new LIGHTS.Loader( bind( this, this.launch ) );

        }
        else {

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

    loadData: function(item, callback) {
      this.api.fetch(item, function(data) {
        LIGHTS.Music.loadPhase(data)
        callback()
      })
    },

	playExperience: function(item) {
      if (!item)
        item = 'test.json'
      that = this
      this.loadData(item, function () {
        that.home.stop();
        that.director.start();
        that.experiencePlaying = true;
      })
	},

	playHome: function() {

		this.director.stop();
		this.home.start();
		this.experiencePlaying = false;
	},

    // _______________________________________________________________________________________ Update

	animateLights: function() {

		requestAnimationFrame( bind( this, this.animateLights ) );

		if( this.experiencePlaying ) {

			this.view.clear();
			this.director.update();
			this.view.update();
			this.director.postUpdate();
		}
		else {

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

//LIGHTS.guiOptions = {
//    particleX:	            0,
//    particleY:	            0,
//    particleZ:	            0,
//    particleScreenX: 		0,
//    particleScreenY: 		0
//};

LIGHTS.Music = {

    startTime: 0,   //  0 A1
//    startTime: 6,   //  1 B1
//    startTime: 20,  //  2 B1a
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
    this.phaseConfigs = []
    for (var i = 0; i < data.phases.length; i ++) {
      this.phase.times.push(data.phases[i].start)
      this.phaseConfigs.push(data.phases[i].config)
    }
  }
}

/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

Detector = {

	canvas : !! window.CanvasRenderingContext2D,
	webgl : ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )(),
	workers : !! window.Worker,
	fileapi : window.File && window.FileReader && window.FileList && window.Blob,

	getWebGLErrorMessage : function () {

		var domElement = document.createElement( 'div' );

		domElement.style.fontFamily = 'monospace';
		domElement.style.fontSize = '13px';
		domElement.style.textAlign = 'center';
		domElement.style.shadow = '#eee';
		domElement.style.color = '#000';
		domElement.style.padding = '1em';
		domElement.style.width = '475px';
		domElement.style.margin = '5em auto 0';

		if ( ! this.webgl ) {

			domElement.innerHTML = window.WebGLRenderingContext ? [
				'Sorry, your graphics card doesn\'t support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a>'
			].join( '\n' ) : [
				'Sorry, your browser doesn\'t support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a><br/>',
				'Please try with',
				'<a href="http://www.google.com/chrome">Chrome</a>, ',
				'<a href="http://www.mozilla.com/en-US/firefox/new/">Firefox 4</a> or',
				'<a href="http://nightly.webkit.org/">Webkit Nightly (Mac)</a>'
			].join( '\n' );

		}

		return domElement;

	},

	addGetWebGLMessage : function ( parameters ) {

		var parent, id, domElement;

		parameters = parameters || {};

		parent = parameters.parent !== undefined ? parameters.parent : document.body;
		id = parameters.id !== undefined ? parameters.id : 'oldie';

		domElement = Detector.getWebGLErrorMessage();
		domElement.id = id;

		parent.appendChild( domElement );

	}

};

/**
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */

if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

			window.setTimeout( callback, 1000 / 60 );

		};

	} )();

}

// stats.js r6 - http://github.com/mrdoob/stats.js
var Stats=function(){function s(a,g,d){var f,c,e;for(c=0;c<30;c++)for(f=0;f<73;f++)e=(f+c*74)*4,a[e]=a[e+4],a[e+1]=a[e+5],a[e+2]=a[e+6];for(c=0;c<30;c++)e=(73+c*74)*4,c<g?(a[e]=b[d].bg.r,a[e+1]=b[d].bg.g,a[e+2]=b[d].bg.b):(a[e]=b[d].fg.r,a[e+1]=b[d].fg.g,a[e+2]=b[d].fg.b)}var r=0,t=2,g,u=0,j=(new Date).getTime(),F=j,v=j,l=0,w=1E3,x=0,k,d,a,m,y,n=0,z=1E3,A=0,f,c,o,B,p=0,C=1E3,D=0,h,i,q,E,b={fps:{bg:{r:16,g:16,b:48},fg:{r:0,g:255,b:255}},ms:{bg:{r:16,g:48,b:16},fg:{r:0,g:255,b:0}},mb:{bg:{r:48,g:16,
b:26},fg:{r:255,g:0,b:128}}};g=document.createElement("div");g.style.cursor="pointer";g.style.width="80px";g.style.opacity="0.9";g.style.zIndex="10001";g.addEventListener("click",function(){r++;r==t&&(r=0);k.style.display="none";f.style.display="none";h.style.display="none";switch(r){case 0:k.style.display="block";break;case 1:f.style.display="block";break;case 2:h.style.display="block"}},!1);k=document.createElement("div");k.style.backgroundColor="rgb("+Math.floor(b.fps.bg.r/2)+","+Math.floor(b.fps.bg.g/
2)+","+Math.floor(b.fps.bg.b/2)+")";k.style.padding="2px 0px 3px 0px";g.appendChild(k);d=document.createElement("div");d.style.fontFamily="Helvetica, Arial, sans-serif";d.style.textAlign="left";d.style.fontSize="9px";d.style.color="rgb("+b.fps.fg.r+","+b.fps.fg.g+","+b.fps.fg.b+")";d.style.margin="0px 0px 1px 3px";d.innerHTML='<span style="font-weight:bold">FPS</span>';k.appendChild(d);a=document.createElement("canvas");a.width=74;a.height=30;a.style.display="block";a.style.marginLeft="3px";k.appendChild(a);
m=a.getContext("2d");m.fillStyle="rgb("+b.fps.bg.r+","+b.fps.bg.g+","+b.fps.bg.b+")";m.fillRect(0,0,a.width,a.height);y=m.getImageData(0,0,a.width,a.height);f=document.createElement("div");f.style.backgroundColor="rgb("+Math.floor(b.ms.bg.r/2)+","+Math.floor(b.ms.bg.g/2)+","+Math.floor(b.ms.bg.b/2)+")";f.style.padding="2px 0px 3px 0px";f.style.display="none";g.appendChild(f);c=document.createElement("div");c.style.fontFamily="Helvetica, Arial, sans-serif";c.style.textAlign="left";c.style.fontSize=
"9px";c.style.color="rgb("+b.ms.fg.r+","+b.ms.fg.g+","+b.ms.fg.b+")";c.style.margin="0px 0px 1px 3px";c.innerHTML='<span style="font-weight:bold">MS</span>';f.appendChild(c);a=document.createElement("canvas");a.width=74;a.height=30;a.style.display="block";a.style.marginLeft="3px";f.appendChild(a);o=a.getContext("2d");o.fillStyle="rgb("+b.ms.bg.r+","+b.ms.bg.g+","+b.ms.bg.b+")";o.fillRect(0,0,a.width,a.height);B=o.getImageData(0,0,a.width,a.height);try{performance&&performance.memory&&performance.memory.totalJSHeapSize&&
(t=3)}catch(G){}h=document.createElement("div");h.style.backgroundColor="rgb("+Math.floor(b.mb.bg.r/2)+","+Math.floor(b.mb.bg.g/2)+","+Math.floor(b.mb.bg.b/2)+")";h.style.padding="2px 0px 3px 0px";h.style.display="none";g.appendChild(h);i=document.createElement("div");i.style.fontFamily="Helvetica, Arial, sans-serif";i.style.textAlign="left";i.style.fontSize="9px";i.style.color="rgb("+b.mb.fg.r+","+b.mb.fg.g+","+b.mb.fg.b+")";i.style.margin="0px 0px 1px 3px";i.innerHTML='<span style="font-weight:bold">MB</span>';
h.appendChild(i);a=document.createElement("canvas");a.width=74;a.height=30;a.style.display="block";a.style.marginLeft="3px";h.appendChild(a);q=a.getContext("2d");q.fillStyle="#301010";q.fillRect(0,0,a.width,a.height);E=q.getImageData(0,0,a.width,a.height);return{domElement:g,update:function(){u++;j=(new Date).getTime();n=j-F;z=Math.min(z,n);A=Math.max(A,n);s(B.data,Math.min(30,30-n/200*30),"ms");c.innerHTML='<span style="font-weight:bold">'+n+" MS</span> ("+z+"-"+A+")";o.putImageData(B,0,0);F=j;if(j>
v+1E3){l=Math.round(u*1E3/(j-v));w=Math.min(w,l);x=Math.max(x,l);s(y.data,Math.min(30,30-l/100*30),"fps");d.innerHTML='<span style="font-weight:bold">'+l+" FPS</span> ("+w+"-"+x+")";m.putImageData(y,0,0);if(t==3)p=performance.memory.usedJSHeapSize*9.54E-7,C=Math.min(C,p),D=Math.max(D,p),s(E.data,Math.min(30,30-p/2),"mb"),i.innerHTML='<span style="font-weight:bold">'+Math.round(p)+" MB</span> ("+Math.round(C)+"-"+Math.round(D)+")",q.putImageData(E,0,0);v=j;u=0}}}};


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

        if( key == 38 || key == 87 )
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


LIGHTS.MaterialCache = function( director ) {

	this.initialize( director );
};

LIGHTS.MaterialCache.prototype = {

    // _______________________________________________________________________________________ Vars

    materials:      [],

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.container = new THREE.Object3D();
		this.container.position = director.player.targetPosition;
        director.view.scene.addChild( this.container );
    },

    addMaterial: function( material ) {

		var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 0, 0 ), material );
		this.container.addChild( mesh );
    }
};

THREE.MeshUtils = {};

THREE.MeshUtils.addChild = function( scene, parent, child ) {

    if( child.parent != parent ) {

        child.parent = parent;
        parent.children.push( child );
        scene.objects.push( child );
        scene.__objectsAdded.push( child );
    }
};

THREE.MeshUtils.removeChild = function( scene, parent, child ) {

    if( child.parent == parent ) {

        child.parent = null;
        parent.children.splice( parent.children.indexOf( child ), 1 );
        scene.objects.splice( scene.objects.indexOf( child ), 1 );
        scene.__objectsRemoved.push( child );
    }
};

THREE.MeshUtils.transformUVs = function( geometry, uOffset, vOffset, uMult, vMult ) {

    var vertexUVs = geometry.faceVertexUvs[ 0 ],
        i, il, j, jl, uvs, uv;

	for( i = 0, il = vertexUVs.length; i < il; i++ ) {

		uvs = vertexUVs[ i ];

		for( j = 0, jl = uvs.length; j < jl; j++ ) {

			uv = uvs[ j ];
			uv.u = uv.u * uMult + uOffset;
			uv.v = uv.v * vMult + vOffset;
		}
	}
};

THREE.MeshUtils.translateVertices = function( geometry, x, y, z ) {

    var vertices = geometry.vertices,
        pos, i, il;

	for( i = 0, il = vertices.length; i < il; i++ ) {

		pos = vertices[ i ].position;
		pos.x += x;
		pos.y += y;
		pos.z += z;
	}
};

THREE.MeshUtils.getVertexNormals = function( geometry ) {

    var faces = geometry.faces,
        normals = [],
        f, fl, face;

    for( f = 0, fl = faces.length; f < fl; f++ ) {

        face = faces[ f ];

        if( face instanceof THREE.Face3 ) {

            normals[ face.a ] = face.vertexNormals[ 0 ];
            normals[ face.b ] = face.vertexNormals[ 1 ];
            normals[ face.c ] = face.vertexNormals[ 2 ];
        }
        else if( face instanceof THREE.Face4 ) {

            normals[ face.a ] = face.vertexNormals[ 0 ];
            normals[ face.b ] = face.vertexNormals[ 1 ];
            normals[ face.c ] = face.vertexNormals[ 2 ];
            normals[ face.d ] = face.vertexNormals[ 3 ];
        }
    }

    return normals;
};

THREE.MeshUtils.createVertexColorGradient = function( geometry, colors, minY ) {

	var vertices = geometry.vertices,
		faces = geometry.faces,
		colorCount = colors.length,
		yList = [],
		vertexColorList = [],
		yBase, yLength, yCount, face, i, il, bottomColor, topColor, alphaColor, alpha, alpha1, color;

	if( minY === undefined ) minY = 0;

	// Ys
	for( i = 0, il = vertices.length; i < il; i++ )
		if( yList.indexOf( vertices[ i ].position.y ) == -1 )
			yList.push( vertices[ i ].position.y );

	yList.sort( function sort( a, b ) { return b - a; } );

	yCount = yList.length;
	yBase = yList[ yCount - 1 ];
	yLength = yList[ 0 ] - yBase;

	// Vertex colors
	for( i = 0; i < yCount; i++ ) {

		alphaColor = (yList[ i ] - yBase) / yLength;
		alphaColor = Math.max( 0 ,(alphaColor - minY) / (1 - minY) );
		alphaColor *= (colorCount - 1);
		index = Math.floor( alphaColor );

		bottomColor = colors[ index ];
		topColor = colors[ index + 1 ];

		topR = (topColor >> 16 & 255) / 255,
		topG = (topColor >> 8 & 255) / 255,
		topB = (topColor & 255) / 255,
		bottomR = (bottomColor >> 16 & 255) / 255,
		bottomG = (bottomColor >> 8 & 255) / 255,
		bottomB = (bottomColor & 255) / 255,

		alpha = alphaColor % 1;
		alpha1 = 1 - alpha;

		color = new THREE.Color();
		color.r = topR * alpha + bottomR * alpha1;
		color.g = topG * alpha + bottomG * alpha1;
		color.b = topB * alpha + bottomB * alpha1;
		color.updateHex();

		vertexColorList[ i ] = color;
	}

	// Assign to faces
	for( i = 0, il = faces.length; i < il; i ++ ) {

		face = faces[ i ];
		face.vertexColors.push( vertexColorList[ yList.indexOf( vertices[ face.a ].position.y ) ] );
		face.vertexColors.push( vertexColorList[ yList.indexOf( vertices[ face.b ].position.y ) ] );
		face.vertexColors.push( vertexColorList[ yList.indexOf( vertices[ face.c ].position.y ) ] );

		if( face.d !== undefined )
			face.vertexColors.push( vertexColorList[ yList.indexOf( vertices[ face.d ].position.y ) ] );
	}

	delete yList;

	geometry.vertexColorList = vertexColorList;
};

/**
 * @author C4RL05 / http://helloenjoy.com/
 */

THREE.RenderStats = function( renderer, parameters ) {

	this.initialize( renderer, parameters );
};

THREE.RenderStats.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( renderer, parameters ) {

        this.renderer = renderer;

		if( parameters === undefined )
    	    parameters = {};

		var color = (parameters.color !== undefined)? parameters.color : '#FF1561',
            top = (parameters.top !== undefined)? parameters.top : '42px',
            s;

        this.values = document.createElement( 'div' );
        s = this.values.style;
        s.fontFamily = 'Helvetica, Arial, sans-serif';
        s.fontSize = '16px';
        s.fontWeight = 'bold';
        s.lineHeight = '28px';
        s.textAlign = 'left';
        s.color = color;
        s.position = 'absolute';
        s.margin = '2px 2px 2px 4px';

        var labels = document.createElement( 'div' );
        s = labels.style;
        s.fontFamily = 'Helvetica, Arial, sans-serif';
        s.fontSize = '8px';
        s.fontWeight = 'bold';
        s.lineHeight = '28px';
        s.textAlign = 'left';
        s.color = color;
        s.position = 'absolute';
        s.top = '12px';
        s.margin = '2px 2px 2px 4px';
        labels.innerHTML = 'VERTS<br>TRIS<br>DRAWS';

        this.container = document.createElement( 'div' );
        s = this.container.style;
        s.zIndex = "10000";
        s.position = 'absolute';
        s.top = top;
        this.container.appendChild( labels );
        this.container.appendChild( this.values );
        document.body.appendChild( this.container );
	},

    // _______________________________________________________________________________________ Update

    update: function() {

        this.values.innerHTML = this.renderer.data.vertices;
        this.values.innerHTML += '</br>' + this.renderer.data.faces;
        this.values.innerHTML += '</br>' + this.renderer.data.drawCalls;
    }
};
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('D.C=d(2,1){0.B(2,1)};D.C.U={B:d(2,1){0.2=2;T(1===k)1={};A 3=(1.3!==k)?1.3:\'#S\',5=1.5!==k?1.5:\'R\',s;0.4=a.j(\'i\');s=0.4.h;s.z=\'y, x, w-v\';s.u=\'Q\';s.t=\'r\';s.q=\'p\';s.o=\'n\';s.3=3;s.g=\'f\';s.m=\'6 6 6 l\';A b=a.j(\'i\');s=b.h;s.z=\'y, x, w-v\';s.u=\'P\';s.t=\'r\';s.q=\'p\';s.o=\'n\';s.3=3;s.g=\'f\';s.5=\'O\';s.m=\'6 6 6 l\';b.9=\'N<8>M<8>L\';0.7=a.j(\'i\');s=0.7.h;s.K="J";s.g=\'f\';s.5=5;0.7.e(b);0.7.e(0.4);a.I.e(0.7)},H:d(){0.4.9=0.2.c.G;0.4.9+=\'</8>\'+0.2.c.F;0.4.9+=\'</8>\'+0.2.c.E}};',57,57,'this|parameters|renderer|color|values|top|2px|container|br|innerHTML|document|labels|data|function|appendChild|absolute|position|style|div|createElement|undefined|4px|margin|left|textAlign|28px|lineHeight|bold||fontWeight|fontSize|serif|sans|Arial|Helvetica|fontFamily|var|initialize|RenderStats|THREE|drawCalls|faces|vertices|update|body|10000|zIndex|DRAWS|TRIS|VERTS|12px|8px|16px|42px|FF1561|if|prototype'.split('|')))


// _______________________________________________________________________________________ TextureUtils

LIGHTS.TextureUtils = function() {

	this.initialize();
};

LIGHTS.TextureUtils.grays = [];

LIGHTS.TextureUtils.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function() {

        // Grays
        for( var i = 0; i < 256; i++ )
            LIGHTS.TextureUtils.grays = 0x010101 * i;
	}
};

LIGHTS.TextureUtils.getCircleTexture = function( size ) {

    var r = size * 0.5,
        i, dotFill, textureCanvas, textureContext, texture;

    textureCanvas = document.createElement( 'canvas' );
    textureCanvas.width = size;
    textureCanvas.height = size;

    textureContext = textureCanvas.getContext( '2d' );
    dotFill = textureContext.createRadialGradient( r, r, 0, r, r, r );
    dotFill.addColorStop( 0, '#FFFFFF' );
    dotFill.addColorStop( 0.4, '#FFFFFF' );
    dotFill.addColorStop( 0.8, '#808080' );
//    dotFill.addColorStop( 0.9, '#808080' );
    dotFill.addColorStop( 1, '#000000' );


    textureContext.fillStyle = dotFill;
    textureContext.beginPath();
    textureContext.arc( r, r, r * 0.95, 0, rad360, true );
    textureContext.closePath();
    textureContext.fill();

    texture = new THREE.Texture( textureCanvas, new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter );
    texture.needsUpdate = true;

    return texture;
};

LIGHTS.TextureUtils.getGradientColors = function( gradient ) {

    var colors = [],
	    i, fill, canvas, context, data;

    canvas = document.createElement( 'canvas' );
    canvas.width = 256;
    canvas.height = 1;

    context = canvas.getContext( '2d' );
    fill = context.createLinearGradient( 0, 0, 255, 0 );

	for( i = 0; i < gradient.length; i++ )
        fill.addColorStop( gradient[ i ][ 1 ], gradient[ i ][ 0 ] );

    context.fillStyle = fill;
    context.fillRect( 0, 0, 256, 1 );
	data = context.getImageData( 0, 0, 256, 1 ).data;

	for( i = 0; i < data.length; i += 4 )
		colors.push( data[ i ] * 0x010000 + data[ i+1 ] * 0x000100 + data[ i+2 ] * 0x000001 );

//	delete data;
//	delete fill;
//	delete context;
//	delete canvas;

	return colors;
};

