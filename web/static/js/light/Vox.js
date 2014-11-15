//File: vox.js
//Date: Sat Nov 15 00:15:22 2014 +0800


// the flying ball in the center

LIGHTS.Vox = function( director ) {

  this.initialize( director );
};

LIGHTS.Vox.prototype = {

  // _______________________________________________________________________________________ Vars

  particleCount:      256,
  trailCountAdd:      24,
  trailCountAlpha:    24,
  spectrumLength:     64,

  // _______________________________________________________________________________________ Constructor

  initialize: function( director ) {

    this.director = director;
    this.player = director.player;
    this.targetPosition = this.player.targetPosition;

    this.vox = new THREE.Object3D();
    director.view.sceneVox.addChild( this.vox );

    this.voxPosition = this.vox.position;
    this.voxPositionY = 0;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();

    this.createParticles();
    this.createTrails();
    this.createBengal();

    this.volume = 1;
    this.time = 0;
    this.isIntro = false;
    this.isOutro = false;
    this.active = false;
  },

  // _______________________________________________________________________________________ Update

  update: function() {

    if( this.active ) {

      var easing = LIGHTS.deltaTime * (this.player.velocity * this.player.turbo / 40);

      this.velocity.x = (this.targetPosition.x - this.position.x) * easing;
      this.velocity.y = (this.targetPosition.y - this.position.y) * easing;
      this.velocity.z = (this.targetPosition.z - this.position.z) * easing;

      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.position.z += this.velocity.z;

      this.voxPositionY -= ( this.voxPositionY - (this.player.cameraTilt + this.player.tilt) * 64 ) * easing * 0.5;
      this.voxPosition.x = this.position.x + this.player.right.x * this.player.roll * 128;
      this.voxPosition.y = this.position.y + this.voxPositionY;
      this.voxPosition.z = this.position.z + this.player.right.y * this.player.roll * 128;

      if( this.bengal.visible )
        this.updateBengal();

      if( this.isIntro ) {

        this.updateParticlesIntro();
      }
      else if( this.isOutro ) {

        this.updateParticlesOutro();
      }
      else {

        this.updateTrailPositions();
        this.updateTrailGeometry( this.trailGeometryAdd );
        this.updateTrailGeometry( this.trailGeometryAlpha );
      }
    }
  },

  finish: function() {

    this.lineSystem.visible = true;
    this.isOutro = true;

    this.bengalAlpha = 0;

    this.setupParticlesOutro();
    //    this.trailSystemAdd.visible = false;
    //    this.trailSystemAlpha.visible = false;
    //    this.bengal.visible = false;
    //    this.bengalShadow.visible = false;
  },

  stop: function() {

    this.lineSystem.visible = false;
    this.trailSystemAdd.visible = false;
    this.trailSystemAlpha.visible = false;
    this.bengal.visible = false;
    this.bengalShadow.visible = false;
    this.active = false;

  },

  start: function() {

    this.active = true;
    this.lineSystem.visible = true;
    this.trailSystemAdd.visible = false;
    this.trailSystemAlpha.visible = false;
    this.bengal.visible = false;
    this.bengalShadow.visible = false;
    this.position.copy( this.director.player.targetPosition );
    this.isIntro = true;
    this.isOutro = false;
    this.introTime = 0;
    this.bengalMaterialCache.visible = true;

    this.setupParticlesIntro();
  },

  launchBengal: function() {

    this.bengal.visible = true;
    this.bengalShadow.visible = true;

    this.bengalTime = 0;
    this.bengalAlpha = 0;
    this.bengal.scale.x = this.bengal.scale.y = 0.001;
    this.bengalShadow.scale.x = this.bengalShadow.scale.y = this.bengal.scale.x;
  },

  launch: function() {

    if( LIGHTS.Music.startTime > 0 )
      this.launchBengal();

    this.isIntro = false;
    this.lineSystem.visible = false;
    this.trailSystemAdd.visible = true;
    this.trailSystemAlpha.visible = true;

    this.setupTrailGeometry( this.trailGeometryAdd );
    this.setupTrailGeometry( this.trailGeometryAlpha );
    this.setupTrailPositions();

    this.bengalMaterialCache.visible = false;
  },

  // _______________________________________________________________________________________ Trails

  createTrails: function() {

    var scene = this.director.view.sceneVox,
    material, i, il;

    var texture = new THREE.Texture( LIGHTS.images.spotLine );
    texture.needsUpdate = true;

    // Add
    this.trailGeometryAdd = new LIGHTS.SpotGeometry( 10, 10, 64, 64, this.trailCountAdd );
    this.trailGeometryAdd.computeBoundingSphere();
    this.trailGeometryAdd.boundingSphere.radius = Number.MAX_VALUE;
    this.trailGeometryAdd.trailCount = this.trailCountAdd;

    for( i = 0, il = this.trailGeometryAdd.vertices.length; i < il; i++ )
      this.trailGeometryAdd.vertices[ i ].linePosition = new THREE.Vector3();

    //    i = this.trailGeometryAdd.vertices.length / this.trailCountAdd;

    material = new THREE.MeshBasicMaterial( {

      map:            texture,
             //      color:          0x202020,
             blending:       THREE.AdditiveBlending,
             transparent:    true
    } );

    this.trailSystemAdd = new THREE.Mesh( this.trailGeometryAdd, material );
    this.trailSystemAdd.renderDepth = 0;
    this.trailSystemAdd.dynamic = true;
    this.trailSystemAdd.doubleSided = true;
    scene.addChild( this.trailSystemAdd );

    // Lines
    this.trailGeometryAdd.trailDatas = [];

    for( i = 0, il = this.trailCountAdd; i < il; i++ )
      this.trailGeometryAdd.trailDatas.push( this.createTrailData( 3 ) );

    // Color
    texture = new THREE.Texture( LIGHTS.images.spotLineAlpha );
    texture.needsUpdate = true;

    this.trailGeometryAlpha = new LIGHTS.SpotGeometry( 10, 10, 64, 64, this.trailCountAlpha );
    this.trailGeometryAlpha.computeBoundingSphere();
    this.trailGeometryAlpha.boundingSphere.radius = Number.MAX_VALUE;
    this.trailGeometryAlpha.trailCount = this.trailCountAdd;

    for( i = 0, il = this.trailGeometryAlpha.vertices.length; i < il; i++ )
      this.trailGeometryAlpha.vertices[ i ].linePosition = new THREE.Vector3();

    this.setupTrailVertexColors( this.trailGeometryAlpha );

    material = new THREE.MeshBasicMaterial( {

      vertexColors:   THREE.VertexColors,
             map:            texture,
             opacity:        0.75,
             //      blending:       THREE.AdditiveBlending,
             transparent:    true
    } );

    this.trailSystemAlpha = new THREE.Mesh( this.trailGeometryAlpha, material );
    this.trailSystemAlpha.renderDepth = 20;
    this.trailSystemAlpha.dynamic = true;
    this.trailSystemAlpha.doubleSided = true;
    scene.addChild( this.trailSystemAlpha );

    // Lines
    this.trailGeometryAlpha.trailDatas = [];

    for( i = 0, il = this.trailCountAlpha; i < il; i++ )
      this.trailGeometryAlpha.trailDatas.push( this.createTrailData( 6 ) );

    // Trail
    this.trailPositions = [];

    for( i = 0; i <= 70; i++ )
      this.trailPositions[ i ] = new THREE.Vector3();

    // Spectrum
    this.spectrum = [];

    for( i = 0; i < this.spectrumLength; i++ )
      this.spectrum[ i ] = 0;

    this.spectrumIndex = 0;

  },

  setupTrailVertexColors: function( geometry ) {

    var trailCount = geometry.trailCount,
    faces = geometry.faces,
    faceCount = faces.length,
    planeOffset = faceCount / trailCount,
    colorTop = [ 1, 0, 0 ],
    colorBottom = [ 1, 0, 0 ],
    f = 0,
    i, j, color, alpha, alphaMinus;

    for( i = 0; i < trailCount; i++ ) {

      colorBottom[ 1 ] = Math.random() * 0.5 + 0.5;
      colorBottom[ 2 ] = Math.random() * 0.5;

      colorTop[ 1 ] = Math.random() * 0.5 + 0.5;
      colorTop[ 2 ] = Math.random() * 0.5;

      for( j = 0; j < planeOffset; j++ ) {

        face = faces[ f++ ];

        alpha = j / planeOffset;
        alphaMinus = 1 - alpha;
        color = new THREE.Color();
        color.r = alphaMinus * colorBottom[ 0 ] + alpha * colorTop[ 0 ];
        color.g = alphaMinus * colorBottom[ 1 ] + alpha * colorTop[ 1 ];
        color.b = alphaMinus * colorBottom[ 2 ] + alpha * colorTop[ 2 ];

        face.vertexColors.push( color );
        face.vertexColors.push( color );

        alpha = (j + 1) / planeOffset;
        alphaMinus = 1 - alpha;
        color = new THREE.Color();
        color.r = alphaMinus * colorBottom[ 0 ] + alpha * colorTop[ 0 ];
        color.g = alphaMinus * colorBottom[ 1 ] + alpha * colorTop[ 1 ];
        color.b = alphaMinus * colorBottom[ 2 ] + alpha * colorTop[ 2 ];

        face.vertexColors.push( color );
        face.vertexColors.push( color );
      }
    }

    geometry.__dirtyColors = true;
  },

  setupTrailGeometry: function( geometry ) {

    var vertices = geometry.vertices,
    vertexCount = vertices.length,
    v, pos;

    for( v = 0; v < vertexCount; v++ ) {

      pos = vertices[ v ].linePosition;
      pos.x = 0;
      pos.y = 0;
      pos.z = 0;
    }

    geometry.__dirtyVertices = true;
  },

  setupTrailPositions: function() {

    var trail = this.trailPositions,
    posX = this.voxPosition.x,
    posY = this.voxPosition.y,
    posZ = this.voxPosition.z,
    i, il, pos;

    for( i = 0, il = trail.length; i < il; i++ ) {

      pos = trail[ i ];
      pos.x = posX;
      pos.y = posY;
      pos.z = posZ;
      pos.active = false;
    }
  },

  updateTrailPositions: function() {

    var thisPos = this.voxPosition,
    pos = this.trailPositions.pop();

    pos.x = thisPos.x;
    pos.y = thisPos.y;
    pos.z = thisPos.z;
    pos.active = true;

    this.trailPositions.unshift( pos );

    this.time += LIGHTS.deltaTime;
  },

  createTrailData: function( headNoise ) {

    return {

      offset:             Math.random() * rad360,
      offsetZ:            Math.random() * rad360,
      freq:               rad180 * (Math.random() * 2 + 0.5),
      amp:                (Math.random() - 0.5) * 10,
      rows:               Math.floor( Math.random() * 8 ) + 4,
      spectrumOffset:     Math.floor( Math.random() * 64 ),
      head:               [ (Math.random() - 0.5) * headNoise,
      (Math.random() - 0.5) * headNoise,
      (Math.random() - 0.5) * headNoise ] };
  },

  updateTrailGeometry: function( geometry ) {

    var lineBodyRnd = 0.1; //0.5 * (this.volume + 1);

    var time = this.time,
        spectrum = this.spectrum,
        spectrumLength = this.spectrumLength,
        trailPositions = this.trailPositions,
        trailDatas = geometry.trailDatas,
        trailCount = geometry.trailCount,
        posX = this.voxPosition.x,
        posY = this.voxPosition.y,
        posZ = this.voxPosition.z,
        vertices = geometry.vertices,
        vertexCount = vertices.length,
        planeOffset = vertexCount / trailCount,
        v, l, vertex, pos, linePos, a, index, head, spectrumIndex, spectrumRnd, data, offset, freq, amp;

    // Shift positions
    for( v = planeOffset - 1; v > 2; v -= 2 ) {

      for( l = 0; l < trailCount; l++ ) {

        vertex = v + l * planeOffset;

        pos = vertices[ vertex ].linePosition;
        linePos = vertices[ vertex - 2 ].linePosition;
        pos.x = linePos.x;
        pos.y = linePos.y;
        pos.z = linePos.z;

        pos = vertices[ vertex - 1 ].linePosition;
        linePos = vertices[ vertex - 3 ].linePosition;
        pos.x = linePos.x;
        pos.y = linePos.y;
        pos.z = linePos.z;
      }
    }

    // Head
    for( l = 0; l < trailCount; l++ ) {

      vertex = planeOffset * l;

      data = trailDatas[ l ];
      amp = data.amp;
      freq = data.freq;
      offset = data.offset;
      head = data.head;

      a = time * freq + offset;

      linePos = vertices[ vertex ].linePosition;
      linePos.x = amp * Math.sin( a );
      linePos.y = amp * Math.cos( a );
      linePos.z = amp * Math.sin( a + data.offsetZ );

      pos = vertices[ vertex + 1 ].linePosition;
      pos.x = linePos.x + head[ 0 ];
      pos.y = linePos.y + head[ 1 ];
      pos.z = linePos.z + head[ 2 ];
    }

    // Body
    this.spectrumIndex += LIGHTS.deltaTime * 10;
    spectrumIndex = Math.floor( this.spectrumIndex );

    for( v = 0; v < vertexCount; v += 2 ) {

      data = trailDatas[ Math.floor( v / planeOffset ) ];
      spectrumRnd = spectrum[ ((v % planeOffset) + spectrumIndex + data.spectrumOffset) % spectrumLength ];
      freq = data.freq;
      offset = data.offset;

      var row = (v/2) % (planeOffset/2);
      var trailPos = trailPositions[ row ];
      amp = Math.sin( Math.min( row / 16, 1 ) * rad90 ) * (0.15 + spectrumRnd * 0.005) * this.volume + 0.1;

      if( trailPos.active ) {

        pos = vertices[ v ].position;
        linePos = vertices[ v ].linePosition;
        pos.x = trailPos.x + linePos.x * amp;
        pos.y = trailPos.y + linePos.y * amp;
        pos.z = trailPos.z + linePos.z * amp;

        pos = vertices[ v + 1 ].position;
        linePos = vertices[ v + 1 ].linePosition;
        pos.x = trailPos.x + linePos.x * amp;
        pos.y = trailPos.y + linePos.y * amp;
        pos.z = trailPos.z + linePos.z * amp;
      }
      else {

        pos = vertices[ v ].position;
        pos.x = posX;
        pos.y = posY;
        pos.z = posZ;

        pos = vertices[ v + 1 ].position;
        pos.x = posX;
        pos.y = posY;
        pos.z = posZ;
      }
    }

    geometry.__dirtyVertices = true;
  },

  // _______________________________________________________________________________________ Bengal

  createBengal: function() {

    this.bengalIndex = 0;
    this.bengalTexture = new THREE.Texture( LIGHTS.images.bengalSeq );
    this.bengalTexture.repeat.x = this.bengalTexture.repeat.y = 0.25;
    this.bengalTexture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial( {

      map:            this.bengalTexture,
        blending:       THREE.AdditiveBlending,
        transparent:    true,
        depthTest:      false
    } );

    this.bengal = new THREE.Mesh( new THREE.PlaneGeometry( 20, 20 ), material );
    this.bengal.doubleSided = true;
    this.bengal.renderDepth = 10;
    this.director.view.sceneVox.addChild( this.bengal );

    this.bengalPosition = this.bengal.position;

    // Shadow
    var texture = new THREE.Texture( LIGHTS.images.bengalShadow );
    texture.needsUpdate = true;

    material = new THREE.MeshBasicMaterial( {

      map:            texture,
             blending:       THREE.MultiplyBlending,
             transparent:    true
    } );

    this.bengalShadow = new THREE.Mesh( new THREE.PlaneGeometry( 20, 20 ), material );
    this.bengalShadow.doubleSided = true;
    this.bengalShadow.renderDepth = 40;
    this.director.view.sceneVox.addChild( this.bengalShadow );

    // Cache material
    this.bengalMaterialCache = new THREE.Mesh( new THREE.PlaneGeometry( 0, 0 ), material );
    this.bengalMaterialCache.doubleSided = true;
    this.vox.addChild( this.bengalMaterialCache );
  },

  updateBengal: function() {

    var deltaTime = LIGHTS.deltaTime;

    // Anim texture
    this.bengalTime += deltaTime;

    if( this.bengalTime >= 1/30 ) {

      this.bengalTime -= 1/30;
      this.bengalIndex++;

      if( this.bengalIndex >= 16 )
        this.bengalIndex = 0;

      this.bengalTexture.offset.x = (this.bengalIndex % 4) * 0.25;
      this.bengalTexture.offset.y = Math.floor( this.bengalIndex / 4 ) * 0.25;
    }

    // Scale
    if( this.bengalAlpha < 1 ) {

      this.bengalAlpha += deltaTime;

      if( this.isIntro ) {

        this.bengal.scale.x -= ( this.bengal.scale.x - 1 ) * deltaTime * 4;
      }
      else if( this.isOutro  && this.bengal.scale.x > 0 ) {

        this.bengal.scale.x = Math.max( 0.001, this.bengal.scale.x - deltaTime * 2 );
        this.bengalShadow.scale.x = this.bengalShadow.scale.y = this.bengal.scale.x;
      }

      this.bengal.scale.y = this.bengal.scale.x;
    }
    else if( ! this.isOutro ) {

      this.bengal.scale.x = this.bengal.scale.y = 0.25 + 0.5 * this.volume;
    }

    this.bengalShadow.scale.x = this.bengalShadow.scale.y = this.bengal.scale.x;

    // Position + rotation
    this.bengalPosition.x = this.voxPosition.x;
    this.bengalPosition.y = this.voxPosition.y;
    this.bengalPosition.z = this.voxPosition.z;
    this.bengal.lookAt( this.director.view.camera.position );

    this.bengalShadow.position.x = this.voxPosition.x;
    this.bengalShadow.position.y = this.voxPosition.y;
    this.bengalShadow.position.z = this.voxPosition.z;
    this.bengalShadow.lookAt( this.director.view.camera.position );
  },

  // _______________________________________________________________________________________ Particles

  createParticles: function() {

    var p, pl, particle, vertices, particles;

    // Geometry
    this.particleGeometry = new THREE.Geometry();
    vertices = this.particleGeometry.vertices;
    particles = this.particles = [];

    // Particles
    for( p = 0, pl = this.particleCount; p < pl; p++ ) {

      particle = new LIGHTS.VoxParticle();

      vertices.push( new THREE.Vertex( particle.positionStart ) );
      vertices.push( new THREE.Vertex( particle.positionEnd ) );
      particles.push( particle );
    }

    // Material
    this.lineMaterial = new THREE.LineBasicMaterial( {

      color:          0xFF8040,
      linewidth:      1,
      blending:       THREE.AdditiveBlending,
      transparent:    true,
      depthTest:      false
    } );

    // Line System
    this.lineSystem = new THREE.Line( this.particleGeometry, this.lineMaterial, THREE.LinePieces );
    this.lineSystem.dynamic = true;
    this.lineSystem.visible = false;
    this.director.view.scene.addChild( this.lineSystem );
  },

  setupParticlesIntro: function() {

    var particles = this.particles,
    positionX = this.voxPosition.x,
    positionY = this.voxPosition.y,
    positionZ = this.voxPosition.z,
    u, a, r, s, p, pl, particle, pos, normal;

    for( p = 0, pl = this.particleCount; p < pl; p++ ) {

      particle = particles[ p ];

      u = Math.random() * 2 - 1;
      a = Math.random() * rad360;
      r = Math.sqrt( 1 - u * u );

      normal = particle.normal;
      normal.x = Math.cos( a ) * r;
      normal.y = Math.sin( a ) * r;
      normal.z = u;

      s = Math.random() * 50 + 100;

      pos = particle.positionStart;
      pos.x = positionX + normal.x * s;
      pos.y = positionY + normal.y * s;
      pos.z = positionZ + normal.z * s;

      pos = particle.positionEnd;
      pos.x = positionX + normal.x * s;
      pos.y = positionY + normal.y * s;
      pos.z = positionZ + normal.z * s;

      particle.end = particle.start = s;
      particle.startVelocity = Math.random() * s * 0.5 + s;
      particle.endVelocity = Math.random() * s * 0.5 + s;
    }

    this.particleGeometry.__dirtyVertices = true;

    this.lineMaterial.color.setHex( 0xFF8040 );

    this.introTime = 0;
  },

  updateParticlesIntro: function() {

    var deltaTime = LIGHTS.deltaTime,
    particles = this.particles,
    positionX = this.voxPosition.x,
    positionY = this.voxPosition.y,
    positionZ = this.voxPosition.z,
    p, pl, particle, pos, normal, radius;

    for( p = 0, pl = this.particleCount; p < pl; p++ ) {

      particle = particles[ p ];

      particle.start = Math.max( 0, particle.start - deltaTime * particle.startVelocity );
      particle.end = Math.max( 0, particle.end - deltaTime * particle.endVelocity );

      normal = particle.normal;

      radius = particle.start;
      pos = particle.positionStart;
      pos.x = positionX + normal.x * radius;
      pos.y = positionY + normal.y * radius;
      pos.z = positionZ + normal.z * radius;

      radius = particle.end;
      pos = particle.positionEnd;
      pos.x = positionX + normal.x * radius;
      pos.y = positionY + normal.y * radius;
      pos.z = positionZ + normal.z * radius;
    }

    this.particleGeometry.__dirtyVertices = true;

    this.introTime += deltaTime;

    if( this.introTime > 0.75 && ! this.bengal.visible )
      this.launchBengal();
  },

  setupParticlesOutro: function() {

    var particles = this.particles,
    positionX = this.voxPosition.x,
    positionY = this.voxPosition.y,
    positionZ = this.voxPosition.z,
    p, pl, particle, pos;

    for( p = 0, pl = this.particleCount; p < pl; p++ ) {

      particle = particles[ p ];

      pos = particle.positionStart;
      pos.x = positionX;
      pos.y = positionY;
      pos.z = positionZ;

      pos = particle.positionEnd;
      pos.x = positionX;
      pos.y = positionY;
      pos.z = positionZ;

      particle.end = particle.start = 50 - Math.random() * 100;
    }

    this.particleGeometry.__dirtyVertices = true;

    this.outroTime = 0;
  },

  updateParticlesOutro: function() {

    var deltaTime = LIGHTS.deltaTime,
    particles = this.particles,
    positionX = this.voxPosition.x,
    positionY = this.voxPosition.y,
    positionZ = this.voxPosition.z,
    p, pl, particle, pos, normal, radius, color, dark;

    for( p = 0, pl = this.particleCount; p < pl; p++ ) {

      particle = particles[ p ];

      particle.start += deltaTime * particle.startVelocity;
      particle.end += deltaTime * particle.endVelocity;

      if( particle.start > 0 && particle.end > 0 ) {

        normal = particle.normal;

        radius = particle.start;
        pos = particle.positionStart;
        pos.x = positionX + normal.x * radius;
        pos.y = positionY + normal.y * radius;
        pos.z = positionZ + normal.z * radius;

        radius = particle.end;
        pos = particle.positionEnd;
        pos.x = positionX + normal.x * radius;
        pos.y = positionY + normal.y * radius;
        pos.z = positionZ + normal.z * radius;
      }
    }

    this.particleGeometry.__dirtyVertices = true;

    this.outroTime += deltaTime;

    if( this.outroTime > 1 ) {

      color = this.lineMaterial.color;
      dark = 1 - deltaTime * 4;
      color.r *= dark;
      color.g *= dark;
      color.b *= dark;

      if( this.outroTime > 1.7 )
        this.stop();
    }
  }
};

LIGHTS.VoxParticle = function() {

  this.positionStart = new THREE.Vector3();
  this.positionEnd = new THREE.Vector3();
  this.normal = new THREE.Vector3();
};

