/*
SEARCH RESULTS VIEW
---------------------------
Displays search results in a column consisting of rings of rectangular panes,
each pane consisting of a search result or advertisement

Function flow as follows:
init---(search entered) --->
*/

//Javascript proper negative modulo hack

NP.module.AppStore = function(accountId, height, width){

  this.accountId = accountId;
  this.height = height;
  this.width = width;
};


//returns a node dom containing the app icon, title, and details
NP.module.AppStore.prototype.createAppCard = function(id){
  var self = this;
  var appCard = document.createElement('div');
  $(appCard).css("display", "block").
  attr("id", "appCard" + ">" + id).
  // attr("href",appTable[index].url ).
  // attr("target","_blank").
  addClass('appCard').
  click(function(){
    if (new Date().getTime()- self.cardMouseDownTime < 300 ){
      return self.tweenCameraToCard(self.appTable[id].index);
    }

  }).
  on('mousedown', function(){
    self.cardMouseDownTime = new Date().getTime();
  } );

  var title = document.createElement( 'div' );
  $(title).addClass('title').
  html( this.appTable[id].title).
  appendTo( appCard) ;

  var icon = document.createElement('div');
  icon.className = 'appIcon';
  // var appLink = document.createElement('a');
  //appLink.setAttribute("href",appTable[index].url );
  //appLink.setAttribute("target","_blank");
  var appIcon = document.createElement('img');
  $(appIcon).attr("title", this.appTable[id].title)
  .attr("target","_blank").
  addClass("appIconImg").
  attr("id",this.appTable[id].id).
  attr("src", NP.config.appURL() +"/images"+this.appTable[id].image).appendTo(icon);

  icon.appendChild(appIcon);
  appCard.appendChild(icon);

  var appText = document.createElement( 'div' );
  $(appText).addClass("appText").appendTo(appCard);


  var lorenIp = 'Lorem ipsum dolor sit amet, sed ei docendi fierent lucilius, mei inani sapientem ut. Ad mel sanctus vivendum';

  var details = document.createElement( 'div' );
  $(details).addClass('details').
  html('<div class="description">' + lorenIp + '</div>').appendTo(appText);

  return appCard;
};

//creates a dom node for the app details card
NP.module.AppStore.prototype.createAppDetailsCard = function(){
  var appCard = document.createElement('div');
  $(appCard).css("display", "block").
  attr("id", "appDetailsCard").
  addClass('appDetailsCard').css('opacity', 0);
  return appCard;
};

//clear app details card and populate with info from api
NP.module.AppStore.prototype.fillAppDetailsCard = function(i){
  var self = this;
  var id = this.appOrdering[i];
  var detailQ = $(this.detailsCard.element);
  detailQ.children().remove();
  console.log("filling click for card:"+id);
  detailQ.unbind("click");
  detailQ.click(function(){
    return self.tweenDetailsCardBack(self.appTable[self.appOrdering[i]].index); 
  });

  var title = document.createElement( 'div' );
  $(title).addClass('title').
  html( this.appTable[id].title).appendTo(detailQ);

  var previewContainer = $(document.createElement('div'));
  previewContainer.addClass('appPreviewContainer').appendTo(detailQ);
  var img = $(document.createElement('img'));
  img.attr('src', 'care2.jpg').addClass('appPreview').
  appendTo(previewContainer).clone().appendTo(previewContainer);

  var addButtonContainer = $(document.createElement('div')).addClass('addDiv').appendTo(previewContainer);
  var addButton = $(document.createElement('div')).addClass('button');

  //check for login (the wrong way)
  if ($("#topBar").children("#userLink").length > 0){
    var launchClick = function(){e.stopPropagation(); alert("running app"); };
    var launchButtonContents = '<i id="addIcon" class="fa fa-check-circle-o"></i> Launch app';
    if (!this.appTable[id].subscribed){
      var buttonContents = '<i id="addIcon" class="fa fa-bookmark"></i> Add me';
      var buttonFunction = function(e){
          e.stopPropagation();
          $(e.target).html('<i id="addIcon" class="fa fa-spinner fa-spin"></i> Adding...');

          $.post('/bookmarks',{appId:id}, function(){
            self.appTable[id].subscribed = true;
            $(e.target).html(launchButtonContents);
            $(e.target).unbind('click').click( launchClick);
          });
      };
    
    }else{
      buttonContents = launchButtonContents;
      buttonFunction = launchClick;
    }
    
  
  }else{
    var buttonContents = '<i id="addIcon" class="fa fa-bookmark"></i> Sign up';
    var buttonFunction = function(e){
        e.stopPropagation();
        alert("Comming soon ...");
    };
  }

  addButton.html(buttonContents).click(buttonFunction).
  addClass('addButton').appendTo(addButtonContainer);



/*/
        $.ajax( {
          type:'POST',
          url: "/bookmarks",
          crossDomain: true,
          data:{appId:appTable[index].id},
          dataType: 'json',
          //once the bookmark is added, change the button to run the app
          success:function(e){
            $(e.target).html('<i id="addIcon" class="fa fa-check-circle-o"></i> Launch app');
            $(e.target).unbind('click').click(function(){e.stopPropagation(); alert("running app"); } );
          },
          error:function(){
            //if the request fails revert its contents
            alert("Sorry, we couldn't bookmark this app");
            $(e.target).html(buttonContents);
           }
         });
//*/

  var appText = document.createElement( 'div' );
  $(appText).addClass("appText").appendTo(detailQ);


  var lorenIp = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  var details = document.createElement( 'div' );
  $(details).addClass('details').
  html('<div class="description">' + lorenIp + '</div>').appendTo(appText);

};

