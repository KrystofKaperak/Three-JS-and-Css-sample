/*global $:false, NP: false */
/*jshint strict:false, devel:true */

'use strict';
var searchRoute = {
	'/search': {
		on: function() {
			function initSearch(){
			    var accountId = NP.user.accountId();
			    var height = NP.config.screenHeight();
			    var width = NP.config.screenWidth();
			    
			    var searchApp = new NP.module.search(accountId, height, width);
	
		        searchApp.init();
		        console.log('initiated' + accountId + ' __ ' + height + ' __ ' + width);
		    }
			$("#appContainer").displayManager('searchApp',{
				template : "search",
				data : {},
				callback: initSearch
			});
		},
		before: function() {
			console.log(' search template initiated');
		},
		after: function() {
			console.log('search after called');
		},
		once: function() {
			console.log('search once is called ones');
		}
	}, 
	'/testCard': {
		on: function() {
			
			$("#appContainer").loadFromTemplate({
				template : "searchCardTest",
				data : {title:"Care2 - make a difference, more than you could ever imagine, I'm teling you how to make a difference right now ", 
      domain: "www.care2.com",  url: "www.care2.com/this/that/this/that/this/that/this/that/this/that/this/that/this/that/this/that/this/that/this/that/this/that/this/that", imageUrl:"https://i1.ytimg.com/vi/zXwR0JGUCFI/mqdefault.jpg",  isAd:true,
      description:"<mark>Care2</mark> - largest online community for healthy and green living, human rights and animal welfare. The seeds for Care2 were planted many years ago. I was 13 years old, traveling up the <mark>Amazon</mark> with my father in a thatch-covered boat. My father, an ornithologist, studied the birds, while I marveled at the rich wildlife, lush vegetation and fascinating people we encountered deep in the jungle." },
				callback: function(){
					$('.carousel-item').css({'position':'absolute', 'top':'100px', 'left':'30px'});
				}	
			});
		}
	}
};

var searchRouter = Router(searchRoute);
searchRouter.init();