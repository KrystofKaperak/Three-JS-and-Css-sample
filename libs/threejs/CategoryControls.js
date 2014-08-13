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


THREE.CategoryControls = function ( camera, domElement, self, options) {
// Solves negative modulo JavaScript bug
	Number.prototype.mod = function(n) {
		var val = ((this%n)+n)%n;
		// console.log("Nan?"+ this + "mod" + n+ "is"+val);
		return val;
	};

	if (!options){
		var options = {snapDivisions:18, renderFunction:self.render, container: $("#search-page-container").get(-1) };
	}

	this.camera = camera;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.isEnabled = true;
	this.snapToSearch = false;
	this.throwCompleteCallback = null;
	this.target = null;
	this.isDragThrowing = false;
	this.snapDivisions = options.snapDivisions ;
	this.renderFunction = options.renderFunction ;
	this.pageContainer = options.container ;
			
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
		scope.renderFunction.apply(self);	
	}


	var dummyNode = document.createElement('div');
	

	this.setYPosBounds = function(upperLimit, lowerLimit){
		if (upperLimit !== null) {this.topEdgeLimit = upperLimit/this.yPanSpeed;}
		if (lowerLimit !== null) {this.bottomEdgeLimit = lowerLimit/this.yPanSpeed;}
	};
	
	this.setCameraPosition = function(xzRad, yRot, yPos){
		if (xzRad !== null){this.cameraPosition.xzRad = xzRad;}
		if (yRot !== null){this.cameraPosition.yRot = yRot;}
		if (yPos !== null){this.cameraPosition.yPos = yPos;}
		cameraPositionUpdate();
	};


	this.dragHandler = new Draggable(dummyNode, {
		type:'top, left',
		trigger:this.domElement,
		throwProps: true, //{resistance:1000},
		bounds:{minTop:scope.bottomEdgeLimit, maxTop:scope.topEdgeLimit},
		snap:{x:
			function(endVal){
				var percentRotation = (endVal/window.innerWidth) * scope.xRotateSpeed;
				var columnPosition = Math.round(percentRotation*scope.snapDivisions);
				var snappedVal = ( (columnPosition/scope.snapDivisions) / scope.xRotateSpeed) * window.innerWidth;
				return snappedVal;
			}, y:
			function(endVal){
				return (Math.round((endVal*scope.yPanSpeed)/ scope.snapRowHeight)*scope.snapRowHeight)/scope.yPanSpeed ;
			}
		},
		edgeResistance:0,
		dragResistance:0,
		dragClickables:true,
		//maxDuration:1,
		throwResistance:700,
		onDrag: dragThrowUpdate,
		onThrowUpdate: dragThrowUpdate,
		onClick: function(){
			scope.isDragThrowing = false;
		} ,
		onDragStart: function(){
			$(self.renderer.domElement).removeClass('hooverable');
			scope.isDragThrowing = true;}, 
		onThrowComplete: function () {
			$(self.renderer.domElement).addClass('hooverable');
			scope.isDragThrowing = false;
			if (scope.throwCompleteCallback !== null ){
				scope.throwCompleteCallback();
			}
		},		
	});

	
	//disabling the controller prevents dragging from changing camera position but camera can still be updated by setCameraPosition (for tweening)
	this.disable = function(){
		if (this.isEnabled){
			this.isEnabled = false;
			this.lockX = this.dragHandler.x;
			this.lockY = this.dragHandler.y;
			
			// forces the drag to remain at the point where it was disabled (disabling/renabling dragHandler causes glitchy behavour)
			// could also be acheive by preventing events 
			this.dragHandler.applyBounds({maxX:this.lockX, minX:this.lockX, maxY:this.lockY, minY:this.lockY});
			// scope.dragHandler.disable();
		}
	}

	this.enable = function(){
		if (!this.isEnabled){
			// force the css properties to conform with cameraPosition by directly editing dummyNode's CSS properties 
			$(dummyNode).css('left', -this.cameraPosition.yRot * window.innerWidth / (Math.PI*2*this.xRotateSpeed)+"px" );
			$(dummyNode).css('top', this.cameraPosition.yPos/this.yPanSpeed + "px");
			
			//restablish normal bounds
			this.dragHandler.applyBounds({minY:scope.bottomEdgeLimit, maxY:scope.topEdgeLimit});
			this.isEnabled = true;
		}
	}

	function dragThrowUpdate(event){
		if (scope.isEnabled){
			var rotationsPerScreen = 1;
			var percentRotation =  - ( ( this.x/window.innerWidth* scope.xRotateSpeed ) % 1 );
			scope.cameraPosition.yRot = percentRotation*Math.PI*2;
			scope.cameraPosition.yPos = scope.yPanSpeed * this.y;
			cameraPositionUpdate();
		}	
		
	}

	function onMouseWheel(e){
		var e = window.event || e; // old IE support
		var sign = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		if (!scope.isDragThrowing && !scope.isWheeling && (scope.cameraPosition.yPos+sign*scope.snapRowHeight) >= scope.bottomEdgeLimit*scope.yPanSpeed-1  && (scope.cameraPosition.yPos+sign*scope.snapRowHeight) <= scope.topEdgeLimit*scope.yPanSpeed+1 ){
			scope.isWheeling = true;		
			scope.disable();
			TweenMax.to(scope.cameraPosition, 0.5, {
				yPos:scope.cameraPosition.yPos+sign*scope.snapRowHeight, 
				onUpdate: function(){cameraPositionUpdate();}, 
				onComplete: function(){
					scope.isWheeling = false;
					scope.enable();
				}, 

			});
		}		
	}
	
	if (scope.pageContainer.addEventListener) {
		// IE9, Chrome, Safari, Opera
		scope.pageContainer.addEventListener("mousewheel",onMouseWheel, false);
		// Firefox
		scope.pageContainer.addEventListener("DOMMouseScroll", onMouseWheel, false);
	}
	// IE 6/7/8
	else {scope.pageContainer.attachEvent("onmousewheel", onMouseWheel);}

};
THREE.CategoryControls.prototype = Object.create( THREE.EventDispatcher.prototype );
