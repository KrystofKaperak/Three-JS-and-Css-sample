/*
CHARITY PICKER MODULE
---------------------------
Displays candidate charities in a spiral and enables user to vote for their favourite causes to which proceeds of advertising will go
*/
NP.module.CharityPicker = function(accountId, height, width){
  this.accountId = accountId;
  this.height = height;
  this.width = width;
};

/* Set up three.js environment and sets global constants */
NP.module.CharityPicker.prototype.init = function() {
  var self = this;
  this.fastMode = false;
  this.targets = { helix: [], helixOrder:[], table: [] };
  this.detailsCard = new THREE.CSS3DObject(this.createAppDetailsCard());
  this.cardsTweening = false;
  //distance towards center to move details card in its starting position (before tweening out)
  this.detailsBehindSpacing = 260;
  //precentage of distance between center and camera position to place details card  (this enables the card to ocupy a relatively constant width of screen )
  self.detailsTowardsCameraRatio = 0.6;
  //stores ids of the charities chosen in "Sponsored" menu
  this.charityChoices = [false, false, false];
  var sc = 0.7;
  // details card's element px width and height are fixed but we can proportion this way
  this.detailsCard.scale.fromArray([sc,sc,sc]);
  //indicated whether or not a charity details card is displayed
  this.detailsCardOut = false;
  
  // indicated whether or not the Sponsored menu is out
  this.sponsoredIsOut = false;
  //indicated whether or not the Categories menu is out
  this.categoryPickerIsOut = false;
  
  //this value divided by the camera aspect gives the true camera radius (delivered by cameraRadius() )
  this.cameraRadiusRel = 4200;
  
  //for helix position spacing
  this.cardRadius = 900;
  this.cardsPerRot = 17.1;
  this.cardsYIncrement = 40;
  this.cameraOffset = 0;

  // length of the tweens for Sponsored and Categories in/out  
  this.togglePickerTime = 0.6;
  
  // an invisible div that sits just behind details card to capture click in order to trigger details card moving back
  var clickCapDiv = document.createElement('div');
  $(clickCapDiv).attr('id', 'click-capturer');
  this.clickCapturer = new THREE.CSS3DObject(clickCapDiv);

  // THREE.JS ENVIRONMENT SET-UP
  this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
  this.scene = new THREE.Scene();

  this.scene.add(this.clickCapturer);  

  this.renderer = new THREE.CSS3DRenderer();
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.domElement.style.position = 'absolute';
  $(this.renderer.domElement).attr('id', 'renderer');
  document.getElementById('charity-container').appendChild(this.renderer.domElement);
  

  this.controls = new THREE.HelixSpiralControls(this.camera, this.renderer.domElement, self);
  this.controls.yRotSpeed = 1.45;
  this.controls.setCameraPosition(this.cameraRadius(), 0, self.cameraOffset);

  // jquery handlebars template renderer settings 
  $.handlebars({
    templatePath: '/templates',
    templateExtension: 'html'
  }); 
  
 
  $(window).resize( function(){ 
    return self.onWindowResize();
  });

  $(self.renderer.domElement).on('mousedown', function(){
    if(self.sponsoredIsOut){
      self.togglePicker();
    }
    if(self.categoryPickerIsOut){
      self.toggleCategoryPicker();
    }

  });

  this.attachPickerEvents();
  this.plotCategoryMenu();  
  this.onWindowResize();
  this.newCategory("28");
    
};

/* Returns camera radius based upon the aspect of users screen.  Enables the helix width to remain a constant percentage of the screen width.  Significantly high camera aspect would send camera into the middle of the helix so a minimum is used to maintain a significant distance from the helix. */
NP.module.CharityPicker.prototype.cameraRadius = function(){
  return this.cameraRadiusRel/Math.min(this.camera.aspect, 2.0);
}


/** Returns a Object3D group of CSS3DObjects containing a front face with the logo and charity name and a semi-transparent card backing */
NP.module.CharityPicker.prototype.createPreviewCard = function(id){
  var self = this;
  //contains front and back objects
  var pane = new THREE.Object3D();
  var previewCard = document.createElement('div');
  $(previewCard).attr("id", "previewCard" + id).css({"display": "block"})
  //for prevening clicks on long holds 
  .on('mousedown', function(){
    self.cardMouseDownTime = new Date().getTime();
  } )
  //moves camera to card on click
  .click( function(){ 
    if (new Date().getTime()- self.cardMouseDownTime < 300 ){
      var thisID =  $(this).attr('id').replace('previewCard', '') ;
      var thisIndex = self.charityTable.items[thisID].index;
      return self.tweenCameraToCard(thisIndex);
    }else {return null;}
  })
  //uses handlebars jquery plugin to render content from /templates/charityPreview.html
  .render('charityPreview', this.charityTable.items[id]);
  
  //logo image needs to be preloaded (rather than rendered in template) so that its height and width properties can be acquired for positioning
  var img = new Image();
  $(img).addClass('charity-logo').attr('src', this.charityTable.items[id].logoFileName);

  
  var imgLoad = imagesLoaded(img);
  imgLoad.on( 'done', function( instance) {
    // natural sizing jquery plugin located in /utils/utils.js, see http://www.jacklmoore.com/notes/naturalwidth-and-naturalheight-in-ie/
    // if image aspect is taller than usable area, fit to height, otherwise fit to width 
    var sizing = ($(img).naturalWidth()/$(img).naturalHeight() > 384/213   ) ? {'width' : '100%', 'height':'auto'} : {'width' : 'auto', 'height':'100%'} ;
    $(img).css(sizing);
    $(previewCard).find(".logo-container").append(img);    
  });
  imgLoad.on('error', function(instance){
    $(img).remove();
    //appends an image indicating a broken link
    $(previewCard).find(".logo-container").append($('<img src="/images/broken.png" class="search-pane-img">'));
  });
  var front = new THREE.CSS3DObject(previewCard);

  // semi-transparent blue backing to card  
  var backDiv = document.createElement('div');
  $(backDiv).attr('id',"previewCardBack"+ id)
  // for gradient styles and preventing the back from being seen from the front
  .addClass('charity-preview-backing no-backface');  
  var back = new THREE.CSS3DObject(backDiv);
  
  //just behind front
  back.position.fromArray([ 0, 0, -1]);
  //turned away from front
  back.rotation.fromArray([ 0, Math.PI, 0 ]);
  pane.add(front);
  pane.add(back);

  return pane;
};

