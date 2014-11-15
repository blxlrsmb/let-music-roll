//File: Terrain.js
//Date: Sat Nov 15 00:27:33 2014 +0800


LIGHTS.Terrain = function( director ) {

	this.initialize( director );
};

LIGHTS.Terrain.prototype = {

    mapResolution:          66,//32,
    tileSize:               480, //320,//640,
    gridSize:               5,
    height:                 140, // 256,

    selectedTile:           null,
    randomVertexIndex:      null,
    randomVertexPosition:   new THREE.Vector3(),
    randomPosition:         new THREE.Vector3(),
    randomNormal:           new THREE.Vector3(),
	randomX:                null,
	randomY:                null,

    tiles:                  [],
    tileIdSet:              {},
	usedVertices:           [],

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.director = director;

        this.scene = director.view.scene;
        this.player = director.player;
        this.camera = this.player.camera;
        this.gridRadius = Math.floor( this.gridSize / 2 );

        // Create tiles
        var x, y, tile;

        for( x = 0; x < this.gridSize; x++ ) {

            this.tiles[ x ] = [];

            for( y = 0; y < this.gridSize; y++ ) {

                tile = new THREE.Object3D();
                tile.visible = false;
                tile.justOn = tile.justOff = tile.justMoved = false;
                this.tiles[ x ][ y ] = tile;
            }
        }

        // TerrainPlane
        this.terrainPlane = new LIGHTS.TerrainPlane( this.tileSize, this.mapResolution, this.height, LIGHTS.images[ 'terrain' + this.mapResolution ] );
		this.displacement = new LIGHTS.TerrainDisplacement( this );

		// usedVertices
		for( x = 0; x <= this.terrainPlane.resolution; x++ ) {

			this.usedVertices[ x ] = [];

			for( y = 0; y <= this.terrainPlane.resolution; y++ )
				this.usedVertices[ x ][ y ] = false;
		}
	},

    // _______________________________________________________________________________________ Update

    update: function() {

        // Tiles
        var cameraX = this.camera.position.x,
            cameraY = this.camera.position.z,
            sin = Math.sin( this.player.angle ),
            cos = Math.cos( this.player.angle ),
            x, y, r, angle, deltaX, deltaY, tile, tileX, tileY, tileId, tileVisible;

        this.cameraTileX = (Math.round( cameraX / this.tileSize ) - this.gridRadius) * this.tileSize;
        this.cameraTileY = (Math.round( cameraY / this.tileSize ) - this.gridRadius) * this.tileSize;

        // Clear idTableSet
        for( tileId in this.tileIdSet )
            delete this.tileIdSet[ tileId ];

        // Update grid
        for( x = 0; x < this.gridSize; x++ ) {

            for( y = 0; y < this.gridSize; y++ ) {

                tileX = this.cameraTileX + this.tileSize * x;
                tileY = this.cameraTileY + this.tileSize * y;
                deltaX = (tileX - cameraX);
                deltaY = (tileY - cameraY);
                angle = Math.atan2( deltaX, deltaY );

                r = Math.floor( Math.max( Math.abs( x - this.gridRadius ), Math.abs( y - this.gridRadius ) ) );

                // Visible?
                /*
                    // sin (s – t) = sin s cos t – cos s sin t
                    cos (s – t) = cos s cos t + sin s sin t
                 */
                if( r > 1 )
                    tileVisible = (cos * Math.cos( angle ) + sin * Math.sin( angle )) < -0.5; // Far cull angle delta cos
                else if( r == 1 )
                    tileVisible = (cos * Math.cos( angle ) + sin * Math.sin( angle )) < 0.5; // Near cull angle delta cos
                else
                    tileVisible = true;

                // Update tile
                tile = this.tiles[ x ][ y ];

                if( tileVisible ) {

                    tile.justOff = false;
                    tile.justOn = ! tile.visible;

                    if( tile.justOn ) {

                        this.scene.addChild( tile );
                        tile.visible = true;
                    }

                    tileId = tileX + "/" + tileY;
                    this.tileIdSet[ tileId ] = true;
                    tile.justMoved = (tile.tileId != tileId);

                    if( tile.justMoved ) {

                        tile.position.x = tileX;
                        tile.position.z = tileY;
                        tile.tileId = tileId;
                    }
                }
                else {

                    tile.justOff = tile.visible;
                    tile.justOn = false;

                    if( tile.justOff ) {

                        this.scene.removeChild( tile );
                        tile.visible = false;
                    }
                }
            }
        }

	    // Displacement
	    if( this.displacement.active )
	        this.displacement.update();
    },

    // _______________________________________________________________________________________ Public

    isVisible: function( posX, posY ) {

        var posTileX = (Math.round( posX / this.tileSize ) - this.gridRadius) * this.tileSize,
            posTileY = (Math.round( posY / this.tileSize ) - this.gridRadius) * this.tileSize,
            x = (posTileX - this.cameraTileX) / this.tileSize + this.gridRadius,
            y = (posTileY - this.cameraTileY) / this.tileSize + this.gridRadius;

        if( isNaN( x ) || isNaN( y ) || x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize )
            return false;
        else
            return this.tiles[ x ][ y ].visible;
    },

	reset: function() {

		var x, y;

		for( x = 0; x <= this.terrainPlane.resolution; x++ )
			for( y = 0; y <= this.terrainPlane.resolution; y++ )
				this.usedVertices[ x ][ y ] = false;

		this.terrainPlane.resetVertices();
	},

    // _______________________________________________________________________________________ Select

    selectTile: function( x, y ) {

        this.selectedTile = this.tiles[ x ][ y ];
    },

    selectTileById: function( tileId ) {

        var x, y, tilesX;

        for( x = 0; x < this.gridSize; x++ ) {

            tilesX = this.tiles[ x ];

            for( y = 0; y < this.gridSize; y++ ) {

                if( tilesX[ y ].tileId == tileId ) {

                    this.selectedTile = tilesX[ y ];
                    return true;
                }
            }
        }

        return false;
    },

    selectCenterTile: function() {

        this.selectedTile = this.tiles[ this.gridRadius ][ this.gridRadius ];
    },

    selectRandomTile: function( radius ) {

        this.selectRandomTileAtRadius( Math.floor( Math.random() * this.gridRadius ) );
    },

    selectRandomTileAtRadius: function( radius ) {

        var tries = 100,
	        x, y, t;

        do {
            x = this.gridRadius + radius * ((Math.random() > 0.5)? 1 : -1);
            y = this.gridRadius - radius + Math.floor( Math.random() * radius * 2 );

            // Swap X/Y
            if( Math.random() > 0.5 ) {

                t = x;
                x = y;
                y = t;
            }

            this.selectedTile = this.tiles[ x ][ y ];

        } while( --tries > 0 && ! this.selectedTile.visible );

		if( tries == 0 ) {

			console.log( this.selectedTile.visible, x, y, radius );
			console.error( "ERROR: Terrain.selectRandomTileAtRadius: Not found" );
		}
    },

    selectTerrainRandomVertex: function( empty, radius, border ) {

	    this.selectTerrainRandomCoords( empty, radius, border );

	    if( empty )
			this.usedVertices[ this.randomX ][ this.randomY ] = true;

        this.randomVertexIndex = this.terrainPlane.indexGrid[ this.randomX ][ this.randomY ];
//        this.randomVertexIndex = Math.floor( Math.random() * this.terrainPlane.vertices.length );
	    this.randomVertex = this.terrainPlane.vertices[ this.randomVertexIndex ];
        this.randomVertexPosition.copy( this.randomVertex.position );
        this.randomPosition.add( this.selectedTile.position, this.randomVertexPosition );
        this.randomNormal = this.terrainPlane.vertexNormals[ this.randomVertexIndex ];
    },

	selectTerrainRandomCoords: function( empty, radius, border ) {

	    var resolution = this.terrainPlane.resolution,
	        usedVertices = this.usedVertices,
		    tries = 100,
	        radius2 = empty? radius * radius : 0,
	        stillEmpty, x, y, ix, iy, ixl, iyl, dx, dy;

		if( border === undefined ) border = 0;

		do {
			var log = Math.random() > 0.98;

		    x = border + Math.floor( Math.random() * (resolution - border * 2) );
		    y = border + Math.floor( Math.random() * (resolution - border * 2) );

			if( empty ) {

				stillEmpty = true;

				for( ix = x - radius, ixl = x + radius; ix < ixl && stillEmpty; ix++ ) {

					dx = (x - ix) * (x - ix);

					for( iy = y - radius, iyl = y + radius; iy < iyl && stillEmpty; iy++ ) {

						dy = (y - iy) * (y - iy);

						if( dx + dy <= radius2 )
							stillEmpty = ! usedVertices[ Math.abs( ix % resolution ) ][ Math.abs( iy % resolution ) ];
					}
				}
			}
			else stillEmpty = false;

	    } while( --tries > 0 && empty && ! stillEmpty );

		if( tries == 0 ) {

			console.log( "ERROR: Terrain.selectTerrainRandomCoords: Not found" );
		}
		else if( empty ) {

			for( ix = x - radius, ixl = x + radius; ix < ixl && stillEmpty; ix++ ) {

				dx = x - ix;

				for( iy = y - radius, iyl = y + radius; iy < iyl && stillEmpty; iy++ )

					dy = y - iy;

					if( dx * dx + dy * dy <= radius2 )
						usedVertices[ Math.abs( ix % resolution ) ][ Math.abs( iy % resolution ) ] = true;
			}
		}

		this.randomX = x;
		this.randomY = y;
    }
};
/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 06/08/2011
 * Time: 19:45
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.TerrainDisplacement = function( terrain ) {

	this.initialize( terrain );
};

LIGHTS.TerrainDisplacement.prototype = {

    // _______________________________________________________________________________________ Group

    active:         false,

    // _______________________________________________________________________________________ Constructor

	initialize: function( terrain ) {

		this.terrain = terrain;
        this.terrainPlane = terrain.terrainPlane;
		this.spectrum = null;

		// Flat2Terrain
		this.velocities = [];

		var xl = this.terrainPlane.resolution,
			x;

		for( x = 0; x < xl; x++ )
			this.velocities[ x ] = [];
	},

    update: function() {

	    switch( LIGHTS.Music.phase.index ) {

			case 15:
			case 21:
		        this.updateSpectrum();
		        break;

			case 16:
			case 22:
		        this.updateFlat();
		        break;

			case 17:
		        this.updateTerrain();
		        break;
	    }
    },

	updateSpectrum: function() {

		var grid = this.terrainPlane.grid,
		    heightGrid = this.terrainPlane.heightGrid,
		    spectrum = this.spectrum,
			resolution = this.terrainPlane.resolution,
		    r2 = resolution / 2,
			x, xl, y, yl, gridX, heightGridX, dx2, dy2, i;

		for( x = 0, xl = resolution; x < xl; x++ ) {

			gridX = grid[ x ];
			heightGridX = heightGrid[ x ];
			dx2 = (x - r2) * (x - r2);

			for( y = 0, yl = resolution; y < yl; y++ ) {

				dy2 = (y - r2) * (y - r2);
				i = Math.floor( Math.sqrt( dx2 + dy2 ) );
				gridX[ y ].y = heightGridX[ y ] + spectrum[ i ];
			}
		}
//console.log( spectrum[ 0 ], spectrum[ 1 ], spectrum[ 2 ], spectrum[ 3 ] );
		this.terrainPlane.tileBorders();
		this.terrainPlane.computeFaceNormals();
		this.terrainPlane.computeVertexNormals();
    },

	updateTerrain: function() {

		var grid = this.terrainPlane.grid,
		    heightGrid = this.terrainPlane.heightGrid,
			resolution = this.terrainPlane.resolution,
			velocities = this.velocities,
			deltaTime = LIGHTS.deltaTime * 0.5,
			drag = 1 - LIGHTS.deltaTime * 5,
			x, xl, y, yl, gridX, gridXY, posY, heightGridX, velocity, velocityX;

		for( x = 0, xl = resolution; x < xl; x++ ) {

			gridX = grid[ x ];
			heightGridX = heightGrid[ x ];
			velocityX = velocities[ x ];

			for( y = 0, yl = resolution; y < yl; y++ ) {

				gridXY = gridX[ y ];
				posY = gridXY.y;
				velocityX[ y ] *= drag;
				velocityX[ y ] += (heightGridX[ y ] - posY) * (Math.abs( posY ) * deltaTime);
				gridXY.y += velocityX[ y ];

//				gridXY.y -= (gridXY.y - heightGridX[ y ]) * ease;
			}
		}

		this.terrainPlane.tileBorders();
		this.terrainPlane.computeFaceNormals();
		this.terrainPlane.computeVertexNormals();
    },

	updateFlat: function() {

		var grid = this.terrainPlane.grid,
			resolution = this.terrainPlane.resolution,
			ease = LIGHTS.deltaTime * 4,
			x, xl, y, yl, gridX, gridXY;

		for( x = 0, xl = resolution; x < xl; x++ ) {

			gridX = grid[ x ];

			for( y = 0, yl = resolution; y < yl; y++ ) {

				gridXY = gridX[ y ];
				gridXY.y -= gridXY.y * ease;
			}
		}

		this.terrainPlane.tileBorders();
		this.terrainPlane.computeFaceNormals();
		this.terrainPlane.computeVertexNormals();
    },

	launchFlat2Terrain: function() {

		var resolution = this.terrainPlane.resolution,
			heightGrid = this.terrainPlane.heightGrid,
			x, xl, y, yl;

		for( x = 0, xl = resolution; x < xl; x++ )
			for( y = 0, yl = resolution; y < yl; y++ )
//				this.velocities[ x ][ y ] = heightGrid[ x ][ y ] / 100;
				this.velocities[ x ][ y ] = 0;
	}
};

    // _______________________________________________________________________________________ Update
