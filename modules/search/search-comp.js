/*jshint devel:false */
/*
SEARCH RESULTS VIEW
---------------------------
Displays search results in a column consisting of rings of rectangular panes,
each pane consisting of a search result or advertisement

Function flow as follows:
init---(search entered) --->
*/

//Javascript proper negative modulo hack
Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
};

NP.module.search = function(accountId, height, width){
  this.accountId = accountId;
  this.height = height;
  this.width = width;
};

NP.module.search.prototype.init = function() {
  var self = this;
  // TweenMax.ticker.fps(30);
  this.camera, this.scene, this.renderer, this.controls;

  this.farOut = 1000,
  this.directionVectors = [[0,0,this.farOut], [this.farOut,0,0], [0,0,-this.farOut], [-this.farOut,0,0]],
  this.paneWidth = 480, 
  this.paneHeight = 540, 
  this.imageRatio = 380/285,
  //transparent space between coloured panes
  this.contentSpacingPx = 20,
  //space between edge of colored pane and content
  this.contentPaddingPx = 20,
  this.contentExtraTopPadding = 30, 
  //number of panes in a circle
  this.ringCircumference = 18,
  //distance to move pane outward from center
  this.cardRadius = this.paneWidth/(2*Math.tan(Math.PI/this.ringCircumference)),
    this.paneAway = 10,
  //radius of position of iframe when it's initially created (behind the search result)
  this.paneCameraIframeInRadius = this.cardRadius - this.paneAway, 
  //radius of position of iframe when it is flipped
  this.paneCameraIframeOutRadius = this.cardRadius + this.paneAway, 
  //distance away from center once camera has tweened to search results
  this.initialCameraRadius = 5000,
  //distance above center the camera 
  this.initialCameraHeight = 7000,
  this.mediaPaneSizeRatio = 0.6,
  this.sampleAdText = '{"results":[{"url":"http://www.care2.com/","title":"Care2 - make a difference", "description":"Care2 - largest online community for healthy and green living, human rights and animal welfare.", "imageUrl":"care2.jpg"}]}';
  this.sampleAd = $.parseJSON(this.sampleAdText);
  //used for mouse over/out events to prevent repeated calls of one/another using setTimout to force a delay in event receptivity after tween starts
  this.tweenTimeout = 40;
  this.tweenPaneLength = 0.30;
  this.tweenPane;
  this.iconFontSize = 28;
  this.iconBackgroundSpacing = 5;
  this.handGap = 20; 
  this.boxEffect = false;
   
  this.initializeStateVariables();

  $.handlebars({
    templatePath: '/templates',
    templateExtension: 'html'
  }); 
  
  this.scene = new THREE.Scene();
  
  this.mediaFrame = new THREE.CSS3DObject( $(document.createElement('div')).click(function(){
    $.colorbox.close();
  }).attr('id', 'media-frame').get(-1) );
  this.scene.add(this.mediaFrame);

  $(this.mediaFrame.element).hide();  

  $(document.createElement('div')).attr('id', 'video-container').appendTo('#search-container');
 
 $("#video-container").one('render.handlebars', function () {
    //called after template is rendered to initialize video player
    videojs('youtube_video', { "techOrder": ["youtube"]});
    //when videojs youtube plugin initializes a video with src="", it makes its iframeblocker black but doesn't un-black it when we set the scr later, so we remove this style setting
    $("#youtube_video").find('.iframeblocker').attr('style', '');
  }).render('videoFrame', {});


  var iconSize = 128, spacingRatio = 1.3, centralAngle = 0.25, offsetAngle = 0.05, heightScreenRatio = 0.2;
  //number of window panes that will fit in one ring of window panes
    
  this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
  
  //set up environment
  this.renderer = new THREE.CSS3DRenderer();
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.domElement.style.position = 'absolute';
  $(this.renderer.domElement).attr('id', 'search-renderer');  
  
  document.getElementById('search-container').appendChild(this.renderer.domElement);

  this.controls = new THREE.SearchControls(this.camera, this.renderer.domElement, self);
  this.controls.yPanSpeed = 1.17;
  this.controls.xRotateSpeed = 0.37;
  this.controls.setYPosBounds(0,0);
  this.controls.snapRowHeight = this.paneHeight;
 
  // will disable/enable up arrow if controls moves to/from the top of the screen 
  this.controls.throwCompleteCallback = function() {
    if (this.cameraPosition.yPos >= -0.001 ){
      if ( $("#pan-up").css('display') !== 'none'){
        $("#pan-up").fadeOut('fast');
      }
    }else{ 
      if ( $("#pan-up").css('display') === 'none' || $("#pan-up").css('visibility') === 'hidden'){
        $("#pan-up").css('visibility', 'visible');
        $("#pan-up").fadeIn('fast');
      }  
    }
  }  

  //this.controls.addEventListener('change', this.render);
  $(window).resize( function(){ 
    return self.onWindowResize();
  });

  this.initButtons();
  this.prepareFirstSearchView();

  $("#youtube-sample").css({'top': window.innerHeight/2 - $("#youtube-sample").outerHeight()/2, 'right': '20px'});
  
  $("#youtube-sample").click(function(){
    $("#youtube-sample").remove();
    window.location.href = 'index.html#feedly';
  })
  
}

NP.module.search.prototype.initializeStateVariables = function(){

  this.searchQuery = "",
  this.numRingsPlotted =0,
  this.numAdsPlotted=0,
  this.numSearchResultsPlotted = 0 , this.numAdsOnRing = 0, this.numResultsOnRing = 0,
  this.paneCameraOutDistance = this.cardRadius + 75,
  this.panes = [],
  this.emptyPanes = {},
  this.hasSpiraledOut = false, 
  this.disableSearch = false,
  this.lastSearchEnter = new Date().getTime();
  this.mediaPaneOut = false,
  
  
  //indicates the arrow buttons are being held down
  this.rightRotateDown = false;
  this.leftRotateDown = false;
  this.panUpDown = false;
  this.panDownDown = false;

}