/** Creates a dom node for the app details card (without image and text) */
NP.module.CharityPicker.prototype.createAppDetailsCard = function(){
  var appCard = document.createElement('div');
  $(appCard).css("display", "block").
  attr("id", "detailsCard").css('opacity', 0).click(function(e){e.stopPropagation();});
  return appCard;
};

/** clear app details card and populate with info from api */
NP.module.CharityPicker.prototype.fillAppDetailsCard = function(i){
  var self = this;
  var id = this.charityTable.ordering[i];
  var details$ = $(this.detailsCard.element);
  details$.children().remove();
  details$.data('target-id', id );
  
  details$.render('charityDetails', this.charityTable.items[id])
  .addClass('no-backface')
  // scaling is require to ensure the card is properly aliased
  .find('.charity-details').css("transform","scale(3)");

  var img = new Image();
  $(img).addClass('charity-logo').load(function () {
      // natural sizing jquery plugin located in /utils/utils.js, see http://www.jacklmoore.com/notes/naturalwidth-and-naturalheight-in-ie/
      // if image aspect is taller than usable area, fit to height, otherwise fit to width 
      var sizing = ($(this).naturalWidth()/$(this).naturalHeight() > 1 ) ? {'width' : '100%', 'height':'auto'} : {'width' : 'auto', 'height':'100%'} ;
      $(this).css(sizing);
      details$.find(".logo-container").append(this);
   }).error(function () {
      $(this).remove();
      $(previewCard).find(".logo-container").append($('<img src="/images/broken.png" class="search-pane-img">'));
  }).attr('src', this.charityTable.items[id].logoFileName); 

  // "Website" button
  details$.find('.website').click(function(e){
    e.stopPropagation();
  });

  // "Sponsor us" button
  details$.find('.add-charity').click(function(e){
    e.stopPropagation();
   // $.ajax ( {
   //  type:'POST',
   //  url: '/api/v1/charity/'+id,
   //  success:function(data){
      self.populateCharityChoice(id);
   //  },
   //  error:function(){
   //    alert("Sorry, your request could not be processed.");      
   //  }
   // });
  });
};

/** Upon user choosing charity, tweens details card back and sets the target position for the card to fly off to  */
NP.module.CharityPicker.prototype.populateCharityChoice = function(id){
  var self = this;
  var pos = self.getEmptyChoicePos();
  if (pos !== false){
    self.cardNeedsAdding = id;
    self.addingCardToChoice = pos;
    var thisCardPos = this.detailsCard.position.clone();
    // self.flyoffPosition = this.detailsCard.position.clone().add( thisCardPos.clone().applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2));
    self.flyoffPosition = self.getTangentPoint(this.detailsCard.position, 1, Math.PI/2, 1);
    this.tweenDetails.reverse();
  }else{
    alert("Sorry, no more choices.  Please remove one of your choices if you wish to sponsor this charity.");
  }
}

