/* global NP:false, jQuery:false*/
'use strict';
var logoutRoute = {
	'/logout': {
		on: function() {
			jQuery.ajax({
				type: 'GET',
				url: 'http://cobra5d.com/auth/logout',
				crossDomain: true
			})
				.done(function(data){
					toastr.clear();
					toastr.success("Redirecting to login page", "Successful Logout");
					toastr.options = {
						"closeButton": false,
						"debug": false,
						"positionClass": "toast-top-right",
						"onclick": null,
						"showDuration": "500",
						"hideDuration": "500",
						"timeOut": "1000",
						"extendedTimeOut": "1000",
						"showEasing": "swing",
						"hideEasing": "linear",
						"showMethod": "fadeIn",
						"hideMethod": "fadeOut"
					};
					NP.user.flush();
					window.location.href = NP.config.appURL() + '#/login';
				});
		}
	}
};

var logoutRouter = Router(logoutRoute);
logoutRouter.init();