NP.module.search.prototype.resetSearch = function(){
  console.log('resetting SEARCH');
  this.clearSearchResults();
  this.hasSpiraledOut = false;
  $('#search-field').prependTo("#search-page-container").css({'position': 'absolute', 'margin-left': 0, 'margin-right':0,'top': 0, 'left':0 });
  this.positionButtons();
  $("#search-bar").add('.nav-element').add('#logo-sm').hide();

  $("#logo-mid").add('#promo-msg').fadeIn();
  this.prepareFirstSearchView();
}

NP.module.search.prototype.prepareFirstSearchView = function(){
  this.controls.disable();
  this.camera.position = new THREE.Vector3(0,this.initialCameraHeight,0);
  this.camera.lookAt(new THREE.Vector3( 0, 0, 0.0001));
  this.plotEmptyRing(); 
  this.render();
  
}  


//given an id string, returns an object with the indices of the element's position in the column
NP.module.search.prototype.parseID = function(thisID){
  var init = thisID.indexOf('[');
  var fin = thisID.indexOf(']');
  var indices = thisID.substring(init + 1, fin).split(":");
  return {column:indices[0], row:indices[1]};
}

NP.module.search.prototype.escapeStr = function( str) {
 if( str){
     return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
 }else{
     return str;
 }
}

// turns camera to center on the next column left/right
NP.module.search.prototype.tweenCameraRotate = function(isRight){
  var self = this;  

  var length = 1000;
  var thisRot = Math.atan2(this.camera.position.x, this.camera.position.z);

  var sign = (isRight) ? 1 : -1;
  var closestcolumnPosition = Math.round((thisRot / (Math.PI*2))*this.ringCircumference);
  var closestColumnAngle = Math.PI*2*closestcolumnPosition/this.ringCircumference ;
  
  var targetAngle = Math.PI*2*( sign/this.ringCircumference ) + closestColumnAngle ;
    
  var currentVars = {rotation: this.controls.cameraPosition.yRot};
  var targetVars = {directionalRotation:{rotation: (targetAngle).toFixed(5) + "_short", useRadians:true}};

  this.controls.disable();
  var tweenFunctions = {
    onUpdate: function () {
      self.controls.setCameraPosition(null, currentVars.rotation, null );
    },
    onComplete: function(){
      if (self.leftRotateDown || self.rightRotateDown ){
        self.tweenCameraRotate(isRight);
      }else{
        self.controls.enable();
      }
    },
    ease: Sine.EaseInOut
  }  
  TweenMax.to(currentVars, 0.6, $.extend(targetVars, tweenFunctions ) ) ; 
}

// turns camera to center on the next row up/down
NP.module.search.prototype.tweenCameraPan = function(isUp){
  if (this.controls.cameraPosition.yPos <= -(this.numRingsPlotted-1)*this.paneHeight +1 && !isUp ){
    this.controls.disable();
    this.getNextRing();
    this.controls.enable();

  }else{
    var self = this;
    // if (!this.cameraTweening){
    var sign = (isUp) ? 1 : -1;
    var length = 1000;
    var thisPos = this.controls.cameraPosition.yPos;
    var closestRowPos = Math.floor( thisPos / this.paneHeight );
    var targetY = (closestRowPos+1*sign)*this.paneHeight ;
    console.log("RowTo:" + (closestRowPos+1*sign));
    if (targetY === 0) { 
      $("#pan-up").fadeOut('fast');
    } 
      
    var currentVars = {y: thisPos };
    var targetVars = {y: targetY};
    
    var tweenFunctions = {
      onStart: function(){
        self.controls.disable();
      },
      onUpdate: function () {
        self.controls.setCameraPosition(null, null, currentVars.y );
      },
      onComplete: function(){
        if (isUp && self.camera.position.y >= self.controls.topEdgeLimit*self.controls.yPanSpeed ) {
          self.controls.enable();
          return;
        }
        if (!isUp  && ! $("#pan-up").is(":visible") ){
          console.log("fademein");
          $("#pan-up").fadeIn('fast');
        }

        if (self.panUpDown || self.panDownDown ){
          self.tweenCameraPan(isUp);
        }else{
          self.controls.enable();
          self.controls.isDragThrowing = false;
        }  
               
      },

      ease: Sine.EaseInOut
    }
    
    TweenMax.to(currentVars, 0.6, $.extend(targetVars, tweenFunctions ) );  
  }   
}

// moves the camera in a circular arc from the center of the ring to the initial camera position (outside the ring)
NP.module.search.prototype.tweenCameraJumpOut = function(){
  
  var self = this;
  var length = 3000;

  var currentVars = {xAngle:0, jumpArcRadius: (this.initialCameraRadius/this.camera.aspect)/2};
  var targetVars = {xAngle: Math.PI};

  var tweenFunctions = {
    onStart:function(){
      self.controls.disable();
    },
    onUpdate: function () {
      currentVars.zPos = -Math.cos(currentVars.xAngle)*currentVars.jumpArcRadius + currentVars.jumpArcRadius;
      currentVars.yPos = Math.sin(currentVars.xAngle)*currentVars.jumpArcRadius;
      self.camera.position.fromArray([0, currentVars.yPos, currentVars.zPos ]);
      self.camera.lookAt(new THREE.Vector3(0, 0, 0 ) );
      self.render();
    },
    onComplete: function(){
      self.controls.enable();
      self.controls.setCameraPosition( (self.initialCameraRadius/self.camera.aspect), 0, 0);
    },
  }  
  TweenMax.to(currentVars, 1, $.extend(targetVars, tweenFunctions, {ease: Elastic.EaseOut} ) );
}

