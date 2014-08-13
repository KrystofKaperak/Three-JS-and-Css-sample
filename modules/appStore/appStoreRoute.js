/*global $:false, NP: false */
/*jshint strict:false, devel:true */

var appStoreRoute = {
	'/appStore': {
		on: function() {
			function initAppStore(){
				var accountId = NP.user.accountId();
			    var height = NP.config.screenHeight();
			    var width = NP.config.screenWidth();
			    
			    var appStore = new NP.module.AppStore(accountId, height, width);

		        appStore.drawHelix('local_apps.json');
			}
			$("#appContainer").displayManager('appStore3DApp',{
				template : "appStore",
				data : {},
				callback: initAppStore
			});
		},
		before: function() {
		},
		after: function() {
		},
		once: function() {
		}
	}
};

var appStoreRouter = Router(appStoreRoute);
appStoreRouter.init();

