/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
/*global THREE, console */

// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
// supported.
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe
//
// This is a drop-in replacement for (most) TrackballControls used in examples.
// That is, include this js file and wherever you see:
//    	controls = new THREE.TrackballControls( camera );
//      controls.target.z = 150;
// Simple substitute "OrbitControls" and the control should work as-is.


THREE.OrbitControls = function ( camera, domElement, self) {
// Solves negative modulo JavaScript bug
	Number.prototype.mod = function(n) {
		var val = ((this%n)+n)%n;
		// console.log("Nan?"+ this + "mod" + n+ "is"+val);
		return val;
	};

	this.camera = camera;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.isEnabled = true;
	this.snapToSearch = false;
	this.throwCompleteCallback = null;
	this.target = null;

	////////////
	// internals

	var scope = this;
	scope.yPanSpeed = 1;
	scope.xRotateSpeed = 1;
	scope.cameraPosition = {xzRad: 3000, yRot:0, yPos:0 };
	
	////////////////////////////////Draggable controls

	function getRadialPlot(xzRad, yRot, yPos){
		var vector = new THREE.Vector3();
		vector.x = Math.sin(yRot)*xzRad;
		vector.z = Math.cos(yRot)*xzRad;
		vector.y = yPos;
		return vector;
	}

	function cameraPositionUpdate(){
		var thisPosition =  getRadialPlot(scope.cameraPosition.xzRad, scope.cameraPosition.yRot, scope.cameraPosition.yPos ).clone();
		scope.camera.position = thisPosition;
		if (scope.target === null) {
 			scope.camera.lookAt(new THREE.Vector3(0,thisPosition.y, 0) ) ;
		}else{
			scope.camera.lookAt(scope.target) ;
		}
		self.render();	
	}


	var dummyNode = document.createElement('div');
	
	this.setYPosBounds = function(upperLimit, lowerLimit){
		this.topEdgeLimit = upperLimit;
		this.bottomEdgeLimit = lowerLimit;
	};
	
	this.setCameraPosition = function(xzRad, yRot, yPos){
		if (xzRad !== null){this.cameraPosition.xzRad = xzRad;}
		if (yRot !== null){this.cameraPosition.yRot = yRot;}
		if (yPos !== null){this.cameraPosition.yPos = yPos;}
		cameraPositionUpdate();
	};

	this.setYPosBounds(500,-500);

	this.dragHandler = new Draggable(dummyNode, {
		type:'x, y',
		trigger:this.domElement,
		throwProps: true, //{resistance:1000},
		throwResistance:10,
		bounds:{minY:scope.bottomEdgeLimit, maxY:scope.topEdgeLimit},
		edgeResistance:0.5,
		dragResistance:0,
		dragClickables:true,
		maxDuration:0.5,
		onDrag: dragThrowUpdate,
		onThrowUpdate: dragThrowUpdate, 
		onThrowComplete: function () {
			if (scope.throwCompleteCallback !== null ){
				scope.throwCompleteCallback();
			}
		}		
	});

	this.enable = function(){
		this.isEnabled = true;
		// scope.dragHandler.enable();
		this.dragHandler.applyBounds({minY:scope.bottomEdgeLimit, maxY:scope.topEdgeLimit});
	}
	this.disable = function(){
		this.isEnabled = false;
		this.lockX = this.dragHandler.x;
		this.lockY = this.dragHandler.y;
		this.dragHandler.applyBounds({maxX:this.lockX, minX:this.lockX, maxY:this.lockY, minY:this.lockY});
		// scope.dragHandler.disable();
	}	

	function dragThrowUpdate(event){
		if (scope.isEnabled){
			var rotationsPerScreen = 1;
			var percentRotation = (this.x/window.innerWidth) * scope.xRotateSpeed;
			percentRotation = -(percentRotation % 1); 
			scope.cameraPosition.yRot = percentRotation*Math.PI*2;
			scope.cameraPosition.yPos = scope.yPanSpeed * this.y;
			cameraPositionUpdate();
		}
		
		
	}

};
THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