NP.module.search.prototype.tweenCameraSpiralOut = function(){
  var self = this; 
  var startRotOffset = (2/18)*Math.PI*2;
  //should be a multiple of 2
  var rotationsPerSecond = 2;
  var tinyRadius = 0.0001;
  
  var rotSpiralTween = new TimelineMax({paused:true});
  rotSpiralTween.pause();
  //all tween lengths should be a multiple of 0.5
  var lengthScale = 1;
  this.render();
    
  var topRotLength=  1.5;
   var endCamRad = self.initialCameraRadius/self.camera.aspect;
  var currentRotVars = {yRot:startRotOffset };
  rotSpiralTween.to(currentRotVars, lengthScale*topRotLength, 
   {
    yRot: topRotLength*rotationsPerSecond*Math.PI*2 +startRotOffset,
    onStart: function(){
      self.controls.disable();

    },
    onUpdate: function () {
      self.camera.lookAt(new THREE.Vector3( Math.sin(currentRotVars.yRot)*tinyRadius, 0, Math.cos(currentRotVars.yRot)*tinyRadius)) ;
      self.render();
    },
    onComplete: function(){
      currentRotVars = {yRot: startRotOffset};

      // self.controls.target = new THREE.Vector3(0, Math.tan(self.controls.cameraLookdownAngle)*(endCamRad - self.cardRadius)/9 - endCamRad/9 , 0); 
      self.controls.target = new THREE.Vector3(0, 0 , 0); 
    },
    ease:Linear.easeNone
  });

  var spiralDownLength = 2;
  var currentSpiralVars = {xzRad:endCamRad, yRot: startRotOffset, yPos:self.initialCameraHeight, ratio:0};
  var myBackEase = Back.easeOut.config(5);
  rotSpiralTween.to(currentSpiralVars, lengthScale*topRotLength, 
  {
     yRot:spiralDownLength*rotationsPerSecond*Math.PI*2 + startRotOffset, yPos:0, ratio: 1,
    onUpdate: function () {
      // self.controls.tiltAmount = currentSpiralVars.ratio;
      self.controls.setCameraPosition(currentSpiralVars.xzRad*myBackEase.getRatio(currentSpiralVars.ratio), currentSpiralVars.yRot, currentSpiralVars.yPos );
    },
    onComplete:function(){
      self.controls.enable();
      self.controls.target = null;

    },
    ease:Linear.easeNone 
  });

  var ringSpinLength = 0.5;
  var currentRingSpinVars = {yRot:startRotOffset};
  rotSpiralTween.to(currentRingSpinVars, lengthScale*ringSpinLength, 
  {
    yRot:ringSpinLength*rotationsPerSecond*Math.PI*2 + startRotOffset,
    onUpdate: function () {
      self.controls.setCameraPosition(null, currentRingSpinVars.yRot, null);
    },
    onComplete:function(){
      self.hasSpiraledOut = true; 
      self.controls.tiltMode = true; 

    },
    ease:Linear.easeNone 
  });
  
  this.spiralTweenLength = rotSpiralTween.duration();

  // used to create a tween that will accelerate rotation and then end with elastic type tween
  // uses third-party GSAP CustomEase : https://github.com/art0rz/gsap-customease
  var customEase = CustomEase.create("myCustomEase", [{s: -0.000000,cp: 0.000192,e: 0.000384},{s: 0.000384,cp: 0.000811,e: 0.001237},{s: 0.001237,cp: 0.001931,e: 0.002624},{s: 0.002624,cp: 0.003622,e: 0.004620},{s: 0.004620,cp: 0.005970,e: 0.007319},{s: 0.007319,cp: 0.009078,e: 0.010837},{s: 0.010837,cp: 0.013078,e: 0.015319},{s: 0.015319,cp: 0.018132,e: 0.020945},{s: 0.020945,cp: 0.024443,e: 0.027942},{s: 0.027942,cp: 0.032265,e: 0.036589},{s: 0.036589,cp: 0.041901,e: 0.047214},{s: 0.047214,cp: 0.053687,e: 0.060160},{s: 0.060160,cp: 0.067928,e: 0.075696},{s: 0.075696,cp: 0.084783,e: 0.093870},{s: 0.093870,cp: 0.104121,e: 0.114372},{s: 0.114372,cp: 0.125485,e: 0.136597},{s: 0.136597,cp: 0.148241,e: 0.159884},{s: 0.159884,cp: 0.171801,e: 0.183718},{s: 0.183718,cp: 0.195755,e: 0.207792},{s: 0.207792,cp: 0.219873,e: 0.231954},{s: 0.231954,cp: 0.244047,e: 0.256140},{s: 0.256140,cp: 0.268562,e: 0.280985},{s: 0.280985,cp: 0.293394,e: 0.305804},{s: 0.305804,cp: 0.318194,e: 0.330585},{s: 0.330585,cp: 0.342950,e: 0.355316},{s: 0.355316,cp: 0.367650,e: 0.379985},{s: 0.379985,cp: 0.392281,e: 0.404576},{s: 0.404576,cp: 0.416826,e: 0.429076},{s: 0.429076,cp: 0.441270,e: 0.453465},{s: 0.453465,cp: 0.465597,e: 0.477730},{s: 0.477730,cp: 0.489790,e: 0.501850},{s: 0.501850,cp: 0.513830,e: 0.525809},{s: 0.525809,cp: 0.537698,e: 0.549586},{s: 0.549586,cp: 0.561371,e: 0.573155},{s: 0.573155,cp: 0.584826,e: 0.596497},{s: 0.596497,cp: 0.608038,e: 0.619578},{s: 0.619578,cp: 0.630978,e: 0.642378},{s: 0.642378,cp: 0.653621,e: 0.664865},{s: 0.664865,cp: 0.675937,e: 0.687008},{s: 0.687008,cp: 0.697892,e: 0.708776},{s: 0.708776,cp: 0.719451,e: 0.730126},{s: 0.730126,cp: 0.740575,e: 0.751025},{s: 0.751025,cp: 0.761225,e: 0.771426},{s: 0.771426,cp: 0.781357,e: 0.791289},{s: 0.791289,cp: 0.800927,e: 0.810566},{s: 0.810566,cp: 0.819886,e: 0.829206},{s: 0.829206,cp: 0.838182,e: 0.847158},{s: 0.847158,cp: 0.855764,e: 0.864370},{s: 0.864370,cp: 0.872578,e: 0.880786},{s: 0.880786,cp: 0.888569,e: 0.896352},{s: 0.896352,cp: 0.903682,e: 0.911011},{s: 0.911011,cp: 0.917860,e: 0.924709},{s: 0.924709,cp: 0.931052,e: 0.937396},{s: 0.937396,cp: 0.943208,e: 0.949021},{s: 0.949021,cp: 0.954281,e: 0.959540},{s: 0.959540,cp: 0.964228,e: 0.968917},{s: 0.968917,cp: 0.973018,e: 0.977119},{s: 0.977119,cp: 0.980621,e: 0.984123},{s: 0.984123,cp: 0.987019,e: 0.989915},{s: 0.989915,cp: 0.992202,e: 0.994488},{s: 0.994488,cp: 0.996167,e: 0.997846},{s: 0.997846,cp: 0.998923,e: 1.000000},{s: 1.000000,cp: 1.000685,e: 1.001370},{s: 1.001370,cp: 1.001987,e: 1.002603},{s: 1.002603,cp: 1.003052,e: 1.003500},{s: 1.003500,cp: 1.002966,e: 1.002432},{s: 1.002432,cp: 1.001064,e: 0.999697},{s: 0.999697,cp: 0.998838,e: 0.997978},{s: 0.997978,cp: 0.997950,e: 0.997922},{s: 0.997922,cp: 0.998995,e: 1.000069},{s: 1.000069,cp: 0.999966,e: 0.999862},{s: 0.999862,cp: 1.000000,e: 1.000137},{s: 1.000137,cp: 1.000069,e: 1.000000},]);

  //  see http://www.snorkl.tv/2011/03/tween-a-timelinelite-for-ultimate-sequencing-control-and-flexibillity/
  var controller = new TimelineMax();

  // the over 1 progress gets wrapped around to this value (because it's where the last tween starts, and it is at the same position as the end of tween) 
  var ringSpinTimeRatio = ringSpinLength/this.spiralTweenLength;
  
  rotSpiralProgress = {progress: 0};
  controller.to(rotSpiralProgress, this.spiralTweenLength*1.35, {progress: 1 , 
    onStart:function(){
       self.disableSearch = true;
    },
    onUpdate: function(){
      var thisProgress = (rotSpiralProgress.progress > 1 ) ? 1-ringSpinTimeRatio+rotSpiralProgress.progress%1 : rotSpiralProgress.progress;
      rotSpiralTween.progress(thisProgress);
      // render();
    },
    onComplete:function(){
      self.disableSearch = false;
       
     } ,
    ease: customEase,  
  }) ;
}

