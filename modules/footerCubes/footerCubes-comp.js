/*global NP: false, $:false */
/*jshint strict:false, devel:true */
'use strict';

// CubeControls.js 
//  a snappable camera controller for THREE.JS using GSAP Draggable and ThrowProps plugin

THREE.CubeControls = function ( camera, domElement, self) {

  this.camera = camera;
  this.domElement = ( domElement !== undefined ) ? domElement : document;

  
  var scope = this;
    
  var dummyNode = document.createElement('div');
  
  this.setXPosBounds = function(leftLimit, rightLimit){
    this.leftEdgeLimit = leftLimit;
    this.rightEdgeLimit = rightLimit;
    this.dragHandler.applyBounds({minX:-scope.leftEdgeLimit, maxX:-scope.rightEdgeLimit});
  }

  this.setCameraPosition = function(x, y, z){
    if (x !== null){this.camera.position.x = x;}
    if (y !== null){this.camera.position.y = y;}
    if (z !== null){this.camera.position.z = z;}
    scope.camera.lookAt(new THREE.Vector3(this.camera.position.x, 0, 0)  ) ;
    self.render(); 
  }

  this.dragHandler = new Draggable(dummyNode, {
    type:'x',
    trigger:$(this.domElement).parent(),
    throwProps: true, //{resistance:1000},
    bounds:{minX:scope.leftEdgeLimit, maxX:scope.rightEdgeLimit},
    edgeResistance:0.5,
    dragResistance:0,
    dragClickables:true,
    maxDuration:0.5,
    onDrag: dragThrowUpdate,
    onThrowUpdate: dragThrowUpdate    
  });
  this.setXPosBounds(0,0);

  function dragThrowUpdate(){
    scope.setCameraPosition(-this.x, null, null);   
  }

};
THREE.CubeControls.prototype = Object.create( THREE.EventDispatcher.prototype );


NP.module.footerCube = function(accountId){
  this.accountId = accountId;
};

