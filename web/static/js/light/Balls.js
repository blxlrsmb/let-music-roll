//File: Balls.js
//Date: Sat Nov 15 00:41:15 2014 +0800

// Balls which turn white and black at the beginning

LIGHTS.Ball = function( manager, container, index, groupIndex ) {

	this.initialize( manager, container, index, groupIndex );
};

LIGHTS.Ball.prototype = {

	testMode:               false,

	groupSelectAdd:         [ [ 0, 0, 1 ], [ 0, 1, 0 ], [ 0, 0, 1 ], [ 1, 0, 0 ], [ 1, 0, 0 ], [ 0, 1, 0 ] ],
	selectAddIntensity:     0.7,

	// _______________________________________________________________________________________ Constructor

	initialize: function( manager, container, index, groupIndex ) {

		this.manager = manager;
		this.container = container;

		// Behaviour
		this.behaviour = manager.behaviours[ index ];
		this.behaviour.balls.push( this );

		// Ball
		this.geometries = manager.geometries,
		this.terrainDisplacement = manager.director.terrain.displacement;
		this.scene = manager.director.view.scene;
		this.children = [];
		this.visible = false;
		this.state = 0;
		this.interactive = false;
		this.selected = false;
		this.unselected = false;
		this.mouseOver = false;
		this.selectGrow = false;
		this.selectMultiply = false;
		this.selectAdditive = false;
		this.selectedPhase = 0;
		this.alpha = 0;

		this.ballSize = LIGHTS.BallGeometries.prototype.ballSize;
		this.ballOffset = LIGHTS.BallGeometries.prototype.ballSize * 0.86;
		this.stemLength = LIGHTS.BallGeometries.prototype.stemLength;

		var	geometries = this.geometries,
			colorIndex = this.behaviour.colorIndex,
			i, mesh, geometry;

		// Spheres
		this.colorIndex = colorIndex;
		geometry = geometries.sphereGeometries[ colorIndex ];
		this.sphereGeometry = geometry;
		this.sphereMaterial = geometries.createSphereMaterial( groupIndex );
		this.addR = this.sphereMaterial.addR;
		this.addG = this.sphereMaterial.addG;
		this.addB = this.sphereMaterial.addB;
		mesh = new THREE.Mesh( geometry, this.sphereMaterial );
//		mesh.dynamic = true;
		mesh.useQuaternion = true;
		mesh.interactive = true;
		mesh.active = false;
		this.ball = mesh;
		this.children.push( mesh );

		this.selectAddR = this.groupSelectAdd[ colorIndex ][ 0 ] * this.selectAddIntensity;
		this.selectAddG = this.groupSelectAdd[ colorIndex ][ 1 ] * this.selectAddIntensity;
		this.selectAddB = this.groupSelectAdd[ colorIndex ][ 2 ] * this.selectAddIntensity;
		this.selectAdd = 0;

		// REMOVE
		// REMOVE
		// REMOVE
		// REMOVE
		// REMOVE
		// REMOVE
		// REMOVE
		// Stem
//		mesh = new THREE.Mesh( geometries.stemGeometry, geometries.stemMaterial );
//		mesh.useQuaternion = true;
//		mesh.interactive = true;
//		mesh.active = false;
//		this.stem = mesh;
//		this.children.push( mesh );

		// Balloon
		geometry = geometries.balloonGeometries[ colorIndex ];
		mesh = new THREE.Mesh( geometry, this.sphereMaterial );
		mesh.useQuaternion = true;
		mesh.interactive = true;
		mesh.active = false;
		this.balloon = mesh;
		this.children.push( mesh );

		// Rotation
		this.rotation = new THREE.Quaternion();
		this.rotation.setFromEuler( new THREE.Vector3( 0, 0, 5 ) );

		// Scale
		this.scale = this.behaviour.scale;
		this.grow = this.growTarget = 0;

		// Colliders
		this.colliderRoot = new THREE.SphereCollider( new THREE.Vector3(), 0 );
		this.colliderRoot.mesh = this.ball;
		this.colliderRoot.ball = this;
		manager.mouseOverCollisions.colliders.push( this.colliderRoot );

		this.colliderBall = new THREE.SphereCollider( new THREE.Vector3(), 0 );
		this.colliderBall.mesh = this.ball;
		this.colliderBall.ball = this;
		manager.mouseOverCollisions.colliders.push( this.colliderBall );

		this.colliderBall.other = this.colliderRoot;
		this.colliderRoot.other = this.colliderBall;
		this.colliderBall.enabled = true;

		this.colliderClick = new THREE.SphereCollider( new THREE.Vector3(), 0 );
		this.colliderClick.mesh = this.balloon;
		this.colliderClick.ball = this;
		manager.clickCollisions.colliders.push( this.colliderClick );

		// State
		this.setState( this.state );

		if( this.testMode ) {

			this.trident = new THREE.Trident();
			this.trident.scale.x = this.trident.scale.y = this.trident.scale.z = 0.4;
			manager.director.view.scene.addChild( this.trident );
		}

//		this.colliderHelper = new THREE.Mesh( new THREE.SphereGeometry( 16, 10, 10 ), new THREE.MeshBasicMaterial( { wireframe: true, color:0xff0000, depthTest: false}));
//		this.colliderHelper.position = this.colliderClick.center;
//		manager.director.view.scene.addChild( this.colliderHelper );
	},

    // _______________________________________________________________________________________ State

	setState: function( state ) {

		switch( state ) {

			case 0:
				this.interactive = this.selected = this.unselected = false;

				this.mouseOver = false;
				this.selectGrow = false;
				this.selectMultiply = false;
				this.selectAdditive = false;
				this.grow = this.growTarget = 0;

				this.ball.active = true;
				this.balloon.active = false;

				this.colliderRoot.enabled = false;
				break;

			case 1:
				this.ball.active = true;

				if( this.selected )
					this.unselect( true );

				this.colliderRoot.enabled = true;

				var ballScale = this.balloon.scale;
				ballScale.x = ballScale.y = ballScale.z = this.behaviour.scale;
				break;

			case 2:
//				this.ball.active = false;

//				this.stem.active = this.stem.visible = true;

//				if( this.stem.parent !== this.container )
//				    THREE.MeshUtils.addChild( this.scene, this.container, this.stem );

				this.balloon.active = this.balloon.visible = true;

				if( this.balloon.parent !== this.container )
				    THREE.MeshUtils.addChild( this.scene, this.container, this.balloon );

				this.colliderRoot.enabled = false;
				break;

			case 3:
				if( this.selected )
					this.unselect();

//				this.balloon.active = true;
				this.colliderRoot.enabled = false;
				break;

			case 4:
				if( this.selected )
					this.unselect();

//				this.balloon.active = true;
				this.colliderClick.radiusSq = this.colliderClick.radius = 0;
				break;
		}

		this.state = state;
	},

	select: function() {

		if( this.unselected && this.selectedPhase != LIGHTS.Music.phase.index )
			return;

		this.interactive = this.selected = true;
		this.unselected = false;

		this.selectedPhase = LIGHTS.Music.phase.index;
		this.scale = this.behaviour.scale;

		switch( LIGHTS.Music.phase.index ) {

		    case 1:
		    case 2:
				this.selected = false;
		        break;

			case 3:
			case 4:
			case 5:
			case 6:
			case 8:
				this.selectGrow = true;
				this.growTarget = 1;

				this.setRotation();
				this.setScale();
				this.selectAdditive = true;
				break;

			case 7:
				this.selectMultiply = true;
				this.behaviour.multiply = 1;
				break;

			case 9:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
			case 17:
			case 18:
			case 19:
			case 20:
			case 21:
				if( this.state == 0 ) {

					this.selectGrow = true;
					this.growTarget = 1;

					this.setRotation();
					this.setScale();
				}
				else {

					this.selectGrow = false;
				}

				this.selectAdditive = true;
				break;
		}
	},

	unselect: function( force ) {

//		console.log( "unselect", force, this.selectedPhase, LIGHTS.Music.phase.index);

		this.unselected = true;

		switch( this.selectedPhase ) {

			case 3:
			case 4:
			case 5:
				if( force ) {

					this.interactive = this.unselected = this.selectAdditive = false;
					this.addR.value = this.selectAddR;
					this.addG.value = this.selectAddG;
					this.addB.value = this.selectAddB;
					this.selectAdd = 1;
				}

				this.selected = false;
				break;

			case 6:
				if( force )
					this.selected = false;
				else
					this.selected = (this.grow <= 0.99);
				break;

			case 7:
				if( force ) {
					this.interactive = this.unselected = this.selectMultiply = false;
					this.behaviour.multiply = 1;
					this.sphereMaterial.multiply.value = 1.0;
				}
				else {
					this.behaviour.multiply = 0;
				}

				this.selected = false;
				break;

			case 8:
			case 9:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
			case 17:
			case 18:
			case 19:
			case 20:
			case 21:
				if( this.state == 0 ) {

					this.selected = force? false : (this.grow <= 0.99);
				}
				else if( force ) {

					this.interactive = this.unselected = this.selectAdditive = false;
					this.addR.value =
					this.addG.value =
					this.addB.value = 0;
					this.selectAdd = 0;
				}

				this.selected = false;
				break;
		}
	},

    // _______________________________________________________________________________________ Update

	update: function() {

		var deltaTime = LIGHTS.deltaTime,
			behaviour = this.behaviour,
			easing;

		// Visible
		if( this.visible && this.container.visible ) {

			this.ball.visible = this.ball.active;
			this.balloon.visible = this.balloon.active;
		}
		else {

			this.ball.visible =
			this.balloon.visible = false;
		}

		// Additive
		if( this.selectAdditive ) {

			if( this.selected ) {

				easing = deltaTime * 10;
				this.addR.value -= (this.addR.value - this.selectAddR) * easing;
				this.addG.value -= (this.addG.value - this.selectAddG) * easing;
				this.addB.value -= (this.addB.value - this.selectAddB) * easing;
				this.selectAdd -= (this.selectAdd - 1) * easing;
			}
			else if( this.unselected ) {

				easing = deltaTime * 10;
				this.addR.value -= this.addR.value * easing;
				this.addG.value -= this.addG.value * easing;
				this.addB.value -= this.addB.value * easing;
				this.selectAdd -= this.selectAdd * easing;

				if( this.selectAdd < 0.01 ) {

					this.addR.value =
					this.addG.value =
					this.addB.value = 0;
					this.selectAdd = 0;
					this.selectAdditive = false;

					if( ! this.selectGrow )
						 this.interactive = this.unselected = false;
				}
			}
		}

		// Spikes
//		var updateVertices = false;
//
//		if( this.selected && this.alpha < 0.99 ) {
//
//			this.alpha -= (this.alpha - 1) * deltaTime * 5;
//			updateVertices = true;
//		}
//		else if( this.alpha > 0 ) {
//
//			this.alpha -= (this.alpha - 0) * deltaTime * 10;
//
//			if( this.alpha < 0.01 )
//				this.alpha = 0;
//
//			updateVertices = true;
//		}
//
//		if( updateVertices )
//			this.geometries.tweenSphereSpikes( this.ball.geometry, this.alpha );

		// State
		switch( this.state ) {

			case 0:
				if( this.selectGrow ) {

					if( this.selected ) {

						// Grow
						this.grow -= (this.grow - 0.3) * deltaTime * 4;
						this.scale -= (this.scale - behaviour.rootScale * 1.5) * deltaTime * 4;

						if( this.grow > 0.29 && this.unselected )
							this.selected = false;
					}
					else if( this.unselected ) {

						// Grow
						this.grow -= (this.grow - 0) * deltaTime * 4;
						this.scale -= (this.scale - behaviour.scale) * deltaTime * 12;

						if( this.grow < 0.01 ) {

							this.interactive = this.unselected = this.selectGrow = false;
							this.scale = behaviour.scale;
						}
					}

					this.setPosition( this.grow * this.stemLength * this.scale );
					this.setScale();

					// Displacement
//					if( this.terrainDisplacement.active )
//						this.setRotation();
				}
				else if( this.selectMultiply ) {

					if( this.selected ) {

						if( this.sphereMaterial.multiply.value < 1 ) {

							this.sphereMaterial.multiply.value -= (this.sphereMaterial.multiply.value - 1) * deltaTime * 10;

							if( this.sphereMaterial.multiply.value > 0.99 )
								this.sphereMaterial.multiply.value = 1;
						}
					}
					else if( this.unselected ) {

						this.sphereMaterial.multiply.value -= (this.sphereMaterial.multiply.value - 0) * deltaTime * 10;

						if( this.sphereMaterial.multiply.value < 0.01 ) {

							this.sphereMaterial.multiply.value = 0;
							this.interactive = this.unselected = this.selectMultiply = false;
						}
					}
				}
				break;

			case 1:

				if( this.selectGrow ) {

					this.grow -= (this.grow - behaviour.grow) * deltaTime * 4;
					this.scale -= (this.scale - behaviour.scale) * deltaTime * 8;

					if( Math.abs( this.grow - behaviour.grow ) < 0.01 ) {

						this.interactive = this.unselected = this.selectGrow = false;
						this.grow = behaviour.grow;
						this.scale = behaviour.scale;
					}

					this.setPosition( this.grow * this.stemLength * this.scale );
					this.setScale();
				}
				break;

			case 2:
				// Grow
//				if( this.ball.parent !== null && this.ball.parent !== undefined ) {
//
//					if( behaviour.scale == 0.01 ) {
//
//						this.ball.active = this.ball.visible = false;
//
//						if( this.ball.parent === this.container )
//							THREE.MeshUtils.removeChild( this.scene, this.container, this.ball );
//					}
//				}

				// Launch ball
				if( this.balloon.active ) {

					this.balloon.position.copy( behaviour.ballPosition );
					this.ball.position.copy( behaviour.ballPosition );
					this.balloon.quaternion.multiplySelf( this.rotation );
				}
				break;

			case 3:
				this.sphereMaterial.multiply.value -= this.sphereMaterial.multiply.value * deltaTime * 2;

				if( this.sphereMaterial.multiply.value < 0.01 ) {

					this.balloon.active = this.balloon.visible = false;

					if( this.balloon.parent === this.container )
						THREE.MeshUtils.removeChild( this.scene, this.container, this.balloon );

					this.colliderClick.radiusSq = this.colliderClick.radius = 0;
				}
				break;

			case 4:
				var ballScale = this.balloon.scale;
				ballScale.x = Math.max( 0.001, ballScale.x - deltaTime * 8 );
				ballScale.y = ballScale.z = ballScale.x;
				break;
		}

		// Colliders
		var root = behaviour.root,
			scale = Math.max( this.scale, behaviour.scale );

		this.colliderRoot.center.x = root.x + this.container.position.x;
		this.colliderRoot.center.y = root.y + this.container.position.y;
		this.colliderRoot.center.z = root.z + this.container.position.z;

		this.colliderBall.center.x = this.ball.position.x + this.container.position.x;
		this.colliderBall.center.y = this.ball.position.y + this.container.position.y;
		this.colliderBall.center.z = this.ball.position.z + this.container.position.z;

		this.colliderRoot.radius = this.colliderBall.radius = scale * this.ballSize * phi * 2;
		this.colliderRoot.radiusSq = this.colliderBall.radiusSq = this.colliderBall.radius * this.colliderBall.radius;

		if( this.state < 2 ) {

			this.colliderClick.center.x = this.colliderBall.center.x;
			this.colliderClick.center.y = this.colliderBall.center.y;
			this.colliderClick.center.z = this.colliderBall.center.z;

			this.colliderClick.radius = scale * this.ballSize;
			this.colliderClick.radiusSq = this.colliderClick.radius * this.colliderClick.radius;
		}
		else {

			this.colliderClick.center.x = this.balloon.position.x + this.container.position.x;
			this.colliderClick.center.y = this.balloon.position.y + this.container.position.y;
			this.colliderClick.center.z = this.balloon.position.z + this.container.position.z;
		}

//		this.colliderHelper.scale.x = this.colliderHelper.scale.y = this.colliderHelper.scale.z = scale;

		// Test mode
		if( this.testMode ) {

			this.trident.position.add( this.ball.position, this.container.position );

			if( this.selected ) {

				this.trident.rotation.x = -rad90;
				this.trident.rotation.z = 0;
			}
			else if( this.unselected ) {

				this.trident.rotation.x = 0;
				this.trident.rotation.z = rad90;
			}
			else {

				this.trident.rotation.x = 0;
				this.trident.rotation.z = 0;
			}
		}
	},

	removeSphere: function() {

		this.ball.active = this.ball.visible = false;

		if( this.ball.parent === this.container )
			THREE.MeshUtils.removeChild( this.scene, this.container, this.ball );
	},


    // _______________________________________________________________________________________ Transform

	setPosition: function( scaleMult ) {

		var root = this.behaviour.root,
			normal = this.behaviour.normal,
			pX, pY, pZ, pos;

		pX = root.x + normal.x * scaleMult;
		pY = root.y + normal.y * scaleMult;
		pZ = root.z + normal.z * scaleMult;

		pos = this.ball.position;
		pos.x = pX;
		pos.y = pY;
		pos.z = pZ;

		if( this.balloon.active ) {

			pos = this.balloon.position;
			pos.x = pX;
			pos.y = pY;
			pos.z = pZ;
		}
	},

	setRotation: function() {

		var behaviour = this.behaviour,
			from = behaviour.up,
			to = behaviour.normal,
			q = behaviour.q,
			h = behaviour.h;

        h.add( from, to );
        h.normalize();

		q.w = from.dot( h );
        q.x = from.y * h.z - from.z * h.y;
        q.y = from.z * h.x - from.x * h.z;
        q.z = from.x * h.y - from.y * h.x;

		this.ball.quaternion.copy( q );

		if( this.balloon.active )
			this.balloon.quaternion.copy( q );
	},

	setScale: function() {

		var scale = this.scale,
			objectScale = this.ball.scale;

		objectScale.x =	objectScale.y =	objectScale.z = scale;

		if( this.balloon.active ) {

			objectScale = this.balloon.scale;
			objectScale.x =	objectScale.y = objectScale.z = scale;
		}
	}
};