//starts a tween to y value of bottom ring to be plotted (called before ring plotted) 
NP.module.search.prototype.tweenCameraToBottom = function(){
  var self = this;
  var length = 500;  
  
  var currentVars = {xzRad: this.controls.cameraPosition.xzRad, yRot: this.controls.cameraPosition.yRot, yPos: this.controls.cameraPosition.yPos };
  var targetVars = {yPos: -this.paneHeight*this.numRingsPlotted , yRot: -(1/this.ringCircumference)*Math.PI*2 };
  console.log("yRot"+this.getYRot(this.camera.position.x, this.camera.position.z) );

  this.controls.disable();
  
  var tweenFunctions = {
    onUpdate: function () {
      self.controls.setCameraPosition(currentVars.xzRad, currentVars.yRot, currentVars.yPos); 
    },
    onComplete: function(){
      self.controls.enable();
      if (! $("#pan-up").is(":visible") ){
          $("#pan-up").fadeIn('fast');
      }
    }   
  }
  var customEase = CustomEase.create("myCustomEase", [{s: -0.000000,cp: 0.001655,e: 0.003309},{s: 0.003309,cp: 0.005690,e: 0.008072},{s: 0.008072,cp: 0.011012,e: 0.013952},{s: 0.013952,cp: 0.017404,e: 0.020856},{s: 0.020856,cp: 0.024800,e: 0.028744},{s: 0.028744,cp: 0.033174,e: 0.037604},{s: 0.037604,cp: 0.042521,e: 0.047438},{s: 0.047438,cp: 0.052849,e: 0.058259},{s: 0.058259,cp: 0.064174,e: 0.070088},{s: 0.070088,cp: 0.076518,e: 0.082948},{s: 0.082948,cp: 0.089910,e: 0.096872},{s: 0.096872,cp: 0.104383,e: 0.111895},{s: 0.111895,cp: 0.119974,e: 0.128054},{s: 0.128054,cp: 0.136724,e: 0.145395},{s: 0.145395,cp: 0.154677,e: 0.163958},{s: 0.163958,cp: 0.173874,e: 0.183791},{s: 0.183791,cp: 0.194368,e: 0.204944},{s: 0.204944,cp: 0.216203,e: 0.227462},{s: 0.227462,cp: 0.239427,e: 0.251393},{s: 0.251393,cp: 0.264086,e: 0.276778},{s: 0.276778,cp: 0.290217,e: 0.303656},{s: 0.303656,cp: 0.317854,e: 0.332052},{s: 0.332052,cp: 0.346752,e: 0.361452},{s: 0.361452,cp: 0.376527,e: 0.391602},{s: 0.391602,cp: 0.407057,e: 0.422512},{s: 0.422512,cp: 0.438347,e: 0.454182},{s: 0.454182,cp: 0.470395,e: 0.486607},{s: 0.486607,cp: 0.503187,e: 0.519767},{s: 0.519767,cp: 0.536697,e: 0.553627},{s: 0.553627,cp: 0.570881,e: 0.588135},{s: 0.588135,cp: 0.605670,e: 0.623204},{s: 0.623204,cp: 0.640969,e: 0.658735},{s: 0.658735,cp: 0.676655,e: 0.694576},{s: 0.694576,cp: 0.712565,e: 0.730554},{s: 0.730554,cp: 0.748487,e: 0.766420},{s: 0.766420,cp: 0.784148,e: 0.801876},{s: 0.801876,cp: 0.819207,e: 0.836539},{s: 0.836539,cp: 0.853248,e: 0.869958},{s: 0.869958,cp: 0.885783,e: 0.901607},{s: 0.901607,cp: 0.916284,e: 0.930961},{s: 0.930961,cp: 0.944270,e: 0.957580},{s: 0.957580,cp: 0.969385,e: 0.981190},{s: 0.981190,cp: 0.991461,e: 1.001732},{s: 1.001732,cp: 1.009155,e: 1.016579},{s: 1.016579,cp: 1.022283,e: 1.027987},{s: 1.027987,cp: 1.029219,e: 1.030452},{s: 1.030452,cp: 1.025334,e: 1.020216},{s: 1.020216,cp: 1.010974,e: 1.001732},{s: 1.001732,cp: 0.994226,e: 0.986719},{s: 0.986719,cp: 0.994226,e: 1.001732},{s: 1.001732,cp: 1.003674,e: 1.005616},{s: 1.005616,cp: 1.003596,e: 1.001576},{s: 1.001576,cp: 1.001654,e: 1.001732},]);    
  TweenMax.to(currentVars, 0.8, $.extend(targetVars, tweenFunctions, {ease: customEase} ) );
}