NP.module.footerCube.prototype.init = function(){
  var self = this;

  this.dockCamera,
  this.scene,
  this.renderer,
  this.controls;
  
  this.objects = [],
  this.cubes = {},
  //this.cubeTable,
  this.cameraZhypotenuse = 59500,
  this.heightScreen = 85,
  this.cubeStartY = -10;
  this.popupHeight = 20 + this.cubeStartY;
  this.widthScreenRatio = 1,
    // angle between positive Z axis and the camera's line of sight
  this.cameraDownAngle = (15/360)*Math.PI*2,
  
  // pulltab is the small tab at the bottom center of the screen that raises the dock
  this.pulltabHeight = parseInt($("#dock-pullup-tab").css('height')),
  this.pulltabWidth = 64,
  this.dockIsOut = false,
  
  //percent of area of cube face that the icon takes up
  this.iconToBorderRatio = 0.9,
  
  //time it takes to move dock down/up (in ms)
  this.tweenTabTime = 500,
  this.hoverTweenLength = 0.2,
  
  //stores the setTimout which moves dock down i.e. after mouse moves out of dock
  this.dockDownTimeout,

  // stores the time of the mousedown on icon to distinguish clicks from hold/drags
  this.mouseDownTime,
  this.dockGrabbed = false;
  this.lastTime;
  this.angularSpeed = 0.01;
  this.dockTabHeight = 70;



  this.scene = new THREE.Scene();
  var iconSize = 32,
  spacingRatio = Math.sqrt(2)+0.2,
  centralAngle = 0.25,
  offsetAngle = 0.05;
  var numCubesOnScreen = 20;
  var cubeTableLength =  Object.keys(self.cubeTable).length;
    
  function widthWithCubes(n){
    return (n -1)*spacingRatio*iconSize;
  }
  
  this.dockCamera = new THREE.PerspectiveCamera(1, window.innerWidth*self.widthScreenRatio / self.heightScreen, 1, 100);
  //dockCamera = new THREE.OrthographicCamera(window.innerWidth/-2, window.innerWidth/2,   window.innerHeight/2, window.innerHeight/-2,  0, -1111, 5000);

  //set up environment
  this.renderer = new THREE.CSS3DRenderer();
  $(this.renderer.domElement).attr('id', 'cube-renderer');
  this.renderer.setSize(window.innerWidth*self.widthScreenRatio, self.heightScreen);

  // DOCK BEHAVOUR
  // mouse over tab brings up dock
  // while mouse is over dock, it stays up
  // when mouse leaves dock, it waits 3 seconds and then tweens down
  // touch click tab brings up cube dock, which tweens out in 3 seconds 
  // if touching down on dock, it stays up
  // if lift up touch on non-click waits 3 seconds and tweens down
  // touch or mouse clicks on cube tween down dock
  // clicks only happen if user releases mouse shortly after mouse down

  var dockDownTimeoutTime = 2000;
  var dockDownDelay = 1000;

  document.getElementById('cubeContainer').appendChild(self.renderer.domElement);

  var cubeTitle = document.createElement('div');
  $(cubeTitle).attr('id', 'cube-title').appendTo("#cubeContainer");
  TweenMax.set($(cubeTitle), {scale:0, transformOrigin:"bottom center"});

  
  $('#dock-pullup-tab').mouseenter(
    function(e) {
      if (!self.dockIsOut) {
        console.log("clientY:"+e.clientY + " | innerHeight:"+window.innerHeight);
        self.tweenDockUp();
      }
  });

  $('#dock-pullup-tab').on('touchstart', function(e){
    e.preventDefault();
    $(this).off('mouseenter');

  });

  $('#dock-pullup-tab').on('touchend', function(){
    if(!self.dockIsOut){
      self.tweenDockUp();
    }
    //wait until tab has tweened out before reactivating its mousenter
    setTimeout(function(){
      $(this).on('mouseenter');
    }, self.tweenTabTime);
    clearTimeout(self.dockDownTimeout);
    self.dockDownTimeout = setTimeout(function(){
      self.tweenDockDown();
    }, dockDownTimeoutTime);
  });

  $(self.renderer.domElement).on('touchstart', function(e){
    self.mouseDownTime =new Date().getTime();
    clearTimeout(self.dockDownTimeout);
  });
  $(self.renderer.domElement).on('touchend', function(){
    
    self.dockDownTimeout = setTimeout(function(){
      self.tweenDockDown();
    }, dockDownTimeoutTime);
  });

  $(self.renderer.domElement).on('mousedown', function(e){
    console.log("domElement mousedown");
    switch (e.button){
      case 0:
        console.log("butt0");
        self.mouseDownTime =new Date().getTime();
        self.dockGrabbed = true;
        break;
      case 1:
        e.stopPropagation();
        break;
      case 2:
        e.stopPropagation();
        break;

    }
  });

  $(self.renderer.domElement).on('mouseup', function(){
    self.dockGrabbed = false;
    if (!self.mouseIsInDock){
      clearTimeout(self.dockDownTimeout);
      self.dockDownTimeout = setTimeout(function(){
        self.dockDownTimeout();
      }, 1000);
    }
  });

  $(self.renderer.domElement).hover(
    function(e){self.mouseIsInDock=true;},
    function(e) {
      self.mouseIsInDock = false;
      console.log("clientY:"+e.clientY + " | innerHeight:"+window.innerHeight);
      clearTimeout(self.dockDownTimeout);
      self.dockDownTimeout =   setTimeout(function(){
        if(self.dockIsOut && !self.mouseIsInDock ){
          if ( e.clientY < window.innerHeight){
            self.tweenDockDown();
          }
        }
      }, dockDownTimeoutTime);
    }
  );


  var cubesAdded = 0;
  // var cubesToPlot = cubeTableLength;
  var cubesToPlot = 30;

  //add cubes to scene
  for (var id in self.cubeTable) {
    //in lieu of slice method for testing
    if (cubesAdded < cubesToPlot){
      var cube = self.createIconCube(id, iconSize);
      var positioningOffset = (cubesToPlot < numCubesOnScreen) ? widthWithCubes(cubesToPlot)/2 : widthWithCubes(numCubesOnScreen)/2;
      var thisX = cubesAdded*iconSize*spacingRatio - positioningOffset;
      cube.position.x = thisX;
      // cubeTable.offsetLeftPosition = window.innerWidth/2+ iconSize*spacingRatio/6 + cube.position.x/3;
      console.log(self.cubeTable.offsetLeftPosition);
      self.scene.add(cube);
      self.cubes[id] = cube;

      //eventCatcher is an invisible pane that sits infront of the cubes and 
      //this simplifies the event handling for the cube because we cannot set events on the div containing all the cube faces due  to the way CSSRenderer is implemented      
      var eventCatcher = document.createElement('div');
      $(eventCatcher).attr('id', 'catcher'+id).attr('data-href', self.cubeTable[id].url).addClass("icon"+id).
      css({'width': iconSize*1.2 +"px",'height': iconSize*2.1 +"px", 'z-index': '2000', 'opacity': '0' });

      eventCatcher.onmouseout = function (e) {
        return self.tweenOutBack($(e.target).attr('id').replace("catcher", ""));
      };
      eventCatcher.onmouseover = function (e) {
        return self.tweenOverFwd($(e.target).attr('id').replace("catcher", ""));
      };

      eventCatcher.onclick = function(e) {
        if ( ( (new Date()).getTime() - self.mouseDownTime) < 300 ){
          window.location.href = $(e.target).attr('data-href');
        }
      };
      var catcherObject = new THREE.CSS3DObject(eventCatcher);
      //position the pane far away enough so that the cube rotated 45 degrees doesn't cut through the pane
      // catcherObject.position.z = Math.sqrt(2)*iconSize/2;
      catcherObject.position.z = iconSize/2 + 5;
      catcherObject.position.x = thisX;
      //catcherObject.rotation.x = Math.PI/2;
      self.scene.add(catcherObject);

      cubesAdded++;

      
    }else{break;} 
  }



  self.controls = new THREE.CubeControls(self.dockCamera, self.renderer.domElement, self);
  // controls = new THREE.TrackballControls(dockCamera, renderer.domElement);
  self.controls.setXPosBounds( 0,  (cubesToPlot < numCubesOnScreen) ? 0: widthWithCubes(cubesToPlot)-widthWithCubes(20) );
  
  self.setCameraPosition();
  $(self.renderer.domElement).css({"position": "absolute", "bottom":0, "left": -1*window.innerWidth+"px", "z-index":"100"});
  
  // controls.addEventListener('change', render);
  window.addEventListener('resize', function(){
    return self.onWindowResize();
  }, false);
  TweenMax.ticker.fps(30);
  TweenMax.ticker.addEventListener('tick', function(){
    self.render();
  });
};