/**
 * Created by JetBrains WebStorm.
 * User: Apple
 * Date: 04/09/2011
 * Time: 14:03
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.BallBehaviour = function( manager, index ) {

	this.initialize( manager, index );
};

LIGHTS.BallBehaviour.prototype = {

	ballFat:                0.5,

	up:                     new THREE.Vector3( 0, 1, 0 ),
	h:                      new THREE.Vector3(),
	q:                      new THREE.Quaternion(),

	initialize: function( manager, index ) {

		this.index = index;
		this.groupIndex = index % 2;

		var terrain = manager.director.terrain;

		this.root = terrain.randomVertex.position;
		this.normal = terrain.randomNormal;
		this.terrainDisplacement = terrain.displacement;

		this.state = 0;
//		this.visible = true;
		this.visible = false;

		this.position = new THREE.Vector3();
		this.ballPosition = new THREE.Vector3();

		this.scale = this.rootScale = Math.random() * 0.5 + 0.25;
		this.scaleDown = 0;//-this.ballOffset * this.rootScale;

		this.fatActive = false;
		this.fat = this.fatTarget = 0;
		this.fatEase = Math.random() * 12 + 4;

		this.grow = this.growTarget = 0;

		this.stemLength = LIGHTS.BallGeometries.prototype.stemLength;
		this.colorIndex = this.groupIndex * 3 + Math.floor( Math.random() * 3 );

		if( LIGHTS.BallGeometries.prototype.groupBehaviours[ this.groupIndex ] === undefined )
			LIGHTS.BallGeometries.prototype.groupBehaviours[ this.groupIndex ] = this;

		this.additive = 0;
		this.multyiply = 0;
		this.balls = [];
	},

    // _______________________________________________________________________________________ State

	setState: function( state ) {

		var balls = this.balls,
			i, il;

		for( i = 0, il = balls.length; i < il; i++ )
			balls[ i ].setState( state );

		switch( state ) {

			case 0:
				this.fatActive = false;
				this.growActive = false;
				this.fat = this.fatTarget = 0;
				this.grow = this.growTarget = 0;
				this.additive = 1;

				this.scale = this.rootScale;
				this.setPosition( this.scaleDown );
				this.setRotation();
				this.setScale();
				break;

			case 1:
				this.growActive = true;
				this.growTarget = 1;
				this.setRotation();
				this.setScale();
				break;

			case 2:
				this.ballPosition.copy( this.position );
				this.height = this.position.y + Math.random() * 50 + 25;
				this.ease = Math.random() * 0.2 + 0.2;
				this.growTarget = 0;
				break;

			case 3:
			case 4:
				break;
		}

		this.state = state;
	},

    // _______________________________________________________________________________________ Update

	update: function() {

		var deltaTime = LIGHTS.deltaTime;

		var balls = this.balls,
			i, il, ball;

		for( i = 0, il = balls.length; i < il; i++ )
			balls[ i ].update();

		// State
		switch( this.state ) {

			case 0:
				// Fat
				if( this.fatActive ) {

					this.fat -= (this.fat - this.fatTarget) * deltaTime * this.fatEase;

					if( this.fatTarget == 1 )
						this.fat = Math.min( this.fat, this.fatTarget );
					else if( this.fatTarget == 0 )
						this.fat = Math.max( this.fat, this.fatTarget );

					this.scale = this.rootScale * (1 + this.fat * this.ballFat);
					this.setScale();
				}

				// Displacement
				if( this.terrainDisplacement.active ) {

					this.setPosition( this.scaleDown );
					this.setRotation();
				}
				break;

			case 1:

				// Grow
				this.grow -= (this.grow - this.growTarget) * deltaTime * 2.5;

				if( this.growTarget == 1 )
					this.grow = Math.min( this.grow, this.growTarget );
				else if( this.growTarget == 0 )
					this.grow = Math.max( this.grow, this.growTarget );

				this.setPosition( this.grow * this.stemLength * this.scale );

				// Displacement
				if( this.terrainDisplacement.active )
					this.setRotation();
				break;

			case 2:
				// Grow
				this.scale -= this.scale * deltaTime * 8;

				if( this.scale < 0.05 )
					this.scale = 0.01;

				this.setScale();

//				this.setPosition( this.grow * this.stemLength * this.scale, true );

				// Launch ball
				this.ballPosition.y -= (this.position.y - this.height) * deltaTime * this.ease;
				break;

			case 3:
			case 4:
				break;
		}
	},

    // _______________________________________________________________________________________ Transform

	setPosition: function( scaleMult ) {

		var balls = this.balls,
			p = this.position,
			normal = this.normal,
			root = this.root,
			pX, pY, pZ, ball, pos, i, il;

		pX = p.x = root.x + normal.x * scaleMult;
		pY = p.y = root.y + normal.y * scaleMult;
		pZ = p.z = root.z + normal.z * scaleMult;

		for( i = 0, il = balls.length; i < il; i++ ) {

			ball = balls[ i ];

			if( ! ball.selectGrow ) {

				pos = ball.ball.position;
				pos.x = pX;
				pos.y = pY;
				pos.z = pZ;
			}
		}
	},

	setRotation: function() {

		var balls = this.balls,
			from = this.up,
			to = this.normal,
			q = this.q,
			h = this.h,
			i, il, ball;

        h.add( from, to );
        h.normalize();

		q.w = from.dot( h );
        q.x = from.y * h.z - from.z * h.y;
        q.y = from.z * h.x - from.x * h.z;
        q.z = from.x * h.y - from.y * h.x;

		for( i = 0, il = balls.length; i < il; i++ ) {

			ball = balls[ i ];

			ball.ball.quaternion.copy( q );
		}
	},

	setScale: function() {

		var balls = this.balls,
			scale = this.scale,
			i, il, ball, objectScale;

		for( i = 0, il = balls.length; i < il; i++ ) {

			ball = balls[ i ];

			if( ! ball.selectGrow ) {

				objectScale = ball.ball.scale;
				objectScale.x =	objectScale.y =	objectScale.z = scale;
			}
		}
	}
}

/**
 * Created by JetBrains WebStorm.
 * User: Apple
 * Date: 02/09/2011
 * Time: 17:49
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.BallExplosions = function( manager, container, index, groupIndex ) {

	this.initialize( manager );
};

LIGHTS.BallExplosions.prototype = {

	explosionCount:     16,
	explosionPool:      [],
	explosions:         [],

	particleMaps:       [ 'plasmaRed', 'plasmaYellow', 'plasmaGreen', 'plasmaCyan', 'plasmaBlue', 'plasmaMagenta', 'plasmaWhite' ],
	ballColorTable:     [ [ 1, 0 ], [ 5, 0 ], [ 1, 2 ], [ 3, 2 ], [ 3, 4 ], [ 5, 4 ] ],


	// _______________________________________________________________________________________ Constructor

	initialize: function( manager ) {

		this.scene = manager.director.view.scene;

		var material, texture, i, il;

		// Materials
		this.materials = [];

		for( i = 0, il = this.particleMaps.length; i < il; i++ ) {

			texture = new THREE.Texture( LIGHTS.images[ this.particleMaps[ i ] ] );
			texture.needsUpdate = true;

			material = new THREE.ParticleBasicMaterial({
				vertexColors: true,
				size: 16,
				map: texture,
				blending: THREE.AdditiveBlending,
				transparent: true
			});

			this.materials.push( material );
		}

		// Explosions
		for( i = 0, il = this.explosionCount; i < il; i++ ) {

			explosion = new LIGHTS.BallExplosion( material );
			this.explosionPool.push( explosion );
			this.explosions.push( explosion );
		}
	},

	launchExplosion: function( ball ) {

		var explosion = this.explosionPool.pop();

		if( explosion !== undefined ) {

			THREE.MeshUtils.addChild( this.scene, this.scene, explosion.particleSystem );
			explosion.particleSystem.visible = true;

			var materialIndex = 6;

			if( LIGHTS.Music.phase.index > 2 )
				materialIndex = this.ballColorTable[ ball.colorIndex ][ Math.floor( Math.random() * 2 ) ];

			explosion.particleSystem.materials[ 0 ] = this.materials[ materialIndex ];
			explosion.launch( ball );
		}
	},

	update: function() {

		var explosions = this.explosions,
			i, il, explosion;

		// Update
		for( i = 0, il = explosions.length; i < il; i++ ) {

			explosion = explosions[ i ];

			if( explosion.active )
				explosion.update();
		}

		// Remove finished
		for( i = 0, il = explosions.length; i < il; i++ ) {

			explosion = explosions[ i ];

			if( explosion.active && explosion.life < 0 ) {

				explosion.particleSystem.visible = explosion.active = false;
				THREE.MeshUtils.removeChild( this.scene, this.scene, explosion.particleSystem );
				this.explosionPool.push( explosion );
			}
		}
	}
};

LIGHTS.BallExplosion = function( material ) {

	this.initialize( material );
};

LIGHTS.BallExplosion.prototype = {

	particleCount:      512,
	gravityStream:      -256,
	gravityExplosion:   0,

	// _______________________________________________________________________________________ Constructor

	initialize: function( material ) {

		var i, il, particle, colors;

		this.particleGeometry = new THREE.Geometry();
		this.particles = [];
		colors = this.particleGeometry.colors = [];

		for( i = 0, il = this.particleCount; i < il; i++ ) {

			particle = new THREE.Vector3();
			particle.x = Math.random() * 32 - 16;
			particle.y = Math.random() * 32 - 16;
			particle.z = Math.random() * 32 - 16;

			particle.velocity = new THREE.Vector3();
			particle.color = new THREE.Color( 0x000000 );

		    this.particles.push( particle );
		    this.particleGeometry.vertices.push( new THREE.Vertex( particle ) );
		    colors.push( particle.color );
		}

		this.particleSystem = new THREE.ParticleSystem( this.particleGeometry, material );
		this.particleSystem.sortParticles = false;
		this.particleSystem.dynamic = true;
		this.particleSystem.visible = false;
//		this.position = this.particleSystem.position;

		this.active = false;
	},

	launch: function( ball ) {

		this.ball = ball;

		if( ball.state > 3 )
			return;

		var particles = this.particles,
			colors = this.colors,
			isFlying = (ball.state >= 2),
			i, il, u, a, r, particle, color, velocity, speed, speedY;

		if( isFlying )
			ball.setState( 4 );

		for( i = 0, il = particles.length; i < il; i++ ) {

			particle = particles[ i ];

			if( isFlying ) {

				u = Math.random() * 2 - 1;
				speed = speedY = Math.random() * 96 + 64;
				particle.life = Math.random() * 0.2 + 0.2;
				particle.delay = Math.random() * 0.1 + 0.08;
			}
			else {

				u = Math.random() * 0.5 + 0.5;
				speedY = Math.random() * 256 + 128;
				speed = Math.random() * 64 + 64;
				particle.delay = Math.random() * 0.5;
			}

			a = Math.random() * rad360;
			r = Math.sqrt( 1 - u * u );

			velocity = particle.velocity;
			velocity.x = Math.cos( a ) * r * speed;
			velocity.y = u * speedY;
			velocity.z = Math.sin( a ) * r * speed;

			if( ! isFlying )
				ball.ball.quaternion.multiplyVector3( velocity );

			particle.drag = Math.random() * 0.01 + 0.005;
			particle.color.r = particle.color.g = particle.color.b = 0;
			particle.intensity = Math.random() * 0.3 + 0.7;
			particle.launch = false;
		}

		this.life = 2;
		this.active = true;
	},

	update: function() {

		var deltaTime = LIGHTS.deltaTime,
			particleGeometry = this.particleGeometry,
			particles = this.particles,
			ball = this.ball,
			isFlying = (ball.state >= 2),
			gravity = (isFlying? this.gravityExplosion : this.gravityStream) * deltaTime,
			ballPos = isFlying? ball.balloon.position : ball.ball.position,
			containerPos = ball.container.position,
			ballNormal = ball.behaviour.normal,
			ballRadius = isFlying? 0 : ball.scale * ball.ballSize - 2.5,
			pX = ballPos.x + containerPos.x + ballRadius * ballNormal.x,
			pY = ballPos.y + containerPos.y + ballRadius * ballNormal.y,
			pZ = ballPos.z + containerPos.z + ballRadius * ballNormal.z,
			i, il, particle, velocity, color;

		for( i = 0, il = particles.length; i < il; i++ ) {

			particle = particles[ i ];

			if( particle.delay < 0 ) {

				velocity = particle.velocity;
				particle.x += velocity.x * deltaTime;
				particle.y += velocity.y * deltaTime;
				particle.z += velocity.z * deltaTime;
				velocity.y += gravity;

				drag = 1 - particle.drag * deltaTime;
				velocity.x *= drag;
				velocity.y *= drag;
				velocity.z *= drag;

				if( particle.launch ) {

					color = particle.color;
					color.r = color.g = color.b = particle.intensity;
					particleGeometry.__dirtyColors = true;

					particle.launch = false;
				}

				if( isFlying ) {

					particle.life -= deltaTime;

					if( particle.life < 0 ) {

						if( particle.life > -0.25 ) {

							color = particle.color;
							color.r = particle.intensity * (1 + particle.life * 4);
							color.g = color.b = color.r;
							particleGeometry.__dirtyColors = true;
						}
						else {

							color = particle.color;
							color.r = color.g = color.b = 0;
							particleGeometry.__dirtyColors = true;
						}
					}
				}
				else if( velocity.y < 0 ) {

					color = particle.color;
					color.r = color.g = color.b = Math.min( 1, -particle.intensity * 10 / velocity.y );
					particleGeometry.__dirtyColors = true;
				}
			}
			else {

				particle.delay -= deltaTime;

				if( particle.delay < 0 ) {

					particle.x = pX;
					particle.y = pY;
					particle.z = pZ;

					particle.launch = true;
				}
			}
		}

		particleGeometry.__dirtyVertices = true;
		this.life -= deltaTime;
	}
};
/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 14/08/2011
 * Time: 09:32
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.BallGeometries = function( director ) {

	this.initialize( director );
};

LIGHTS.BallGeometries.prototype = {

	ballSize:               16,

	stemWidth:              0.05,

	stemRadius:             2,
	stemLength:             48,
	stemCapHeight:          2,
	stemReflectivity:       0.4,

	sphereColors:           [ [ 0xFFFF00, 0xFF0000 ],
							  [ 0xFF00FF, 0xFF0000 ],
							  [ 0xFFFF00, 0x00FF00 ],
							  [ 0x00FFFF, 0x00FF00 ],
							  [ 0x00FFFF, 0x0000FF ],
							  [ 0xFF00FF, 0x0000FF ] ],

	spotColors:             [ 0xFF6060,
							  0xFF6060,
							  0x60FF60,
							  0x60FF60,
							  0x6060FF,
							  0x6060FF ],

	groupBehaviours:        [],

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

		this.director = director;

		this.createSphereGeometries();
		this.createBalloonGeometries();
		this.createStemGeometry();
	},

    // _______________________________________________________________________________________ Sphere

	createSphereGeometries: function() {

		// Geometries
		this.sphereGeometries = [];

		var geometry, colors, material, shader, uniforms, i, il, v;

		for( i = 0, il = this.sphereColors.length; i < il; i++ ) {

//			geometry = new LIGHTS.SphereGeometry( this.ballSize, 16, 12 );
			geometry = this.createDropGeometry();
//			geometry = this.createStemGeometry();
//			this.createSphereSpikes( geometry );
			colors = this.sphereColors[ i ];
			THREE.MeshUtils.createVertexColorGradient( geometry, [ colors[ 0 ], colors[ 1 ] ], 0.6667 );
			this.sphereGeometries.push( geometry );
		}

		// Shader
		this.sphereShader = {

			uniforms: THREE.UniformsUtils.merge( [

				THREE.UniformsLib[ "common" ],
				THREE.UniformsLib[ "fog" ],
				{ "addR" : { type: "f", value: 0.0 } },
				{ "addG" : { type: "f", value: 0.0 } },
				{ "addB" : { type: "f", value: 0.0 } },
				{ "multiply" : { type: "f", value: 1.0 } }
			] ),

			fragmentShader: [

				"uniform float addR;",
				"uniform float addG;",
				"uniform float addB;",
				"uniform float multiply;",

				THREE.ShaderChunk[ "color_pars_fragment" ],
				THREE.ShaderChunk[ "fog_pars_fragment" ],

				"void main() {",

					"gl_FragColor = vec4( vColor * multiply, 1.0 );",
					"gl_FragColor.r = min( gl_FragColor.r + addR, 1.0 );",
					"gl_FragColor.g = min( gl_FragColor.g + addG, 1.0 );",
					"gl_FragColor.b = min( gl_FragColor.b + addB, 1.0 );",

					THREE.ShaderChunk[ "fog_fragment" ],
				"}"
			].join("\n"),

			vertexShader: [

				THREE.ShaderChunk[ "color_pars_vertex" ],

				"void main() {",

					"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

					THREE.ShaderChunk[ "color_vertex" ],
					THREE.ShaderChunk[ "default_vertex" ],
				"}"
			].join("\n")
		};

		this.sphereMaterials = [];
		this.sphereMaterialGroups = [];

		this.groupAdditives = [ 0.0, 0.0 ];
		this.groupMultiplies = [ 1.0, 1.0 ];
	},

	createBalloonGeometries: function() {

		// Geometries
		this.balloonGeometries = [];

		var geometry, colors, i, il;

		for( i = 0, il = this.sphereColors.length; i < il; i++ ) {

			geometry = new LIGHTS.SphereGeometry( this.ballSize, 16, 12 );
			colors = this.sphereColors[ i ];
			THREE.MeshUtils.createVertexColorGradient( geometry, [ colors[ 0 ], colors[ 1 ] ] );
			this.balloonGeometries.push( geometry );
		}
	},

/*
	createSphereGeometry: function() {

		var colors = this.sphereColors[ Math.floor( Math.random() * this.sphereColors.length) ],
			geometry, colors, material, shader, uniforms, i, il, v;

		geometry = new LIGHTS.SphereGeometry( this.ballSize, 12, 12 );
		this.createSphereSpikes( geometry );
		THREE.MeshUtils.createVertexColorGradient( geometry, [ colors[ 0 ], colors[ 1 ] ] );

		return geometry;
	},
*/

	createDropGeometry: function() {

		var segmentsAroundY = 16,
			refYs = [ -45, -30.168032, -23.313184, -17.65832, -14.0680352, -11.2017072, -7.888, -4.0291056, 0.112, 4.2531056, 8.112, 11.4257088, 13.9684064, 15.5668128 ],
			refRs = [ 1.81821399749878, 2.402843307774461, 3.7592494738495223, 6.7234277501566355, 9.351939279986453, 11.548022675641983, 13.9635861231426, 15.482072410492423, 15.999999947561278, 15.454813063676234, 13.856406445413263, 11.31370807962314, 7.999999973780639, 4.141104984053141 ],
			positions = [],
			i, il, pos, radius, angle, j, cos, sin;

		var geometry = new LIGHTS.CapsuleGeometry( 1, 1, 1, segmentsAroundY, refYs, true, 15, 1, false ), // 0.0340742
			vertices = geometry.vertices;

		v = 0;

		for( i = 0, il = refRs.length; i < il; i++ ) {

			radius = refRs[ i ];

			for( j = 0; j < segmentsAroundY; j++ ) {

				pos = vertices[ v++ ].position;

				angle = Math.atan2( pos.z, pos.x );
				cos = Math.cos( angle );
				sin = Math.sin( angle );
				pos.x = radius * cos;
				pos.z = radius * Math.sin( angle );
				pos.cos = cos;
				pos.sin = sin;

				positions.push( pos );
			}
		}

		geometry.positions = positions;

		return geometry;
	},