/** Takes a card from the end of the spiral and places it in the empty position where chosen card used to be */
NP.module.CharityPicker.prototype.fillEmptyCardSpace = function(){
  var self = this;
  var removedID = self.cardNeedsAdding;

  //only fill empty space if the removed card was not the last card
  if (self.charityTable.items[removedID].index !== self.charityTable.ordering.length-1 )  {
    var emptyIndex = self.charityTable.items[removedID].index;
    var emptyPos = self.getHelixPosition(emptyIndex).clone();
    emptyPos.xzRad = self.getXZRadAt(emptyIndex);
    emptyPos.yRot = self.getYRotAt(emptyIndex);

    var lastIndex = self.charityTable.ordering.length -1 ;

    var lastPos = self.getHelixPosition(lastIndex).clone();
    lastPos.xzRad = self.getXZRadAt(lastIndex);
    lastPos.rotation = self.getYRotAt(lastIndex);
    lastPos.arcTheta = 0;

    // important to remove last entry (rather than setting to null) because ordering is how we keep track of how many cards are in helix
    var lastID = self.charityTable.ordering.pop();
    self.charityTable.items[lastID].position  =  self.getHelixPosition(emptyIndex);
    self.charityTable.items[lastID].xzRad  =  self.getXZRadAt(emptyIndex);
    self.charityTable.items[lastID].yRot  =  self.getYRotAt(emptyIndex);
    self.charityTable.items[lastID].index  =  emptyIndex;
    self.charityTable.ordering[ emptyIndex ]  = lastID ;


    //move last card into position of empty card
    var thisObject = self.charityTable.items[lastID].object;
    TweenMax.to(lastPos, 0.6, {directionalRotation:{rotation: (emptyPos.yRot).toFixed(5) + "_ccw", useRadians:true}, y: emptyPos.y , arcTheta: Math.PI, 
      onUpdate:function(){
        self.applyPositioning(thisObject, lastPos.xzRad + Math.sin(lastPos.arcTheta)*lastPos.xzRad*0.5, lastPos.rotation, lastPos.y );
        thisObject.rotation.y += lastPos.arcTheta*6;
        self.render();  
      }
    });

  // this case doesnt happen often because more cards always come in when end of the line is reached, but it can happen when a user clicks on the last card off to the side
  }else{self.charityTable.ordering.pop();}

  // indicate card is added to its position
  self.addingCardToChoice = false;
  self.cardNeedsAdding = false;        

  // show choices after empty position replaced (if necessary)
  if (!self.sponsoredIsOut) {
    self.togglePicker();
    //put the menu back in after 2 seconds of viewing (if not done already)
    setTimeout(function(){
      if(self.sponsoredIsOut){
        self.togglePicker();
      }
    }, 2000);
  }
  
  //move end bounds of controller back one position  
  self.controls.setIndexBounds(0, self.charityTable.ordering.length -1);
  // any item in the Sponsored menu will have undefined positioning properties 
  self.charityTable.items[removedID].position = undefined;
  self.charityTable.items[removedID].xzRad = undefined;
  self.charityTable.items[removedID].yRot = undefined;
  self.charityTable.items[removedID].index = undefined;   
}

/** returns and angle in radians, the y rotation of a point on xz plane */
NP.module.CharityPicker.prototype.getYRot = function(x,z) {
  if (x === 0 ) {
    if (z > 0){return 0;
    }else{return Math.PI;}
  }
  return Math.atan2(x, z);
};

/** returns the distance(radius) of a point on the xz plane to the center */
NP.module.CharityPicker.prototype.getXZRad = function(x,z){
  return Math.sqrt(Math.pow(x, 2)+ Math.pow(z, 2));
};

/** returns a vector given radial co-ordiantes on xz plane and y position */
NP.module.CharityPicker.prototype.getRadialPlot = function(xzRad, yRot, yPos){
  var vector = new THREE.Vector3();
  vector.x = Math.sin(yRot)*xzRad;
  vector.z = Math.cos(yRot)*xzRad;
  vector.y = yPos;
  return vector;
};

/** position object with given co-ordiantes as specified in getRadialPlot */
NP.module.CharityPicker.prototype.applyPositioning = function(object,xzRad, yRot, yPos, isFacingInward ){
  var flipOption =  (isFacingInward) ? Math.PI : 0;
  object.rotation.fromArray([0, yRot + flipOption , 0]);
  object.position = this.getRadialPlot(xzRad, yRot, yPos);
};

/** Returns an object with the parameters used to define a point in terms of 
xzRad: the (closest) distance from the point to the y-axis
yRot: the angle of the point on the y-axis
yPos: the y position of the point   
*/
NP.module.CharityPicker.prototype.radialHelixPosition = function(index){
  return {xzRad:this.cardRadius, yRot: index * (1/this.cardsPerRot)*1.3 * Math.PI*2, yPos: -index * this.cardsYIncrement };
} 


/**  returns Vector3 position of card at index 
calculates position if not stored in table, or simply returns it if it is (as is the case with getYRotAt and getZXRadAt) */
NP.module.CharityPicker.prototype.getHelixPosition = function(index){ 
    var radPlot = this.radialHelixPosition(index);
    var position = this.getRadialPlot(radPlot.xzRad, radPlot.yRot, radPlot.yPos).clone();
    
    //if the helix does not have an item in this position or it is a non-integer, do not store calculated value, just return it
    if (typeof(this.charityTable.byIndex(index)) == 'undefined'  || index%1 !== 0 ){
      return position;
    }else{
      //if value hasn't been stored, do so
      if (typeof(this.charityTable.byIndex(index).position) == 'undefined'){
        this.charityTable.byIndex(index).position = position;
      }
      return this.charityTable.byIndex(index).position;
    }
};


/* obtains the y rotation of an app card at the given index ( a "memoized" function) */
NP.module.CharityPicker.prototype.getYRotAt = function(index){
    if (!this.charityTable.byIndex(index).yRot){
      this.charityTable.byIndex(index).yRot = this.getYRot(this.charityTable.byIndex(index).position.x , this.charityTable.byIndex(index).position.z);
    }
    return this.charityTable.byIndex(index).yRot;
};

/** obtains the distance from the y-axis of an app card at the given index ( a "memoized" function) */
NP.module.CharityPicker.prototype.getXZRadAt = function(index){
    if (!this.charityTable.byIndex(index).xzRad){
      this.charityTable.byIndex(index).xzRad = this.getXZRad(this.charityTable.byIndex(index).position.x , this.charityTable.byIndex(index).position.z);
    }
    return this.charityTable.byIndex(index).xzRad;
};

