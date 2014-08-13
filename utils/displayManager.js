/*global jQuery:false, NP:false, options:false */
/*jshint strict:false, devel:true */
 /**
  *     [used to load FullScreen3D Apps]
  *
  *      @example
  *      $(<target dom element>).displayManager('id of app',{
  *             template : "template name",
  *             data : {},
  *             callback: some callback function
  *         });
  *     
  */

(function($){
    $.fn.displayManager = function(id, params){
        var self = this;
        var fullscreenAppsCount = jQuery('.fullscreenApp').length;

        $('.wm-window.active').addClass('hidden');

        var methods = {
            // removes the requested 3D app from DOM
            clearFullScreenApp: function(){
                jQuery('.fullscreenApp').eq(0).remove();
            },
            renderFullScreenApp: function(id, params){
                if(jQuery('.fullscreenApp').get(0)){
                    jQuery('.fullscreenApp').last().css({'display': 'none'});
                    if(jQuery('#'+id).length){
                        jQuery('#'+id).css({'display': 'block'});
                    }
                    else {
                        $(self).loadFullScreenTemplate(params);
                    }
                }
                else
                {
                    $(self).loadFullScreenTemplate(params)
                        .css({'display': 'none'})
                        .fadeIn(500);
                }
            }
        };

        if(fullscreenAppsCount < 3){
            methods.renderFullScreenApp(id, params);
        }
        else {
            // FIFO to clear the stuff. Behavioral patterns to come here
            methods.clearFullScreenApp.call(this);
            methods.renderFullScreenApp(params);
        }
        
        window.history.pushState("object or string", "Title", '/index.html');
    };
}(jQuery));

(function($){
    var handlebars_templates = {};

    $.fn.loadFullScreenTemplate = function(params){
        var end = false;

        // clears everything else previously in container
        //this.empty();  //not cleaning up anymore, will have to manage hide and show in code.

        // Extend default options with custom options
        options = $.extend({}, $.fn.loadFullScreenTemplate.dafaults, params);

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

    $.fn.loadFullScreenTemplate.dafaults = {
        template : "template",
        data : "data.json",
        path : NP.config.templatePath(),
        extension : ".html",
        callback: $.noop,
        callbackPerEach: $.noop
    };
}(jQuery));