/*
	// update() on bump
	update_Bump: function() {

		this.active = (this.bumps.length > 0);

		if( this.active ) {

			for( var i = 0; i < this.bumps.length; i++ )
				this.updateBump( this.bumps[ i ] );

			this.terrainPlane.computeFaceNormals();
			this.terrainPlane.computeVertexNormals();
		}
	},

	createBump: function( h ) {

		this.terrain.selectTerrainRandomCoords( false );

		var x = this.terrain.randomX,
			y = this.terrain.randomY,
			r = 10;

//		console.log( this.terrainPlane.grid[ x ][ y ].y );

		if( this.terrainPlane.grid[ x ][ y ].y > 20 )
			h = -h;

		if( this.bumps === undefined )
			this.bumps = [];

		this.bumps.push( new LIGHTS.Bump( x, y, r, h ) );
	},

	updateBump: function( bump ) {

		var a = bump.a - (bump.a - 1) * LIGHTS.deltaTime;

		this.terrainPlane.displaceVertex( bump.x, bump.y, bump.r, bump.h * (a - bump.a) );
		bump.a = a;

		if( bump.a > 0.99 ) {

			this.bumps.splice( this.bumps.indexOf( bump ), 1 );
			delete bump;
		}
	}
};

LIGHTS.Bump = function( x, y, r, h ) {

	this.x = x;
	this.y = y;
	this.r = r;
	this.h = h;
	this.a = 0;
};
*/

LIGHTS.TerrainMap = function( renderer ) {

	this.initialize( renderer );
};

LIGHTS.TerrainMap.size = 512;
LIGHTS.TerrainMap.uvOffset = 0.2;

LIGHTS.TerrainMap.prototype = {

	post:       true,
    opacity:    0.98,
    subtract:   0.005,

    // _______________________________________________________________________________________ Constructor

	initialize: function( renderer ) {

        this.renderer = renderer;

        var size = LIGHTS.TerrainMap.size,
	        sizeHalf = size / 2,
            postSize = size * (1 + 2 * LIGHTS.TerrainMap.uvOffset),
            postSizeHalf = postSize * 0.5,
            postTextureParams = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat },
            textureParams = { minFilter: THREE.LinearMipMapLinearFilter, magFilter: THREE.LinearMipMapLinearFilter, format: THREE.RGBFormat },
            screenShader, screenUniforms, screenFragmentShader, texturedUniforms, texturedFragmentShader, combinedUniforms, combinedMaterial, texturedQuad, planeGeometry;

        this.offset = size * LIGHTS.TerrainMap.uvOffset;
        this.viewRadius = postSizeHalf;

        this.camera = new THREE.Camera();
        this.camera.projectionMatrix = THREE.Matrix4.makeOrtho( -postSizeHalf, postSizeHalf, postSizeHalf, -postSizeHalf, -10000, 10000 ),
        this.camera.position.z = 100;

		this.scene = new THREE.Scene();
        this.postTexture = new THREE.WebGLRenderTarget( postSize, postSize, postTextureParams );

        // Postprocessing
        this.postCamera = new THREE.Camera();
        this.postCamera.projectionMatrix = THREE.Matrix4.makeOrtho( -sizeHalf, sizeHalf, sizeHalf, -sizeHalf, -10000, 10000 ),
        this.postCamera.position.z = 100;

        this.postScene = new THREE.Scene();
        this.glowScene = new THREE.Scene();

		// Textures
        this.texture = new THREE.WebGLRenderTarget( size, size, textureParams );
		this.combinedTexture = new THREE.WebGLRenderTarget( size, size, postTextureParams );
        this.canvasTexture = new THREE.WebGLRenderTarget( size, size, postTextureParams );

        // Screen Material
        screenShader = THREE.ShaderUtils.lib["screen"];
		screenUniforms = { tDiffuse: { type: "t", value: 0, texture: this.postTexture }	};

		screenFragmentShader = [

			"varying vec2 vUv;",
			"uniform sampler2D tDiffuse;",

			"void main() {",

				"gl_FragColor = texture2D( tDiffuse, vUv );",
			"}"

		].join("\n");

        this.screenMaterial = new THREE.MeshShaderMaterial( {

            uniforms: screenUniforms,
            vertexShader: screenShader.vertexShader,
            fragmentShader: screenFragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true
        } );

        // Textured Material
        texturedUniforms = {

            tDiffuse:   { type: "t", value: 0, texture: this.canvasTexture },
            opacity:    { type: "f", value: this.opacity },
            subtract:   { type: "f", value: this.subtract }
        };

        texturedFragmentShader = [

            "varying vec2 vUv;",
            "uniform sampler2D tDiffuse;",
            "uniform float opacity;",
            "uniform float subtract;",

            "void main() {",

                "vec4 texel = texture2D( tDiffuse, vUv );",
                "texel.r = min( texel.r - subtract, texel.r * opacity );",
                "texel.g = min( texel.g - subtract, texel.g * opacity );",
                "texel.b = min( texel.b - subtract, texel.b * opacity );",
                "gl_FragColor = texel;",
            "}"

        ].join("\n");

        this.texturedMaterial = new THREE.MeshShaderMaterial( {

            uniforms: texturedUniforms,
            vertexShader: screenShader.vertexShader,
            fragmentShader: texturedFragmentShader
        } );

		// Combined Material
        combinedUniforms = THREE.UniformsUtils.clone( screenUniforms );
        combinedUniforms["tDiffuse"].texture = this.combinedTexture;

		combinedMaterial = new THREE.MeshShaderMaterial( {

		    uniforms: combinedUniforms,
		    vertexShader: screenShader.vertexShader,
		    fragmentShader: screenFragmentShader
		} );

		// Quads
		planeGeometry = new THREE.PlaneGeometry( size, size );
        texturedQuad = new THREE.Mesh( planeGeometry, this.texturedMaterial );
        texturedQuad.position.z = -10;
        this.postScene.addObject( texturedQuad );

        // Tiled quads
        this.setupTiledQuad();

        // Combined
        this.combinedScene = new THREE.Scene();

		// Combined Quad
        this.combinedQuad = new THREE.Mesh( planeGeometry, combinedMaterial );
		this.combinedScene.addObject( this.combinedQuad );

		var canvasQuad = new THREE.Mesh( new THREE.PlaneGeometry( postSize, postSize ), new THREE.MeshBasicMaterial( { map: this.canvasTexture } ) );
		canvasQuad.z = -10;
		this.glowScene.addObject( canvasQuad );

		// Combined Black
		this.combinedColor = new THREE.Mesh( planeGeometry, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
		this.combinedColor.position.z = 10;
		this.combinedColor.visible = false;
		this.combinedScene.addObject( this.combinedColor );

        // Test
//        this.tests = [];
//        var colors = [ 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFF0000, 0x00FF00, 0x0000FF ];
//
//        for( var i = 0; i < colors.length; i++ ) {
//
//            var test = new THREE.Mesh( new THREE.SphereGeometry( 300, 10, 10 ), new THREE.MeshBasicMaterial( {wireframe: true, color: colors[ i ] } ) );
//            test.position.x = Math.random() * 200 - 100;
//            test.position.y = Math.random() * 200 - 100;
//            test.speed = 0.005 * Math.random();
//            this.scene.addChild( test );
//            this.tests.push( test );
//        }
    },

    // _______________________________________________________________________________________ Setup

	setupTiledQuad: function() {

		var s = LIGHTS.TerrainMap.size,
			v1 = s / 2,
			u0 = LIGHTS.TerrainMap.uvOffset,
			u1 = 1 - LIGHTS.TerrainMap.uvOffset,
			v0 = (0.5 - LIGHTS.TerrainMap.uvOffset) * v1,
			quad, combined;

		// Center
		combined = new THREE.PlaneGeometry( s, s );
		this.setQuadUVs( combined, u0, u0, u0, u1, u1, u1, u1, u0 );

		// Left
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, v0, v1, v0, -v1, v1, -v1, v1, v1 );
		this.setQuadUVs( quad, 0, u0, 0, u1, u0, u1, u0, u0 );
		GeometryUtils.merge( combined, quad );

		// Right
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, -v1, v1, -v1, -v1, -v0, -v1, -v0, v1 );
		this.setQuadUVs( quad, u1, u0, u1, u1, 1, u1, 1, u0 );
		GeometryUtils.merge( combined, quad );

		// Top
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, -v1, v1, -v1, v0, v1, v0, v1, v1 );
		this.setQuadUVs( quad, u0, u1, u0, 1, u1, 1, u1, u1 );
		GeometryUtils.merge( combined, quad );

		// Bottom
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, -v1, -v0, -v1, -v1, v1, -v1, v1, -v0 );
		this.setQuadUVs( quad, u0, 0, u0, u0, u1, u0, u1, 0 );
		GeometryUtils.merge( combined, quad );

		// Top Left
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, v0, v1, v0, v0, v1, v0, v1, v1 );
		this.setQuadUVs( quad, 0, u1, 0, 1, u0, 1, u0, u1 );
		GeometryUtils.merge( combined, quad );

		// Top Right
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, -v1, v1, -v1, v0, -v0, v0, -v0, v1 );
		this.setQuadUVs( quad, u1, u1, u1, 1, 1, 1, 1, u1 );
		GeometryUtils.merge( combined, quad );

		// Bottom Left
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, v0, -v0, v0, -v1, v1, -v1, v1, -v0 );
		this.setQuadUVs( quad, 0, 0, 0, u0, u0, u0, u0, 0 );
		GeometryUtils.merge( combined, quad );

		// Bottom Right
		quad = new THREE.PlaneGeometry( s, s );
		this.setQuadVertices( quad, -v1, -v0, -v1, -v1, -v0, -v1, -v0, -v0 );
		this.setQuadUVs( quad, u1, 0, u1, u0, 1, u0, 1, 0 );
		GeometryUtils.merge( combined, quad );

		// Add to scene
        this.postScene.addObject( new THREE.Mesh( combined, this.screenMaterial ) );
	},