/* zooms camera into a given card and calls tweenDetailsCardForward upon completion */
NP.module.CharityPicker.prototype.tweenCameraToCard = function(index){
  var self = this;
  if (!this.cardsTweening){
    this.controls.disable();
    this.cardsTweening = true; 
          
    var currentVars = {xzRad: self.controls.cameraPosition.xzRad, rotation: this.controls.cameraPosition.yRot, yPos: this.controls.cameraPosition.yPos };
    var targetVars = {xzRad:this.cameraRadius(), directionalRotation:{rotation: (this.getYRotAt(index)).toFixed(5) + "_short", useRadians:true}, yPos: this.getHelixPosition(index).y};
    
    // calculated the shortest angular distance between 2 angles
    function smallestDifference(a1, a2){
      return  Math.abs(Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1)) );
    }

    // calculates the amout of time the tween should take based upon how far away the clicked card is from the camera (so we maintain a somewhat similar speed in each tween)
    var pxPerSecond = 1300;
    var tweenLength = (Math.abs(smallestDifference(currentVars.rotation, this.getYRotAt(index)) )*this.cameraRadius() + Math.abs(targetVars.yPos - currentVars.yPos))/pxPerSecond;
    
    var tweenFunctions = {
      onUpdate: function () {
          self.controls.setCameraPosition(currentVars.xzRad, currentVars.rotation, currentVars.yPos );         
      },
      onComplete:function(){
        self.tweenDetailsCardForward(index);
      }
    };

    TweenMax.to(currentVars, tweenLength, $.extend(targetVars, tweenFunctions ) );
  }
};

/* positions details card, populates it with data, and then tweens it and corresponding app card */
NP.module.CharityPicker.prototype.tweenDetailsCardForward = function(index){
    var self = this;
            
    var length = 0.5;    
    var currentVars = {yRot: 0, xzRadDetails:this.getXZRadAt(index) - this.detailsBehindSpacing , xzRadPreview:self.cardRadius, cardPosYRot: this.getYRotAt(index), cardPosYVal : this.getHelixPosition(index).y  };
    var targetVars = {yRot: Math.PI, xzRadDetails:self.cameraRadius()*self.detailsTowardsCameraRatio , xzRadPreview: 0.5*self.cardRadius};
    console.log("yRot"+this.getYRot(this.camera.position.x, this.camera.position.z) );
    
    this.fillAppDetailsCard(index);
    this.applyPositioning( this.detailsCard, currentVars.xzRadDetails,  currentVars.cardPosYRot , currentVars.cardPosYVal , true );
   
    $("#previewCardBack"+self.charityTable.ordering[index]).hide();
      
     var tweenFunctions = {
      onStart: function(){
        self.detailsCardOut = true;
        self.controls.disable();
        self.scene.add(self.detailsCard);
      },
      
      onUpdate: function () {
        var previewCard = self.charityTable.byIndex(index).object;
        previewCard.rotation.y = currentVars.cardPosYRot - currentVars.yRot; 
        previewCard.rotation.z = -currentVars.yRot; 
        previewCard.position = self.getRadialPlot(currentVars.xzRadPreview, currentVars.cardPosYRot, currentVars.cardPosYVal).clone();

        self.detailsCard.rotation.y = currentVars.cardPosYRot + Math.PI - currentVars.yRot;
        self.detailsCard.rotation.z =  Math.PI - currentVars.yRot;
        self.detailsCard.position = self.getRadialPlot(currentVars.xzRadDetails, currentVars.cardPosYRot, currentVars.cardPosYVal).clone();
        self.render();
        
      },
      onComplete:function () {
        if (this.progress() == 1){
          self.cardsTweening = false;
          // self.scene.add(self.clickCapturer);
          self.clickCapturer.position = self.getRadialPlot(currentVars.xzRadDetails - 5, currentVars.cardPosYRot, currentVars.cardPosYVal).clone();
          self.clickCapturer.rotation.y = currentVars.cardPosYRot;
          self.render();
                             
          $("#click-capturer").show().on("click.clickCapture", function(){
            if (index !== false){
              $("#click-capturer").hide().off("click.clickCapture");
              self.tweenDetails.reverse(); 
            }
          });
        }
      }, 
      onReverseComplete:function () {
        self.detailsCardOut = false;
        self.scene.remove(self.detailsCard);
        $("#detailsCard").remove();
           
        // self.scene.remove(self.clickCapturer);
              
        $("#previewCardBack"+self.charityTable.ordering[index]).show();

        var camPos = {xzRad: self.controls.cameraPosition.xzRad, yRot: self.controls.cameraPosition.yRot, yPos: self.controls.cameraPosition.yPos};
        
        self.controls.positionAt(index);
        self.controls.enable();
        self.cardsTweening = false;
        // for case where "Sponsor us" was clicked
        if (self.cardNeedsAdding){
          thisCardPos = self.charityTable.items[self.cardNeedsAdding].position.clone();
          thisCardPos.rotDelta = 0;
          thisCardPos.yRot = self.charityTable.items[self.cardNeedsAdding].yRot;
          var thisCard = self.charityTable.items[self.cardNeedsAdding].object;
          
          // Tweens Card off screen
          TweenMax.to(thisCardPos, 0.5, {x:self.flyoffPosition.x, z:self.flyoffPosition.z, rotDelta:10*Math.PI,
              onUpdate: function() {
                thisCard.position = thisCardPos.clone();
                thisCard.rotation.y = thisCardPos.yRot + thisCardPos.rotDelta;
                self.render();
              }, 
              onComplete:function(){
                // stores id of added card in choices array 
                self.charityChoices[self.addingCardToChoice] = self.cardNeedsAdding;
                //moves the front of the card from the preview card object to the Sponsored menu
                $("#previewCard"  + self.cardNeedsAdding + " .charity-preview").appendTo("#choice" +  self.addingCardToChoice + " .image-container");
                //shows the X mark again for removal
                $("#choice" +  self.addingCardToChoice + " .fa").show();                    
                // hides the back of the preview card we just took the front off of
                $("#previewCardBack" + self.cardNeedsAdding).hide();

                //will resize the Sponsored menu to the proper size
                self.onWindowResize();
                self.controls.enable();
                //pull menu out to show choice
                self.togglePicker();                    
                //when the menu is out, take the last card and put it in the empty spot
                setTimeout(function(){self.fillEmptyCardSpace();}, self.togglePickerTime*1000);
                
                //put the Sponsored menu back in 2 seconds after it went out
                setTimeout(function(){
                  if (self.sponsoredIsOut){
                    self.togglePicker();
                  }
                }, self.togglePickerTime*1000 + 2000 );                
              }
          });
        }
      },
    };
    var opacityStartRatio = 0.5;
    // tween stored globally so that click on clickCapturer can trigger its reversal
    this.tweenDetails = new TimelineMax();
    this.tweenDetails.to(currentVars, length, $.extend(targetVars, tweenFunctions ) );
    this.tweenDetails.to(this.detailsCard.element, length*opacityStartRatio, {opacity:1  }, 0 );  
};