/* -----------------------------------------------------------------------------
    CSS3DObject generating methods (name beginning with "create")
    These function create CSS3DObjects which are later positioned by the callee
----------------------------------------------------------------------------------*/

//makes search results/ad pane
NP.module.search.prototype.createWindowPane = function(id, isAd, searchNum, data) {
  var self = this;
  data.isAd = isAd;
  var data = (isAd)? 
      {title:"Care2 - make a difference", domain: "http://www.care2.com/",
      url: "http://www.care2.com/", imageUrl:"/images/care2.jpg",  
      description:"Care2 - largest online community for healthy and green living, human rights and animal welfare.", content:"url", isAd: true }
    : data;
  console.log(JSON.stringify(data));
  data.searchNum = searchNum;

  var paneContent = document.createElement('div');
  $(paneContent).attr('id',id).addClass('window-pane').on('mousedown', function(){
    self.paneMouseDownTime = new Date().getTime();
  });
    
  var thisID = id;
  if (data.content === 'url'){
    data.isYoutube = false;
    $(paneContent).attr("href",data.url).attr("target","_blank")
      .click(function(e){
        if (new Date().getTime() - self.paneMouseDownTime < 200 ){
          return !window.open(data.url);
        } 
      });   
  } else if (data.content === 'youtube'){
    data.isYoutube = true;
    $(paneContent)
      .click(function(e){
        if (new Date().getTime() - self.paneMouseDownTime < 200 ){
          $(self.mediaFrame.element).hide();
          //$('#media-frame').data('iframe', data.url+'/?rel=0&amp;wmode=transparent' );
          $('#media-frame').data('iframe', data.url);
           var col = $(this).data('column');
           var row = $(this).data('row');
           return self.tweenCameraToCard(row,col);
        } 
      }); 
  }

  var img = new Image();
  $(img).addClass("search-pane-img").load(function () {
      //$(this).css('display', 'none'); // .hide() doesn't work in Safari when the element isn't on the DOM already
      $("#"+thisID+" .loadingSpinner").remove();
      $(this).hide();
      $("#"+thisID+" .screenshot").append(this);
      $(this).fadeIn();
  }).error(function () {
      $("#"+thisID+" .loadingSpinner").remove();
      $("#"+thisID+" .screenshot").append($('<img src="http://cobra5d.com/images/notavail.png" class="search-pane-img">'));
  }).attr('src', data.imageUrl); 

  $(paneContent).render('searchCard', data);
   
  return paneContent;
}

//creates a group of icons in cube formation
NP.module.search.prototype.createWindowPaneBox = function(id, isAd, searchNum, data) {
  var itemWidth = 420 ;  // ensure this value is synced with search.less @item-width value
  var itemHeight = 460 ;  // ensure this value is synced with search.less @item-height value
  var itemThick = 60 ;  // ensure this value is synced with search.less @item-height value
  var self = this;

  
  var r = Math.PI / 2;
 
  var pos = [
    [ 0, 0, itemThick/2 ], //front
    [ 0, 0, -itemThick/2 ], //back
    [ itemWidth/2, 0, 0 ], //right
    [ -itemWidth/2, 0, 0 ], //left
    [ 0, itemHeight/2, 0 ], //top
    [ 0, -itemHeight/2, 0 ] //bottom
  ];
  var rot = [
    [ 0, 0, 0 ],
    [ 0, 0, r*2 ],
    [ 0, r,  r],
    [ 0, -r,  -r],
    [ r, 0, 0 ],
    [ r, 0, 0 ]
  ];

  // cube
  var paneBox = new THREE.Object3D();
  
  // sides
  if (this.boxEffect){
    for (var i = 0; i < 6; i++) {
      var faceDiv;
      
      if (i === 0 ){
        faceDiv = this.createWindowPane(id, isAd, searchNum, data);
      }else{
        
        faceDiv = document.createElement('div');
        $(faceDiv).addClass('box-sides');
        if (i === 1){
          $(faceDiv).addClass( "box-back");
        }else if (i === 2 || i === 3 ){
          $(faceDiv).addClass( "box-vert-side");
        }else if (i === 4 || i === 5){
          $(faceDiv).addClass( "box-horiz-side");
        }
        
      }
      var object = new THREE.CSS3DObject(faceDiv);
      object.position.fromArray(pos[ i ]);
      object.rotation.fromArray(rot[ i ]);

      paneBox.add(object);
    }
  }else{
    var faceDiv = this.createWindowPane(id, isAd, searchNum, data);
    var front = new THREE.CSS3DObject(faceDiv);
    front.position.fromArray([0,0,0]);
    front.rotation.fromArray(rot[ 0 ]);
    var backDiv = document.createElement('div');
    $(backDiv).addClass('box-sides box-back no-backface');
    var back = new THREE.CSS3DObject(backDiv);
    back.position.fromArray([ 0, 0, -0.5]);
    back.rotation.fromArray([ 0, r*2, 0 ]);
    paneBox.add(front);
    paneBox.add(back);
  }
  
  return paneBox;
};