/*
    setupTiledQuads: function() {

        var v1 = LIGHTS.TerrainMap.size / 2,
            u0 = LIGHTS.TerrainMap.uvOffset,
            u1 = 1 - LIGHTS.TerrainMap.uvOffset,
            v0 = (0.5 - LIGHTS.TerrainMap.uvOffset) * v1,
            quad;

        // Center
        quad = this.createQuad();
        this.setQuadUVs( quad, u0, u0, u0, u1, u1, u1, u1, u0 );

        // Left
        quad = this.createQuad();
        this.setQuadVertices( quad, v0, v1, v0, -v1, v1, -v1, v1, v1 );
        this.setQuadUVs( quad, 0, u0, 0, u1, u0, u1, u0, u0 );

        // Right
        quad = this.createQuad();
        this.setQuadVertices( quad, -v1, v1, -v1, -v1, -v0, -v1, -v0, v1 );
        this.setQuadUVs( quad, u1, u0, u1, u1, 1, u1, 1, u0 );

        // Top
        quad = this.createQuad();
        this.setQuadVertices( quad, -v1, v1, -v1, v0, v1, v0, v1, v1 );
        this.setQuadUVs( quad, u0, u1, u0, 1, u1, 1, u1, u1 );

        // Bottom
        quad = this.createQuad();
        this.setQuadVertices( quad, -v1, -v0, -v1, -v1, v1, -v1, v1, -v0 );
        this.setQuadUVs( quad, u0, 0, u0, u0, u1, u0, u1, 0 );

        // Top Left
        quad = this.createQuad();
        this.setQuadVertices( quad, v0, v1, v0, v0, v1, v0, v1, v1 );
        this.setQuadUVs( quad, 0, u1, 0, 1, u0, 1, u0, u1 );

        // Top Right
        quad = this.createQuad();
        this.setQuadVertices( quad, -v1, v1, -v1, v0, -v0, v0, -v0, v1 );
        this.setQuadUVs( quad, u1, u1, u1, 1, 1, 1, 1, u1 );

        // Bottom Left
        quad = this.createQuad();
        this.setQuadVertices( quad, v0, -v0, v0, -v1, v1, -v1, v1, -v0 );
        this.setQuadUVs( quad, 0, 0, 0, u0, u0, u0, u0, 0 );

        // Bottom Right
        quad = this.createQuad();
        this.setQuadVertices( quad, -v1, -v0, -v1, -v1, -v0, -v1, -v0, -v0 );
        this.setQuadUVs( quad, u1, 0, u1, u0, 1, u0, 1, 0 );
    },

    createQuad: function() {

        var screenQuad = new THREE.Mesh( new THREE.PlaneGeometry( LIGHTS.TerrainMap.size, LIGHTS.TerrainMap.size ), this.screenMaterial );
        this.postScene.addObject( screenQuad );

        return screenQuad;
    },
*/
    setQuadVertices: function( quad, x0, y0, x1, y1, x2, y2, x3, y3 ) {

        var geo = (quad instanceof THREE.Mesh)? quad.geometry : quad;
	        vertices = geo.vertices,
            face = geo.faces[0],
            a = vertices[ face.a ].position,
            b = vertices[ face.b ].position,
            c = vertices[ face.c ].position,
            d = vertices[ face.d ].position;

        a.x = x0;
        a.y = y0;
        b.x = x1;
        b.y = y1;
        c.x = x2;
        c.y = y2;
        d.x = x3;
        d.y = y3;
    },

    setQuadUVs: function( quad, u0, v0, u1, v1, u2, v2, u3, v3 ) {

	    var geo = (quad instanceof THREE.Mesh)? quad.geometry : quad;
		    uvs = geo.faceVertexUvs[ 0 ][ 0 ];

        uvs[ 0 ].u = u0;
        uvs[ 0 ].v = v0;
        uvs[ 1 ].u = u1;
        uvs[ 1 ].v = v1;
        uvs[ 2 ].u = u2;
        uvs[ 2 ].v = v2;
        uvs[ 3 ].u = u3;
        uvs[ 3 ].v = v3;
    },

   // _______________________________________________________________________________________ Update

    update: function() {

	    if( this.post ) {

	        // Render scene
	        this.renderer.render( this.scene, this.camera, this.postTexture, true );

			// Postprocessing
	        this.texturedMaterial.uniforms.opacity.value = this.opacity;
	        this.texturedMaterial.uniforms.subtract.value = this.subtract;
			this.renderer.render( this.postScene, this.postCamera, this.combinedTexture, true );

			// Render canvas
			this.renderer.render( this.combinedScene, this.postCamera, this.canvasTexture, true );

			// Render glows
		    this.renderer.render( this.glowScene, this.camera, this.texture, true );
	    }
	    else {

	        // Render scene
		    this.renderer.render( this.scene, this.camera, this.texture, true );
	    }
    },

    clear: function( color ) {

	    if( color === undefined ) color = 0x000000;

	    this.combinedColor.materials[ 0 ].color.setHex( color );
	    this.combinedColor.visible = true;
	    this.combinedQuad.visible = false;

        this.renderer.render( this.combinedScene, this.postCamera, this.canvasTexture, true );

	    this.combinedColor.visible = false;
	    this.combinedQuad.visible = true;
    }
};

/**
 * @author mr.doob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */

