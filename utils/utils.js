/*global $: false, NP:false */
/*jshint strict:false, devel:true */
NP.user = {
	setLoggedIn: function(state){
		var a = state.toString();
		console.log(a);
		$.jStorage.set('loggedIn', a);
		return false;
	},
	setAccountId: function(accountId){
		var a = accountId.toString();
		$.jStorage.set('accountId', a);
	},
	setUserName: function(userName){
		var a = userName.toString();
		$.jStorage.set('userName', a);
	},
	setAPIKey: function(apiKey){
		var a = apiKey.toString();
		$.jStorage.set('apiKey', a, {TTL: 86400000}); // sets TTL to 24 hours
	},
	setBookmarks: function(bookmarks){
		var a = JSON.stringify(bookmarks);
		sessionStorage.setItem('bookmarks', a);
	},
	isLoggedIn: function(){
		var loggedIn = $.jStorage.get('loggedIn');
		if (loggedIn === 'true') {
			return true;
		}
		else {
			return false;
		}
	},
	accountId: function(){
		return $.jStorage.get('accountId');
	},
	userName: function(){
		return $.jStorage.get('userName');
	},
	apiKey: function(){
		return $.jStorage.get('apiKey');
	},
	getBookmarks: function(){
		var bookmarks = sessionStorage.getItem('bookmarks');
		return JSON.parse(bookmarks);
	},
	flush: function(){
		$.jStorage.flush();
		sessionStorage.removeItem('bookmarks');
	}
};

NP.config = {
	setScreenHeight: function(screenHeight){
		var a = screenHeight.toString();
		sessionStorage.setItem('screenHeight', a);
	},
	setScreenWidth: function(screenWidth){
		var a = screenWidth.toString();
		sessionStorage.setItem('screenWidth', a);
	},
	screenHeight: function(){
		var w=window,
		d=document,
		e=d.documentElement,
		g=d.getElementsByTagName('body')[0],
		x=w.innerWidth||e.clientWidth||g.clientWidth,
		y=w.innerHeight||e.clientHeight||g.clientHeight;
		return y;
	},
	screenWidth: function(){
		var w=window,
		d=document,
		e=d.documentElement,
		g=d.getElementsByTagName('body')[0],
		x=w.innerWidth||e.clientWidth||g.clientWidth,
		y=w.innerHeight||e.clientHeight||g.clientHeight;
		return x;
	},
	appURL: function(){
		return APP_URL;
	},
	cdnURL: function(){
		return CDN_URL;
	},
	templatePath: function(){
		return TEMPLATE_PATH;
	}
};

function bringAppToForeground(target){
	var min,
	o = jQuery('.wm-window'),
	group = $.makeArray($(o)).sort(function(a,b) {
		return (parseInt($(a).css("zIndex"),10) || 0) - (parseInt($(b).css("zIndex"),10) || 0);
	});

	if (!group.length) { return; }

	min = parseInt($(group[0]).css("zIndex"), 10) || 0;
	$(group).each(function(i) {
		$(this).css("zIndex", min + i);
	});
	$(target).css("zIndex", (min + group.length));
}

 // adds .naturalWidth() and .naturalHeight() methods to jQuery
  // for retreaving a normalized naturalWidth and naturalHeight.
  (function($){
    var
    props = ['Width', 'Height'],
    prop;

    while (prop = props.pop()) {
    (function (natural, prop) {
      $.fn[natural] = (natural in new Image()) ? 
      function () {
      return this[0][natural];
      } : 
      function () {
      var 
      node = this[0],
      img,
      value;

      if (node.tagName.toLowerCase() === 'img') {
        img = new Image();
        img.src = node.src,
        value = img[prop];
      }
      return value;
      };
    }('natural' + prop, prop.toLowerCase()));
    }
  }(jQuery));
