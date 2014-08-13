/**
 * Custom controls for the Charity Picker module
 * Using the X-drag position, the camera is kept in front of the line of cards and spirals around it up and down
 * It calls the apropriate function to add more cards to the list when the camera reaches the end of the list
 */
 

THREE.HelixSpiralControls = function ( camera, domElement, self) {
// Solves negative modulo JavaScript bug
	Number.prototype.mod = function(n) {
		var val = ((this%n)+n)%n;
		return val;
	};

	this.camera = camera;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	//used for locking the controller when the camera is tweening
	this.isEnabled = true;
	this.target = null;
	//index of top card
	this.topEdgeLimit = 0;
	//index of bottom card
	this.bottomEdgeLimit = 0;
	//the number of pixels dragged for each movement from one card to the next 
	this.pxPerIndex = window.innerWidth/7;
	//the index of the card the camera is infront of
	this.indexPosition = 0;
	//the scroll events are attached to this node
	this.pageContainer = $("#appContainer").get(-1);
	// true if the controls are either dragging or thowing (in momentum)
	this.isDragThrowing = false;
	//true if the camera is tweening from the mouse scroll
	this.isWheeling = false;
	this.throwCompleteCallback = function(){
		console.log("Snap check...");
		if (Math.round(this.indexPosition) === this.lastIndex){
			console.log("Controler got to the end.");
			self.nextPage();
		}
	}
	
	////////////
	// internals

	var scope = this;
	scope.yPanSpeed = 1;
	scope.xRotateSpeed = 1;
	scope.cameraPosition = {xzRad: 2500, yRot:0, yPos:0 };
	
	/** moves the camera to the position specified by cameraPosition, orients its view and updates renderer */
	function cameraPositionUpdate(){
		var thisPosition =  self.getRadialPlot(scope.cameraPosition.xzRad, scope.cameraPosition.yRot, scope.cameraPosition.yPos ).clone();
		scope.camera.position = thisPosition;
		if (scope.target === null) {
 			scope.camera.lookAt(new THREE.Vector3(0,thisPosition.y, 0) ) ;
		}else{
			scope.camera.lookAt(scope.target) ;
		}
		self.render();	
	}


	/** sets bounds given the first and last index of helix */
	this.setIndexBounds = function(firstIndex, lastIndex){
		if (firstIndex !== null) {this.topEdgeLimit = firstIndex*this.pxPerIndex;}
		if (lastIndex !== null) {this.bottomEdgeLimit = -lastIndex*this.pxPerIndex; this.lastIndex = lastIndex;}
		scope.dragHandler.applyBounds({minX:scope.bottomEdgeLimit, maxX:scope.topEdgeLimit});
	};

	/** assign parameters of cameraPosition and calls cameraPositionUpdate */
	this.setCameraPosition = function(xzRad, yRot, yPos){
		if (xzRad !== null){this.cameraPosition.xzRad = xzRad;}
		if (yRot !== null){this.cameraPosition.yRot = yRot;}
		if (yPos !== null){this.cameraPosition.yPos = yPos;}
		cameraPositionUpdate();
	};

	// the position of this node (not attached to DOM) determine camera position through Draggable
	this.dummyNode = document.createElement('div');
	
	this.dragHandler = new Draggable(scope.dummyNode, {
		type:'left',
		trigger:this.domElement,
		throwProps: true, //{resistance:1000},
		bounds:{minY:scope.bottomEdgeLimit, maxY:scope.topEdgeLimit},
		edgeResistance:0,
		dragResistance:0,
		dragClickables:true,
		throwResistance:700,
		onDrag: dragThrowUpdate,
		onThrowUpdate: dragThrowUpdate, 
		snap:{x:
			function(endVal){				
				return Math.round(endVal/scope.pxPerIndex)*scope.pxPerIndex;
			}
		},
		onThrowComplete: function () {
			scope.isDragThrowing = false;
			if (scope.throwCompleteCallback !== null ){
				scope.throwCompleteCallback();
			}
		},
		onDragStart: function(){
			scope.isDragThrowing = true;
		}, 		
		onClick: function(){
			scope.isDragThrowing = false;
		}
	});

	/* disabling the controller prevents dragging from changing camera position but camera can still be updated by setCameraPosition (for tweening) */
	this.disable = function(){
		if (this.isEnabled){
			this.isEnabled = false;
			this.lockX = this.dragHandler.x;						
			// forces the drag to remain at the point where it was disabled (disabling/renabling dragHandler through Draggable causes glitchy behavour)
			// could also be acheived by preventing events 
			this.dragHandler.applyBounds({maxX:this.lockX, minX:this.lockX});
		}
	}

	/** Re-enable dragging the position of the camera */
	this.enable = function(){
		if (!this.isEnabled){				
			//restablish normal bounds
			this.dragHandler.applyBounds({minX:scope.bottomEdgeLimit, maxX:scope.topEdgeLimit});
			this.isEnabled = true;
		}
	}

	/** sets the cameraPosition data to the corresponding index after the camera has been taken off its spiral track i.e. in tweening camera to clicked card */
	this.positionAt = function(index){
		if (!this.isEnabled){
			var newLeft = -index*this.pxPerIndex;
			$(this.dummyNode).css('left', newLeft  + "px" );
			scope.cameraPosition = self.radialHelixPosition( index );
			scope.indexPosition = index;
			scope.cameraPosition.xzRad = self.cameraRadius();
			this.lockX = newLeft;
			this.dragHandler.applyBounds({maxX:this.lockX, minX:this.lockX});
			dragThrowUpdate();
		}
	}

	/** plots camera if controler enabled */
	function dragThrowUpdate(){
		if (scope.isEnabled){
			plotCamera();
		}		
	}

	/** Determins the index of the card based upon the Draggable position */
	function plotCamera(){
		var index = -(1/scope.pxPerIndex)*scope.dragHandler.x;			
		scope.cameraPosition = self.radialHelixPosition( index );
		scope.cameraPosition.xzRad = self.cameraRadius();
		scope.indexPosition = index;
		cameraPositionUpdate();
	}

	/** Tweens camera forward and backward on spiral on scrolling of mouse wheel */
	function onMouseWheel(e) {
		var e = window.event || e; // old IE support
		var sign = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		
		if (!scope.isDragThrowing && !scope.isWheeling ){ //
			scope.isWheeling = true;		
			var newIndex = Math.round(scope.indexPosition) - sign;
			
			var newLeft = -(newIndex)*scope.pxPerIndex;
			TweenMax.to( $(scope.dummyNode), 0.3, {
				'left': newLeft +"px" , 
				onUpdate: function(){
					scope.dragHandler.update(true);
					plotCamera();
					console.log(scope.dragHandler.x);
				}, 
				onComplete: function(){
					scope.isWheeling = false;
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

THREE.HelixSpiralControls.prototype = Object.create( THREE.EventDispatcher.prototype );