LIGHTS.TerrainPlane = function( size, resolution, height, image ) {

	THREE.Geometry.call( this );

	this.resolution = resolution;
	this.segmentSize = size / resolution;

    var ix, iy, x, y,
    sizeHalf = size / 2,
    resolution1 = resolution + 1,
    segmentSize = this.segmentSize,
    vertex, vertexPosition, a, b, c, d, heightMap;

    heightMap = createHeightMap( resolution, height, image );

    this.grid = [];
    this.vertexGrid = [];
	this.uvGrid = [];
	this.indexGrid = [];
	this.heightGrid = [];

    // Vertices
    for( ix = 0; ix <= resolution; ix++ ) {

        x = ix * segmentSize - sizeHalf;
        this.grid[ ix ] = [];
        this.vertexGrid[ ix ] = [];
	    this.indexGrid[ ix ] = [];
	    this.heightGrid[ ix ] = [];

        for( iy = 0; iy <= resolution; iy++ ) {

            y = iy * segmentSize - sizeHalf;
            vertexPosition = new THREE.Vector3( x, heightMap[ ix ][ iy ], y );
            vertex = new THREE.Vertex( vertexPosition );

            this.grid[ ix ][ iy ] = vertexPosition;
            this.vertexGrid[ ix ][ iy ] = vertex;
            this.indexGrid[ ix ][ iy ] = this.vertices.length;
	        this.heightGrid[ ix ][ iy ] = vertexPosition.y;

	        this.vertices.push( vertex );
		}
	}

	// UVs
	for( ix = 0; ix <= resolution; ix++ ) {

		this.uvGrid[ ix ] = [];

	    for( iy = 0; iy <= resolution; iy++ )
			this.uvGrid[ ix ][ iy ] = new THREE.UV( iy / resolution, ix / resolution );
	}

    // Faces
    for( ix = 0; ix < resolution; ix++ ) {

        for( iy = 0; iy < resolution; iy++ ) {

			a = ix + resolution1 * iy;
            b = ( ix + 1 ) + resolution1 * iy;
			c = ( ix + 1 ) + resolution1 * ( iy + 1 );
            d = ix + resolution1 * ( iy + 1 );

			this.faces.push( new THREE.Face4( a, b, c, d ) );
			this.faceVertexUvs[ 0 ].push( [
				this.uvGrid[ ix     ][ iy     ],
				this.uvGrid[ ix + 1 ][ iy     ],
				this.uvGrid[ ix + 1 ][ iy + 1 ],
				this.uvGrid[ ix     ][ iy + 1 ]
            ] );
		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
    this.computeVertexNormals();

    this.vertexNormals = THREE.MeshUtils.getVertexNormals( this );

    // _______________________________________________________________________________________ Create Height Maps

    function createHeightMap( resolution, height, image ) {

        // ImageData
        var heightMap = [],
            imageCanvas = document.createElement( 'canvas' ),
            imageContext = imageCanvas.getContext( '2d' ),
            imageData, x, y, ix, iy, blurRadius, blurBuffer, blurAcc, bx, by;

        imageContext.drawImage( image, 0, 0 );
        imageData = imageContext.getImageData( 0, 0, resolution, resolution ).data;

        // Height map
        for( x = 0; x <= resolution; x++ )
            heightMap[ x ] = [];

        // Interior
        for( x = 0; x <= resolution; x++ ) {

            ix = (x < resolution)? x : 0;

            for( y = 0; y <= resolution; y++ ) {

                iy = (y < resolution)? y : 0;
                heightMap[ x ][ y ] = imageData[ (ix + iy * resolution) * 4 ];
            }
        }

        // Blur
        blurRadius = 2;
        blurBuffer = [];

        for( x = 0; x <= resolution; x++ )
            blurBuffer[ x ] = heightMap[ x ].slice( 0 );

        for( x = 0; x <= resolution; x++ ) {

            for( y = 0; y <= resolution; y++ ) {

                blurAcc = 0;

                for( by = -blurRadius; by <= blurRadius; by++ ) {

                    for( bx = -blurRadius; bx <= blurRadius; bx++ ) {

                        ix = x + bx;
                        iy = y + by;

                        if( ix < 0 )
                            ix += resolution;
                        else if( ix > resolution )
                            ix -= resolution;

                        if( iy < 0 )
                            iy += resolution;
                        else if( iy > resolution )
                            iy -= resolution;

                        blurAcc += blurBuffer[ ix ][ iy ];
                    }
                }

                heightMap[ x ][ y ] = blurAcc / ((blurRadius * 2 + 1) * (blurRadius * 2 + 1));
            }
        }

        // Scale
        for( x = 0; x <= resolution; x++ )
            for( y = 0; y <= resolution; y++ )
                heightMap[ x ][ y ] = height * ((heightMap[ x ][ y ] - 128) / 255);

        return heightMap;
    }
};

LIGHTS.TerrainPlane.prototype = new THREE.Geometry();
LIGHTS.TerrainPlane.prototype.constructor = LIGHTS.TerrainPlane;

// _______________________________________________________________________________________ Public

LIGHTS.TerrainPlane.prototype.displaceVertex = function( x, y, radius, height ) {

	var radius2 = radius * radius,
		diameter = radius * 2,
		resolution = this.resolution,
		grid = this.grid,
		ix, iy, dx2, dy2, gx, gy, gridX, gridX0, h;

	// Vertices
	for( ix = 0; ix < diameter; ix++ ) {

		dx2 = (ix - radius) * (ix - radius);
		gx = (resolution + x + ix - radius) % resolution;
		gridX = grid[ gx ];

		for( iy = 0; iy < diameter; iy++ ) {

			dy2 = (iy - radius) * (iy - radius);
			gy = (resolution + y + iy - radius) % resolution;
			h = Math.max( 0, 1 - ((dx2 + dy2) / radius2) );

			if( h > 0 )
				gridX[ gy ].y += height * (Math.sin( rad180 * h - rad90 ) + 1) * 0.5;
		}
	}

	// Fix tiled border
	gridX = grid[ resolution ];
	gridX0 = grid[ 0 ];

	for( iy = 0; iy <= resolution; iy++ )
		gridX[ iy ].y = gridX0[ iy ].y;

	for( ix = 0; ix < resolution; ix++ )
		grid[ ix ][ resolution ].y = grid[ ix ][ 0 ].y;

	// Dirty
	this.__dirtyVertices = true;
};

LIGHTS.TerrainPlane.prototype.tileBorders = function() {

	var resolution = this.resolution,
		grid = this.grid,
		ix, iy, dx2, dy2, gx, gy, gridX, gridX0, h;

	// Fix tiled border
	gridX = grid[ resolution ];
	gridX0 = grid[ 0 ];

	for( iy = 0; iy <= resolution; iy++ )
		gridX[ iy ].y = gridX0[ iy ].y;

	for( ix = 0; ix < resolution; ix++ )
		grid[ ix ][ resolution ].y = grid[ ix ][ 0 ].y;

	// Dirty
	this.__dirtyVertices = true;
};

LIGHTS.TerrainPlane.prototype.resetVertices = function() {

	for( x = 0; x <= this.resolution; x++ )
	    for( y = 0; y <= this.resolution; y++ )
		    this.grid[ x ][ y ].y = this.heightGrid[ x ][ y ];

	// Dirty
	this.__dirtyVertices = true;

	this.computeCentroids();
	this.computeFaceNormals();
    this.computeVertexNormals();
};


LIGHTS.TerrainDotAvatars = function( manager ) {

	this.initialize( manager );
};

LIGHTS.TerrainDotAvatars.prototype = {

	avatarCount:    9,

    // _______________________________________________________________________________________ Constructor

	initialize: function( manager ) {

		this.manager = manager;
		this.player = manager.director.player;

		this.avatars = [];

		var ellieCount = 0,
			userCount = 0,
			sizeX, sizeY, avatarImage, i, il;

		for( i = 0, il = this.avatarCount; i < il; i++ ) {

			sizeX = (i % 3 == 1)? 22 : 21;
			sizeY = (Math.floor( i / 3 ) == 1)? 22 : 21;
			sizeX = sizeY = 22;

			if( i % 2 == 0 )
				avatarImage = LIGHTS.images[ 'ellieAvatar' + ellieCount++ ];
			else
				avatarImage = LIGHTS.images[ 'avatar' + userCount++ ];

			avatar = new LIGHTS.TerrainDotAvatar( avatarImage, sizeX, sizeY );
			avatar.index = i;
			this.avatars.push( avatar );
		}
	}
};

// ___________________________________________________________________________________________ TerrainDotsWord

LIGHTS.TerrainDotAvatar = function( image, sizeX, sizeY ) {

	this.initialize( image, sizeX, sizeY );
};

LIGHTS.TerrainDotAvatar.prototype = {

	opacity:    2,

    // _______________________________________________________________________________________ Constructor

	initialize: function( image, sizeX, sizeY ) {

        // ImageData
        var imageCanvas = document.createElement( 'canvas' ),
            imageContext = imageCanvas.getContext( '2d' ),
            opacity = this.opacity, // Wipe
//            opacity = this.opacity / 255, // Fade
            imageData, colorsX, x, y, i, r, g, b;

        imageContext.drawImage( image, 0, 0, sizeX, sizeY );
        imageData = imageContext.getImageData( 0, 0, sizeX, sizeY ).data;

		this.width = sizeX;
		this.height = sizeY;

		// Dots
		this.colors = [];

		for( x = 0; x < sizeX; x++ ) {

			colorsX = [];

			for( y = 0; y < sizeY; y++ ) {

				i = (x + y * sizeX) * 4;

				// Wipe
				r = Math.floor( imageData[ i++ ] * opacity );
				g = Math.floor( imageData[ i++ ] * opacity );
				b = Math.floor( imageData[ i++ ] * opacity );
//				colorsX.push( (r << 16) + (g << 8) + b );
				colorsX.push( [ r / 255, g / 255, b / 255 ] );

				// Fade
//				r = imageData[ i++ ] * opacity;
//				g = imageData[ i++ ] * opacity;
//				b = imageData[ i++ ] * opacity;
//				colorsX.push( [ r, g, b ] );
			}

			this.colors.push( colorsX );
		}
	}
};

/*
//returns a function that calculates lanczos weight
function lanczosCreate(lobes){
  return function(x){
    if (x > lobes)
      return 0;
    x *= Math.PI;
    if (Math.abs(x) < 1e-16)
      return 1
    var xx = x / lobes;
    return Math.sin(x) * Math.sin(xx) / x / xx;
  }
}

//elem: canvas element, img: image element, sx: scaled width, lobes: kernel radius
function thumbnailer(elem, img, sx, lobes){
    this.canvas = elem;
    elem.width = img.width;
    elem.height = img.height;
    elem.style.display = "none";
    this.ctx = elem.getContext("2d");
    this.ctx.drawImage(img, 0, 0);
    this.img = img;
    this.src = this.ctx.getImageData(0, 0, img.width, img.height);
    this.dest = {
        width: sx,
        height: Math.round(img.height * sx / img.width),
    };
    this.dest.data = new Array(this.dest.width * this.dest.height * 3);
    this.lanczos = lanczosCreate(lobes);
    this.ratio = img.width / sx;
    this.rcp_ratio = 2 / this.ratio;
    this.range2 = Math.ceil(this.ratio * lobes / 2);
    this.cacheLanc = {};
    this.center = {};
    this.icenter = {};
    setTimeout(this.process1, 0, this, 0);
}

/*
thumbnailer.prototype.process1 = function(self, u){
    self.center.x = (u + 0.5) * self.ratio;
    self.icenter.x = Math.floor(self.center.x);
    for (var v = 0; v < self.dest.height; v++) {
        self.center.y = (v + 0.5) * self.ratio;
        self.icenter.y = Math.floor(self.center.y);
        var a, r, g, b;
        a = r = g = b = 0;
        for (var i = self.icenter.x - self.range2; i <= self.icenter.x + self.range2; i++) {
            if (i < 0 || i >= self.src.width)
                continue;
            var f_x = Math.floor(1000 * Math.abs(i - self.center.x));
            if (!self.cacheLanc[f_x])
                self.cacheLanc[f_x] = {};
            for (var j = self.icenter.y - self.range2; j <= self.icenter.y + self.range2; j++) {
                if (j < 0 || j >= self.src.height)
                    continue;
                var f_y = Math.floor(1000 * Math.abs(j - self.center.y));
                if (self.cacheLanc[f_x][f_y] == undefined)
                    self.cacheLanc[f_x][f_y] = self.lanczos(Math.sqrt(Math.pow(f_x * self.rcp_ratio, 2) + Math.pow(f_y * self.rcp_ratio, 2)) / 1000);
                weight = self.cacheLanc[f_x][f_y];
                if (weight > 0) {
                    var idx = (j * self.src.width + i) * 4;
                    a += weight;
                    r += weight * self.src.data[idx];
                    g += weight * self.src.data[idx + 1];
                    b += weight * self.src.data[idx + 2];
                }
            }
        }
        var idx = (v * self.dest.width + u) * 3;
        self.dest.data[idx] = r / a;
        self.dest.data[idx + 1] = g / a;
        self.dest.data[idx + 2] = b / a;
    }

    if (++u < self.dest.width)
        setTimeout(self.process1, 0, self, u);
    else
        setTimeout(self.process2, 0, self);
};

thumbnailer.prototype.process2 = function(self){
    self.canvas.width = self.dest.width;
    self.canvas.height = self.dest.height;
    self.ctx.drawImage(self.img, 0, 0);
    self.src = self.ctx.getImageData(0, 0, self.dest.width, self.dest.height);
    var idx, idx2;
    for (var i = 0; i < self.dest.width; i++) {
        for (var j = 0; j < self.dest.height; j++) {
            idx = (j * self.dest.width + i) * 3;
            idx2 = (j * self.dest.width + i) * 4;
            self.src.data[idx2] = self.dest.data[idx];
            self.src.data[idx2 + 1] = self.dest.data[idx + 1];
            self.src.data[idx2 + 2] = self.dest.data[idx + 2];
        }
    }
    self.ctx.putImageData(self.src, 0, 0);
    self.canvas.style.display = "block";
};
*/
/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 01/08/2011
 * Time: 11:19
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.TerrainDotsManager = function( director ) {

	this.initialize( director );
};

LIGHTS.TerrainDotsManager.prototype = {

    // _______________________________________________________________________________________ Group

    active:         false,

    beats:          0,
    grid:           [],
	tiles:          [],
	circles:        [],

    brightColor:    new THREE.Color( 0xFFFFFF ),
    darkColor:      new THREE.Color( 0x000000 ),
    debugColor:     new THREE.Color( 0xFF0000 ),

	activeMult:     1, //0.35,

	avatarOrder:    [ [0, 4], 8, 2, 6, 1, 5, [3, 7] ],
	avatarPosX:     [ 0, 22, 44,  0, 22, 44,  0, 22, 44 ],
	avatarPosY:     [ 0,  0,  0, 22, 22, 22, 44, 44, 44 ],

	rgbColors:      [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ], [ 1, 1, 0 ], [ 0, 1, 1 ], [ 1, 0, 1 ] ],
/*
	arpKeys:        [ 0, 0.255, 0.38, 0.63, 0.75,
					  1, 1.255, 1.38, 1.63, 1.75,
					  2, 2.125, 2.38, 2.50, 2.75,
					  3, 3.125, 3.38, 3.50, 3.75,
					  4, 4.255, 4.38, 4.63, 4.75,
					  5, 5.255, 5.38, 5.63, 5.75,
					  6, 6.125, 6.38, 6.50, 6.75,
					  7, 7.125, 7.38, 7.50, 7.75 ],
*/
	arpKeys:        [     0, 0.375, 0.750,
					  1.000, 1.375, 1.750,
					  2.125, 2.500, 2.750,
					  3.125, 3.500, 3.750,
					  4.000, 4.375, 4.750,
					  5.000, 5.375, 5.750,
					  6.125, 6.500, 6.750,
					  7.125, 7.500, 7.750 ],

    // _______________________________________________________________________________________ Constructor

    initialize: function( director ) {

	    this.director = director;
	    this.terrainPlane = director.terrain.terrainPlane;
	    this.displacement = director.terrain.displacement;

        // Geometry
	    var x, y, i, dot, pv, tv;

        this.geometry = new THREE.Geometry(),
        this.geometry.colors = [];
	    this.terrainVertices = [];
	    this.particleVertices = [];
	    this.dots = [];
	    this.avatar = null;

        for( x = 0, i = 0; x < LIGHTS.Terrain.prototype.mapResolution; x++ ) {

            this.grid[ x ] = [];

            for( y = 0; y < LIGHTS.Terrain.prototype.mapResolution; y++ ) {

                this.grid[ x ][ y ] = i++;
	            tv = director.terrain.terrainPlane.vertexGrid[ x ][ y ];
	            pv = new THREE.Vertex( tv.position.clone() );
                this.terrainVertices.push( tv );
                this.particleVertices.push( pv );
                this.geometry.colors.push( new THREE.Color( 0x00FFFF ) );

	            dot = new LIGHTS.TerrainDot( pv.position );
	            dot.index = i - 1;
	            this.dots.push( dot );
            }
        }

	    this.geometry.vertices = this.terrainVertices;

	    texture = new THREE.Texture( LIGHTS.images.terrainDot );
	    texture.needsUpdate = true;

        // Material
        this.material = new THREE.ParticleBasicMaterial( {
            vertexColors: true,
            size: 20,
            color: 0xC0C0C0,
//            color: 0xFFFFFF,
//            map: THREE.ImageUtils.loadTexture( "images/cyan_plasma_ball.png" ),
//            map: THREE.ImageUtils.loadTexture( "images/small_plasma_ball.png" ),
//            map: THREE.ImageUtils.loadTexture( "images/plasma_ball.png" ),
//            map: THREE.ImageUtils.loadTexture( "images/particle.png" ),
//          map: LIGHTS.Utils.getCircleTexture( 32 ),
	        map: texture,
            blending: THREE.AdditiveBlending,
            transparent: true
        } );

        this.beatTime = 0.1;
		this.allPainted = 1;

	    for( i = 0; i < 6; i++ )
	        this.circles.push( new LIGHTS.TerrainCircle( i ) );

//	    this.setupWords();
    },

    // _______________________________________________________________________________________ Events

    launch: function() {

        switch( LIGHTS.Music.phase.index ) {

            case 0:
				this.beats = 1;
	            this.material.color.setHex( 0xC0C0C0 );
	            this.material.size = 20;
	            this.resetDots();
	            this.paintAll( 0, true );
	            this.geometry.vertices = this.terrainVertices;
	            this.dirtyVertices = true;
	            break;

	        case 1:
	        case 2:
		        this.paintCircles( 16, true );
				break;

            case 3:
	            this.paintAll( 2, true );
	            break;

            case 4:
            case 6:
            case 12:
	            this.paintAll( 1, true );
	            break;

            case 5:
	            this.resetParticles();
	            this.setupWords();
	            this.launchWords();
	            this.geometry.vertices = this.particleVertices;
	            this.dirtyVertices = true;
	            this.nextBeat = 1;
                break;

	        case 7:
	            this.paintAll( 0 );
	            break;

		    case 11:
			    this.resetDots();
			    this.material.size = 32;
			    this.paintAll( 1, true );
			    this.geometry.vertices = this.terrainVertices;
			    this.dirtyVertices = true;
			    break;

            case 13:
	            this.setupAvatars();
	            this.launchAvatars();
	            this.paintAll( 1, true );
                break;

		    case 15: // D1
			    this.material.size = 20;
			    this.resetDots();
			    this.paintAll( 0, true );
			    this.paintCircles( 192 );
		        break;

	        case 16: // S!
		        this.material.size = 20;
		        this.paintAll( 1, true );
		        break;

	        case 17: // C3
		        this.material.color.setHex( 0xFFFFFF );
		        this.paintAll( 0, true );
		        this.paintCircles( 128 );
		        break;

	        case 18: // C3b
	        case 19: // C3c
	        case 20: // C3d
		        this.paintAll( 0, true );
		        this.paintCircles( 128 );
		        break;

	        case 21:
		        this.resetParticles();
		        this.paintAll( 1, true );
//		        this.geometry.vertices = this.terrainVertices;
//		        this.dirtyVertices = true;
		        this.beats = 0;
	            break;

	        case 22:
		        this.paintAll( 0, true );
		        this.paintCircles( 128 );
		        this.setupMoveUp();
		        this.geometry.vertices = this.particleVertices;
		        this.dirtyVertices = true;
	            break;
        }
    },

    beat: function() {

        switch( LIGHTS.Music.phase.index ) {

            case 1:
		        if( this.beats % 2 == 0 )
		            this.paintCircles( 16, true );
		        break;

	        case 2:
				this.paintCircles( 12, true );
		        break;

            case 3:
	        case 4:
	        case 6:
		        this.paintCircles( 32 );
		        break;

	        case 5:
		        if( this.nextBeat == 0 ) {

			        this.paintCircles( 32 );
		        }
		        else {

			        this.paintAll( 1, true );
			        this.nextBeat--;
		        }
	            break;

		    case 11:
	        case 12:
		        this.paintCircles( 8 );
                break;

	        case 13:
	        case 14:
		        if( this.beats % 2 == 0 )
			        this.launchAvatar();
				break;

            case 15:
                break;

            case 17:
            case 18:
            case 19:
            case 20:
                break;

	        case 21:
		        var beats21 = [ 12, 14 ];

	            if( this.beats % 2 == 1 || beats21.indexOf( this.beats ) != -1 ) {

		            this.paintAll( 0, true );
		            this.paintCircles( 128 );
	            }
                break;
        }
        this.beats++;
    },

    // _______________________________________________________________________________________ Update

    update: function() {

		this.geometry.__dirtyVertices = this.dirtyVertices || this.terrainPlane.__dirtyVertices;
	    this.dirtyVertices = false;

	    switch( LIGHTS.Music.phase.index ) {

		    case 0:
			    this.paintDarker( true, false, 4 );
			    this.updateMovingCircles();
			    break;

		    case 1:
		    case 2:
			    this.paintDarker( true, false, 3 );
			    break;

		    case 3:
		    case 4:
		        this.paintDarker( true, false, 1 );
		        break;

	        case 5:
	        case 6:
			    this.moveToWords();
		        this.paintDarker( false, true, 0.5 );
		        break;

		    case 7:
		        this.explodeWords();
		        break;

		    case 11:
		    case 12:
		        this.paintDarker( true, false, 0.5 );
		        break;

	        case 13:
	        case 14:
		        this.paintDarker( false, false, 0.5 );
		        this.updateAvatar();
	            break;

	        case 15:
	            break;

		    case 17:
		    case 18:
		    case 19:
		    case 20:
		        this.paintDarker( true, false, 0.5 );
		        break;

		    case 21:
		        this.paintDarker( true, false, 4 );
		        break;

		    case 22:
		        this.moveUp();
		        break;
	    }
    },

    // _______________________________________________________________________________________ Private

    // _______________________________________________________________________________________ Canvas

	paintAll: function( grey, force ) {

		var colors = this.geometry.colors,
			dots = this.dots,
		    il = dots.length,
		    i, dot, color;

		for( i = 0; i < il; i++ ) {

			dot = dots[ i ];

			if( force || ! dot.isActive ) {

				color = colors[ dot.index ];
				color.r = color.g = color.b = grey;
			}
		}

		this.allPainted = grey;
	    this.geometry.__dirtyColors = true;
	},

	paintDarker: function( force, blend, darkness ) {

		var colors = this.geometry.colors,
			activeMult = this.activeMult,
			dots = this.dots,
		    il = dots.length,
			dark = 1 - darkness * LIGHTS.deltaTime,
		    i, dot, color, active;

		for( i = 0; i < il; i++ ) {

			dot = dots[ i ];
			active = dot.isActive;

			if( force || ! active ) {

				color = colors[ dot.index ];
				color.r *= dark;
				color.g *= dark;
				color.b *= dark;
			}
			else if( blend ) {

				color = colors[ dot.index ];

				if( color.r > activeMult )
					color.r *= dark;

				if( color.g > activeMult )
					color.g *= dark;

				if( color.b > activeMult )
					color.b *= dark;
			}
		}

	    this.geometry.__dirtyColors = true;
	},

	paintCircles: function( count, isWhite ) {

        var colors = this.geometry.colors,
            res = LIGHTS.Terrain.prototype.mapResolution,
            isColor = (isWhite === undefined || isWhite === false),
            dots = this.dots,
            grid = this.grid,
            activeMult = this.activeMult,
            radius, radius2, centerX, centerY, rgb, colorR, colorG, colorB, colorRi, colorGi, colorBi,
            i, il, x, y, xl, yl, dx, dy, gridX, color, index, dot;

		if( isWhite )
			colorR = colorG = colorB = 2;

		for( i = 0; i < count; i++ ) {

			radius = Math.random() * 4 + 4;
			radius2 = radius * radius;
			radius = Math.floor( radius );
			centerX = Math.floor( Math.random() * res );
			centerY = Math.floor( Math.random() * res );

			if( isColor ) {

				rgb = this.rgbColors[ Math.floor( Math.random() * this.rgbColors.length ) ];
				colorR = rgb[ 0 ];
				colorG = rgb[ 1 ];
				colorB = rgb[ 2 ];
				colorRi = Math.min( colorR + 0.5, 1 ) * activeMult;
				colorGi = Math.min( colorG + 0.5, 1 ) * activeMult;
				colorBi = Math.min( colorB + 0.5, 1 ) * activeMult;
			}

			for( x = centerX - radius, xl = centerX + radius; x <= xl; x++ ) {

				if( x >= 0 )
					gridX = grid[ x % res ];
				else
					gridX = grid[ (x + Math.ceil( -x / res ) * res ) % res ];

				dx = (centerX - x) * (centerX - x);

				for( y = centerY - radius, yl = centerY + radius; y <= yl; y++ ) {

					dy = (centerY - y) * (centerY - y);

					if( dx + dy <= radius2 ) {

						if( y >= 0 )
							index = gridX[ y % res ];
						else
							index = gridX[ (y + Math.ceil( -y / res ) * res ) % res ];

						color = colors[ index ];
						dot = dots[ index ];

						if( dot.isActive ) {

							color.r = colorRi;
							color.g = colorGi;
							color.b = colorBi;
						}
						else {

							color.r += colorR;
							color.g += colorG;
							color.b += colorB;
						}
					}
				}
			}
		}

		this.allPainted = null;
        this.geometry.__dirtyColors = true;
    },

	updateMovingCircles: function() {

        var deltaTime = LIGHTS.deltaTime,
			colors = this.geometry.colors,
            circles = this.circles,
            res = LIGHTS.Terrain.prototype.mapResolution,
            grid = this.grid,
            grey, circle, radius, radius2, centerX, centerY, dist2,
            i, il, x, y, xl, yl, dx, dy, gridX, color, index;

		for( i = 0, il = circles.length; i < il; i++ ) {

			circle = circles[ i ];

			if( circle.delay < 0 ) {

				radius = Math.ceil( circle.radius );
				radius2 = circle.radius * circle.radius;
				centerX = circle.posX;
				centerY = circle.posY;
				grey = circle.grey;

				for( x = centerX - radius, xl = centerX + radius; x <= xl; x++ ) {

				    if( x >= 0 )
					    gridX = grid[ x % res ];
				    else
					    gridX = grid[ (x + Math.ceil( -x / res ) * res ) % res ];

					dx = (centerX - x) * (centerX - x);

					for( y = centerY - radius, yl = centerY + radius; y <= yl; y++ ) {

						dy = (centerY - y) * (centerY - y);
						dist2 = radius2 - (dx + dy);

						if( dist2 >= 0 /*&& dist2 <= 4*/ ) {

							if( y >= 0 )
								index = gridX[ y % res ];
							else
								index = gridX[ (y + Math.ceil( -y / res ) * res ) % res ];

							color = colors[ index ];

							color.r += grey;
							color.g += grey;
							color.b += grey;
						}
					}
				}

				circle.radius += deltaTime * circle.speed;
				circle.grey -= deltaTime * circle.fade;

				if( circle.grey <= 0 )
					circle.reset( 0 );
			}
			else {

				circle.delay -= deltaTime;
			}
		}

		this.allPainted = null;
        this.geometry.__dirtyColors = true;
    },

    // _______________________________________________________________________________________ Avatars

	setupAvatars: function() {

		var dots = this.dots,
			grid = this.grid,
			posX = this.avatarPosX,
			posY = this.avatarPosY,
			dotAvatars = new LIGHTS.TerrainDotAvatars( this ),
			avatars = dotAvatars.avatars,
			avatar, colors, colorsX, gridX, dot, avatarDots, avatarDotsX, avatarColor, dotColor,
			i, il, x, y, w, h, dx, dy;

		this.avatars = avatars;

	    for( i = 0, il = avatars.length; i < il; i++ ) {

		    avatar = avatars[ i ];
		    colors = avatar.colors;
		    w = avatar.width;
		    h = avatar.height;
		    dx = posX[ i ];
		    dy = posY[ i ];

			avatarDots = [];

		    for( x = 0; x < w; x++ ) {

			    colorsX = colors[ x ];
			    gridX = grid[ x + dx ];
			    avatarDotsX = [];

			    for( y = 0; y < h; y++ ) {

			        dot = dots[ gridX[ y + dy ] ];
//				    dot.avatarColor = colorsX[ y ]; // Fade
				    dotColor = dot.avatarColor = new THREE.Color( 0x000000 ); // Wipe
				    avatarColor = colorsX[ y ];
				    dotColor.r = avatarColor[ 0 ];
				    dotColor.g = avatarColor[ 1 ];
				    dotColor.b = avatarColor[ 2 ];
				    avatarDotsX.push( dot );
			    }

			    avatarDots.push( avatarDotsX );
		    }

		    avatar.dots = avatarDots;
	    }
	},

	launchAvatars: function() {

		var dots = this.dots,
			avatars = this.avatars,
			posX = this.avatarPosX,
			posY = this.avatarPosY,
			avatarDots, color,
		    i, il, x, xl, y, yl, w, h, w1, h1;

		// Deactivate
		for( i = 0, il = dots.length; i < il; i++ )
			dots[ i ].isActive = false;

		// Rotate to camera
//		for( i = 0, il = avatars.length; i < il; i++ ) {
//
//			avatar = avatars[ i ];
//			avatarDots = avatar.dots;
//			w = avatar.width;
//			h = avatar.height;
//			w1 = w - 1;
//			h1 = h - 1;
//
//			for( x = 0; x < w; x++ ) {
//
//				for( y = 0; y < h; y++ ) {
//
//					avatarDots[ x ][ y ].currentAvatarColor = avatarDots[ y ][ w1 - x ].avatarColor;
//				}
//
//				avatarDots.push( avatarDotsX );
//			}
//		}

		this.avatarNext = 0;
	},

	launchAvatar: function() {

		if( this.avatarNext > -1 ) {

			if( this.avatarNext < this.avatarOrder.length ) {

				if( this.avatarOrder[ this.avatarNext ] instanceof Array )
					this.avatar = null;
				else
					this.avatar = this.avatars[ this.avatarOrder[ this.avatarNext ] ];

				this.avatarNext++;
				this.avatarLine = 0;
			}
			else {

				this.avatarNext = -1;
			}
		}
	},

	updateAvatar: function() {

		if( this.avatarNext > 0 ) {

			if( this.avatarLine !== null ) {

				var colors = this.geometry.colors,
					isMulti = (this.avatar === null),
					lines = Math.ceil( LIGHTS.deltaTime * 30 ),
				    a, al, il, i, j, jl, dot, dotLine, color, avatarColor;

				for( a = 0, al = isMulti? 2 : 1; a < al; a++ ) {

					dots = isMulti? this.avatars[ this.avatarOrder[ this.avatarNext - 1 ][ a ] ].dots : this.avatar.dots;

					for( j = this.avatarLine, jl = Math.min( dots.length, this.avatarLine + lines ); j < jl; j++ ) {

						dotLine = dots[ j ];

						for( i = 0, il = dotLine.length; i < il; i++ ) {

							dot = dotLine[ i ];
							dot.isActive = true;
							color = colors[ dot.index ];
							avatarColor = dot.avatarColor;

							color.r = avatarColor.r;
							color.g = avatarColor.g;
							color.b = avatarColor.b;
						}
					}
				}

				this.geometry.__dirtyColors = true;

				this.avatarLine += lines;

				if( this.avatarLine >= dots.length )
					this.avatarLine = null;
			}
		}
	},

	updateAvatarFade: function() {

		if( this.avatarNext > 0 ) {

			var colors = this.geometry.colors,
				avatar = this.avatar,
				dots = avatar.dots,
				height = avatar.height,
				ease = LIGHTS.deltaTime * 2,
			    x, xl, yl, y, dot, dotLine, color, avatarColor;

			for( x = 0, xl = avatar.width; x < xl; x++ ) {

				dotLine = dots[ x ];

				for( y = 0, yl = height; y < yl; y++ ) {

					dot = dotLine[ y ];
					dot.isActive = true;
					color = colors[ dot.index ];
					avatarColor = dot.avatarColor;

					color.r -= (color.r - avatarColor[ 0 ]) * ease;
					color.g -= (color.g - avatarColor[ 1 ]) * ease;
					color.b -= (color.b - avatarColor[ 2 ]) * ease;
				}
			}

			this.geometry.__dirtyColors = true;

			this.avatarTime -= LIGHTS.deltaTime;

			if( this.avatarTime < 0 )
				this.launchAvatar();
		}
	},

    // _______________________________________________________________________________________ Words

	setupWords: function() {

		var i, j, wordDots, tries, u, a, r, speed;

	    this.text = new LIGHTS.TerrainDotsText( this );

	    for( i = 0; i < this.text.words.length; i++ ) {

		    wordDots = this.text.words[ i ].dots;

		    for( j = 0; j < wordDots.length; j++ ) {

				// Find available dot
			    tries = 1000;

				do {

					dot = this.dots[ Math.floor( Math.random() * this.dots.length ) ];

				} while( --tries > 0 && dot.isText );

			    if( dot.isText ) {

				    console.log( "ERROR: LIGHTS.TerrainDotsManager.setupWords: Dot without text not found!" );
				}
			    else {

				    dot.isText = true;
				    dot.delay = i + 0.2 + Math.random() * 0.5;
					dot.wordPosition = wordDots[ j ];

				    u = Math.random() * 2 - 1;
					a = Math.random() * rad360;
					r = Math.sqrt( 1 - u * u );
				    speed = Math.random() * 96 + 64;

				    dot.velocity.x = Math.cos( a ) * r * speed;
				    dot.velocity.y = u * speed;
				    dot.velocity.z = Math.sin( a ) * r * speed;
			    }
		    }
	    }
	},

	launchWords: function() {

		var dots = this.dots,
		    il = dots.length,
		    i, dot;

		for( i = 0; i < il; i++ ) {

			dot = dots[ i ];

			if( dot.isText ) {

				dot.isActive = true;
				dot.ease = 2.5 + Math.random();
			}
		}
	},

	moveToWords: function() {

		this.text.update();

	    var deltaTime = LIGHTS.deltaTime,
	        dots = this.dots,
	        il = dots.length,
	        i, dot, ease, position, wordPosition;

	    for( i = 0; i < il; i++ ) {

		    dot = dots[ i ];

		    if( dot.isText ) {

			    if( dot.delay < 0 ) {

				    position = dot.position;
			        wordPosition = dot.wordPosition;
				    ease = deltaTime * dot.ease;

				    position.x -= (position.x - wordPosition.x) * ease;
				    position.y -= (position.y - wordPosition.y) * ease;
				    position.z -= (position.z - wordPosition.z) * ease;

				    dot.ease -= (dot.ease - 10) * ease * 0.1;
			    }
			    else
			        dot.delay -= deltaTime;
		    }
	    }

	    this.dirtyVertices = true;
    },

	explodeWords: function() {

	    var deltaTime = LIGHTS.deltaTime,
		    colors = this.geometry.colors,
	        dots = this.dots,
	        il = dots.length,
	        dark = 1 - deltaTime * 2,
	        i, dot, ease, position, velocity, drag, color;

	    for( i = 0; i < il; i++ ) {

		    dot = dots[ i ];

		    if( dot.isText ) {

				position = dot.position;
				velocity = dot.velocity;

				position.x += velocity.x * deltaTime;
				position.y += velocity.y * deltaTime;
				position.z += velocity.z * deltaTime;

				drag = 1 - dot.drag * deltaTime;
				velocity.x *= drag;
				velocity.y *= drag;
				velocity.z *= drag;

				color = colors[ dot.index ];
				color.r *= dark;
				color.g *= dark;
				color.b *= dark;
		    }
	    }

	    this.dirtyVertices = true;
		this.geometry.__dirtyColors = true;
    },

	resetDots: function() {

		var dots = this.dots,
		    il = dots.length,
		    i, dot;

		for( i = 0; i < il; i++ )
			dots[ i ].reset();
	},

    // _______________________________________________________________________________________ Particles

	updateTerrainParticles: function() {

		var terrainVertices = this.terrainVertices,
			dots = this.dots,
		    il = dots.length,
		    i, dot, position, terrainPosition;

		for( i = 0; i < il; i++ ) {

			dot = dots[ i ];

			if( ! dot.isText && ! dot.isAvatar ) {

				position = dot.position;
				terrainPosition = terrainVertices[ i ].position;

				position.x = terrainPosition.x;
				position.y = terrainPosition.y;
				position.z = terrainPosition.z;
			}
		}
	},

	resetParticles: function() {

		var terrainVertices = this.terrainVertices,
			particleVertices = this.particleVertices,
			dots = this.dots,
		    il = dots.length,
		    particlePosition, terrainPosition, i;

		for( i = 0; i < il; i++ ) {

			position = particleVertices[ i ].position;
			terrainPosition = terrainVertices[ i ].position;

			position.x = terrainPosition.x;
			position.y = terrainPosition.y;
			position.z = terrainPosition.z;

			dots[ i ].reset();
		}
	},

    // _______________________________________________________________________________________ Private

    showDebug: function() {

        var colors = this.geometry.colors,
            res = LIGHTS.Terrain.prototype.mapResolution,
            grid = this.grid,
            debugColor = this.debugColor,
            x, y, gridX;

        for( x = 0; x < res; x++ ) {

            gridX = grid[ x ];

            for( y = 0; y < res; y++ )
                colors[ gridX[ y ] ] = debugColor;
        }

        this.geometry.__dirtyColors = true;
    },

    show: function( visible ) {

		var tiles = this.tiles,
			i, il;

		for( i = 0, il = tiles.length; i < il; i++ )
			tiles[ i ].particleSystem.visible = visible;
    },
/*
    showStripeX: function( advance ) {

        var colors = this.geometry.colors,
            res = LIGHTS.Terrain.prototype.mapResolution,
            grid = this.grid,
            step = advance? this.beats % 8 : 0,
            brightColor = this.brightColor,
            darkColor = this.darkColor,
            x, y, gridX, color;

        for( x = 0; x < res; x++ ) {

            gridX = grid[ x ];
            color = ((x+step) % 8 >= 4)? brightColor : darkColor;

            for( y = 0; y < res; y++ )
                colors[ gridX[ y ] ] = color;
        }

        this.geometry.__dirtyColors = true;
    },

	showStripeY: function( advance ) {

	    var colors = this.geometry.colors,
	        res = LIGHTS.Terrain.prototype.mapResolution,
	        grid = this.grid,
		    step = advance? this.beats % 8 : 0,
	        brightColor = this.brightColor,
	        darkColor = this.darkColor,
	        x, y, color;

	    for( y = 0; y < res; y++ ) {

	        color = ((y+step) % 8 >= 4)? brightColor : darkColor;

	        for( x = 0; x < res; x++ )
	            colors[ grid[ x ][ y ] ] = color;
	    }

	    this.geometry.__dirtyColors = true;
	},
*/
	setupMoveUp: function() {

	    var dots = this.dots,
		    colors = this.geometry.colors,
	        arpKeys = this.arpKeys,
	        arpKeyCount = arpKeys.length,
	        i, il, dot, dotColor, color;

	    for( i = 0, il = dots.length; i < il; i++ ) {

		    dot = dots[ i ];
			dot.position.y = 0;

		    dot.delay = arpKeys[ Math.floor( Math.random() * arpKeyCount ) ];
		    dot.height = Math.random() * 150 + 50;
		    dot.ease = 2 + Math.random();

		    dotColor = dot.color;
			color = colors[ i ];
		    dotColor.r = color.r;
		    dotColor.g = color.g;
		    dotColor.b = color.b;
	    }

		this.geometry.__dirtyColors = true;
    },

    moveUp: function() {

	    var deltaTime = LIGHTS.deltaTime,
	        dots = this.dots,
	        terrainVertices = this.terrainVertices,
	        colors = this.geometry.colors,
	        i, il, dot, dotColor, intensity, color;

	    for( i = 0, il = dots.length; i < il; i++ ) {

		    dot = dots[ i ];

		    if( dot.delay < 0 ) {

			    dot.position.y -= (dot.position.y - dot.height) * deltaTime * dot.ease;
			    dotColor = dot.color;
			    color = colors[ i ];
			    intensity = 1 - (dot.position.y / dot.height);
			    color.r = dotColor.r * intensity;
			    color.g = dotColor.g * intensity;
			    color.b = dotColor.b * intensity;
		    }
		    else {

			    dot.position.y = terrainVertices[ i ].position.y;
			    dot.delay -= deltaTime;
		    }
	    }

	    this.geometry.__dirtyColors = true;
	    this.dirtyVertices = true;
    }
};

// ___________________________________________________________________________________________ Dot

LIGHTS.TerrainDot = function( pos ) {

	this.initialize( pos );
};

LIGHTS.TerrainDot.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( pos ) {

		this.position = pos;
		this.delay = 0;
		this.avatarColor = null;
		this.color = new THREE.Color();
		this.index = null;
		this.velocity = new THREE.Vector3();
		this.drag = Math.random() * 0.01 + 0.005;

		this.reset();
	},

	reset: function() {

		this.isText = false;
		this.isAvatar = false;
		this.isActive = false;
	}
};