//	refDropRs: [ 1.8369775289023125, 1.81821399749878, 2.402843307774461, 3.7592494738495223, 6.7234277501566355, 9.351939279986453, 11.548022675641983, 13.9635861231426, 15.482072410492423, 15.999999947561278, 15.454813063676234, 13.856406445413263, 11.31370807962314, 7.999999973780639, 4.141104984053141 ],
	refDropRs: [ 1, 2.402843307774461, 3.7592494738495223, 6.7234277501566355, 9.351939279986453, 11.548022675641983, 13.9635861231426, 15.482072410492423, 15.999999947561278, 15.454813063676234, 13.856406445413263, 11.31370807962314, 7.999999973780639, 4.141104984053141 ],
	refGrowRs: [],

	updateDrops: function( grow ) {

		var segmentsAroundY = 16,
			ballSize = this.ballSize,
			refDropRs = this.refDropRs,
			refGrowRs = this.refGrowRs,
			useBehaviour =  (grow === undefined),
			i, il, j, g, s, sl, v, pos, radius, angle, alpha, behaviour;


		for( g = 0; g < 2; g++ ) {

			behaviour = this.groupBehaviours[ g ];

			if( useBehaviour )
				alpha = 1 - (Math.sin( Math.min( 1, behaviour.grow * 1.1 ) * rad90 - rad90 ) + 1);
			else
				alpha = 1 - (Math.sin( Math.min( 1, grow ) * rad90 - rad90 ) + 1);

//			alpha = Math.sin( (1 - Math.min( 1, behaviour.grow * 1.08 )) * rad90 );

			for( i = 0; i < 9; i++ )
				refGrowRs[ i ] = refDropRs[ i ] - (refDropRs[ i ] - ballSize) * alpha;

			if( ! useBehaviour || behaviour.growTarget == 1 ) {

				for( s = g * 3, sl = (g + 1) * 3; s < sl; s++ ) {

					geometry = this.sphereGeometries[ s ];
					positions = geometry.positions,
					v = 0;

					for( i = 0, il = refGrowRs.length; i < il; i++ ) {

						radius = refGrowRs[ i ];

						for( j = 0; j < segmentsAroundY; j++ ) {

							pos = positions[ v++ ];
							pos.x = radius * pos.cos;
							pos.z = radius * pos.sin;
						}
					}

					geometry.__dirtyVertices = true;
				}
			}
		}
	},

	createSphereSpikes: function( geometry ) {

		var vertices = geometry.vertices,
			grid = geometry.grid,
			spikesOn = [],
			spikesOff = [],
			gridX, spike, i, il, j, jl;

		geometry.spikesOff = spikesOff;
		geometry.spikesOn = spikesOn;

		for( i = 0, il = vertices.length; i < il; i++ ) {

			spikesOff.push( vertices[ i ].position.clone() );
			spikesOn.push( vertices[ i ].position.clone() );
		}

		for( i = 0, il = grid.length; i < il; i += 2 ) {

			gridX = grid[ i ];

			if( gridX[ 0 ] != gridX[ 1 ] ) {

				for( j = 0, jl = gridX.length; j < jl; j += 2 ) {

					spike = spikesOn[ gridX[ j ] ];
					spike.multiplyScalar( phi + Math.random() );
				}
			}
			else {

				spike = spikesOn[ gridX[ 0 ] ];
				spike.multiplyScalar( phi + Math.random() );
			}
		}
	},

	tweenSphereSpikes: function( geometry, alpha ) {

		var vertices = geometry.vertices,
			spikesOn = geometry.spikesOn,
			spikesOff = geometry.spikesOff,
			alphaMinus = 1 - alpha,
			vertexPos, spikeOn, spikeOff, i, il;

		for( i = 0, il = vertices.length; i < il; i++ ) {

			vertexPos = vertices[ i ].position;
			spikeOn = spikesOn[ i ];
			spikeOff = spikesOff[ i ];

			vertexPos.x = spikeOn.x * alpha + spikeOff.x * alphaMinus;
			vertexPos.y = spikeOn.y * alpha + spikeOff.y * alphaMinus;
			vertexPos.z = spikeOn.z * alpha + spikeOff.z * alphaMinus;
		}

		geometry.__dirtyVertices = true;
	},

	createSphereMaterial: function( groupIndex ) {

		uniforms = THREE.UniformsUtils.clone( this.sphereShader.uniforms );

		var material = new THREE.MeshShaderMaterial( {

//			wireframe: true,
			fog: this.director.view.scene.fog,
			vertexColors: THREE.VertexColors,
			uniforms: uniforms,
			vertexShader: this.sphereShader.vertexShader,
			fragmentShader: this.sphereShader.fragmentShader
		} );

		material.addR = uniforms["addR"];
		material.addG = uniforms["addG"];
		material.addB = uniforms["addB"];
		material.multiply = uniforms["multiply"];
		material.addR.value = 0;
		material.addG.value = 0;
		material.addB.value = 0;
		material.multiply.value = this.groupMultiplies[ groupIndex ];

//		this.director.materialCache.addMaterial( material );

		if( this.sphereMaterialGroups[ groupIndex ] === undefined )
			this.sphereMaterialGroups[ groupIndex ] = [];

		this.sphereMaterialGroups[ groupIndex ].push( material );
		this.sphereMaterials.push( material );

		return material;
	},

	setSphereMultiplyAdditive: function( multiply, additive, group ) {

		var isGroup = (group !== undefined),
			materials = isGroup? this.sphereMaterialGroups[ group ] : this.sphereMaterials,
			material, i, il;

		for( i = 0, il = materials.length; i < il; i++ ) {

			material = materials[ i ];
			material.addR.value = additive;
			material.addG.value = additive;
			material.addB.value = additive;
			material.multiply.value = multiply;
		}

		if( isGroup ) {

			this.groupMultiplies[ group ] = multiply;
			this.groupAdditives[ group ] = additive;
		}
		else {

			this.groupMultiplies[ 0 ] = this.groupMultiplies[ 1 ] = multiply;
			this.groupAdditives[ 0 ] = this.groupAdditives[ 1 ] = additive;
		}
	},

	setSphereMultiply: function( multiply, group ) {

		var isGroup = (group !== undefined),
			materials = isGroup? this.sphereMaterialGroups[ group ] : this.sphereMaterials,
			i, il;

		for( i = 0, il = materials.length; i < il; i++ )
			materials[ i ].multiply.value = multiply;

		if( isGroup )
			this.groupMultiplies[ group ] = multiply;
		else
			this.groupMultiplies[ 0 ] = this.groupMultiplies[ 1 ] = multiply;
	},

	setSphereAdditive: function( additive, group ) {

		var isGroup = (group !== undefined),
			materials = isGroup? this.sphereMaterialGroups[ group ] : this.sphereMaterials,
			i, il, material;

		for( i = 0, il = materials.length; i < il; i++ ) {

			material = materials[ i ];
			material.addR.value = additive;
			material.addG.value = additive;
			material.addB.value = additive;
		}

		if( isGroup )
			this.groupAdditives[ group ] = additive;
		else
			this.groupAdditives[ 0 ] = this.groupAdditives[ 1 ] = additive;
	},

	setSphereBlend: function( blend, group ) {

		var isGroup = (group !== undefined),
			materials = isGroup? this.sphereMaterialGroups[ group ] : this.sphereMaterials,
			i, il;

		for( i = 0, il = materials.length; i < il; i++ ) {

			materials[ i ].blending = blend? THREE.AdditiveBlending : THREE.NormalBlending;
			materials[ i ].transparent = blend;
		}
	},

    // _______________________________________________________________________________________ Stem

	createStemGeometry: function() {
/*
		var segmentsAroundY = 16,
			refYs = [ -4.24158, -2.686576, -1.885502, -1.457074, -1.103645, -0.8792522 ],
			refRs = [ 0.06822220584883634, 0.0669877629933408, 0.10545021761674084, 0.194687465384837, 0.3494873056313777, 0.5333295288212063 ],
			i, il, pos, radius, angle, j;

		for( i = 0, il = refRs.length; i < il; i++ )
			refRs[ i ] -= ( refRs[ i ] - 1 ) * this.stemWidth;

		for( i = 0, il = refYs.length; i < il; i++ )
			refYs[ i ] *= this.ballSize;

		for( i = 0, il = refRs.length; i < il; i++ )
			refRs[ i ] *= this.ballSize;

		this.stemGeometry = new LIGHTS.CapsuleGeometry( 1, 1, 1, segmentsAroundY, refYs, true, -4, 1, false );
		var vertices = this.stemGeometry.vertices;

		v = 0;

		for( i = 0, il = refRs.length; i < il; i++ ) {

			radius = refRs[ i ];

			for( j = 0; j < segmentsAroundY; j++ ) {

				pos = vertices[ v++ ].position;

				angle = Math.atan2( pos.z, pos.x );
				pos.x = radius * Math.cos( angle );
				pos.z = radius * Math.sin( angle );
			}
		}
*/
		this.stemGeometry = new LIGHTS.CapsuleGeometry( this.stemRadius, this.stemRadius, this.stemLength, 8, [ 0, 1 ], true, this.stemCapHeight, 1, false );
		this.moveVertexY( this.stemGeometry.vertices, -(this.ballSize * 0.97 + this.stemLength) );

		// Material
		this.stemMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
	},

	createStemGeometryTube: function() {

		var stemHeights = [ 0, 0.5, 1 ];

		// Geometry
		this.stemGeometry = new LIGHTS.CapsuleGeometry( this.stemRadius, this.stemRadius, this.stemLength, 12, stemHeights, true, this.stemCapHeight, 2, false );
		THREE.MeshUtils.createVertexColorGradient( this.stemGeometry, [ 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x808080 ] );
		this.moveVertexY( this.stemGeometry.vertices, -(this.ballSize * 0.97 + this.stemLength) );

		// Materials
		this.stemMaterials = [];

//		var envMap = new THREE.Texture( [
//
//			LIGHTS.images.envMapLeft,
//			LIGHTS.images.envMapRight,
//			LIGHTS.images.envMapTop,
//			LIGHTS.images.envMapBottom,
//			LIGHTS.images.envMapFront,
//			LIGHTS.images.envMapBack
//		] );
//
//		envMap.needsUpdate = true;

		for( i = 0; i < this.sphereColors.length; i++ ) {

			material = new THREE.MeshBasicMaterial( {

				vertexColors:   THREE.VertexColors,
//				envMap:         envMap,
//				reflectivity:   this.stemReflectivity,
//				combine:        THREE.MultiplyOperation,
//				shading:        THREE.SmoothShading
//				color:          0xFFFFFF
//				map:            texture,
//				blending:       THREE.AdditiveBlending,
//				transparent:    true
			} );

			this.stemMaterials.push( material );
			this.director.materialCache.addMaterial( material );
		}

		this.resetStemColors();
	},

	createStemGeometry_Spot: function() {

		var stemHeights = [ 0, 0.5, 1 ];

		// Geometry
//		this.stemGeometry = new LIGHTS.CapsuleGeometry( this.stemRadius, this.stemRadius, this.stemLength, 12, stemHeights, true, 2, this.stemCapHeight, false );
		this.stemGeometry = new LIGHTS.SpotGeometry( this.stemRadius, this.stemRadius, this.stemLength );
//		THREE.MeshUtils.createVertexColorGradient( this.stemGeometry, [ 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x808080 ] );
		this.moveVertexY( this.stemGeometry.vertices, -(this.ballSize * 0.97 + this.stemLength) );


		// Materials
		var texture = new THREE.Texture( LIGHTS.images.spotLine );
		texture.needsUpdate = true;

		// Materials
		this.stemMaterials = [];

//		var envMap = new THREE.Texture( [
//
//			LIGHTS.images.envMapLeft,
//			LIGHTS.images.envMapRight,
//			LIGHTS.images.envMapTop,
//			LIGHTS.images.envMapBottom,
//			LIGHTS.images.envMapFront,
//			LIGHTS.images.envMapBack
//		] );
//
//		envMap.needsUpdate = true;

		for( i = 0; i < this.sphereColors.length; i++ ) {

			material = new THREE.MeshBasicMaterial( {

//				vertexColors:   THREE.VertexColors,
//				envMap:         envMap,
//				reflectivity:   this.stemReflectivity,
//				combine:        THREE.MultiplyOperation,
//				shading:        THREE.SmoothShading,
				color:          0xFFFFFF,
				map:            texture,
				blending:       THREE.AdditiveBlending,
				transparent:    true
			} );

			this.stemMaterials.push( material );
			this.director.materialCache.addMaterial( material );
		}

		this.resetStemColors();
	},

	setStemColors: function( color ) {

		var materials = this.stemMaterials,
			i, il;

		for( i = 0, il = materials.length; i < il; i++ )
			materials[ i ].color.setHex( color );

		this.stemColors = color;
	},

	resetStemColors: function() {

		if( this.stemColors !== null ) {

			var materials = this.stemMaterials,
				colors = this.spotColors,
				i, il;

			for( i = 0, il = materials.length; i < il; i++ )
				materials[ i ].color.setHex( colors[ i ] );

			this.stemColors = null;
		}
	},

	setStemReflection: function( reflectivity ) {

		var materials = this.stemMaterials,
			i, il;

		for( i = 0, il = materials.length; i < il; i++ )
			materials[ i ].reflectivity = reflectivity;
	},

	resetStemReflection: function() {

		var materials = this.stemMaterials,
			reflectivity = this.stemReflectivity,
			i, il;

		for( i = 0, il = materials.length; i < il; i++ )
			materials[ i ].reflectivity = reflectivity;
	},

    // _______________________________________________________________________________________ Private

	moveVertexY: function( vertices, dy ) {

		for( var v = 0; v < vertices.length; v++ )
			vertices[ v ].position.y += dy;
	}
};