/** constructs html for category selector from api and attaches corresponding event handler for each item */
NP.module.CharityPicker.prototype.plotCategoryMenu = function() {
  var self = this;
  //acquire the list of categories from the api
  $.ajax( {
    type:'GET',
    url: "http://cobra5d.com/api/v1/charity",
    crossDomain: true,
    success:function(data){
      //construct a button for each category
      for (var i = 0 ; i < data.categories.length; i++){
        var thisCatDiv = document.createElement('div');
        var thisCatID = data.categories[i].categoryId;
        $(thisCatDiv).addClass('category-title').html(data.categories[i].category)
        .click(
          (function(cat) { 
            return function() { 
              //put the menu back 0.5s after clicking on a category
              setTimeout(function(){self.toggleCategoryPicker();}, 500);
              self.clearHelix();
              self.controls.setCameraPosition(self.cameraRadius(),0,0);
              self.newCategory(cat);
            } 
          })(thisCatID) 
        ).appendTo("#category-selector");
      }           
    },
    error:function(){
       console.log("Can't get categories");      
    }   
   });
  
  this.render();
}



/** tweens objects to a set of targets in an order specified by array order */
NP.module.CharityPicker.prototype.transformCards = function(startIndex) {
  var self = this;
  var delayGap = 0.08;
  var order = [];
  var duration = 0.7;
  var numCards = this.charityTable.ordering.length;
  var totalLength = duration*numCards + (delayGap-duration)*(numCards-1);
  console.log("Total time:" + totalLength);

  var charityTableLength = this.charityTable.ordering.length;
  this.controls.setIndexBounds(0, charityTableLength-1);
  this.controls.disable();

  if (!this.fastMode && this.page === 1) {
   self.cameraThroughTunnel(totalLength);
  }else{
    this.controls.enable();
  }
  
  for (var i = startIndex ; i < numCards; i++) {
       //order is a sequence such that for a series i : 0 to 9, corresponding indices  are 0,9,1,8,2,7,3,6...
       //used for drawing helix from both ends by appending cards in this order
      var j = (i%2==0) ? Math.floor(i/2) : numCards-Math.ceil(i/2.0);
      order[i] = j;
  }

  
  var thisEase =  Expo.easeOut;
  var recursiveTween =  function localRecursiveTween(i) {
    if (i<numCards){
      var target = new THREE.Object3D();
      target.position = self.charityTable.byIndex(i).position.clone();
      target.rotation.y = self.charityTable.byIndex(i).yRot; 
      var thisObject = self.charityTable.byIndex(i).object;
      //determines wether card comes from right or left side, alternating
      var sign = (i%2 == 0) ? -1 : 1;
      thisObject.position = self.getTangentPoint(self.camera.position, 1, sign*Math.PI*2, 1.5);
      thisObject.position.y += 2000;

      self.scene.add(thisObject);
      if (!self.fastMode){
        TweenMax.to(thisObject.position, duration, { x: target.position.x, y: target.position.y, z: target.position.z, ease: thisEase, delay:delayGap*i, onUpdate:function(){self.render();}});
        TweenMax.to(thisObject.rotation, duration, { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z, ease: thisEase, delay:delayGap*i });
      }else{
        thisObject.position = target.position;
        thisObject.rotation.y = target.rotation.y;
        self.render();
      }
      localRecursiveTween(i+1);

    }
  };
  recursiveTween(startIndex);
 
};