// ___________________________________________________________________________________________ Dot

LIGHTS.TerrainCircle = function( index ) {

	this.initialize( index );
};

LIGHTS.TerrainCircle.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( index ) {

		this.index = index;

		this.reset( index );
	},

	reset: function( delay ) {

		this.active = false;
		this.posX = Math.floor( Math.random() * LIGHTS.Terrain.prototype.mapResolution );
		this.posY = Math.floor( Math.random() * LIGHTS.Terrain.prototype.mapResolution );
		this.radius = 0;
		this.grey = 1.2;
		this.delay = delay;
		this.speed = Math.random() * 25 + 5;
		this.fade = 2;
	}
};

// ___________________________________________________________________________________________ Tile

LIGHTS.TerrainDotsTile = function( manager ) {

	this.initialize( manager );
};

LIGHTS.TerrainDotsTile.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( manager ) {

        this.manager = manager;

        this.children = [];

        this.particleSystem = new THREE.ParticleSystem( manager.geometry, manager.material );
        this.particleSystem.sortParticles = false;
        this.particleSystem.position.y = 3;
        this.children.push( this.particleSystem );

		manager.tiles.push( this );
    },

    // _______________________________________________________________________________________ Update

    update: function() {

    }
};
/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 12/08/2011
 * Time: 10:12
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.TerrainDotsText = function( manager ) {

	this.initialize( manager );
};