//returns and angle in radians, the y rotation of a point on xz plane
NP.module.AppStore.prototype.getYRot = function(x,z) {
  if (x === 0 ) {
    if (z > 0){return 0;
    }else{return Math.PI;}
  }
  return Math.atan2(x, z);
};

//returns the distance(radius) of a point on the xz plane to the center
NP.module.AppStore.prototype.getXZRad = function(x,z){
  return Math.sqrt(Math.pow(x, 2)+ Math.pow(z, 2));
};

//returns a vector given radial co-ordiantes on xz plane and y position
NP.module.AppStore.prototype.getRadialPlot = function(xzRad, yRot, yPos){
  var vector = new THREE.Vector3();
  vector.x = Math.sin(yRot)*xzRad;
  vector.z = Math.cos(yRot)*xzRad;
  vector.y = yPos;
  return vector;
};

//position object with given co-ordiantes as specified in getRadialPlot
NP.module.AppStore.prototype.applyPositioning = function(object,xzRad, yRot, yPos, isFacingInward ){
  var flipOption =  (isFacingInward) ? Math.PI : 0;
  object.rotation.fromArray([0, yRot + flipOption , 0]);
  object.position = this.getRadialPlot(xzRad, yRot, yPos);
};

//gets position of app card at index,
// calculates position if not stored in table, or simply returns it if it is (as is the case with getYRotAt and getZXRadAt)
NP.module.AppStore.prototype.getHelixPosition = function(index){
    var position = new THREE.Vector3();

    if (!this.appTable[this.appOrdering[index]].position){
      var phi = index * 0.27 + Math.PI;
      magicNumber = 2000;

      position.x = magicNumber * Math.sin(phi);
      position.y = (-( index * 15 ) + magicNumber/2) - 300;
      position.z = magicNumber * Math.cos(phi);
      this.appTable[this.appOrdering[index]].position = position;

    }
    return this.appTable[this.appOrdering[index]].position;
};



//obtains the y rotation of an app card at the given index
NP.module.AppStore.prototype.getYRotAt = function(index){
    if (!this.appTable[this.appOrdering[index]].yRot){
      this.appTable[this.appOrdering[index]].yRot = this.getYRot(this.appTable[this.appOrdering[index]].position.x , this.appTable[this.appOrdering[index]].position.z);
    }
    return this.appTable[this.appOrdering[index]].yRot;
};

//obtains the distance from the y-axis of an app card at the given index
NP.module.AppStore.prototype.getXZRadAt = function(index){
    if (!this.appTable[this.appOrdering[index]].xzRad){
      this.appTable[this.appOrdering[index]].xzRad = this.getXZRad(this.appTable[this.appOrdering[index]].position.x , this.appTable[this.appOrdering[index]].position.z);
    }
    return this.appTable[this.appOrdering[index]].xzRad;
};