/** Places camera at the bottom of the helix looking up and moves it up through the helix, jumping out in an arc to arrive at first item */
NP.module.CharityPicker.prototype.cameraThroughTunnel = function(delayLength ){
  var self = this;
  var tinyRadius = 0.00001;
  var cameraViewSlantPos = -1000;
  this.camera.position.y = -(this.charityTable.ordering.length-1)*self.cardsYIncrement - 4000;
  this.camera.position.x = 0;
  this.camera.position.z = 0;
  this.camera.lookAt(new THREE.Vector3());

  var camDist = {y: self.camera.position.y, viewRot:0};
  this.spiralTween = new TimelineMax({paused:true});

  this.spiralTween.to(camDist, 0.5, {y: cameraViewSlantPos,   delay: delayLength-1 , ease:Sine.easeIn,  //viewRot: 2*Math.PI,
    onStart: function(){
      self.controls.disable();
    } ,
    onUpdate:function(){
      self.camera.position.y = camDist.y;
      self.camera.lookAt(new THREE.Vector3(Math.sin(camDist.viewRot)*tinyRadius , camDist.y + 400, Math.cos(camDist.viewRot)*tinyRadius ) );
      self.render();
    }
  });

  var camDist2 = {y: cameraViewSlantPos, viewRot:Math.PI/2 };  
  
  // self.controls.setCameraPosition(camDist.xzRad, camDist.yRot, camDist.yPos);
  this.spiralTween.to(camDist2, 0.5, {y: 0, viewRot: 0,  ease:Linear.easeNone,  
    onUpdate:function(){
      self.camera.position.y = camDist2.y;
      self.camera.lookAt(new THREE.Vector3(0, camDist2.y+Math.sin(camDist2.viewRot)*self.cardRadius, Math.cos(camDist2.viewRot)*self.cardRadius ));
      self.render();
    }
  });

  var currentVars = {xAngle:0, jumpArcRadius: this.cameraRadius()/2};
  var target = new THREE.Vector3(0,0,this.cardRadius);
    
  this.spiralTween.to(currentVars, 1, {
    ease: Elastic.EaseOut, 
    xAngle: Math.PI,
    onUpdate: function () {
      currentVars.zPos = -Math.cos(currentVars.xAngle)*currentVars.jumpArcRadius + currentVars.jumpArcRadius;
      currentVars.yPos = Math.sin(currentVars.xAngle)*currentVars.jumpArcRadius;
      self.camera.position.fromArray([0, currentVars.yPos, currentVars.zPos ]);
      self.camera.lookAt(target );
      self.render();
    },
    onComplete: function(){
      self.controls.target = null;
      self.controls.positionAt(0);
      self.controls.enable();
    }
  });

  this.spiralTween.play();

};

/** Given a vector, plots a point which is the sum of this vector (scaled) and a rotated and scaled copy of itself 
Useful for creating a point at right angle to another point   */ 
NP.module.CharityPicker.prototype.getTangentPoint = function(vector, vectorScale, angle, tangentScale, axis ){
  if (axis == 'x') {var axisNorm = [1,0,0];
  }else if (axis == 'y'){
    var axisNorm = [0,1,0];
  }else if (axis == 'z' ){
    var axisNorm = [0,0,1];
  }else{
    var axisNorm = [0,1,0];    
  }
  return vector.clone().multiplyScalar(vectorScale).add(vector.clone().multiplyScalar(tangentScale).applyAxisAngle(new THREE.Vector3().fromArray(axisNorm), angle));
};

/** Creates event handlers for :
    -- X buttons of Sponsored choices
    -- menu pullout tabs for Categories and Sponsored   
 */