NP.module.search.prototype.tweenCameraToCard = function(row, column){
  var self = this;
  if (self.controls.isEnabled ){
    var thisRow = Math.round(-self.controls.cameraPosition.yPos/self.paneHeight);
    var thisCol = Math.round( (self.controls.cameraPosition.yRot / (Math.PI*2) )*self.ringCircumference).mod(self.ringCircumference);
    //don't tween to card if its positioned infront
    if (thisRow  === row && thisCol === column  ){
      self.tweenIframePane(row, column);
    }else{
      var length = 500;
      var currentVars = {rotation: (self.controls.cameraPosition.yRot*(180/Math.PI)).toFixed(5) , yPos: self.controls.cameraPosition.yPos};
      var targetVars = {directionalRotation: (360*(column/self.ringCircumference)).toFixed(5) +"_short" , yPos: -row*self.paneHeight };
      
      this.controls.disable();

      var tweenFunctions = {
        onStart: function(){
          // render();
        },
        onUpdate: function () {
            self.controls.setCameraPosition(null, currentVars.rotation/(180/Math.PI), currentVars.yPos );
        },
        onComplete:function(){
          self.controls.enable();
          self.tweenIframePane(row, column);
        }

      };

      TweenMax.to(currentVars, 1, $.extend(targetVars, tweenFunctions ) );
    }
  }
}  

NP.module.search.prototype.tweenIframePane = function(row, column){
  var self = this;
 
  var length = 0.5;
  var xzDiff = 2000;
  var currentVars = {yRot: 0, xzRad:0, cardPosYRot: (column/self.ringCircumference)*Math.PI*2, cardPosYVal : self.controls.cameraPosition.yPos};
  var targetVars = {xzRad:self.controls.cameraPosition.xzRad-1, yRot: Math.PI, cardPosYVal:self.camera.position.y} ;
 
  this.applyPositioning( this.mediaFrame, self.cardRadius -xzDiff , this.controls.cameraPosition.yRot  , this.controls.cameraPosition.yPos);
    
  var tweenFunctions = {
    onStart: function(){
      self.controls.disable();
      $(self.mediaFrame.element).show();
    },    
    onUpdate: function () {
      self.panes[row][column].rotation.y = currentVars.cardPosYRot - currentVars.yRot; 
      self.mediaFrame.rotation.y = currentVars.cardPosYRot + Math.PI - currentVars.yRot;
      self.mediaFrame.position = self.getRadialPlot(currentVars.xzRad, currentVars.cardPosYRot, currentVars.cardPosYVal).clone();
      self.render();    
    },
    onComplete:function () {
      console.log("complete");     
      self.mediaPaneOut = true;
      $('#youtube_video').find('iframe:first').attr("src", $('#media-frame').data('iframe') );
      $.colorbox($.extend(self.getColorboxSizing(), {
         scrolling: false,opacity:0, inline:true,  href:"#youtube_video", onClosed:function(){self.tweenMediaFrame.reverse();}
        })
      ); 

    }, 
    onReverseComplete:function () {
     self.mediaPaneOut = false;
     self.controls.enable();
     self.controls.isDragThrowing = false;
     $(self.mediaFrame.element).hide();
    }
  };
  var opacityStartRatio = 0.5;
  var thisWidth = window.innerWidth*this.mediaPaneSizeRatio;
  this.tweenMediaFrame = TweenMax.to(currentVars, length, $.extend(targetVars, tweenFunctions ) );
  


};


NP.module.search.prototype.createEmptyWindowPane = function() {
  var self = this;
  var paneContent = document.createElement('div');
  //coloured div
  $(paneContent).addClass("box-sides box-back no-backface");
  //used to set color
     
  $(paneContent).fadeIn("slow");
  var cssObject = new THREE.CSS3DObject(paneContent);
  return cssObject;
}

// generates a vector with polar co-ordinates on the xz pane and a y position
NP.module.search.prototype.getRadialPlot = function(xzRad, yRot, yPos){
  var vector = new THREE.Vector3(Math.sin(yRot)*xzRad, yPos, Math.cos(yRot)*xzRad);
  // vector.x = Math.sin(yRot)*xzRad;
  // vector.z = Math.cos(yRot)*xzRad;
  // vector.y = yPos;
  return vector;
}

//position object with given co-ordiantes as specified in getRadialPlot
NP.module.search.prototype.applyPositioning = function(object,xzRad, yRot, yPos ){
  object.rotation.fromArray([0, yRot , 0]);
  object.position = this.getRadialPlot(xzRad, yRot, yPos);
}

// gets JSON data and passed it to plotRing
NP.module.search.prototype.getNextRing = function(){
  var self = this;
        
  // $.getJSON( '/api/v1/textsearch?callback=?', {
  $(function(){
    $.ajax({
      url:'http://cobra5d.com/api/v1/textsearch', 
      method: "GET",
      data:{
        "query": self.searchQuery,
        "page" : self.numRingsPlotted, 
        lang: "en-us"
      },
      success: function(searchData){
        console.log(JSON.stringify(searchData)); 
        if (typeof(searchData.results) !== 'undefined'){
          if (searchData.results.length> 0){
            console.log("##################ALOOOOOOOONGGGGGGGGGGGGGGGGGGGGGGGGGG:" +searchData.results.length);
            self.plotRing(searchData);
          }else{
            alert("Empty search results");
          }
        }else{
          alert("That there link may be a 404");
        }
      }
    });
  });

 
}