/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 01/08/2011
 * Time: 15:52
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.BallsManager = function( director ) {

	this.initialize( director );
};

LIGHTS.BallsManager.prototype = {

    // _______________________________________________________________________________________ Vars

    ballsPerTile:           40,
    releaseVelocity:        5,
    gravity:                -4096,

    active:                 false,

    tiles:                  [],
    balls:                  [],
	behaviours:             [],
	visibleGroups:          [],
	cameraTilePosition:     new THREE.Vector3(),

    beats:                  0,

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.director = director;

		this.geometries = new LIGHTS.BallGeometries( director );

		var terrain = director.terrain,
			i, il;

 		// Ball positions
		terrain.selectCenterTile();

		for( i = 0, il = this.ballsPerTile; i < il; i++ ) {

			terrain.selectTerrainRandomVertex( true, 3, 3 );
			this.behaviours.push( new LIGHTS.BallBehaviour( this, i ) );
		}

		this.volume = 0;
		this.nextBeat = 0;

		this.mouse = new THREE.Vector3( 0, 0, 0.5 );
		this.projector = new THREE.Projector();
		this.camera = director.view.camera;
		this.ray = new THREE.Ray( this.camera.position, this.mouse );

		this.explosions = new LIGHTS.BallExplosions( this );

		this.mouseOverCollisions = new THREE.CollisionSystem();
		this.clickCollisions = new THREE.CollisionSystem();

		this.state = 0;
	},

    // _______________________________________________________________________________________ Events

    launch: function() {

	    var geo = this.geometries;

        switch( LIGHTS.Music.phase.index ) {

	        case 0:
		        this.beats = 1;
		        this.resetState( 0 );
		        this.setSphereMultiplyAdditive( 0.0, 0.0 );
		        break;

            case 1:
//	            geo.updateDrops( 0.8 );
	            geo.setSphereBlend( false );
	            this.setSphereMultiplyAdditive( 0.0, 1.0, 0 );
                this.showGroup( 0, true );
                this.showGroup( 1, false );
                break;

            case 2:
	            this.setSphereMultiplyAdditive( 0.0, 1.0, 1 );
                this.showGroup( 1, true );
                break;

            case 3: // C1
		        this.setSphereMultiplyAdditive( 1.0, 1.0 );
//	            geo.setStemColors( 0xFFFFFF );
	            this.activateFat( true );
	            this.setFat( phi, 1 );
	            this.nextBeat = 1;
	            break;

            case 4:
	        case 6:
		        this.setSphereAdditive( 1.0 );
		        this.setFat( phi, 1 );
		        this.nextBeat = 1;
                break;

	        case 5:
		        this.changeFat();
		        this.nextBeat = 2;
                break;

	        case 7: // B2
		        this.unselect();
		        this.setSphereMultiply( 0.0 );
		        this.activateFat( false );
                break;

	        case 8:
		        this.unselect();
		        this.setSphereMultiplyAdditive( 1.0, 1.0 );
		        this.nextBeat = 1;
                break;

	        case 9:
				this.beats = 0;
		        this.unselect();
		        this.setState( 1, true );
//		        this.activateGrow( true );
		        this.setGrow( 0, 0 );
		        this.setGrow( 1, 1 );
	            break;

	        case 10:
	            this.beats = 1;
	            break;

	        case 11: // C2
		        this.setSphereAdditive( 1.0 );
//		        geo.setStemColors( 0x000000 );
//		        this.activateFat( true );
//		        this.setFat( phi, 1 );
//		        this.setState( 2, false, 1 );
		        this.setState( 2, true );
		        this.nextBeat = 1;
	            break;

	        case 13:
		        this.setState( 3, true );
                break;

	        case 15: // D1
	            break;

	        case 16: // S!
//		        geo.updateDrops( 0.8 );

//		        this.setSphereMultiplyAdditive( 0.0, 0.0 );
//		        geo.setStemColors( 0x000000 );
//		        geo.setStemReflection( 0 );
//		        this.setState( 3, false, 1 );
                break;

	        case 17: // C3
		        this.resetState( 0 );
		        this.activateFat( true );
		        this.setFat( phi, 1 );
		        geo.setSphereBlend( false );
		        this.setSphereMultiplyAdditive( 1.0, 1.0 );
//		        geo.setStemColors( 0xFFFFFF );
//		        geo.resetStemReflection();
		        this.setRotation();
		        this.nextBeat = 1;
                break;

	        case 18:
		        this.setSphereMultiplyAdditive( 1.0, 1.0 );
//		        geo.setStemColors( 0xFFFFFF );
		        this.unselect();
		        this.setState( 1, true );
		        this.setGrow( 0, 1 );
		        this.setGrow( 1, 0 );
		        this.nextBeat = 1;
	            break;

	        case 19:
	        case 20:
		        this.setSphereMultiplyAdditive( 1.0, 1.0 );
//		        geo.setStemColors( 0xFFFFFF );
		        this.changeGrow();
		        this.beats = 0;
		        this.nextBeat = 1;
	            break;

	        case 21: // D2
		        this.setSphereMultiplyAdditive( 1.0, 1.0 );
//		        geo.setStemColors( 0x000000 );
		        this.setState( 2, true );
		        this.nextBeat = 1;
                break;

	        case 22: // A2
		        this.setState( 3, true );
//		        this.setSphereMultiply( 0.0 );
	            break;
        }
    },

    beat: function() {

	    var geo = this.geometries;

        switch( LIGHTS.Music.phase.index ) {

            case 1:
	            if( this.beats % 2 == 0 )
		            this.setSphereAdditive( 1.0, 0 );
	            else
		            this.setSphereAdditive( 0.0, 0 );
//		            this.selectBallsAdditive( 0 );
                break;

            case 2:
	            if( this.beats % 2 == 0 ) {

		            this.setSphereAdditive( 1.0, 0 );
		            this.setSphereAdditive( 0.0, 1 );
//		            geo.setSphereAdditive( 1.0, 0 );
//		            this.selectBallsAdditive( 1 );
	            }
	            else {

		            this.setSphereAdditive( 0.0, 0 );
		            this.setSphereAdditive( 1.0, 1 );
//		            this.selectBallsAdditive( 0 );
//		            geo.setSphereAdditive( 1.0, 1 );
	            }
	            break;

	        case 3:
	        case 4:
	        case 6:
		        if( this.nextBeat == 0 ) {

			        this.changeFat();
		        }
		        else {

			        this.setFat( 0, 1 );
			        this.setFat( 1, 0.5 );
			        this.setSphereAdditive( 0.0 );
//			        geo.resetStemColors();
			        this.nextBeat--;
		        }
		        break;

	        case 5:
		        if( this.nextBeat == 0 ) {

			        this.changeFat();
		        }
		        else if( this.nextBeat == 1 ) {

			        this.setFat( 0, 1 );
			        this.setFat( 1, 0.5 );
			        this.setSphereAdditive( 0.0 );
//			        geo.resetStemColors();
			        this.nextBeat--;
		        }
		        else {

			        this.setFat( phi, 1 );
			        this.setSphereAdditive( 1.0 );
//			        geo.setStemColors( 0xFFFFFF );
			        this.nextBeat--;
		        }
			    break;

	        case 8:
		        if( this.nextBeat == 1 ) {

			        this.setSphereAdditive( 0.0 );
			        this.nextBeat--;
		        }
				break;

	        case 9:
				if( this.beats > 1 && this.beats % 2 == 0 )
					this.changeGrow();
		        break;

	        case 10:
		        if( this.beats == 15 ) {

			        this.setGrow( 1, 0 );
			        this.setGrow( 1, 1 );
		        }
		        else if( this.beats < 16 && this.beats % 2 == 1 ) {

			        this.changeGrow();
		        }
	            break;

		    case 11:
			    if( this.nextBeat == 1 ) {

				    this.setSphereAdditive( 0.0 );
				    this.removeSpheres();
				    geo.setSphereBlend( true );
				    this.nextBeat--;
			    }
			    break;

//	        case 13:
//		        if( this.nextBeat == 0 ) {
//
//			        this.changeFat();
//		        }
//		        else if( this.nextBeat == 1 ) {
//
//			        this.setFat( 0, 1 );
//			        this.setFat( 1, 0.5 );
//			        this.nextBeat--;
//		        }
//		        else {
//
//			        this.setFat( phi, 1 );
//			        geo.setSphereAdditive( 1.0 );
//			        geo.setStemColors( 0xFFFFFF );
//			        this.nextBeat--;
//		        }
//			    break;

		    case 17:
			    if( this.nextBeat == 0 ) {

				    this.changeFat();
			    }
			    else {

				    this.setFat( 0, 1 );
				    this.setFat( 1, 0.5 );
				    this.setSphereAdditive( 0.0 );
//				    geo.resetStemColors();
				    this.nextBeat--;
			    }
		        break;

	        case 18:
	        case 19:
		        if( this.nextBeat == 1 ) {

			        this.setSphereAdditive( 0.0 );
//			        geo.resetStemColors();

			        this.nextBeat--;
		        }

		        if( this.beats % 2 == 1 )
		            this.changeGrow();
	            break;

		    case 20:
			    if( this.nextBeat == 1 ) {

				    this.setSphereAdditive( 0.0 );
//				    geo.resetStemColors();

				    this.nextBeat--;
			    }

			    if( this.beats == 13 ) {

				    this.setGrow( 1, 0 );
				    this.setGrow( 1, 1 );
			    }
			    else if( this.beats < 14 && this.beats % 2 == 1 ) {

				    this.changeGrow();
			    }
		        break;

		    case 21:
			    if( this.nextBeat == 1 ) {

				    this.setSphereAdditive( 0.0 );
				    geo.setSphereBlend( true );
//				    geo.resetStemColors();

				    this.nextBeat--;
			    }
				break;

//	        case 19:
//		        this.changeFat();
//
//		        if( this.beats % 2 == 0 )
//		            this.changeGrow();
//	            break;

        }
        this.beats++;
    },

    // _______________________________________________________________________________________ Update