//Grows cube
NP.module.footerCube.prototype.tweenOverFwd = function(thisID) {
  var self = this;
  //window.alert("mouse in");
  var cubeTopBounds = document.getElementById("cubeTop"+thisID).getBoundingClientRect();
  self.titleCenterX = (cubeTopBounds.right + cubeTopBounds.left) /2;
   
  var currentScale = {scale: self.cubes[thisID].scale.x};
  var bigScale = {scale: 1.2};
  var tweenFunctions = {onUpdate:function(){
      self.render();
      self.cubes[thisID].scale.set(currentScale.scale, currentScale.scale, currentScale.scale);

    }, ease:Back.easeOut.config(5)
  };
  TweenMax.to(currentScale, self.hoverTweenLength, $.extend(bigScale, tweenFunctions ) );

  var pos = {y:self.cubeStartY} ;
  TweenMax.to(pos, self.hoverTweenLength, {y: self.popupHeight,
    onUpdate:function(){
      self.cubes[thisID].position.y = pos.y;
    }
  });

  
  TweenMax.to($('#cube-title'), self.hoverTweenLength, {scale: 1, 
    onStart:function(){
      $('#cube-title').html(self.cubeTable[thisID].title);
      $('#cube-title').css({'left':self.titleCenterX - $('#cube-title').outerWidth()/2+'px'});
    }
  });
  
};

//Shrinks cube
NP.module.footerCube.prototype.tweenOutBack = function(thisID) {
  var self = this;
 
  //window.alert("running mouse out");
  var currentScale = {scale: self.cubes[thisID].scale.x};
  var smallScale = {scale: 1};
  var tweenFunctions = {onUpdate:function(){
      self.render();
      self.cubes[thisID].scale.set(currentScale.scale, currentScale.scale, currentScale.scale);
    }, ease:Back.easeOut.config(5)
  };

  TweenMax.to(currentScale, self.hoverTweenLength, $.extend(smallScale, tweenFunctions ) );

  var pos = {y:self.popupHeight} ;
  TweenMax.to(pos, self.hoverTweenLength, {y: self.cubeStartY,
    onUpdate:function(){
      self.cubes[thisID].position.y = pos.y;
    }
  });

  TweenMax.to($('#cube-title'), self.hoverTweenLength, {scale: 0});
    
};

//creates a face for cube
NP.module.footerCube.prototype.createIconPane = function(tableId, iconSize, isFront) {
  var self = this;

  var icon = document.createElement('div');
  $(icon).addClass('icon'+tableId);
  $(icon).attr('data-href', self.cubeTable[tableId].url);
  var iconBorder = document.createElement('div');
  $(iconBorder).css({'height': iconSize+'px', 'width':iconSize+'px'}).addClass('cubeIconBorder').appendTo(icon);

  var iconOverlay = document.createElement('div');
  $(iconOverlay).addClass('cubeIconOverlay').css({'height':Math.round(self.iconToBorderRatio*iconSize),'width':Math.round(self.iconToBorderRatio*iconSize) }).appendTo(iconBorder);
    
  var image = document.createElement('img');
  $(image).attr('src',NP.config.appURL() + '/images' + self.cubeTable[tableId].image).addClass('cubeIconImg').appendTo(iconOverlay);
  
  return new THREE.CSS3DObject(icon);
};