// Given a set of search data, this will plot the data under any existing search results rings.  
// Ring starts on positive Z axis and proceeds couterclockwise to the right
// First item is offset 1 to the left so camera tween come out on 2nd search result, 
// hence the use of (column-1)%ringCircumference in indexing of radial position index
NP.module.search.prototype.plotRing = function(searchData){
  var self = this;
  //search results limited to 10 rings (for performance reasons)
  // if (this.numRingsPlotted < 10){
  var theseIDs = [];
  //moves camera to next row

  //plot ring of search result panes
  self.panes.push([]);
  for (var column = 0; column < this.ringCircumference ; column++) {

    //change this and you must change the corresponding isAd in plotEmptyRing
    var isAd =  (column % 9 === 0 || (column - 1)%9 ===0  ) ? true : false; 

    var id = (isAd) ? 'ad-pane'+self.numAdsPlotted: 'search-pane'+self.numSearchResultsPlotted;
          
    theseIDs.push(id);
    
    //Add coloured search results pane
            
    var paneData = (isAd) ? self.sampleAd.results[0] : searchData.results[self.numResultsOnRing]; 
    var thisPane = self.createWindowPaneBox(id, isAd,  self.numSearchResultsPlotted + 1, paneData );
    $(thisPane.children[0].element).attr('data-column', column);
    $(thisPane.children[0].element).attr('data-row', self.numRingsPlotted);
    self.scene.add(thisPane);

    var yRot = ( ( column  % self.ringCircumference) / self.ringCircumference) * Math.PI * 2;
    var yPos = -self.paneHeight * self.numRingsPlotted;
    self.applyPositioning(thisPane, self.cardRadius, yRot, yPos);
    self.panes[self.numRingsPlotted][column] = thisPane;
         
    if (isAd) {
      self.numAdsOnRing++;
      self.numAdsPlotted++;
    }else{
      self.numSearchResultsPlotted++;
      self.numResultsOnRing++;
    }
  }
  self.numResultsOnRing = 0;
  self.numAdsOnRing = 0;

  self.render();
 
  if (self.numRingsPlotted > 0){
    self.controls.setYPosBounds(null, -(self.numRingsPlotted )* self.paneHeight);
    self.tweenCameraToBottom();
    self.clearEmptyRing();
    
  }else{
    if (!this.hasSpiraledOut){
      $(".arrow-button").not("#pan-up").css({visibility: 'visible'}).fadeIn('slow'); 
    }
    self.tweenCameraSpiralOut();
  }
  self.numRingsPlotted++;

}

//creates a ring of empty panes 
NP.module.search.prototype.plotEmptyRing = function(searchData){
  var self = this;
  //search results limited to 10 rings (for performance reasons)
  
  //moves camera to next row
  
  //plot ring of search result panes
  for (var column = 0; column < this.ringCircumference ; column++) {

   
     //plots ads on first 3 columns of first row or for subsequent rows, choose if ad at random 20% of time
    // var isAd =  ( numRingsPlotted===0 && column < 3 ) || (numRingsPlotted >0 && Math.random() < 0.2) ? true : false; 
    
    var adIndex = self.numRingsPlotted % self.ringCircumference;

    //change this and you must change the corresponding isAd in plotRing
    var isAd =  (column % 9 === 0 || (column - 1 )%9 === 0  )  ? true : false; 
    
    //Add coloured search results pane
          
    
    // var paneData = (isAd) ? searchData.ads[numAdsOnRing] : searchData.results[column]; 
    var thisPane = self.createEmptyWindowPane(); 
    var yRot = ( ((column - 1) % self.ringCircumference) / self.ringCircumference) * Math.PI * 2;
    var yPos = -self.paneHeight * self.numRingsPlotted;
    self.applyPositioning(thisPane, self.cardRadius, yRot, yPos);
    thisPane.rotation.y = thisPane.rotation.y + Math.PI;
    //added to panes with non-standard indexing, just so they get cleared in clearSearchResults
    self.emptyPanes[column] = thisPane;
    self.scene.add(thisPane);            
  }
    self.render();
}

//removes the empty search cards after the initial search has been added
NP.module.search.prototype.clearEmptyRing = function(){
  for (key in this.emptyPanes){
    this.scene.remove(this.emptyPanes[key]);
  }
}

//removes all panes and spacers from screen, jumps out camera, and plots the first ring
NP.module.search.prototype.clearSearchResults = function(){
  var self = this;    
  
  //remove the initial branding, charity and hand elements and add bar
  if (!self.hasSpiraledOut){
    
    $('#search-field').fadeOut('fast', function(){
      $('#search-bar').fadeIn('fast');
      $("#logo-sm").fadeIn('fast');  
      $('#search-field').appendTo("#search-bar").css({ 'position':'static', 'margin-left': 'auto', 'margin-right':'auto'}).fadeIn('fast');
    });

    $('#logo-mid').add("#promo-msg").fadeOut('fast');
    $('#charity-hand').css('left', '-100000px');        
  }

  for (var i = 0; i < self.panes.length ; i++){
    for (var j =0; j < self.ringCircumference; j++ ){
      for (var k = 0; k < self.panes[i][j].children.length; k++){
        self.panes[i][j].remove(self.panes[i][j].children[k]);
      }
      this.scene.remove(self.panes[i][j]);
    }
    $(".box-sides").remove();
  }
  //reset search tracking variables
  this.initializeStateVariables();

  this.controls.setYPosBounds(0,0);
  this.camera.position = new THREE.Vector3(0,this.initialCameraHeight,0);
  this.camera.lookAt(new THREE.Vector3( 0, 0, 0.0001)) ;  

}




//called on new search event, clears screen and calls getNextRing
NP.module.search.prototype.newSearch = function(){
  var self = this;
  var enteredSearch = document.getElementById('search-field').value;
  $("#youtube-sample").remove();
  //ignore searchs with nothing or only whitespace
  if (enteredSearch.trim() !== "") {
    self.clearSearchResults();
    this.searchQuery = document.getElementById('search-field').value;
    this.getNextRing();
  }
}


