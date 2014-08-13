/* global $:false, NP:false, jQuery:false, toastr:false */
'use strict';
var signupRoute = {
	'/signup': {
		on: function() {
			function initSignup(){
				if( NP.user.isLoggedIn() ) {
					toastr.success("Redirecting to search page", "Already Loggedin");
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
					window.location.href = NP.config.appURL() + '#/search';
					console.log('user already logged in.');
				}
				else {
					NP.user.flush();
					console.log('creating template');
					var l = Ladda.create( document.querySelector( '.ladda-button' ) );
					
					jQuery('#signupButton').click(function(e){
						var l = Ladda.create( this );
						l.start();
						e.preventDefault();
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
									console.log('some error happened while log in');
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

					jQuery('#loginButton').click(function(){
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
									toastr.success("Redirecting to search page", "Login Successful");
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
									jQuery('#userName').val('');
									jQuery('#userPassword').val('');
									NP.user.setLoggedIn(true);
									// NP.user.setAccountId(data.id);
									// NP.user.setUserName(data.displayName);
									// NP.user.setAPIKey(data.apiKey);
									l.stop();
									window.location.href = NP.config.appURL() + '#/search'; 
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
			}
			$("#appContainer").loadFromTemplate({
				template : "signup",
				data : {},
				callback: initSignup
			});
		}
	}
};

var signupRouter = Router(signupRoute);
signupRouter.init();