//File: Stars.js
//Date: Sat Nov 15 00:43:43 2014 +0800

LIGHTS.Star = function() {

  this.initialize();
};

LIGHTS.Star.prototype = {

    // _______________________________________________________________________________________ Constructor

  initialize: function() {

        this.position = null;
        this.color = null;
//    this.colorR = 0;
//    this.colorG = 0;
//    this.colorB = 0;
        this.life = Math.random() * 4;
        this.lifeTime = 0;
        this.fadeIn = 0;
        this.fadeOut = 0;
    this.key = Math.floor( Math.random() * 4 );

    if( this.key == 3 )
      this.key = 4;
    else if( this.key == 1 && Math.random() > 0.5 )
      this.key = 3;
    }
};

LIGHTS.Stars = function( director ) {

  this.initialize( director );
};

LIGHTS.Stars.particleCount = 10;//24;
LIGHTS.Stars.particleSize = 4;

LIGHTS.Stars.prototype = {

    // _______________________________________________________________________________________ Constructor

  initialize: function( director ) {

        this.terrain = director.terrain;
        this.player = director.player;

        var p, star, material;

        // Geometry
        this.particles = new THREE.Geometry();
        this.particles.dynamic = true;
        this.particles.colors = [];
        this.stars = [];

        // Materials
        material = new THREE.ParticleBasicMaterial({
                vertexColors: true,
                size: LIGHTS.Stars.particleSize * 2,
//                map: this.getCircleTexture( 32 ),
                map: LIGHTS.TextureUtils.getCircleTexture( 32 ),
//                map: THREE.ImageUtils.loadTexture( "images/BluePlasmaBall.png" ),
                blending: THREE.AdditiveBlending,
                transparent: true
        });

        for( p = 0; p < LIGHTS.Stars.particleCount; p++ ) {

            star = new LIGHTS.Star();
            star.position = new THREE.Vector3( 999999, 0, 999999 );
            star.color = new THREE.Color( 0xFF0000 );
            this.stars.push( star );

            this.particles.vertices.push( new THREE.Vertex( star.position ) );
            this.particles.colors.push( star.color );
        }

        this.particleSystem = new THREE.ParticleSystem( this.particles, material );
        this.particleSystem.sortParticles = false;
        this.particleSystem.dynamic = true;
        director.view.scene.addChild( this.particleSystem );
    },

   // _______________________________________________________________________________________ Update

    lifeFade:    0.5,

    update: function() {

        var i, star;

        this.particles.__dirtyColors = true;

        for( i = 0; i < LIGHTS.Stars.particleCount; i++ ) {

            star = this.stars[ i ];

            star.life += LIGHTS.deltaTime;

            if( star.life < star.fadeIn )
                star.color.setHex( 0x010101 * Math.floor( 256 * star.life / star.fadeIn ));
            else if( star.life > star.fadeOut )
                star.color.setHex( 0x010101 * Math.floor( 256 * (1 - (star.life - star.fadeOut) / star.fadeOutTime ) ) );

            if( star.life > star.lifeTime || ! this.terrain.isVisible( star.position.x, star.position.z ) ) {

//                this.terrain.selectRandomTileAtRadius( 1 );
              this.terrain.selectCenterTile();
//                this.terrain.selectRandomTileAtRadius( 1 + Math.ceil( Math.random() * (this.terrain.gridRadius - 3) ) );
                this.terrain.selectTerrainRandomVertex( false );

                star.position.copy( this.terrain.randomPosition );
                star.position.y += 50 + 150 * Math.random();
                star.color.setHex( 0x000000 );
                star.life = 0;
                star.lifeTime = 0.5 + Math.random() * 0.5;
                star.fadeIn = (0.5 + Math.random() * 0.5) * star.lifeTime;
                star.fadeOut = (0.5 + Math.random() * 0.5) * (star.lifeTime - star.fadeIn);
                star.fadeOutTime = star.lifeTime - star.fadeOut;

                this.particles.__dirtyVertices = true;
            }
        }
    }
};

// _______________________________________________________________________________________ STAR

LIGHTS.StarManager = function( director ) {

  this.initialize( director );
};

