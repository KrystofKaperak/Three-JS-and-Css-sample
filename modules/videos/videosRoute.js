/*global $:false, NP: false */
/*jshint strict:false, devel:true */

'use strict';
var videosRoute = {
    '/videos': {
        on: function() {
            console.log('Videos  is called ');
        },
        once: function() {
            function initVideos(){
                var accountId = NP.user.accountId();
                var height = NP.config.screenHeight();
                var width = NP.config.screenWidth();

                var videosApp = new NP.module.videos(accountId, height, width);

                videosApp.init();
                console.log('initiated' + accountId + ' __ ' + height + ' __ ' + width);
            }
            $("#appContainer").loadFromTemplate({
                template : "videos",
                data : {},
                callback: initVideos
            });
        },
        before: function() {
            console.log(' Videos template initiated');
        },
        after: function() {
            console.log('Videos once is called ones');
        }
    }
};

var videosRoute = Router(videosRoute);
videosRoute.init();