//zooms camera into a given card and calls tweenDetailsCardForward upon completion
NP.module.AppStore.prototype.tweenCameraToCard = function(index){
  var self = this;
  if (!this.cardsTweening){
    this.cardsTweening = true; 
    var targetPos = this.getHelixPosition(index);
    console.log('index:'+index);
    console.log('camera:' + this.camera.position.toArray() );
    console.log('target:' + targetPos.toArray() );
    var length = 500;
    var currentXZrad = this.getXZRad(this.camera.position.x, this.camera.position.z);
    var currentYrot = this.getYRot(this.camera.position.x, this.camera.position.z);
    var targetYrot =  this.getYRotAt(index);
    console.log('currentY:'+currentYrot/(Math.PI*2) + ' targetY' + targetYrot/(Math.PI*2) );
    var targetXZrad = 2500;
    var currentVars = {yRot: currentYrot, xzRad:currentXZrad, y: this.camera.position.y};
    var targetVars = {yRot: targetYrot, xzRad:targetXZrad, y: targetPos.y};
   
    this.controls.disable();

    var tweenFunctions = {
      onStart: function(){
        // render();
      },
      onUpdate: function () {
          console.log("whaaaat");
          self.controls.setCameraPosition(currentVars.xzRad, currentVars.yRot, currentVars.y );
         
      },
      onComplete:function(){
        self.tweenDetailsCardForward(index);
      }
    };

    tweenIn = TweenMax.to(currentVars, 1, $.extend(targetVars, tweenFunctions ) );
  }  

};
// positions details card, populates it with data, and then tweens it and corresponding app card
NP.module.AppStore.prototype.tweenDetailsCardForward = function(index){
    var self = this;
    var cardPos = this.getHelixPosition(index);
    var cardPosXZrad = this.getXZRadAt(index);
    var cardPosYRot =  this.getYRotAt(index) ;
    console.log("index:"+index);
    var length = 0.5;

    var currentXZrad = cardPosXZrad - this.detailsBehindSpacing  ;
    var targetXZrad = cardPosXZrad + this.detailsBehindSpacing ;
    var currentYrot = 0 ;
    var targetYrot = Math.PI;

    var currentVars = {yRot: currentYrot, xzRad:currentXZrad, cardPosYRot: cardPosYRot, cardPosYVal : cardPos.y  };
    var targetVars = {yRot: targetYrot, xzRad:targetXZrad};
    console.log("yRot"+this.getYRot(this.camera.position.x, this.camera.position.z) );
    
    this.fillAppDetailsCard(index);
    this.applyPositioning( this.detailsCard, currentXZrad,  cardPosYRot , cardPos.y , true );
   
      
     var tweenFunctions = {
      
      onUpdate: function () {
        self.objects[index].rotation.y = currentVars.cardPosYRot - currentVars.yRot; 
        self.detailsCard.rotation.y = currentVars.cardPosYRot + Math.PI - currentVars.yRot;
        var thisPos = self.getRadialPlot(currentVars.xzRad, currentVars.cardPosYRot, currentVars.cardPosYVal).clone();
        self.detailsCard.position.fromArray(thisPos.toArray());
        self.render();
        
      },
      onComplete:function () {
        if (this.progress() == 1){
          self.cardsTweening = false;
        }
      }, 
      onReverseComplete:function () {
        var camPos = {xzRad: self.controls.cameraPosition.xzRad, yRot: self.controls.cameraPosition.yRot, yPos: self.controls.cameraPosition.yPos};
        TweenMax.to(camPos, 1, {xzRad:3000, 
          onUpdate:function(){
            self.controls.setCameraPosition(camPos.xzRad, camPos.yRot, camPos.yPos);
            // controls.cameraPositionUpdate();
            self.render();
          }, onComplete:function(){
            self.controls.enable();
            self.cardsTweening = false;
          }
        });
         
      },
    };
    var opacityStartRatio = 0.5;
    this.tweenDetails = new TimelineMax();
    this.tweenDetails.to(currentVars, length, $.extend(targetVars, tweenFunctions ) );
    this.tweenDetails.to(this.detailsCard.element, length*opacityStartRatio, {opacity:1  }, 0 );
  
};

// moves details card back and hides it
NP.module.AppStore.prototype.tweenDetailsCardBack = function(index){
    cardsTweening = true;
    var cardPos = this.getHelixPosition(index);
    var cardPosXZrad = this.getXZRadAt(index);
    var cardPosYRot =  this.getYRotAt(index) ;
    console.log("index:"+index);
    var length = 500;

    var currentXZrad = cardPosXZrad + this.detailsBehindSpacing ;
    var targetXZrad = cardPosXZrad - this.detailsBehindSpacing  ;
    var currentYrot = Math.PI;
    var targetYrot = 0 ;

    var currentVars = {yRot: currentYrot, xzRad:currentXZrad };
    var targetVars = {yRot: targetYrot, xzRad:targetXZrad};
    console.log("yRot"+this.getYRot(this.camera.position.x, this.camera.position.z) );
    this.tweenDetails.reverse();
  
};

NP.module.AppStore.prototype.clearScreen = function(){
  $("#container").children(":first").children(":first").remove();
};