LIGHTS.TerrainDotsText.prototype = {

	textScale:      phi,

    // _______________________________________________________________________________________ Constructor

	initialize: function( manager ) {

		this.manager = manager;
		this.player = manager.director.player;

		this.words = [];

		var size = LIGHTS.Terrain.prototype.tileSize,
			s1 = size * (1/3 - 0.5),
			s2 = size * (2/3 - 0.5),
			s3 = size * 0.5,
			positions = [],
			position, word, i;

		positions.push( [ s1,  80, s1 ] );
		positions.push( [ s1,  90, s2 ] );
		positions.push( [ s1, 100, s3 ] );

		positions.push( [ s2, 120, s1 ] );
		positions.push( [ s2, 130, s2 ] );
		positions.push( [ s2, 140, s3 ] );

		positions.push( [ s3, 150, s1 ] );
		positions.push( [ s3, 160, s2 ] );
		positions.push( [ s3, 170, s3 ] );

		for( i = 0; i < LIGHTS.tweets.length; i++ ) {

			pos = positions[ i ];
			position = new THREE.Vector3( pos[ 0 ], pos[ 1 ], pos[ 2 ] );
			word = new LIGHTS.TerrainDotsWord( '@' + LIGHTS.tweets[ i ], position );
			this.words.push( word );
		}
	},

    // _______________________________________________________________________________________ Update

	update: function() {

		var words = this.words,
			il = words.length,
			angle = this.player.angle,
			i;

		for( i = 0; i < il; i++ )
			words[ i ].update( angle );
	}
};

// ___________________________________________________________________________________________ TerrainDotsWord

LIGHTS.TerrainDotsWord = function( word, position ) {

	this.initialize( word, position );
};