NP.module.CharityPicker.prototype.attachPickerEvents = function(){
  var self = this;
  
  // X-button events for removing a charity choice
  $('#charity-selector .choices .fa').each(function(){
    $(this).click(function(){
      //get index of choice position from its parent id
      var choiceInd =  parseInt($(this).closest('.choices').attr('id').replace('choice', ''));
      var choiceID = self.charityChoices[choiceInd]; 
      
      //fades out the DOM node in the picker, moves it back to its corresponding object , resetting scale, and fades it back in
      $(this).closest('.choices').find('.image-container').children().fadeOut('slow')
      .appendTo( self.charityTable.items[choiceID].object.children[0].element).css('transform', 'scale(1)').fadeIn('fast');
      //hide the X button for now empty choice
      $("#choice" +  choiceInd + " .fa").fadeOut('fast');    
      //show the back of the card we just added         
      $("#previewCardBack" + choiceID).show();
      
      //start card off to the right of camera
      var thisPos = self.getTangentPoint(self.camera.position, 0.5, Math.PI/2, 1 );
      thisPos.xzRad = thisPos.length();
      thisPos.yRot = self.getYRot(thisPos.x, thisPos.z);
      thisPos.arcTheta = 0;
      
      // add the charity to the end by updating its positioning data
      self.charityTable.ordering.push(choiceID);
      var targetIndex = self.charityTable.ordering.length -1;
      self.charityTable.items[choiceID].index = targetIndex;
      
      var targetPos = self.getHelixPosition(targetIndex);
      targetPos.yRot = self.getYRotAt(targetIndex);
      targetPos.xzRad = self.getXZRadAt(targetIndex);

      var thisObject = self.charityTable.items[choiceID].object;

      thisObject.rotation.y = targetPos.yRot;  

      thisObject.rotation.fromArray([0,self.controls.cameraPosition.yRot, 0]);


      TweenMax.to(thisPos, 1.5, {xzRad: targetPos.xzRad, yRot : targetPos.yRot, y: targetPos.y , arcTheta: Math.PI, 
        onUpdate:function(){
          self.applyPositioning(thisObject, thisPos.xzRad, thisPos.yRot, thisPos.y );
          thisObject.rotation.y += thisPos.arcTheta*6;
          self.render();  
        },
        onComplete:function(){
          self.charityChoices[choiceInd] = false;
          if (self.sponsoredIsOut){
            self.togglePicker();
            self.controls.setIndexBounds(0, targetIndex);
          }
        }

      });

    });
  });
  
  var tabEase = Cubic.easeOut;
  var tabTweenTime = 0.2;
  $("#charity-picker-tab").click(function(){
    return self.togglePicker();
  }).hover(
    function(){
      TweenMax.to($(this), tabTweenTime, {left:window.innerWidth - self.pickerTabWidth +  "px", ease:tabEase });
    },function(){
      TweenMax.to($(this), tabTweenTime, {left: window.innerWidth - self.pickerTabWidth + 10 + "px", ease:tabEase});
    }
  );
  $("#category-picker-tab").click(function(){
    return self.toggleCategoryPicker();
  }).hover(
    function(){
      TweenMax.to($(this), tabTweenTime, {left:"0px", ease:tabEase});
    },function(){
      TweenMax.to($(this), tabTweenTime, {left:"-10px", ease:tabEase});
    }
  );
}

/** Moves Sponsored choice menu in and out */
NP.module.CharityPicker.prototype.togglePicker = function(){
  var self = this;
  if (self.sponsoredIsOut){
    $("#charity-picker-tab").fadeIn('slow');
    TweenMax.to($("#charity-selector"), 0.6, {left:window.innerWidth+"px" ,
      onComplete:function(){ 
        // $("#picker-toggle .fa").removeClass("fa-angle-double-left").addClass("fa-angle-double-right"); 
        self.sponsoredIsOut =false;
      }
    });

  }else{
    $("#charity-picker-tab").fadeOut('slow');
    TweenMax.to($("#charity-selector"), 0.6, {left:window.innerWidth-self.pickerWidth-self.pickerTabWidth ,
      onComplete:function(){ 
        self.sponsoredIsOut =true;
      }
    });
  }
}

/** Moves Categories menu in and out */
NP.module.CharityPicker.prototype.toggleCategoryPicker = function(){
  var self = this;
  if (self.categoryPickerIsOut){
    // TweenMax.to($("#picker-toggle"), 0.6, {directionalRotation:"0_cw"});
    $("#category-picker-tab").fadeIn('slow');
    TweenMax.to($("#category-selector"), 0.6, {left:-self.categoryPickerWidth+"px" ,
      onComplete:function(){ 
        self.categoryPickerIsOut =false;
      }
    });

  }else{
    $("#category-picker-tab").fadeOut('slow');
    TweenMax.to($("#category-selector"), 0.6, {left: 0 ,
      onComplete:function(){ 
        self.categoryPickerIsOut =true;
      }
    });
  }
}

/** returns the position of the first available slot in the Sponsored selector */
NP.module.CharityPicker.prototype.getEmptyChoicePos = function(){
  for (var i = 0 ; i < this.charityChoices.length; i++){
    if (this.charityChoices[i] === false) {return i;}
  }
  return false;
}

/** called when broswer window changes size */
NP.module.CharityPicker.prototype.onWindowResize = function() {
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.controls.setCameraPosition(this.cameraRadius(), null, null);
  this.resizePicker();
  if (this.detailsCardOut){
    this.applyPositioning(this.detailsCard, this.controls.cameraPosition.xzRad*this.detailsTowardsCameraRatio, this.controls.cameraPosition.yRot, this.controls.cameraPosition.yPos);
  }
  this.render();
};

