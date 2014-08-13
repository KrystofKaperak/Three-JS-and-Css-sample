/*global jQuery:false, $:false, NP: false */
/*jshint strict:false, devel:true */
// Main file to initialize all variables, check if user is logged in
// create bookmark dock in bottom and create camera event.

footerCubes = {};

jQuery(document).ready(function(){
	// force browser zoom to be set to 100% if it is not with a dialog box instructing on how to reset
	function getZoom() {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		svg.setAttribute('version', '1.1');
		document.body.appendChild(svg);
		var z = svg.currentScale;
		document.body.removeChild(svg);
		return z;
	}
	console.log('checking zoom');
	if (getZoom() !== 1){
		console.log("you no zoom right");
		var keyCommand =  (navigator.appVersion.indexOf("Mac")!=-1 ) ? "⌘ + 0" : "Ctrl + 0";
		
		$(document.createElement('div')).attr('id', 'zoom-dialog').css('display', 'none').attr('title', 'Adjust browser zoom settings').
		html('<p>Currently your browser zoom is set to something other than 100%.  Squify will only work properly at your browser\'s default zoom.  <b>Please press '+ keyCommand + ' to reset zoom</b>.</p>' ).appendTo('body');

		$('#zoom-dialog').dialog({
		  dialogClass: "no-close", height: "auto", width: 400		  
		});

		(function checkZoom () {          
		   setTimeout(function () {   
		      if (getZoom() !== 1){
				console.log("you no zoom right");
		      	checkZoom();      
		      }else{
		      	$( "#zoom-dialog" ).dialog("close");
		      }                 
		   }, 200);
		})();  
	}

	if( NP.user.isLoggedIn() ) {
		console.log('user already logged in.');
	}
	else {
		// console.log('user not logged in, requesting bookmarks from server');
		// NP.user.flush();
		// jQuery.ajax({
		// 	url: NP.config.appURL() + '/apps.json',
		// 	type: 'get',
		// 	crossDomain: true,
		// 	success: initiateGuestLogin,
		// 	error: function(){
		// 		console.log('looks like something got messed up in servers');
		// 	}
		// });
	}
	if(window.location.href === (NP.config.appURL() + '/')){
		window.location.href = NP.config.appURL() + '/index.html';
		console.log('redirected to index.html');
	}
	var accountId = 10;
	footerCubes = new NP.module.footerCube(accountId);
	footerCubes.drawBoxes('/apps.json');
	
	jQuery('.meny-contents').css('height', NP.config.screenHeight());
	var meny = Meny.create({
		menuElement: document.querySelector( '.meny' ),
		contentsElement: document.querySelector( '.meny-contents' ),
		position: 'top',
		height: 75,
		width: 260,
		threshold: 20,
		transitionDuration: '0.35s',
		transitionEasing: 'ease',
		overlap: 0,
		mouse: false,
		touch: false
	});
    document.getElementById('arrow').addEventListener('mousedown', function(){
		if(meny.isOpen()){
			meny.close();
		}
		else {
			meny.open();
		}
	});
	jQuery('body').click(function(e){
		if( e.target.id != 'arrow' ){
			if(meny.isOpen()){
				meny.close();
			}
		}
	});


	jQuery("#themeSetting").colorbox({inline:true,width:"50%", opacity:0.65});
	jQuery('#backgroundColorWheel').change(function(){
		//console.log(jQuery(this).val());
		$('body').removeClass('default');
		$('body').css('background-color', jQuery(this).val());
	});
	
	jQuery('#theme1').click(function(){
		$('body').attr('class', 'default meny-top');
		$('body').css('background-color', '');
	});
	
	jQuery('#removeBackground').click(function(){
		$('body').css('background-image', '');
	});

	jQuery('#inputFileToLoad').change(function(){
		var filesSelected = document.getElementById("inputFileToLoad").files;
		if (filesSelected.length > 0){
			var fileToLoad = filesSelected[0];
			var fileReader = new FileReader();

			fileReader.onload = function(fileLoadedEvent) {
				//var textAreaFileContents = document.getElementById("textAreaFileContents");
				$('body').css('background-image', 'url("' + fileLoadedEvent.target.result + '")');
				console.log(fileLoadedEvent.target.result);
			};
			fileReader.readAsDataURL(fileToLoad);
		}
	});
	jQuery('#toggleCloud').click(function(){
		//jQuery('#canvas2').toggle().animation();
		if(jQuery('#canvas2').css('display') === 'block'){
			jQuery('#canvas2').fadeOut('slow');
			jQuery('#toggleCloud').html('Show Cloud');
		}
		else {
			jQuery('#canvas2').fadeIn('slow');
			jQuery('#toggleCloud').html('Hide Cloud');
		}
	});

	$(window).resize( function(){
		var sizing = (window.innerWidth/window.innerHeight > 1 ) ? {'width' : '100%', 'height':'auto'} : {'width' : 'auto', 'height':'100%'} ;
		$("#canvas2").css(sizing);    	
  	});

	jQuery('body').on('click', '.wm-maximize', function(){
		var parentElement = jQuery(this).closest('.wm-window.active');

		if(jQuery(parentElement).hasClass('maximize')){
			var prevHeight = jQuery(parentElement).attr('data-height');
			var prevWidth = jQuery(parentElement).attr('data-width');
			var prevLeftLocation = jQuery(parentElement).attr('data-left');
			var prevTopLocation = jQuery(parentElement).attr('data-top');

			//reduce it to previous size at previous location
			jQuery(parentElement).animate({
					'left': prevLeftLocation,
					'top': prevTopLocation,
					'height': prevHeight,
					'width': prevWidth
				}, 500)
				.removeClass('maximize')
				.attr({
					'data-height': '',
					'data-width': '',
					'data-left': '',
					'data-top': ''
				});
		}
		else {
			var currentHeight = jQuery(parentElement).css('height');
			var currentWidth = jQuery(parentElement).css('width');
			var currentLeftLocation = jQuery(parentElement).css('left');
			var currentTopLocation = jQuery(parentElement).css('top');

			jQuery(parentElement).attr({
				'data-height': currentHeight,
				'data-width': currentWidth,
				'data-left': currentLeftLocation,
				'data-top': currentTopLocation
			})
			.animate({
					'left': '0px',
					'top': '0px',
					'height': '100%',
					'width': '100%'
				}, 500)
			.addClass('maximize');
		}
	});

	jQuery('body').on('click', '.wm-minimize', function(){
		var parentElement = jQuery(this).closest('.wm-window.active');
		var parentElementId = jQuery(parentElement).attr('id');
		console.log('parent element id ' + parentElementId);

		var currentHeight = jQuery(parentElement).css('height');
		var currentWidth = jQuery(parentElement).css('width');
		var currentLeftLocation = jQuery(parentElement).css('left');
		var currentTopLocation = jQuery(parentElement).css('top');

		jQuery(parentElement).attr({
			'data-height': currentHeight,
			'data-width': currentWidth,
			'data-left': currentLeftLocation,
			'data-top': currentTopLocation
		});
		jQuery(parentElement).addClass('minimize');

		var minMaxTween = new TimelineMax();
		
		var tweenLength = 1;

		CSSPlugin.defaultTransformPerspective = 500;
		var opacitySlice = 0.3;
		minMaxTween.add("startPt", 0);
		minMaxTween.pause();
		var boundingData = $('#cubeTop' + parentElementId).get(0).getBoundingClientRect();
		console.log(boundingData);
		var leftVal = (boundingData.left+boundingData.right)/2 - 400;
		console.log("leftVal:"+leftVal);
		var topVal = (boundingData.top+boundingData.bottom)/2;
		console.log("topVal:"+topVal);
		minMaxTween.to($(parentElement), tweenLength*0.5, {rotationX:-15, transformOrigin:"top center" , repeat: 1, yoyo: true} );
		minMaxTween.to($(parentElement), tweenLength, {left: leftVal,  ease:Power2.easeInOut}, 'startPt' );
		minMaxTween.to($(parentElement), tweenLength, {top: topVal}, 'startPt' );
		minMaxTween.to($(parentElement), tweenLength, {scale:0.05, ease:Power2.easeInOut}, 'startPt' );
		minMaxTween.to($(parentElement), tweenLength*opacitySlice, {opacity:0 }, '-='+opacitySlice*tweenLength );
		minMaxTween.play();
	});

	jQuery('body').on('click', '.wm-close', function(){
		var parentElement = jQuery(this).closest('.wm-window.active');

		var parentId = jQuery(parentElement).attr('id');
		footerCubes.stopCubeSpin(parentId);
		jQuery(parentElement).effect('fade', 500, function(){
			jQuery(this).remove();
		});

		window.history.pushState("object or string", "Title", '/index.html');
	});

	jQuery('body').on('mouseover', '.wm-window', function(){
		bringAppToForeground(this);
	});

	jQuery('body').on('mouseover', '.wm-window', function(){
		jQuery(this).find('.wm-window-title').css({opacity: 1});
	});

	jQuery('body').on('mouseout', '.wm-window', function(){
		var self = this;
		jQuery(self).find('.wm-window-title').css({opacity: 0});
	});

	/* animated svg buttons at top */
	[].slice.call( document.querySelectorAll( '.si-icons-default > .si-icon' ) ).forEach( function( el ) {
			var svgicon = new svgIcon( el, svgIconConfig, { easing : mina.elastic, evtoggle : 'mouseover', size : { w : 28, h : 28 } } );
		} );
	/* login popup here */
	 $( "#login-container" ).dialog({
		autoOpen: false,
		width: 510,
		height: 480, 
		modal: true,
		show: {
			effect: 'scale',
			duration: 800
		},
		hide: {
			effect: 'explode',
			duration: 600
		}
    });

 	jQuery('#headerLoginButton').on('click', function(e){
		e.preventDefault();
		$( "#login-container" ).dialog('open');
		initSignup();
	});

	 /* login popup ends here */


	if(window.location.href === (NP.config.appURL() + '/index.html')){
		window.location.href = NP.config.appURL() + '/index.html#/search';
		console.log('redirected');
	}
});