//creates a group of icons in cube formation
NP.module.footerCube.prototype.createIconCube = function(tableId, iconSize) {
  var self = this;

  var r = Math.PI / 2;
  var d = iconSize / 2;
  var pos = [
    [ d, 0, 0 ],
    [ -d, 0, 0 ],
    [ 0, d, 0 ],
    [ 0, -d, 0 ],
    [ 0, 0, d ],
    [ 0, 0, -d ]
  ];
  var rot = [
    [ 0, r, 0 ],
    [ 0, -r, 0 ],
    [ -r, 0, 0 ],
    [ r, 0, 0 ],
    [ 0, 0, 0 ],
    [ 0, 0, 0 ]
  ];

  // cube
  var cube = new THREE.Object3D();

  // sides
  for (var i = 0; i < 6; i++) {
    var object = self.createIconPane(tableId, iconSize, i == 0);
    if (i === 2){
      $(object.element).attr('id', 'cubeTop'+tableId);
    }
    object.position.fromArray(pos[ i ]);
    object.rotation.fromArray(rot[ i ]);
    cube.add(object);
  }

  cube.spinTween = new TimelineMax();
  cube.spinTween.pause();
  var tempRotation = cube.rotation.clone();

  cube.spinTween.to(tempRotation, 3, {y: Math.PI*2, ease:Linear.easeNone,
    onUpdateParams:[tableId], onUpdate: spinCubeUpdate });
  cube.spinTween.repeat(-1);
  cube.position.y = this.cubeStartY;

  function spinCubeUpdate(id){
   cube.rotation.y = tempRotation.y;
  };
  
  return cube;
};

NP.module.footerCube.prototype.makeCubeSpin = function(tableId){
  // cubes[tableId].isSpinning = true;
  this.cubes[tableId].spinTween.repeat(-1);
  this.cubes[tableId].spinTween.play();
};

NP.module.footerCube.prototype.stopCubeSpin = function(tableId){
  // cubes[tableId].isSpinning = false;
  this.cubes[tableId].spinTween.repeat(0);
};

NP.module.footerCube.prototype.tweenDockDown = function(){
  var self = this;

  this.dockIsOut = false;
  TweenMax.to(self.renderer.domElement, 1, {left:-1*window.innerWidth+"px", ease:Back.easeOut});  
  TweenMax.to($('#dock-pullup-tab'), self.tweenTabTime/1000, {bottom: '-3px'});     
};

NP.module.footerCube.prototype.tweenDockUp = function(){
  var self = this;

  this.dockIsOut = true;
  TweenMax.to(self.renderer.domElement, 1, {left: '0px', ease:Back.easeOut});
  TweenMax.to($('#dock-pullup-tab'), self.tweenTabTime/1000, {bottom: -1*self.pulltabHeight+'px'});
};


NP.module.footerCube.prototype.render = function() {
  var self = this;
  self.renderer.render(self.scene, self.dockCamera);
};

NP.module.footerCube.prototype.getCameraHeight = function(){
  //display was optimized to a 1300 width and 20 cubes in it so we scale the height according to this, (window.innerWidth/1300)*heightScreen is maintaining 20 cubes to all displays
  return  (window.innerWidth/1300)*this.heightScreen;
};

NP.module.footerCube.prototype.setCameraPosition = function(){
  var self = this;

    self.controls.setCameraPosition(null,
      Math.sin(self.cameraDownAngle)*self.cameraZhypotenuse/self.dockCamera.aspect,
      Math.cos(self.cameraDownAngle)*self.cameraZhypotenuse/self.dockCamera.aspect);
};

NP.module.footerCube.prototype.onWindowResize = function() {
  var self = this;

  var thisHeight = self.getCameraHeight();
  // $('#dock-pullup-tab').css('bottom',0);

  var scalar = (self.dockIsOut) ? 0 : -1;
  $(self.renderer.domElement).css('left', scalar*window.innerWidth+"px" );


  self.dockCamera.aspect = window.innerWidth*self.widthScreenRatio / thisHeight;
  self.setCameraPosition();

  
  self.dockCamera.updateProjectionMatrix();

  self.renderer.setSize(window.innerWidth*self.widthScreenRatio, thisHeight);
  $('#dock-pullup-tab').css({'transform':'scale('+ 0.886*thisHeight/this.dockTabHeight +')', 'transform-origin': 'bottom left'} );
  return self.render();
};


NP.module.footerCube.prototype.drawBoxes = function(url) {
  var self = this;
  $.get(url, function (res) {
      self.cubeTable = res;
      console.log(Object.keys(self.cubeTable)); 
      self.init();
  });
};

//drawBoxes("/local_apps.json");
// drawBoxes("http://search.cobra5d.com/bookmarks.json");
