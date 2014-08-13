/*global jQuery:false, NP:false, options:false */
/*jshint strict:false, devel:true */
 /**
  *     [Loader for 2D framework]
  *
  *      @example
  *     $(<target dom>).renderManager('id of window',{
  *         template : "<template name to be used>",
  *         data : {},
  *         callback: function(){
  *             //call function here
  *         }
  *     });
  *     
  */

(function($){
    $.fn.renderManager = function(id, params){
        var self = this;
        var smallAppsCount = jQuery('.smallApp').length;

        var methods = {
            // removes the requested 2D app from DOM
            clearSmallApp: function(){
                jQuery('.smallApp').eq(0).fadeOut(2000, function() {
                    $(this).remove();
                });
            },
            renderSmallApp: function(id, params){
                if(jQuery('.smallApp').get(0)){
                    $(self).load2DTemplate(params).css({
                        'display': 'block',
                        'position': 'absolute',
                        'top': smallAppsCount*100 + 'px',
                        'left': smallAppsCount*50 + 'px'
                    });
                }
                else
                {
                    $(self).load2DTemplate(params)
                        .css({'display': 'none'})
                        .fadeIn(500);
                }
            }
        };

            // check if the app already exists in DOM
        if(jQuery('#'+id).length){
            var parentElement = jQuery('#'+id);
            var parentElementId = jQuery(parentElement).attr('id');
            
                // rearrange apps to push target app on foreground.
            bringAppToForeground(parentElement);
            
                // app exists in DOM and is hidden because a 3D app was selected.
            if (jQuery(parentElement).hasClass('hidden')){
                jQuery(parentElement).removeClass('hidden');
            }

                // app exists in DOM but was minimized
            else if(jQuery(parentElement).hasClass('minimize')){
                
                //bringAppToForeground(parentElement);

                var prevHeight = jQuery(parentElement).attr('data-height');
                // var prevWidth = jQuery(parentElement).attr('data-width');
                var prevLeftLocation = jQuery(parentElement).attr('data-left');
                var prevTopLocation = jQuery(parentElement).attr('data-top');

                var minMaxTween = new TimelineMax();
            
                var tweenLength = 1;

                CSSPlugin.defaultTransformPerspective = 500;
                var opacitySlice = 0.3;
                minMaxTween.add("startPt", 0);
                minMaxTween.pause();
                var leftVal = prevLeftLocation;
                console.log("leftVal:"+leftVal);
                var topVal = prevTopLocation;
                console.log("topVal:"+topVal);
                minMaxTween.to($(parentElement), tweenLength*0.5, {rotationX:0, transformOrigin:"top center" , repeat: 1, yoyo: true} );
                minMaxTween.to($(parentElement), tweenLength, {left: leftVal,  ease:Power2.easeInOut}, 'startPt' );
                minMaxTween.to($(parentElement), tweenLength, {top: topVal}, 'startPt' );
                minMaxTween.to($(parentElement), tweenLength, {scale:1, ease:Power2.easeInOut}, 'startPt' );
                minMaxTween.to($(parentElement), tweenLength*opacitySlice, {opacity:1 }, opacitySlice*tweenLength );
                minMaxTween.play();

                //reduce it to previous size at previous location
                jQuery(parentElement)
                    .removeClass('minimize')
                    .attr({
                        'data-height': '',
                        'data-width': '',
                        'data-left': '',
                        'data-top': ''
                    });
            }
        }
            // app does not exits, render the app.
        else{
            methods.renderSmallApp(id, params);
        }
        window.history.pushState("object or string", "Title", '/index.html');
        return this;
    };
}(jQuery));

(function($){
    var handlebars_templates = {};

    $.fn.load2DTemplate = function(params){
        var end = false;

        // clears everything else previously in container
        //this.empty();  //not cleaning up anymore, will have to manage hide and show in code.

        // Extend default options with custom options
        options = $.extend({}, $.fn.load2DTemplate.dafaults, params);

        // Private methods of the plugin
        var methods = {
            // Get json data
            getData : function(){
                if(typeof options.data == "object"){
                        methods.renderData.call(this, options.data);
                }else{
                        var _this = this;
                        $.getJSON(options.data, function(data) {
                                methods.renderData.call(_this, data);
                        });
                }
            },
            // get final HTML and append to the element
            renderData: function(data){
                var html = handlebars_templates[options.template](data);
                //html = jQuery(html).draggable().resizable();
                //html = jQuery(html).find('.active').css('top', '300px');
                var min,
                o = jQuery('.wm-window'),
                group = $.makeArray($(o)).sort(function(a,b) {
                    return (parseInt($(a).css("zIndex"),10) || 0) - (parseInt($(b).css("zIndex"),10) || 0);
                });

                if (group.length) { 
                    $(html).css("zIndex", parseInt($(group[group.length-1]).css("zIndex"), 10) + 2);
                }
                this.append(html).each(options.callbackPerEach);
                methods.doCallback.call(this);
            },
            // Compile Handlebars Template
            compileTemplate : function(){
                var $template = $(options.template);
                if($template.length){
                    handlebars_templates[options.template] = Handlebars.compile(options.template);
                    methods.getData.call(this);
                }else{
                    var _this = this;
                    $.get(options.path+options.template+options.extension,function(results){
                            handlebars_templates[options.template] = Handlebars.compile(results);
                            methods.getData.call(_this);
                    });
                }
            },
            doCallback : function(){
                // Do the calback if necessary
                if(!end){
                    end = true;
                    if(options.callback){
                        options.callback.call(this);
                    }else if(typeof params == "function"){
                        params.call(this);
                    }
                }

            }
        };
        if (typeof handlebars_templates[options.template] == "function"){
            // If the template is preloaded data compiled
            methods.getData.call(this);
        }else{
            // If the themplate isn't compiled I compile
            methods.compileTemplate.call(this);
        }
        // returns the elements we have passed to the plugin
        // it allows you to chain multiple functions and plugins together on one jQuery element.
        return this;
    };

    $.fn.load2DTemplate.dafaults = {
        template : "template",
        data : "data.json",
        path : NP.config.templatePath(),
        extension : ".html",
        callback: $.noop,
        callbackPerEach: $.noop
    };
}(jQuery));