/** responsive positioning and sizing of menus */
NP.module.CharityPicker.prototype.resizePicker = function() {
  var previewWidth = 384;  //Must stay synced with charity.less value @preview-width
  var previewHeight = 256;  //Must stay synced with charity.less value @preview-height
  var extraHeightSpacing = 35+71;
  var thisAspect = previewWidth/previewHeight;
  var selectorRatio = 0.23;
  if ( (window.innerWidth*selectorRatio)/( (window.innerHeight - extraHeightSpacing) /3) > thisAspect ) {
    selectorRatio = (thisAspect*(window.innerHeight - extraHeightSpacing)/3)/ window.innerWidth;
  }    

  var thisWidth = window.innerWidth*selectorRatio;
  var pickerExtendBack = 10000;
  this.pickerWidth = thisWidth;
  this.categoryPickerWidth = parseInt($("#category-selector").css('width'));
  this.pickerTabWidth = parseInt($("#category-picker-tab").css('width'));


  var positioning =  (this.sponsoredIsOut) ? {'top':0, 'left': window.innerWidth - this.pickerWidth - this.pickerTabWidth+'px'}: {'top':0, 'left': window.innerWidth};
  $('#charity-selector').css(positioning);
  $('#charity-selector').css('width', thisWidth+pickerExtendBack +"px");
  $('#charity-selector .charity-choice-spacer').css({'width':thisWidth+'px', 'height': (window.innerHeight-extraHeightSpacing)/3 +'px'});
  $('#charity-selector .choices').css({'width': 0.9*thisWidth + 'px', 'height': 0.9*thisWidth*(previewHeight/previewWidth) +'px'});
  $('#charity-selector .image-container').css({'width': 0.81*thisWidth + 'px', 'height': 0.81*thisWidth*(previewHeight/previewWidth) +'px' }); //0.81 comes from 0.9 to corners X 0.9 to spacing inside corners 
  $('#charity-selector .corner').css({'height': thisWidth/7 + 'px', 'width': thisWidth/7 + 'px'});
  $('#charity-selector .image-container .charity-preview').css({'transform': 'scale('+  (thisWidth*0.81/previewWidth).toFixed(5)+ ')' }); //0.81 comes from 0.9 to corners X 0.9 to spacing inside corners 
  
  $("#charity-picker-tab").position({my: 'right center', at: 'right+10 center', of: window});
  $("#category-picker-tab").position({my: 'left center', at: 'left-10 center', of: window});


  var categoryPositioning =  (this.categoryPickerIsOut) ? {'top':0, 'left': 0}: {'top':0, 'left': -this.categoryPickerWidth + "px"};
  $('#category-selector').css(categoryPositioning);

}

/* called when controls hits end of the helix, plots the next page of charity results */
NP.module.CharityPicker.prototype.nextPage = function() {

  toastr.options = {
    "closeButton": false,
    "debug": false,
    "positionClass": "toast-bottom-right",
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }
  toastr.info("Loading more choices...");
  this.page += 1;
  this.getTableData();
}

/** Loads helix for a new category choice   */
NP.module.CharityPicker.prototype.newCategory = function(category) {
  var self = this;
  self.charityTable = {items:{}, ordering:[]}; 
  
  this.charityTable.byIndex = function(i){
    return this.items[this.ordering[i]];
  }

  self.category = category;
  self.page = 1; 
  this.getTableData();

};

/** Makes request to api for a list of charities for the   */
NP.module.CharityPicker.prototype.getTableData = function() {
  var self = this;
  var newItemsStartIndex = self.charityTable.ordering.length;
  

  $.ajax( {
    type:'GET',
    url: "http://cobra5d.com/api/v1/charity",
    crossDomain: true,
    data:{"categoryId": self.category, "page": self.page},
    success:function(data){
      for (var i = 0 ; i < data.charities.length; i++){

        var thisID = data.charities[i].charityId;

        self.charityTable.items[thisID] = data.charities[i] ;
        console.log(thisID + ":" + self.charityTable.items[thisID].name );
        self.charityTable.items[thisID].index = newItemsStartIndex+i;
        self.charityTable.ordering.push(thisID);
        // this is a hack, mysteriously the first call to this function does not render card properly so this is a "dummy" call to correct this
        if (!self.hasFetched) {self.fillAppDetailsCard(0);}  
        self.hasFetched = true;
      }
      self.plotHelixPage(newItemsStartIndex);      
    },
    error:function(){
      alert("Couldn't acquire charity data :(");
    }
   
   });
}

/** Removes all the charity preview card objects and their corresponding DOM nodes  */
NP.module.CharityPicker.prototype.clearHelix = function() {
  for (var i = 0; i < this.charityTable.ordering.length; i++){
    var thisID = this.charityTable.ordering[i];
    this.scene.remove(this.charityTable.items[thisID].object );
    $("#previewCard"+thisID).remove();
    $("#previewCardBack"+thisID).remove();
  }  
}

/** adds objects to data table to be tweened by transformCards, assigning corresponding position properties  */
NP.module.CharityPicker.prototype.plotHelixPage = function(startIndex) {
  var self = this;
 
  // PLOTS RANDOM POSITIONS , ADDS CARDS --------------------------------------------------------------------
  for (var i = startIndex ; i < this.charityTable.ordering.length; i++ ) {
      //object displays HTML data directly
    var id = this.charityTable.byIndex(i).charityId;
    console.log("Plotting id:" + id + "at index:" + i);
    var object = this.createPreviewCard(id);
    // var object = new THREE.Object3D();
    //initially place cards in random positions
    var offscreenDisplace = 12000;
    var sideSign = (i%2==0) ? -1 : 1;  
   
    this.charityTable.items[id].object = object; 
    this.charityTable.items[id].position = self.getHelixPosition(i);
    this.charityTable.items[id].yRos = self.getYRotAt(i);
    this.charityTable.items[id].xzRad = self.getXZRadAt(i);
    

  }
  
  this.transformCards(startIndex);  
  
}

NP.module.CharityPicker.prototype.render = function() {
  this.renderer.render(this.scene, this.camera);
};

NP.module.CharityPicker.prototype.categoryRender = function() {
  this.categoryRenderer.render(this.categoryScene, this.categoryCamera);
};