LIGHTS.StarManager.prototype = {

    // _______________________________________________________________________________________ Group

    active:                 false,

  tiles:                  [],

  particleCount:          256,
  particleSize:           4,
  arpKeys:                [ [ 0, 0.255, 0.38, 0.63, 0.75 ], [ 0, 0.125, 0.38, 0.50, 0.75 ] ],

    // _______________________________________________________________________________________ Constructor

  initialize: function( director ) {

    this.director = director;
    this.tileSize = director.terrain.tileSize;

    var p, pl, star, material;

    // Geometry
    this.particles = new THREE.Geometry();
    this.particles.colors = [];
    this.stars = [];

    // Materials
    material = new THREE.ParticleBasicMaterial({
      vertexColors: true,
      size: this.particleSize,
//                map: this.getCircleTexture( 32 ),
      map: LIGHTS.TextureUtils.getCircleTexture( 32 ),
//                map: THREE.ImageUtils.loadTexture( "images/BluePlasmaBall.png" ),
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    for( p = 0, pl = this.particleCount * LIGHTS.TileManager.prototype.estimatedTileCount; p < pl; p++ ) {

        star = new LIGHTS.Star();
        star.position = new THREE.Vector3( 999999, 0, 999999 );
        star.color = new THREE.Color( 0x000000 );

//      star.colorR = (Math.random() * 0.5 + 0.5) * 1;
//      star.colorG = (Math.random() * 0.5 + 0.5) * 1;
//      star.colorB = (Math.random() * 0.5 + 0.5) * 1;

        this.stars.push( star );

        this.particles.vertices.push( new THREE.Vertex( star.position ) );
        this.particles.colors.push( star.color );
    }

    this.particleSystem = new THREE.ParticleSystem( this.particles, material );
    this.particleSystem.sortParticles = false;
    this.particleSystem.dynamic = true;

    this.director.view.scene.addChild( this.particleSystem );
  },

  launch: function() {

      switch( LIGHTS.Music.phase.index ) {

          case 0:
            this.particleSystem.visible = true;
            this.beats = 0;
            this.arpTimes = this.arpKeys[ 0 ];
            this.nextArpIndex = 0;
            this.nextArpTime = this.arpTimes[ 0 ];
            break;

        case 22: // A2
            this.particleSystem.visible = false;
            break;
      }
  },

  beat: function() {

    this.arpTimes = this.arpKeys[ this.beats++ % 2 ];
    this.nextArpIndex = 0;
    this.nextArpTime = this.arpTimes[ 0 ];
  },

  update: function() {

    var stars = this.stars,
      deltaTime = LIGHTS.deltaTime,
      star, brightness, i, il;

    for( i = 0, il = stars.length; i < il; i++ ) {

        star = this.stars[ i ];

      star.life += deltaTime;

      brightness = (star.life * 2) % 2;

      if( brightness > 1 )
          brightness = 1 - (brightness - 1);

      star.color.r =
      star.color.g =
      star.color.b = (Math.sin( brightness * rad90 - rad90 ) + 1) * 4;
    }

    this.particles.__dirtyColors = true;
  },

  updateKeys: function() {

    var isKey = (LIGHTS.time > this.nextArpTime);

    if( isKey ) {

      this.nextArpIndex++;

      if( this.nextArpIndex >= this.arpTimes.length ) {

        this.beats++;
        this.arpTimes = this.arpKeys[ Math.floor( (this.beats % 4) / 2 ) ];
        this.nextArpTime = Math.floor( LIGHTS.time + 1 ) + this.arpTimes[ 0 ];
        this.nextArpIndex = 0;
      }
      else {

        this.nextArpTime = Math.floor( LIGHTS.time ) + this.arpTimes[ this.nextArpIndex ];
      }
    }

    var stars = this.stars,
      deltaTime = LIGHTS.deltaTime,
      keyIndex = this.nextArpIndex,
      star, starLife, brightness, i, il;

    for( i = 0, il = stars.length; i < il; i++ ) {

        star = this.stars[ i ];

        star.life += deltaTime;
      starLife = star.life;

        if( starLife < star.fadeIn )
            brightness = starLife / star.fadeIn;
        else if( starLife > star.fadeOut )
            brightness = 1 - (starLife - star.fadeOut) / star.fadeOutTime;

        if( starLife > star.lifeTime ) {

            brightness = 0;
            star.life = 0;
            star.lifeTime = Math.random() * 1 + 0.5;
            star.fadeIn = (Math.random() * 0.5 + 0.5) * star.lifeTime;
            star.fadeOut = (Math.random() * 0.5 + 0.5) * (star.lifeTime - star.fadeIn);
            star.fadeOutTime = star.lifeTime - star.fadeOut;
        }

      if( isKey && star.key == keyIndex ) {

        star.color.r =
        star.color.g =
        star.color.b = 8;
//        star.color.r = star.colorR;
//        star.color.g = star.colorG;
//        star.color.b = star.colorB;
      }
      else {

//        star.color.r =
//        star.color.g =
//        star.color.b = 0;
        star.color.r *= 0.95;
        star.color.g *= 0.95;
        star.color.b *= 0.95;
      }


//      star.color.r = star.color.g = star.color.b = brightness;
    }

    this.particles.__dirtyColors = true;
  }
};