function initiateGuestLogin(data) {
	var a = data;
	NP.user.setBookmarks(a);
	NP.user.setLoggedIn(false);
	NP.user.setAccountId('');
	NP.user.setUserName('guest');
	NP.user.setAPIKey('');
} 

function initSignup(){
	if( NP.user.isLoggedIn() ) {
		toastr.success("User is already logged in.", "Already Loggedin");
		toastr.options = {
			"closeButton": false,
			"debug": false,
			"positionClass": "toast-top-right",
			"onclick": null,
			"showDuration": "1000",
			"hideDuration": "500",
			"timeOut": "1000",
			"extendedTimeOut": "1000",
			"showEasing": "swing",
			"hideEasing": "linear",
			"showMethod": "fadeIn",
			"hideMethod": "fadeOut"
		};
		$( "#login-container" ).dialog('close');
		console.log('user already logged in.');
	}
	else {
		NP.user.flush();
		console.log('creating template');
		var l = Ladda.create( document.querySelector( '.ladda-button' ) );
		
		jQuery('#signupButton').click(function(e){
			e.preventDefault();
			var l = Ladda.create( this );
			l.start();
			var userName = jQuery('#emailsignup').val();
			var password = jQuery('#passwordsignup').val();
			var passwordConfirm = jQuery('#passwordsignup_confirm').val();

			if(userName === '' || password === '' || passwordConfirm === ''){
				toastr.clear();
				toastr.error("Please fill all fields", "Incomplete Data");
				toastr.options = {
					"closeButton": false,
					"debug": false,
					"positionClass": "toast-top-right",
					"onclick": null,
					"showDuration": "1000",
					"hideDuration": "500",
					"timeOut": "1500",
					"extendedTimeOut": "1000",
					"showEasing": "swing",
					"hideEasing": "linear",
					"showMethod": "fadeIn",
					"hideMethod": "fadeOut"
				};
				l.stop();
				return;
			}
			if(password !== passwordConfirm){
				toastr.clear();
				toastr.error("Please check passwords", "Password mismatch!");
				toastr.options = {
					"closeButton": false,
					"debug": false,
					"positionClass": "toast-top-right",
					"onclick": null,
					"showDuration": "1000",
					"hideDuration": "500",
					"timeOut": "1500",
					"extendedTimeOut": "1000",
					"showEasing": "swing",
					"hideEasing": "linear",
					"showMethod": "fadeIn",
					"hideMethod": "fadeOut"
				};
				l.stop();
				return;
			}

			jQuery.ajax({
				type: 'POST',
					url: NP.config.appURL() + '/auth/isBusy',
					crossDomain: true,
					data: {
						'email': userName
					}
			})
			.done(function(data){
				console.log(data);
				if(data.isBusy){
					toastr.clear();
					toastr.error("Email address is already in use", "Email Busy");
					toastr.options = {
						"closeButton": false,
						"debug": false,
						"positionClass": "toast-top-right",
						"onclick": null,
						"showDuration": "1000",
						"hideDuration": "500",
						"timeOut": "1500",
						"extendedTimeOut": "1000",
						"showEasing": "swing",
						"hideEasing": "linear",
						"showMethod": "fadeIn",
						"hideMethod": "fadeOut"
					};
					l.stop();
					return;
				}
				jQuery.ajax({
					type: 'POST',
					url: NP.config.appURL() + '/auth/signup',
					crossDomain: true,
					data: {
						'email': userName,
						'password': password
					}
				})
					.done(function(data){
						l.stop();
						toastr.clear();
						toastr.success("Account successfully created", "Account Created");
						toastr.options = {
							"closeButton": false,
							"debug": false,
							"positionClass": "toast-top-right",
							"onclick": null,
							"showDuration": "1000",
							"hideDuration": "500",
							"timeOut": "1500",
							"extendedTimeOut": "1000",
							"showEasing": "swing",
							"hideEasing": "linear",
							"showMethod": "fadeIn",
							"hideMethod": "fadeOut"
						};
						console.log(data);
						jQuery('#userName').val('');
						jQuery('#userPassword').val('');
						$( "#login-container" ).dialog('close');
					})
					.error(function(){
						l.stop();
						toastr.clear();
						toastr.error("Some error occured", "Signup failed");
						toastr.options = {
							"closeButton": false,
							"debug": false,
							"positionClass": "toast-top-right",
							"onclick": null,
							"showDuration": "1000",
							"hideDuration": "500",
							"timeOut": "1500",
							"extendedTimeOut": "1000",
							"showEasing": "swing",
							"hideEasing": "linear",
							"showMethod": "fadeIn",
							"hideMethod": "fadeOut"
						};
					});
			})
			.error(function(){
				l.stop();
				toastr.clear();
				toastr.error("Some error occured", "Signup failed");
				toastr.options = {
					"closeButton": false,
					"debug": false,
					"positionClass": "toast-top-right",
					"onclick": null,
					"showDuration": "1000",
					"hideDuration": "500",
					"timeOut": "1500",
					"extendedTimeOut": "1000",
					"showEasing": "swing",
					"hideEasing": "linear",
					"showMethod": "fadeIn",
					"hideMethod": "fadeOut"
				};
				console.log('some error occured');
			});
			
		});

		jQuery('#loginButton').click(function(e){
			e.preventDefault();
			var l = Ladda.create( this );
			l.start();
			var userName = jQuery('#username').val();
			var userPassword = jQuery('#password').val();
			console.log(userName + '___' + userPassword);
			
			if(userName && userPassword){
				jQuery.ajax({
					type: 'POST',
					url: NP.config.appURL() + '/auth/login',
					crossDomain: true,
					data: {
						'username': userName,
						'password': userPassword
					}
				})
					.done(function(data){
						toastr.clear();
						toastr.success("Welcome to Cobra5d!", "Login Successful");
						toastr.options = {
							"closeButton": false,
							"debug": false,
							"positionClass": "toast-top-right",
							"onclick": null,
							"showDuration": "1000",
							"hideDuration": "500",
							"timeOut": "1000",
							"extendedTimeOut": "1000",
							"showEasing": "swing",
							"hideEasing": "linear",
							"showMethod": "fadeIn",
							"hideMethod": "fadeOut"
						};
						$( "#login-container" ).dialog('close');
						jQuery('#userName').val('');
						jQuery('#userPassword').val('');
						NP.user.setLoggedIn(true);
						// NP.user.setAccountId(data.id);
						// NP.user.setUserName(data.displayName);
						// NP.user.setAPIKey(data.apiKey);
						l.stop();
					})
					.error(function(){
						l.stop();
						jQuery('#userName').val('');
						jQuery('#userPassword').val('');
						toastr.clear();
						toastr.error("Please check credentials", "Login failed");
						toastr.options = {
							"closeButton": false,
							"debug": false,
							"positionClass": "toast-top-right",
							"onclick": null,
							"showDuration": "500",
							"hideDuration": "500",
							"timeOut": "1500",
							"extendedTimeOut": "1000",
							"showEasing": "swing",
							"hideEasing": "linear",
							"showMethod": "fadeIn",
							"hideMethod": "fadeOut"
						};
					});
			}
			else {
				l.stop();
				toastr.clear();
				toastr.error("Please check credentials", "Input empty!");
				toastr.options = {
					"closeButton": false,
					"debug": false,
					"positionClass": "toast-top-right",
					"onclick": null,
					"showDuration": "500",
					"hideDuration": "500",
					"timeOut": "1500",
					"extendedTimeOut": "1000",
					"showEasing": "swing",
					"hideEasing": "linear",
					"showMethod": "fadeIn",
					"hideMethod": "fadeOut"
				};
			}
		});
	}
	jQuery('.ui-widget-overlay.ui-front').on('click', function(){
		$("#login-container").dialog('close');
	});


}