LIGHTS.TerrainDotsWord.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( word, position ) {

		this.word = word;
		this.position = position;
		this.rotation = Math.random() * rad360;
		this.scale = LIGHTS.TerrainDotsText.prototype.textScale;
		this.rotationSpeed = Math.random() * 0.1 + 0.1;
		this.rotationSpeed *= (Math.random() > 0.5)? 1 : -1;
		this.floatFreq = Math.random() * 5 + 5;
		this.floatAmp = Math.random() * 5 + 5;

		// Dots
		this.pixels = [];
		this.dots = [];

		var x = 0,
			i, j, fontChar, dot, w2, xoffset, yoffset;

		for( i = 0; i < word.length; i++ ) {

			fontChar = LIGHTS.DotsFont.font[ word.charCodeAt( i ) ];
			xoffset = fontChar.xoffset;
			yoffset = fontChar.yoffset;

			if( fontChar !== undefined ) {

				pixels = fontChar.pixels;

				for( j = 0; j < pixels.length; j++ ) {

					pixel = pixels[ j ];
					this.pixels.push( [ pixel[ 0 ] + xoffset + x, pixel[ 1 ] + yoffset ] );
					this.dots.push( new THREE.Vector3() );
				}

				x += fontChar.xadvance;
			}
			else {

				console.log( "ERROR: LIGHTS.TerrainDotsWord: Char not found in font!" );
			}
		}

		this.width = x;

		// Center
		w2 = x / 2;

		for( i = 0; i < this.pixels.length; i++ )
			this.pixels[ i ][ 0 ] -= w2;
	},

    // _______________________________________________________________________________________ Update

	update: function( angle ) {

		var pixels = this.pixels,
			dots = this.dots,
			posX = this.position.x,
			posY = this.position.y,
			posZ = this.position.z,
			scaleX = this.scale,
			scaleY = this.scale,
			s = Math.sin( this.rotation ),
			c = Math.cos( this.rotation ),
			il = pixels.length,
			dy = Math.sin( ((LIGHTS.time % this.floatFreq) / this.floatFreq) * rad360 ) * this.floatAmp,
			i, px, py, pz, pixel, dot;

		// sin( rotation - angle )
		if( s * Math.cos( angle ) - c * Math.sin( angle ) < 0 )
			scaleX = -scaleX;

		for( i = 0; i < il; i++ ) {

			pixel = pixels[ i ];
			px = pixel[ 0 ] * scaleX * s;
			py = pixel[ 1 ] * scaleY;
			pz = pixel[ 0 ] * scaleX * c;

			dot = dots[ i ];
			dot.x = posX + px;
			dot.y = posY - py + dy;
			dot.z = posZ + pz;
		}

		this.rotation += this.rotationSpeed * LIGHTS.deltaTime;
	},

	toString: function() {

		var pixels = this.pixels,
			dots = this.dots,
			posX = this.position.x,
			posY = this.position.y,
			posZ = this.position.z,
			scale = this.scale,
			matrix = [],
			output = '',
			w2 = this.width / 2,
			il = pixels.length,
			i, px, py, pixel;

		for( i = 0; i < il; i++ ) {

			pixel = pixels[ i ];
			px = pixel[ 0 ] + w2;
			py = pixel[ 1 ];

			if( matrix[ py ] === undefined )
				matrix[ py ] = [];

			matrix[ py ][ px ] = true;
		}

		for( py = 0; py < matrix.length; py++ ) {

			if( matrix[ py ] !== undefined )
				for( px = 0; px < matrix[ py ].length; px++ )
					output += (matrix[ py ][ px ] == true)? 'X' : ' ';

			output += '\n';
		}

		return output;
	}
};
/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 01/08/2011
 * Time: 13:45
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.TerrainMeshManager = function( director ) {

	this.initialize( director );
};

LIGHTS.TerrainMeshManager.prototype = {

    // _______________________________________________________________________________________ Group

    active:         false,

	colors:         [ 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFF0000, 0x00FF00, 0x0000FF ],

    beats:          0,

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

		this.director = director;

        this.geometry = director.terrain.terrainPlane;

        this.terrainMap = new LIGHTS.TerrainMap( director.view.renderer );
		this.terrainMap.texture.wrapS = this.terrainMap.texture.wrapT = THREE.RepeatWrapping;

//		var texture = new THREE.Texture( LIGHTS.images.lines );
//		texture.needsUpdate = true;


//		texture = new THREE.Texture( LIGHTS.images.candy );
//		texture.needsUpdate = true;
//		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//		texture.repeat.x = texture.repeat.y = 4;


//        texture.magFilter = THREE.LinearMipMapLinearFilter;
//        texture.minFilter = THREE.LinearMipMapLinearFilter;

		var envMap = new THREE.Texture( [

			LIGHTS.images.envMapLeftRight,
			LIGHTS.images.envMapLeftRight,
			LIGHTS.images.envMapTop,
			LIGHTS.images.envMapBottom,
			LIGHTS.images.envMapFrontBack,
			LIGHTS.images.envMapFrontBack
		] );

		envMap.needsUpdate = true;

		this.material = new THREE.MeshBasicMaterial( {
			color: 0x000000,
			map: this.terrainMap.texture,
//			map: texture,
			envMap: envMap,
			reflectivity: 1,
			combine: THREE.MultiplyOperation,
			shading: THREE.SmoothShading
		} );

		director.materialCache.addMaterial( this.material );

        this.mapDots = new LIGHTS.MapDots( this.terrainMap );
        this.mapLines = new LIGHTS.MapLines( this.terrainMap );
        this.mapCircles = new LIGHTS.MapCircles( this.terrainMap );
        this.mapGlows = new LIGHTS.MapGlows( this.terrainMap );
//        this.mapAvatars = new LIGHTS.MapAvatars( this.terrainMap );
	},

    // _______________________________________________________________________________________ Public

    launch: function() {

        switch( LIGHTS.Music.phase.index ) {
	        case 0:
				break;

            case 1:
	            this.mapGlows.launch( this.director.tileManager.balls );
	            this.material.color.setHex( 0xFFFFFF );
                this.material.reflectivity = 0;
	            this.terrainMap.clear();
	            this.terrainMap.update();
	            break;

	        case 2:
		        this.material.reflectivity = 0.2;
		        break;

	        case 3:
		        break;

            case 7:
		        this.material.reflectivity = 0;
	            this.material.color.setHex( 0xFFFFFF );
	            break;

            case 8:
		        this.material.reflectivity = 0.15;
	            break;

	        case 11:
	        case 21:
		        this.material.reflectivity = 0.2;
		        this.mapGlows.update();
				break;

	        case 13:
				this.mapLines.clear();
//	            this.terrainMap.opacity = 0.97;
//	            this.terrainMap.subtract = 0.005;
//		        this.material.reflectivity = 0.2;
//		        this.material.color.setHex( 0x000000 );
		        break;

	        case 14:
		        this.dotCount = 1;
	            break;

	        case 15:
//		        this.mapDots.drawDots( 64 );
//		        this.mapDots.update();
//		        this.terrainMap.update();

		        this.terrainMap.clear( 0x808080 );
//		        this.material.color.setHex( 0xFFFFFF );
//		        this.material.reflectivity = 0.8;
		        this.material.reflectivity = 0.3;
//
//		        this.mapLines.clear();
//
//		        for( var i = 0; i < 9; i++ )
//		            this.mapAvatars.drawAvatar( i );
//
//		        this.terrainMap.post = false;
//		        this.terrainMap.clear();
//		        this.terrainMap.update();
		        break;

	        case 16:
		        this.material.reflectivity = 0;
                this.material.color.setHex( 0x000000 );
//		        this.mapAvatars.clear();
		        this.terrainMap.post = true;
                this.terrainMap.clear();
                this.terrainMap.update();
                break;

            case 17:
	            this.material.reflectivity = 0.3;
	            this.material.color.setHex( 0xFFFFFF );
	            this.mapDots.clear();
	            //this.mapCircles.launch();
	            this.terrainMap.update();
//	            this.terrainMap.opacity = 0.98;
//	            this.terrainMap.subtract = 0.005;
//		        this.mapDots.drawDots( 64 );
                break;

	        case 22: // A2
		        this.material.reflectivity = 0;
		        this.mapCircles.clear();

//		        this.material.color.setHex( 0x000000 );
//		        this.terrainMap.clear();
//		        this.terrainMap.update();
	            break;
        }
    },

    beat: function() {

        switch( LIGHTS.Music.phase.index ) {

			case 7:
				this.mapLines.drawLines( 4 );
				break;

			case 8:
				this.mapLines.drawLines( 8 );
				break;

			case 9:
				this.mapLines.drawLines( 16 );
				break;

			case 10:
				this.mapLines.drawLines( 24 );
				break;

			case 11:
			case 12:
//				this.mapLines.rotLines();
				this.mapLines.drawLines( 8 );
				break;

	        case 13:
		        break;

	        case 14:
		        this.mapDots.drawDots( this.dotCount );

		        if( this.beats % 8 == 0 && this.dotCount < 24 )
		            this.dotCount++;
		        break;

	        case 15:
		        this.mapDots.drawDots( this.dotCount );

		        if( this.dotCount < 16 )
		            this.dotCount += 2;

/*
		        if( this.beats % 2 == 0 ) {
			        this.mapColor.setColor( this.colors[ this.beats % this.colors.length ] );
			        this.material.color.setHex( 0xFFFFFF );
			        this.material.reflectivity = 0.8;
		        }
		        else {

			        this.material.color.setHex( 0x000000 );
			        this.material.reflectivity = 0.8;
//			        this.material.reflectivity = 0.8;
		        }
*/
		        break;

			case 17:
	        case 18:
	        case 19:
	        case 20:
	        case 21:
//				this.mapCircles.drawCircles( 32 );
//				this.mapDots.drawDots( 16 );
//				this.mapLines.drawLines( 16 );
				break;
		}

		this.beats++;
    },

    // _______________________________________________________________________________________ Update

    update: function() {

        switch( LIGHTS.Music.phase.index ) {
// REVIEW GLOWS
	        case 1:
	        case 2:
	        case 3:
	        case 4:
	        case 5:
	        case 6:
		        this.mapGlows.update();
		        this.terrainMap.update();
		        break;

            case 7:
	        case 8:
	        case 9:
	        case 10:
		        this.mapLines.update();
				this.mapGlows.update();
		        this.terrainMap.update();
		        break;

		    case 11:
		    case 12:
		    case 16:
                this.mapLines.update();
                this.terrainMap.update();
                break;

	        case 13:
		        this.terrainMap.update();
		        this.material.reflectivity -= this.material.reflectivity * LIGHTS.deltaTime;
		        break;

	        case 14:
	        case 15:
		        this.mapDots.update();
		        this.terrainMap.update();
		        break;

	        case 17:
	        case 18:
	        case 19:
	        case 20:
		        this.mapGlows.update();
                this.mapCircles.update();
                this.terrainMap.update();
                break;

	        case 21:
                this.mapCircles.update();
                this.terrainMap.update();
                break;

	        case 22:
                this.terrainMap.update();
                break;
        }
    },

	animateUVs: function() {

		var uvs = this.geometry.uvGrid;

		for( var i = 0; i < uvs.length; i++ ) {

			var dv = (Math.random() - 0.5) * 0.005;

			for( var j = 0; j < uvs[ i ].length; j++ ) {

				uvs[ j ][ i ].v += dv;
			}

		}

		this.geometry.__dirtyUvs = true;
	}
};

// ___________________________________________________________________________________________ Tile

LIGHTS.TerrainMeshTile = function( manager ) {

	this.initialize( manager );
};

LIGHTS.TerrainMeshTile.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( manager ) {

        this.manager = manager;

        this.children = [];

        var mesh = new THREE.Mesh( manager.geometry, manager.material );
		mesh.dynamic = true;
        this.children.push( mesh );
	},

    // _______________________________________________________________________________________ Update

    update: function() {

    }
};

LIGHTS.MapCircles = function( map ) {

	this.initialize( map );
};

LIGHTS.MapCircles.prototype = {

	circleCount:    64,

//    colors:         [ 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFF0000, 0x00FF00, 0x0000FF ],
//    colors:         [ 0x808000, 0x008080, 0x800080, 0x800000, 0x008000, 0x000080 ],
//    colors:         [ 0x404000, 0x004040, 0x400040, 0x400000, 0x004000, 0x000040 ],
    colors:         [ 0x303000, 0x003030, 0x300030, 0x300000, 0x003000, 0x000030 ],

    circles:        [],

    // _______________________________________________________________________________________ Constructor

	initialize: function( map ) {

        this.map = map;

        // Circle texture
        var mapSize = LIGHTS.TerrainMap.size,
            i, mesh, materials, material, texture, geometry;

		texture = new THREE.Texture( LIGHTS.images.circle );
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		texture.magFilter = THREE.LinearMipMapLinearFilter;
        texture.needsUpdate = true;

		// Materials
		materials = [];

		for( i = 0; i < this.colors.length; i++ ) {

			materials.push( new THREE.MeshBasicMaterial( {

				color:          this.colors[ i ],
				map:            texture,
				blending:       THREE.AdditiveBlending,
				transparent:    true
			} ) );
		}

        // Planes
		geometry = new THREE.PlaneGeometry( mapSize, mapSize );

        for( i = 0; i < this.circleCount; i++ ) {

	        material = materials[ Math.floor( Math.random() * materials.length ) ];
            mesh = new THREE.Mesh( geometry, material );
            this.circles.push( new LIGHTS.MapCircle( mesh, material ) );
        }
    },

    // _______________________________________________________________________________________ Public

    launch: function() {

	    var circles = this.circles,
	        mapSize = LIGHTS.TerrainMap.size,
		    i, il, circle, size, posMax;

		for( i = 0, il = this.circleCount; i < il; i++ ) {

			size = 0.05 + 0.15 * Math.random();
            posMax = this.map.viewRadius - mapSize * size * 0.5;

            circle = this.circles[ i ];
			circle.size = size;
			circle.posMax = posMax;

			this.resetCircle( circle );

            this.map.scene.addChild( circle.mesh );
        }
    },

	clear: function() {

		var circles = this.circles,
			i, il;

	    for( i = 0, il = this.circleCount; i < il; i++ )
	        this.map.scene.removeChild( circles[ i ].mesh );
	},

    update: function() {

	    var circles = this.circles,
	        deltaTime = LIGHTS.deltaTime,
		    i, il;

        for( i = 0, il = this.circleCount; i < il; i++ ) {

	        circle = this.circles[ i ];

	        circle.life -= deltaTime;

	        if( circle.life < 0 )
	            this.resetCircle( circle );

	        circle.radius += deltaTime * circle.speed;
	        circle.scale.x = circle.scale.y = circle.radius * circle.size;
        }
    },

    // _______________________________________________________________________________________ Private

	resetCircle: function( circle ) {

		var posMax = circle.posMax;

		circle.life = Math.random() * 4 + 4;
		circle.position.x = Math.random() * 2 * posMax - posMax;
		circle.position.y = Math.random() * 2 * posMax - posMax;
		circle.radius = 0.001;
		circle.scale.x = circle.scale.y = circle.radius * circle.size;
		circle.speed = Math.random() * 0.15 + 0.15;
	}
};