//    update: function() {
//
//	    // Update tiles
//	    var tiles = this.tiles,
//		    il = tiles.length,
//		    i;
//
//	    for( i = 0; i < il; i++ )
//		    tiles[ i ].update();
//
//	    this.explosions.update();
//    },

    update: function() {

	    var behaviours = this.behaviours,
		    i, il;

	    for( i = 0, il = behaviours.length; i < il; i++ )
	        behaviours[ i ].update();

	    this.explosions.update();

//	    if( this.state == 1 )
//	        this.geometries.updateDrops();
    },

	raycast: function() {

	    var origin = this.ray.origin,
	        mouse = this.mouse,
	        balls = this.balls,
	        ball, colliders, collider, other, i, il;

		mouse.x = LIGHTS.Input.mouseX;
		mouse.y = -LIGHTS.Input.mouseY;
		mouse.z = 0.5;

	    this.projector.unprojectVector( mouse, this.camera );

		mouse.x -= origin.x;
		mouse.y -= origin.y;
		mouse.z -= origin.z;
		mouse.normalize();

		// Rollover
	    colliders = this.mouseOverCollisions.rayCastAll( this.ray );

		for( i = 0, il = balls.length; i < il; i++ )
			balls[ i ].mouseOver = false;

		for( i = 0, il = colliders.length; i < il; i++ ) {

			collider = colliders[ i ];

			if( collider != null && collider.enabled ) {

				other = colliders.indexOf( collider.other );

				if( other != -1 )
					colliders[ other ] = null;

				ball = collider.ball;
				ball.mouseOver = true;

				if( ball.ball.visible && ! ball.selected && ! ball.unselected )
					ball.select();
			}
		}

		for( i = 0, il = balls.length; i < il; i++ ) {

			ball = balls[ i ];

			if( ball.selected && ! ball.mouseOver )
				ball.unselect( false );
		}

		// Click
		if( LIGHTS.Input.mouseClick ) {

			LIGHTS.Input.mouseClick = false;
			collider = this.clickCollisions.rayCastNearest( this.ray );

			if( collider !== null && (collider.ball.ball.visible || collider.ball.balloon.visible) )
					this.explosions.launchExplosion( collider.ball );
		}
	},

	unselect: function() {

	    var balls = this.balls,
	        ball, i, il;

		for( i = 0, il = balls.length; i < il; i++ ) {

			ball = balls[ i ];

			if( ball.selected || ball.unselected )
				ball.unselect( true );
		}
	},


    // _______________________________________________________________________________________ Private

    showGroup: function( groupIndex, visible ) {

        var tiles = this.tiles,
		    behaviours = this.behaviours,
	        i, il, j, jl, group, child;

	    for( i = 0, il = tiles.length; i < il; i++ ) {

		    group = tiles[ i ].groups[ groupIndex ];

		    for( j = 0, jl = group.length; j < jl; j++ )
				group[ j ].visible = visible;
        }

	    for( i = 0, il = behaviours.length; i < il; i++ )
	        if( behaviours[ i ].groupIndex == groupIndex )
		        behaviours[ i ].visible = visible;

	    this.visibleGroups[ groupIndex ] = visible;
    },

	setState: function( state, force, ratio ) {

		var behaviours = this.behaviours,
			prevState = state - 1,
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];

			if( behaviour.state < state && (force || (behaviour.state == prevState && Math.random() < ratio) ) )
				behaviour.setState( state );
		}

		this.state = state;
	},

	resetState: function( state ) {

		var behaviours = this.behaviours,
			i, il;

		for( i = 0, il = behaviours.length; i < il; i++ )
			behaviours[ i ].setState( state );
	},

	setRotation: function() {

		var balls = this.balls,
			il = balls.length,
			i;

		for( i = 0; i < il; i++ )
			balls[ i ].setRotation();
	},

	removeSpheres: function() {

		var balls = this.balls,
			il = balls.length,
			i;

		for( i = 0; i < il; i++ )
			balls[ i ].removeSphere();
	},

	selectBallsAdditive: function( group ) {

		var tiles = this.tiles,
			groupBalls, ball, i, il, j, jl;

		for( i = 0, il = tiles.length; i < il; i++ ) {

			groupBalls = tiles[ i ].groups[ group ];

			for( j = 0, jl = groupBalls.length; j < jl; j++ ) {

				ball = groupBalls[ j ];
				ball.sphereMaterial.additive.value = ball.selectAdditive? 1.0 : 0.0;
			}
		}
	},

	setSphereAdditive: function( additive, group ) {

		var behaviours = this.behaviours,
			notGroup = (group === undefined),
			i, il;

		for( i = 0, il = behaviours.length; i < il; i++ )
			if( notGroup || behaviours[ i ].groupIndex == group )
		        behaviours[ i ].additive = additive;

		this.geometries.setSphereAdditive( additive, group );
	},

	setSphereMultiplyAdditive: function( multiply, additive, group ) {

		var behaviours = this.behaviours,
			notGroup = (group === undefined),
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];

			if( notGroup || behaviours[ i ].groupIndex == group ) {

				behaviour.additive = additive;
				behaviour.multiply = multiply;
			}
		}

		this.geometries.setSphereMultiplyAdditive( multiply, additive, group );
	},

	setSphereMultiply: function( multiply, group ) {

		var behaviours = this.behaviours,
			notGroup = (group === undefined),
			i, il;

		for( i = 0, il = behaviours.length; i < il; i++ )
			if( notGroup || behaviours[ i ].groupIndex == group )
		        behaviours[ i ].multiply = multiply;

		this.geometries.setSphereMultiply( multiply, group );
	},

    // _______________________________________________________________________________________ Fat

	activateFat: function( ok ) {

		var behaviours = this.behaviours,
			i, il;

		for( i = 0, il = behaviours.length; i < il; i++ )
			behaviours[ i ].fatActive = ok;
	},

	changeFat: function() {

		var behaviours = this.behaviours,
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];

			if( behaviour.state == 0 )
				behaviour.fatTarget = 1 - behaviour.fatTarget;
		}
	},

	setFat: function( fat, ratio ) {

		var behaviours = this.behaviours,
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];

			if( behaviour.state == 0 && Math.random() < ratio )
				behaviour.fatTarget = fat;
		}
	},

    // _______________________________________________________________________________________ Grow

	activateGrow: function( ok ) {

		var behaviours = this.behaviours,
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];
			behaviour.growActive = ok;
