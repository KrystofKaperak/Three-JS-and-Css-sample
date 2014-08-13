
//Javascript proper negative modulo hack

Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
}

NP.module.videos = function(accountId, height, width){
  this.accountId = accountId;
  this.height = height;
  this.width = width;
}


NP.module.videos.prototype.init = function() {

    var _this = this;
    var search_field = $("#search-field");
    search_field.position({my:"center center", at:"center center", of: window});
    search_field.on('keyup', function(e) {
        if (e.which == 13 && search_field.is(":focus")) {
            e.preventDefault();
            _this.newSearch();
        }
    })
    .focus(function(){
        $(this).val('');
    });
}

NP.module.videos.prototype.newSearch = function(){

    var videos;
    var camera, scene, renderer;
    var controls;
    var objects = [];
    var elements = [];
    var targets = {sphere: []};
    var currentPlayerFrame3dObject;
    var currentVideoObject = null;
    var zoomInCoeff = 1.9;
    var zoomOutCoeff = 3.8;
    var isZoomed = false;
    var container;
    var mask;
    var clickFlag = false;
    var doubleClickFlag = false;
    var width = 419, height = 300;
    var k = [1,4,9,13,14,13,9,4,1];
    var k1 = [[14, 5], [13, 4], [13, 6], [9, 3], [9, 7], [4, 2], [4, 8], [1, 1], [1, 9]];
    var R = k[4] * (width + width * 0.1)/ (2 * Math.PI);
    var mouseDown = false;

    //Request for video info
    function getResponse() {
        $.ajax({
//            url: "/videos.json",
            url: "http://www.cobra5d.com/api/v1/videosearch?query=" + document.getElementById('search-field').value,
            dataType: "json",
            success: function(data) {
                videos = data;
                init();
                animate();
            }
        });
    }

    $('#videos-container').html('')

    document.getElementById( 'videos-container' ).innerHtml = ''
    var search_bar = $('#search-bar');
    var search_field = $('#search-field');
    search_bar.show();
    search_field.appendTo(search_bar).css({ 'position':'static', 'margin-left': 'auto', 'margin-right':'auto'}).fadeIn('fast');
    $('#logo-mid').fadeOut('fast');
    $("#logo-sm").fadeIn('fast');

    function globalClickHandle() {
        if(clickFlag) {
            clickFlag = false;
            return;
        }
        if (doubleClickFlag) {
            doubleClickFlag = false;
            return;
        }

        if (camera.position.z < R * zoomInCoeff && isZoomed) {
            currentVideoObject = null;
            new TWEEN.Tween( camera.position )
                    .to( { x: zoomedObject.position.x * zoomOutCoeff, y: zoomedObject.position.y * zoomOutCoeff, z: zoomedObject.position.z * zoomOutCoeff }, 1000 )
                    .easing( TWEEN.Easing.Exponential.InOut )
                    .start();
            isZoomed = false;
        }
    }

    function globalKeyPressHandle(e) {
        if (e.keyCode == 27) {
            globalClickHandle();
        }
    }

    function cropString(text, max) {
        if (!!text) {
            if (text.length <= max) {
                return text;
            } else {
                return text.substring(0, max) + '...';
            }
        }
        return '';
    }

    function addDetails(parent, videoNumber) {
        container = document.createElement( 'div' );
        container.className = 'pic-container';

        var symbol = document.createElement( 'img' );
        symbol.className = 'img';
        symbol.src = videos[videoNumber].thumbnails.medium;

        var titleContainer = document.createElement( 'div' );
        titleContainer.className = 'pic-title-container';

        var title = document.createElement( 'div' );
        title.className = 'pic-title';
        title.innerHTML = cropString(videos[videoNumber].title, 40);

        var icon = document.createElement( 'img' );
        icon.src = 'images/videos/play-button.png'
        icon.className = 'pic-play-icon';

        titleContainer.appendChild(title);

        parent.appendChild(titleContainer);
        parent.appendChild(icon);

        parent.appendChild(symbol);
        parent.appendChild(container);

        return parent;
    }

    function createElement() {

    }

    function openVideoPlayer(videoNumber) {
        var self = this;
        var thisWidth = window.innerWidth*0.56;
        overlayLayer = document.getElementById('cboxOverlay');
        overlayLayer.className = 'semi-dark';
        $.colorbox({
            innerWidth:thisWidth+"px", innerHeight: Math.round(thisWidth*(9/16)) +"px",  opacity:0, iframe:true, href: videos[videoNumber].embedUrl,
            onClosed:function(){
                if (camera.position.z < R * zoomInCoeff) {
                    currentVideoObject = null;
                    new TWEEN.Tween( camera.position )
                        .to( { x: zoomedObject.position.x * zoomOutCoeff, y: zoomedObject.position.y * zoomOutCoeff, z: zoomedObject.position.z * zoomOutCoeff }, 1000 )
                        .easing( TWEEN.Easing.Exponential.InOut )
                        .start();
                    isZoomed = false;
                    $('#search-field').focus();
                }
                overlayLayer.className = '';
            }
        });

    }

    function checkEquality(videoObjectId) {
        if (zoomedObject == null) {
            result = false;
        } else {
            result  = zoomedObject.id == objects[videoObjectId].id;
        }
        return result;
    }

    getResponse();

    function init() {
        //global key events handling;
        document.onclick = globalClickHandle;
        document.onkeydown = globalKeyPressHandle;
        if (document.layers) {
            document.captureEvents(Event.KEYPRESS || Event.CLICK);
        }

        // First camera's position
        camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );

        scene = new THREE.Scene();

        // Build sphere construction


        var thetaStep = Math.PI / 8;
        for (var i = 0, m = 0; i < k1.length; i++) {
            var phiStep = 2 * Math.PI / k1[i][0];
            for (var j = 0; j < k1[i][0]; j++, m++) {

                var element = document.createElement( 'div' );
                var back_element = document.createElement( 'div' );
                element.className = 'video-element';
                back_element.className = 'video-image-backing';
                element.id = m;
                back_element.id = "previewCardBack" + m;
                element.style.backgroundColor = 'rgba(255,255,255,' + ( Math.random() * 0.5 + 0.25 ) + ')';
                element.onclick = function() {
                    //Prepare for double click, continue to clickHandler doesn't come soon enough
                    currentObjectId = this.id;
                    this.preventDefault;
                    clickFlag = true;
                    if (isZoomed && checkEquality(currentObjectId)) {
                        if (camera.position.z != zoomedObject.position.z * zoomInCoeff) {
                            new TWEEN.Tween( camera.position )
                                .to( { x: zoomedObject.position.x * zoomInCoeff, y: zoomedObject.position.y * zoomInCoeff, z: zoomedObject.position.z * zoomInCoeff }, 1000 )
                                .easing( TWEEN.Easing.Linear.None )
                                .onComplete(function() {
                                    openVideoPlayer(currentObjectId);
                                })
                                .start();
                        } else {
                            openVideoPlayer(currentObjectId);
                        }
                        isZoomed = false;
                    } else {
                        isZoomed = true;
                        zoomedObject = objects[currentObjectId];
                        new TWEEN.Tween( camera.position )
                            .to( { x: zoomedObject.position.x * zoomOutCoeff, y: zoomedObject.position.y * zoomOutCoeff, z: zoomedObject.position.z * zoomOutCoeff }, 1000 )
                            .easing( TWEEN.Easing.Exponential.InOut )
                            .start();
                        new TWEEN.Tween(camera.up )
                            .to( { x: 0, y: 1, z: 0 }, 1000 )
                            .easing( TWEEN.Easing.Exponential.InOut )
                            .start();
                        clearTimeout(this.clickTimeout);
                        this.clickTimeout = setTimeout(function(){
                            setTimeout(function() {
                                new TWEEN.Tween( camera.position )
                                    .to( { x: zoomedObject.position.x * zoomInCoeff, y: zoomedObject.position.y * zoomInCoeff, z: zoomedObject.position.z * zoomInCoeff }, 1000 )
                                    .easing( TWEEN.Easing.Linear.None )
                                    .onComplete(function() {
                                        currentVideoObject = document.getElementById(currentObjectId);
                                    })
                                    .start();
                            }, 1000)
                        },200);
                    }
                }

                element.ondblclick = function() {
                    clearTimeout(this.clickTimeout);
                    openVideoPlayer(this.id);
                    doubleClickFlag = true;
                }

                addDetails(element, m);

                elements.push(element);

                var vector = new THREE.Vector3();
                var object = new THREE.CSS3DObject(element);
                var back_vector = new THREE.Vector3();
                var back_object = new THREE.CSS3DObject(back_element);
                var pos_x = R * Math.cos(phiStep * j) * Math.sin(thetaStep * (k1[i][1] - 1));
                var pos_y = R * Math.cos(thetaStep * (k1[i][1] - 1));
                var pos_z = R * Math.sin(thetaStep * (k1[i][1] - 1)) * Math.sin(phiStep * j);
                object.position.x = pos_x; object.position.z = pos_z; object.position.y = pos_y;
                back_object.position.x = 0.998 * pos_x; back_object.position.z = 0.998 * pos_z; back_object.position.y = 0.998 * pos_y;
                vector.copy(object.position).multiplyScalar(2);
                back_vector.copy(back_object.position).multiplyScalar(2);
                object.lookAt(vector);
                back_object.lookAt(back_vector);
                scene.add(object);
                scene.add(back_object);
                objects.push(object);
            }
        }

        renderer = new THREE.CSS3DRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = 'absolute';
        var vc = document.getElementById( 'videos-container' );
        vc.appendChild( renderer.domElement );

        //Scroll and rotation settings

        camera.position.z = R * zoomOutCoeff;

        var bodyContainer = document.getElementById("videos-container");
        controls = new THREE.TrackballControls( camera, bodyContainer );
        controls.rotateSpeed = 0.1;
        controls.minDistance = 500;
        controls.maxDistance = 6000;
        controls.addEventListener( 'change', render );

        window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        render();
    }

    function animate() {
        requestAnimationFrame( animate );
        TWEEN.update();
        controls.update();
    }

    function render() {
        renderer.render( scene, camera );
    }
};