LIGHTS.MapCircle = function( mesh ) {

	this.mesh = mesh;
	this.position = mesh.position;
	this.scale = mesh.scale;

	this.life =
	this.size =
	this.posMax =
	this.radius =
	this.speed = 0;
};
/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 27/07/2011
 * Time: 11:32
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.MapDots = function( map ) {

	this.initialize( map );
};

LIGHTS.MapDots.prototype = {

//    colors:         [ 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFF0000, 0x00FF00, 0x0000FF ],
	colors:         [ 0x808000, 0x008080, 0x800080, 0x800000, 0x008000, 0x000080 ],
//    colors:         [ 0xFF1561, 0x1a0209, 0x1a1002, 0xFF9D14 ],
	dotCount:       64,

	colorIndex:     0,
	drawCount:      0,
	dots:           [],
	dotMaterials:   [],
	addDot:         false,
	removeDot:      false,

	// _______________________________________________________________________________________ Constructor

	initialize: function( map ) {

	    this.map = map;

	    // Dot texture
	    var r = LIGHTS.TerrainMap.size * 0.5,
	        i, dot, dotMaterial, texture;

		texture = new THREE.Texture( LIGHTS.images.dot );
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		texture.magFilter = THREE.LinearMipMapLinearFilter;
	    texture.needsUpdate = true;

	    // Plane
	    for( i = 0; i < this.dotCount; i++ ) {

	        dotMaterial = new THREE.MeshBasicMaterial( {
		        color:          0xFFFFFF,
		        map:            texture,
		        blending:       THREE.AdditiveBlending,
		        transparent:    true
	        } );

	        dot = new THREE.Mesh( new THREE.PlaneGeometry( LIGHTS.TerrainMap.size, LIGHTS.TerrainMap.size ), dotMaterial  );

	        this.dots.push( dot );
	        this.dotMaterials.push( dotMaterial );
	    }
	},

	// _______________________________________________________________________________________ Update

	drawDots: function( count ) {

	    this.drawCount = count;

	    var i, dot, scale, size, posMax;

	    for( i = 0; i < count; i++ ) {

	        scale = 0.05 + 0.15 * Math.random(),
	        size = LIGHTS.TerrainMap.size * scale,
	        posMax = this.map.viewRadius - size * 0.5;

	        dot = this.dots[ i ];
	        dot.position.x = Math.random() * 2 * posMax - posMax;
	        dot.position.y = Math.random() * 2 * posMax - posMax;
	        dot.scale.x = dot.scale.y = scale;

	        this.map.scene.addChild( dot );
	        this.dotMaterials[ i ].color.setHex( this.colors[ (this.colorIndex++) % this.colors.length ] );
	    }

		this.addDot = true;
		this.removeDot = false;
	},

	clear: function() {

		for( var i = 0; i < this.dotCount; i++ )
		    this.map.scene.removeChild( this.dots[ i ] );
	},

	update: function() {

	    if( this.addDot ) {

		    this.addDot = false;
	        this.removeDot = true;
	    }
	    else if( this.removeDot ) {

	        for( var i = 0; i < this.drawCount; i++ )
	            this.map.scene.removeChild( this.dots[ i ] );

	        this.removeDot = false;
	    }
	}
};
/**
 * Created by JetBrains WebStorm.
 * User: Apple
 * Date: 04/09/2011
 * Time: 11:57
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.MapGlows = function( map ) {

	this.initialize( map );
};

LIGHTS.MapGlows.prototype = {

    colors:       [ [ [ 1, 1, 0 ], [ 1, 0, 0 ] ],
					[ [ 1, 0, 1 ], [ 1, 0, 0 ] ],
					[ [ 1, 1, 0 ], [ 0, 1, 0 ] ],
					[ [ 0, 1, 1 ], [ 0, 1, 0 ] ],
	                [ [ 0, 1, 1 ], [ 0, 0, 1 ] ],
	                [ [ 1, 0, 1 ], [ 0, 0, 1 ] ] ],

    glows:        [],

    // _______________________________________________________________________________________ Constructor

	initialize: function( map ) {

        this.map = map;
		this.ballSize = LIGHTS.BallGeometries.prototype.ballSize;

        // Glow texture
        var i, material;

        // Texture
		this.texture = new THREE.Texture( LIGHTS.images.glow );
		this.texture.minFilter = THREE.LinearMipMapLinearFilter;
		this.texture.magFilter = THREE.LinearMipMapLinearFilter;
        this.texture.needsUpdate = true;

        // Geometry
		this.glowCount = LIGHTS.BallsManager.prototype.ballsPerTile;
		this.geometry = new LIGHTS.SpotGeometry( 1, 1, 1, 1, this.glowCount );

		material = new THREE.MeshBasicMaterial( {

			vertexColors:   THREE.FaceColors,
			map:            this.texture,
			blending:       THREE.AdditiveBlending,
			transparent:    true
		} );

		this.mesh = new THREE.Mesh( this.geometry, material );
		this.mesh.dynamic = true;

        for( i = 0; i < this.glowCount; i++ )
            this.glows.push( new LIGHTS.MapGlow( i, this.geometry ) );
    },

    // _______________________________________________________________________________________ Public

    launch: function( balls ) {

	    this.balls = balls;

	    var glows = this.glows,
	        terrainSize = LIGHTS.Terrain.prototype.tileSize,
	        mapSize = this.map.viewRadius * 2,
		    i, il, glow, ballPos, ball, behaviour, colorIndex;

		for( i = 0, il = this.glowCount; i < il; i++ ) {

			behaviour = balls.behaviours[ i ];
			ballPos = behaviour.position;

            glow = this.glows[ i ];
			glow.behaviour = behaviour;

			glow.position.x = (ballPos.x / terrainSize) * mapSize;
			glow.position.y = (ballPos.z / terrainSize) * mapSize;
        }

        this.map.glowScene.addChild( this.mesh );
    },

	clear: function() {

        this.map.scene.removeChild( this.mesh );
	},

    update: function() {

	    var glows = this.glows,
		    ballSize = this.ballSize,
	        colors = this.colors,
		    i, il, glow, glowColor, ballColors, topColor, bottomColor, behaviour, mult, add, grow, scale, growMinus,
		    posX, posY, glowSize2;

        for( i = 0, il = this.glowCount; i < il; i++ ) {

	        glow = this.glows[ i ];
	        behaviour = glow.behaviour;

	        if( behaviour.visible && behaviour.state < 2 ) {

		        mult = behaviour.multiply;
		        add = behaviour.additive;
		        grow = behaviour.grow;
		        scale = behaviour.scale;

		        glow.visible = true;

		        if( glow.scale != scale || glow.grow != grow || glow.multiply != mult || glow.additive != add ) {

					glowColor = glow.color;
					ballColors = colors[ behaviour.colorIndex ];
					bottomColor = ballColors[ 0 ];
					topColor = ballColors[ 1 ];
					growMinus = 1 - grow;

					glowColor.r = (topColor[ 0 ] * growMinus + bottomColor[ 0 ] * grow) * mult + add;
					glowColor.g = (topColor[ 1 ] * growMinus + bottomColor[ 1 ] * grow) * mult + add;
					glowColor.b = (topColor[ 2 ] * growMinus + bottomColor[ 2 ] * grow) * mult + add;

					posX = glow.position.x;
					posY = glow.position.y;

					glowSize2 = 3 * ( behaviour.scale * ballSize * (1 - grow * 0.5) - add );

					glow.posA.x = posX - glowSize2;
					glow.posA.y = posY - glowSize2;
					glow.posB.x = posX + glowSize2;
					glow.posB.y = posY - glowSize2;
					glow.posC.x = posX - glowSize2;
					glow.posC.y = posY + glowSize2;
					glow.posD.x = posX + glowSize2;
					glow.posD.y = posY + glowSize2;

					glow.scale = scale;
					glow.grow = grow;
					glow.multiply = mult;
					glow.additive = add;

					this.geometry.__dirtyVertices = true;
					this.geometry.__dirtyColors = true;
		        }
	        }
	        else if( glow.visible ) {

		        glow.visible = false;
		        glow.scale = 0;

		        glow.posA.x = glow.posA.y =
		        glow.posB.x = glow.posB.y =
		        glow.posC.x = glow.posC.y =
		        glow.posD.x = glow.posD.y = 0;

		        this.geometry.__dirtyVertices = true;
	        }
        }
    }
};

LIGHTS.MapGlow = function( index, geometry ) {

	this.position = new THREE.Vector3();

	this.posA = geometry.vertices[ index * 4 ].position;
	this.posB = geometry.vertices[ index * 4 + 1 ].position;
	this.posC = geometry.vertices[ index * 4 + 2 ].position;
	this.posD = geometry.vertices[ index * 4 + 3 ].position;

	this.posA.z = 10;
	this.posB.z = 10;
	this.posC.z = 10;
	this.posD.z = 10;

	geometry.faces[ index ].color = this.color = new THREE.Color();

	this.scale = 0;
	this.grow = 0;
	this.multiply = 0;
	this.additive = 0;
	this.visible = false;
};
/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 27/07/2011
 * Time: 17:06
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.MapLines = function( map ) {

	this.initialize( map );
};

LIGHTS.MapLines.prototype = {

    colors:         [ 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFF0000, 0x00FF00, 0x0000FF ],
    lineCount:      64,

    colorIndex:     0,
    drawCount:      0,
    lines:          [],
    lineMaterials:  [],
    addLine:        false,
    removeLine:     false,

    // _______________________________________________________________________________________ Constructor

	initialize: function( map ) {

        this.map = map;

        // Circle texture
        var r = LIGHTS.TerrainMap.size * 0.5,
            i, line, material, height;

		var sizes = [ 2, 4, 8, 16, 32, 64 ];
        // Plane
        for( i = 0; i < this.lineCount; i++ ) {

            material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
	        height = Math.ceil( Math.random() * 4 );
//	        height = LIGHTS.TerrainMap.size / 16;
//	        height = sizes[ Math.floor( i / 4 ) ];
            line = new THREE.Mesh( new THREE.PlaneGeometry( LIGHTS.TerrainMap.size, height ), material  );

            this.lines.push( line );
            this.lineMaterials.push( material );
        }
    },

    // _______________________________________________________________________________________ Update

    drawLines: function( count ) {

        this.drawCount = count;

        var i, line, scale, size, posMax;

        for( i = 0; i < count; i++ ) {

            scale = 0.05 + 0.1 * Math.random(),
            size = LIGHTS.TerrainMap.size * scale,
            posMax = this.map.viewRadius - size * 0.5;

            line = this.lines[ i ];
            line.position.x = 0;
            line.position.y = Math.random() * 2 * posMax - posMax;
//            line.position.y = Math.floor( Math.random() * 16 ) * LIGHTS.TerrainMap.size / 16;
			line.speed = 0; //Math.random() * 32 + 32;
			line.speed *= (line.position.y > 0)? -1 : 1;

            this.map.scene.addChild( line );
            this.lineMaterials[ i ].color.setHex( this.colors[ (this.colorIndex++) % this.colors.length ] );

            this.addLine = true;
            this.removeLine = false;
        }
    },

	// TODO
	moveLines: function() {

		for( var i = 0; i < this.lineCount; i++ )
			this.lines[ i ].rotation.z += Math.random() * 0.1;

	},

	clear: function() {

		for( var i = 0; i < this.lineCount; i++ )
			this.map.scene.removeChild( this.lines[ i ] );
	},

	update: function() {

		for( var i = 0; i < this.lineCount; i++ )
			this.lines[ i ].position.y += this.lines[ i ].speed * LIGHTS.deltaTime;

return;
		/*
        if( this.addLine ) {

		    this.addLine = false;
            this.removeLine = true;
        }
        else if( this.removeLine ) {

            for( var i = 0; i < this.drawCount; i++ )
                this.map.scene.removeChild( this.lines[ i ] );

            this.removeLine = false;
        }
        */
    }
}