//			behaviour.growTarget = ( Math.random() > 0.5 )? 1 : 0;
		}
	},

	changeGrow: function() {

		var behaviours = this.behaviours,
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];

			if( behaviour.state > 0 )
				behaviour.growTarget = 1 - behaviour.growTarget;
		}
	},

	setGrow: function( grow, groupIndex ) {

		var behaviours = this.behaviours,
			i, il, behaviour;

		for( i = 0, il = behaviours.length; i < il; i++ ) {

			behaviour = behaviours[ i ];

			if( behaviours[ i ].groupIndex == groupIndex )
				behaviour.growTarget = grow;
		}
	}
};



// ___________________________________________________________________________________________ Tile

LIGHTS.BallsTile = function( manager, container ) {

	this.initialize( manager, container );
};

LIGHTS.BallsTile.prototype = {

    // _______________________________________________________________________________________ Constructor

	initialize: function( manager, container ) {

        this.manager = manager;
		this.containerPosition = container.position;
		this.cameraPosition = manager.director.view.camera.position;

        this.children = [];
        this.balls = [];
		this.groups = [ [], [] ];

        var i, j, child, ball, visible, groupIndex;

        for( i = 0; i < manager.ballsPerTile; i++ ) {

	        groupIndex = i % 2;
	        ball = new LIGHTS.Ball( manager, container, i, groupIndex );

	        for( j = 0; j < ball.children.length; j++ )
				this.children.push( ball.children[ j ] );

	        // Save
	        this.groups[ groupIndex ].push( ball );
	        this.balls.push( ball );
	        manager.balls.push( ball );
        }

		// Update new groups
		for( i = 0; i < this.groups.length; i++ ) {

			group = this.groups[ i ];
			visible = manager.visibleGroups[ i ];

			for( j = 0; j < group.length; j++ ) {

				ball = group[ j ];
				ball.visible = visible;

//				ball.setState( this.ballState );
//				ball.ballGrow = this.ballGrow;
//				ball.ballFat = this.ballFat;
			}
		}

		// Debug
		// this.children.push( new THREE.Mesh( new THREE.SphereGeometry( 80, 12, 10 ), new THREE.MeshBasicMaterial( { color: 0xFFFF00, wireframe: true } )) );

        manager.tiles.push( this );
    },

    // _______________________________________________________________________________________ Update

//    update: function() {
//
//	    var balls = this.balls,
//		    i, il;
//
//		for( i = 0, il = balls.length; i < il; i++ )
//			balls[ i ].update();
//    },

	updateTile: function() {

	    var balls = this.balls,
		    ball, i, il;

//		for( i = 0, il = balls.length; i < il; i++ ) {
//
//			ball = balls[ i ];
//
//			if( ball.selected )
//				ball.unselect();
//		}
    }
};

