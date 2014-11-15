//File: Misc.js
//Date: Sat Nov 15 15:24:45 2014 +0800

// Misc
document.onselectstart = function() { return false; }; // ie
document.onmousedown = function() { return false; }; // mozilla
window.onload = function() { this.lights = new LIGHTS.Lights(); }




// stats.js r6 - http://github.com/mrdoob/stats.js
var Stats=function(){function s(a,g,d){var f,c,e;for(c=0;c<30;c++)for(f=0;f<73;f++)e=(f+c*74)*4,a[e]=a[e+4],a[e+1]=a[e+5],a[e+2]=a[e+6];for(c=0;c<30;c++)e=(73+c*74)*4,c<g?(a[e]=b[d].bg.r,a[e+1]=b[d].bg.g,a[e+2]=b[d].bg.b):(a[e]=b[d].fg.r,a[e+1]=b[d].fg.g,a[e+2]=b[d].fg.b)}var r=0,t=2,g,u=0,j=(new Date).getTime(),F=j,v=j,l=0,w=1E3,x=0,k,d,a,m,y,n=0,z=1E3,A=0,f,c,o,B,p=0,C=1E3,D=0,h,i,q,E,b={fps:{bg:{r:16,g:16,b:48},fg:{r:0,g:255,b:255}},ms:{bg:{r:16,g:48,b:16},fg:{r:0,g:255,b:0}},mb:{bg:{r:48,g:16, b:26},fg:{r:255,g:0,b:128}}};g=document.createElement("div");g.style.cursor="pointer";g.style.width="80px";g.style.opacity="0.9";g.style.zIndex="10001";g.addEventListener("click",function(){r++;r==t&&(r=0);k.style.display="none";f.style.display="none";h.style.display="none";switch(r){case 0:k.style.display="block";break;case 1:f.style.display="block";break;case 2:h.style.display="block"}},!1);k=document.createElement("div");k.style.backgroundColor="rgb("+Math.floor(b.fps.bg.r/2)+","+Math.floor(b.fps.bg.g/ 2)+","+Math.floor(b.fps.bg.b/2)+")";k.style.padding="2px 0px 3px 0px";g.appendChild(k);d=document.createElement("div");d.style.fontFamily="Helvetica, Arial, sans-serif";d.style.textAlign="left";d.style.fontSize="9px";d.style.color="rgb("+b.fps.fg.r+","+b.fps.fg.g+","+b.fps.fg.b+")";d.style.margin="0px 0px 1px 3px";d.innerHTML='<span style="font-weight:bold">FPS</span>';k.appendChild(d);a=document.createElement("canvas");a.width=74;a.height=30;a.style.display="block";a.style.marginLeft="3px";k.appendChild(a);
m=a.getContext("2d");m.fillStyle="rgb("+b.fps.bg.r+","+b.fps.bg.g+","+b.fps.bg.b+")";m.fillRect(0,0,a.width,a.height);y=m.getImageData(0,0,a.width,a.height);f=document.createElement("div");f.style.backgroundColor="rgb("+Math.floor(b.ms.bg.r/2)+","+Math.floor(b.ms.bg.g/2)+","+Math.floor(b.ms.bg.b/2)+")";f.style.padding="2px 0px 3px 0px";f.style.display="none";g.appendChild(f);c=document.createElement("div");c.style.fontFamily="Helvetica, Arial, sans-serif";c.style.textAlign="left";c.style.fontSize=
  "9px";c.style.color="rgb("+b.ms.fg.r+","+b.ms.fg.g+","+b.ms.fg.b+")";c.style.margin="0px 0px 1px 3px";c.innerHTML='<span style="font-weight:bold">MS</span>';f.appendChild(c);a=document.createElement("canvas");a.width=74;a.height=30;a.style.display="block";a.style.marginLeft="3px";f.appendChild(a);o=a.getContext("2d");o.fillStyle="rgb("+b.ms.bg.r+","+b.ms.bg.g+","+b.ms.bg.b+")";o.fillRect(0,0,a.width,a.height);B=o.getImageData(0,0,a.width,a.height);try{performance&&performance.memory&&performance.memory.totalJSHeapSize&&
    (t=3)}catch(G){}h=document.createElement("div");h.style.backgroundColor="rgb("+Math.floor(b.mb.bg.r/2)+","+Math.floor(b.mb.bg.g/2)+","+Math.floor(b.mb.bg.b/2)+")";h.style.padding="2px 0px 3px 0px";h.style.display="none";g.appendChild(h);i=document.createElement("div");i.style.fontFamily="Helvetica, Arial, sans-serif";i.style.textAlign="left";i.style.fontSize="9px";i.style.color="rgb("+b.mb.fg.r+","+b.mb.fg.g+","+b.mb.fg.b+")";i.style.margin="0px 0px 1px 3px";i.innerHTML='<span style="font-weight:bold">MB</span>';
h.appendChild(i);a=document.createElement("canvas");a.width=74;a.height=30;a.style.display="block";a.style.marginLeft="3px";h.appendChild(a);q=a.getContext("2d");q.fillStyle="#301010";q.fillRect(0,0,a.width,a.height);E=q.getImageData(0,0,a.width,a.height);return{domElement:g,update:function(){u++;j=(new Date).getTime();n=j-F;z=Math.min(z,n);A=Math.max(A,n);s(B.data,Math.min(30,30-n/200*30),"ms");c.innerHTML='<span style="font-weight:bold">'+n+" MS</span> ("+z+"-"+A+")";o.putImageData(B,0,0);F=j;if(j> v+1E3){l=Math.round(u*1E3/(j-v));w=Math.min(w,l);x=Math.max(x,l);s(y.data,Math.min(30,30-l/100*30),"fps");d.innerHTML='<span style="font-weight:bold">'+l+" FPS</span> ("+w+"-"+x+")";m.putImageData(y,0,0);if(t==3)p=performance.memory.usedJSHeapSize*9.54E-7,C=Math.min(C,p),D=Math.max(D,p),s(E.data,Math.min(30,30-p/2),"mb"),i.innerHTML='<span style="font-weight:bold">'+Math.round(p)+" MB</span> ("+Math.round(C)+"-"+Math.round(D)+")",q.putImageData(E,0,0);v=j;u=0}}}};


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