// add events and positioning to buttons
NP.module.search.prototype.initButtons = function(){
  var self = this;

  $(document).ready(function(){
    $("#search-field").focus();
    $("#rotate-right").mousedown(function(){
      if (self.controls.isEnabled && !self.controls.isDragThrowing){
        $(window).on('mouseup.holdArrow', function(){
          self.rightRotateDown = false; 
          $(window).off('mouseup.holdArrow'); 
        } );
        self.rightRotateDown = true; 
        self.tweenCameraRotate(true);
      } 
    });

    $("#rotate-left").mousedown(function(){
      if (self.controls.isEnabled && !self.controls.isDragThrowing){
        $(window).on('mouseup.holdArrow', function(){
          self.leftRotateDown = false; 
          $(window).off('mouseup.holdArrow'); 
        } );

        self.leftRotateDown = true; 
        self.tweenCameraRotate(false);
      }
    });

    $("#pan-up").mousedown(function(){

      if (self.controls.isEnabled && !self.controls.isDragThrowing && self.controls.cameraPosition.yPos <= -0.001){
        $(window).on('mouseup.holdArrow', function(){
          self.panUpDown = false; 
          $(window).off('mouseup.holdArrow'); 
        } );
        self.panUpDown = true; 
        self.tweenCameraPan(true);
      }
    });

    $("#pan-down").mousedown(function(){
      if (self.controls.isEnabled && !self.controls.isDragThrowing){
        $(window).on('mouseup.holdArrow', function(){
          self.panDownDown = false; 
          $(window).off('mouseup.holdArrow'); 
        } );
        self.panDownDown = true; 
        self.tweenCameraPan(false);
      }
    });
    
   
    $("#search-field").on('keyup', function(e) {
        if (e.which == 13 && $("#search-field").is(":focus") && !self.disableSearch && (new Date().getTime()) - self.lastSearchEnter > 1000 ) {
            self.lastSearchEnter = new Date().getTime();
            self.disableSearch = true;
            e.preventDefault();
            self.newSearch();
        }
    })
    .focus(function(){
      $(this).val('');
    });

    var logo = $(document.createElement('img'));
    $('').hide().appendTo("#search-page-container");  

    var handTweenLength = 0.4;
    $('#charity-hand').hover(
      function(){
        TweenMax.to($(this), handTweenLength, {left:0});
        TweenMax.to($('#charity-hand #charity-text'), handTweenLength, {left:"10px", ease:Back.easeOut});
      },
      function(){
        TweenMax.to($(this), handTweenLength, {left:-self.handGap+"px"});
        TweenMax.to($('#charity-hand #charity-text'), handTweenLength, {left:"-165px"});
      }
    );
    
    $("#logo-sm").click(function(){
      self.resetSearch();
    });  
    
    self.positionButtons();
  });
  
}


//absolutely positions buttons based upon window dimensions
NP.module.search.prototype.positionButtons = function(){
  var self = this;
  //space from edge of window to arrow
  var arrowHorizSpace = 2;
    
  //space from top of screen to centered icon position
  var arrowVertSpace = 2;
  var elementCont = window;
  if (!self.hasSpiraledOut){
    $("#search-field").position({my:"center center", at:"center center", of: window});
    $("#charity-hand").position({my:"left center", at:"left-" +self.handGap+" center", of: window});
  }

  $("#rotate-left").position({my:"left center", at:"left center", of: elementCont});
  $("#rotate-right").position({my:"right center", at:"right center", of: elementCont});

  $("#pan-down").position({my:"center bottom", at:"center bottom-70", of:elementCont});
  $("#pan-up").position({my:"center top", at:"center bottom", of: "#search-bar"});
  
  
  $("#promo-msg").css({ top:window.innerHeight - $("#promo-msg").height() - 70 +"px", 'left': window.innerWidth/2 - $("#promo-msg").width()/2 +"px" });

}

NP.module.search.prototype.render = function() {
  this.renderer.render(this.scene, this.camera);
}

NP.module.search.prototype.getYRot = function(x,z) {
  return Math.atan2(x, z);
}

NP.module.search.prototype.getXZRad = function(x,z){
  return Math.sqrt(Math.pow(x, 2)+ Math.pow(z, 2));
}

NP.module.search.prototype.getColorboxSizing = function() {
  var thisAspect = window.innerWidth / (window.innerHeight-50);
  var isTall = thisAspect < (16/9);
  var thisInnerWidth = (isTall) ? window.innerWidth*this.mediaPaneSizeRatio :Math.round( (window.innerHeight-50) * this.mediaPaneSizeRatio*(16/9))  ;
  var thisInnerHeight = (isTall) ? Math.round(window.innerWidth * this.mediaPaneSizeRatio*(9/16)) :   (window.innerHeight -50)*this.mediaPaneSizeRatio ;
  return {innerWidth: thisInnerWidth+"px", innerHeight:  thisInnerHeight+"px" }
}



//recalculate camera position and navigation elements for window resizing
NP.module.search.prototype.onWindowResize = function() {
  self = this;
  var yRot = this.getYRot(this.camera.position.x, this.camera.position.z);
  console.log(this.camera.aspect);


  //this prevents the camera from going too close to the ring (making search results too zoomed in)
  var thisAspect = Math.min(this.camera.aspect, 2.9);
  if (this.hasSpiraledOut){
    this.controls.setCameraPosition(this.initialCameraRadius/thisAspect , yRot, this.camera.position.y );
    if (this.mediaPaneOut){
      
      this.applyPositioning(this.mediaFrame, this.controls.cameraPosition.xzRad-1, this.controls.cameraPosition.yRot, this.controls.cameraPosition.yPos);
      clearTimeout(this.boxResize);
      this.boxResize = setTimeout(function(){
        $.colorbox.resize(self.getColorbosSizing());
      }, 500);
    }
  }
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.positionButtons();

  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.render();

}



