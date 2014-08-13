 /*global jQuery:false, NP:false, options:false */
/*jshint strict:false, devel:true */
 /**
  *     [loadFromTemplate loads content from Handlebars template]
  *
  *      @example
  *      $jQueryElement.loadFromTemplate({
  *             template : "templateName",
  *             data : "dataCollection.json"
  *      });
  *     
  *     @example with custom template path and extension
  *     $.fn.loadFromTemplate.dafaults.path = "tmp/";
  *     $.fn.loadFromTemplate.dafaults.extension = ".tmp";
  *     $jQueryElement.loadFromTemplate({
  *         template : "templateName",
  *         data : "dataCollection.json"
  *     });
  */

(function($){
    var handlebars_templates = {};

    $.fn.loadFromTemplate = function(params){
        var end = false;

        // clears everything else previously in container
        this.empty();  //not cleaning up anymore, will have to manage hide and show in code.

        // Extend default options with custom options
        options = $.extend({}, $.fn.loadFromTemplate.dafaults, params);

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

    $.fn.loadFromTemplate.dafaults = {
        template : "template",
        data : "data.json",
        path : NP.config.templatePath(),
        extension : ".html",
        callback: $.noop,
        callbackPerEach: $.noop
    };
}(jQuery));