/**
 * @author mr.doob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Sphere.as
 */

LIGHTS.SphereGeometry = function ( radius, segmentsWidth, segmentsHeight ) {

	THREE.Geometry.call( this );

	var radius = radius || 50,
	gridX = segmentsWidth || 8,
	gridY = segmentsHeight || 6;

	var i, j, pi = Math.PI;
	var iHor = Math.max( 3, gridX );
	var iVer = Math.max( 2, gridY );
	var aVtc = [];
	this.grid = aVtc;

	for ( j = 0; j < ( iVer + 1 ) ; j++ ) {

		var fRad1 = j / iVer;
		var fZ = radius * Math.cos( fRad1 * pi );
		var fRds = radius * Math.sin( fRad1 * pi );
		var aRow = [];
		var oVtx = 0;

		for ( i = 0; i < iHor; i++ ) {

			var fRad2 = 2 * i / iHor;
			var fX = fRds * Math.sin( fRad2 * pi );
			var fY = fRds * Math.cos( fRad2 * pi );

			if ( !( ( j == 0 || j == iVer ) && i > 0 ) ) {

				oVtx = this.vertices.push( new THREE.Vertex( new THREE.Vector3( fY, fZ, fX ) ) ) - 1;

			}

			aRow.push( oVtx );

		}

		aVtc.push( aRow );

	}

	var n1, n2, n3, iVerNum = aVtc.length;

	for ( j = 0; j < iVerNum; j++ ) {

		var iHorNum = aVtc[ j ].length;

		if ( j > 0 ) {

			for ( i = 0; i < iHorNum; i++ ) {

				var bEnd = i == ( iHorNum - 1 );
				var aP1 = aVtc[ j ][ bEnd ? 0 : i + 1 ];
				var aP2 = aVtc[ j ][ ( bEnd ? iHorNum - 1 : i ) ];
				var aP3 = aVtc[ j - 1 ][ ( bEnd ? iHorNum - 1 : i ) ];
				var aP4 = aVtc[ j - 1 ][ bEnd ? 0 : i + 1 ];

				var fJ0 = j / ( iVerNum - 1 );
				var fJ1 = ( j - 1 ) / ( iVerNum - 1 );
				var fI0 = ( i + 1 ) / iHorNum;
				var fI1 = i / iHorNum;

				var aP1uv = new THREE.UV( 1 - fI0, fJ0 );
				var aP2uv = new THREE.UV( 1 - fI1, fJ0 );
				var aP3uv = new THREE.UV( 1 - fI1, fJ1 );
				var aP4uv = new THREE.UV( 1 - fI0, fJ1 );

				if ( j < ( aVtc.length - 1 ) ) {

					n1 = this.vertices[ aP1 ].position.clone();
					n2 = this.vertices[ aP2 ].position.clone();
					n3 = this.vertices[ aP3 ].position.clone();
					n1.normalize();
					n2.normalize();
					n3.normalize();

					this.faces.push( new THREE.Face3( aP1, aP2, aP3, [ new THREE.Vector3( n1.x, n1.y, n1.z ), new THREE.Vector3( n2.x, n2.y, n2.z ), new THREE.Vector3( n3.x, n3.y, n3.z ) ] ) );

					this.faceVertexUvs[ 0 ].push( [ aP1uv, aP2uv, aP3uv ] );

				}

				if ( j > 1 ) {

					n1 = this.vertices[aP1].position.clone();
					n2 = this.vertices[aP3].position.clone();
					n3 = this.vertices[aP4].position.clone();
					n1.normalize();
					n2.normalize();
					n3.normalize();

					this.faces.push( new THREE.Face3( aP1, aP3, aP4, [ new THREE.Vector3( n1.x, n1.y, n1.z ), new THREE.Vector3( n2.x, n2.y, n2.z ), new THREE.Vector3( n3.x, n3.y, n3.z ) ] ) );

					this.faceVertexUvs[ 0 ].push( [ aP1uv, aP3uv, aP4uv ] );

				}

			}
		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

	this.boundingSphere = { radius: radius };

};

LIGHTS.SphereGeometry.prototype = new THREE.Geometry();
LIGHTS.SphereGeometry.prototype.constructor = LIGHTS.SphereGeometry;