NP.module.AppStore.prototype.init = function() {
  var self = this;
  // var appTable;
  this.appOrdering = [];
  this.targets = { helix: [], helixOrder:[], table: [] };
  this.detailsCard = new THREE.CSS3DObject(this.createAppDetailsCard());
  this.cardsTweening = false;
  // var cardMouseDownTime;
  this.detailsBehindSpacing = 260;
  // var tweenDetails;
  var sc = 0.7;
  this.detailsCard.scale.fromArray([sc,sc,sc]);
  this.testMode = false;

  // SET UP ENVIRONMENT
  this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
  this.scene = new THREE.Scene();
  this.objects = [];
  this.objects.length = 0;

  this.renderer = new THREE.CSS3DRenderer();
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.domElement.style.position = 'absolute';
  document.getElementById('container').appendChild(this.renderer.domElement);

  this.controls = new THREE.HelixControls(this.camera, this.renderer.domElement, self);
  this.controls.setYPosBounds(10000000000000,-10000000000000000000000);

  this.camera.position.x = 0;
  this.camera.position.y = 0;
  this.camera.position.z = 3000;
  
  // controls.addEventListener('change', render);
 window.addEventListener('resize', function(){ 
    return self.onWindowResize();
  }, false);

  this.scene.add(this.detailsCard);

  var i = 0;

  // PLOTS RANDOM POSITIONS , ADDS CARDS --------------------------------------------------------------------
  for (var id in this.appTable) {
      //object displays HTML data directly
    this.appOrdering[i] = id;
    this.appTable[id].index = i;
    var object = new THREE.CSS3DObject(this.createAppCard(id));
    // var object = new THREE.Object3D();
      object.position = this.getHelixPosition(i).clone();
      object.rotation.y = this.getYRotAt(i);


    // //initially place cards in random positions
    // var offscreenDisplace = 12000;
    // var sideSign = (i%2==0) ? -1 : 1;
    // object.position.x = Math.random() * 4000 - 2000 + offscreenDisplace*sideSign;
    // object.position.y = Math.random() * 4000 - 2000;
    // object.position.z = Math.random() * 4000 - 2000;

    this.scene.add(object);
    this.objects.push(object);
    i++;

  }


  this.fillAppDetailsCard(0);

  // //PLOTS HELIX POSITIONS
  // for (var i = 0, l = objects.length; i < l; i++) {
  //   // var object = new THREE.Object3D();
  //   var object = new THREE.CSS3DObject(this.createAppCard(id));

  //   object.position = this.getHelixPosition(i).clone();
  //   object.rotation.y = this.getYRotAt(i);

  //   this.targets.helix.push(object);

  //   //j is a sequence such that for a series i : 0 to 9, ordering for j is 0,9,1,8,2,7,3,6...
  //   // this ordering is store for transform call
  //   var j = (i%2==0) ? Math.floor(i/2) : l-Math.ceil(i/2.0);
  //   this.targets.helixOrder.push(j);
  // }

  // TweenMax.ticker.addEventListener("tick", this.render);
  
  // setTimeout(function(){this.controls.rotateTween.play();}, 600);

  //    $( document ).ready(function() {
  //       // console.log("ordering:"+targets.helixOrder);
  //       this.transform(this.targets.helix, this.targets.helixOrder, 300);
  //     });
   

  //  // this works, but first click on card without moving camera doesn't ?
  //  // likely evidence of event handling issues
  //  // setTimeout(function(){ tweenCameraToCard(18);}, 10000);
  this.render();
  this.controls.yRotSpeed = 1.45;

};


//tweens objects to a set of targets in an order specified by array order
NP.module.AppStore.prototype.transform = function(targets, order, duration) {
  var delayGap = 0.05;
  
  var recursiveTween =  function localRecursiveTween(i) {
    if (i<this.targets.length){
      

      var object = this.objects[order[i]];
      var target = this.targets[order[i]];

      if (testMode){
        object.position = target.position;
        object.rotation = target.rotation;
        this.render();
      }else{

        TweenMax.to(object.position, duration/1000, { x: target.position.x, y: target.position.y, z: target.position.z, delay:delayGap*i, onUpdate:self.render });
        TweenMax.to(object.rotation, duration/1000, { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z, delay:delayGap*i, onUpdate:self.render });

      }

      localRecursiveTween(i+1);

    }
  };
  recursiveTween(0);
 
};

NP.module.AppStore.prototype.getCameraDistance = function (){
  return this.camera.position.length();
};



NP.module.AppStore.prototype.onWindowResize = function() {

  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize(window.innerWidth, window.innerHeight);

  this.render();

};



NP.module.AppStore.prototype.render = function() {

  this.renderer.render(this.scene, this.camera);

};

NP.module.AppStore.prototype.drawHelix = function(url) {
  var self = this;
  console.log("drawing Helix");
  
  $.get(url, function (res) {
    self.appTable = res;
    self.init();
   
  });
};