/*global $:false, Router:false, bringAppToForeground: false */
/*jshint strict:false, devel:true */

var listener = function() { 
      console.log("Listener at: " + window.location); 
    };

var routes = {
	'/numerics': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa6865',{
			template : "numerics",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						        //$(this).find('.wm-window-title').css({height: 0});
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
					    resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa6865').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa6865');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa6865');
				var appendedDOM = $('#52ab89690baa46c9ebfa6865');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/scripts': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa6867',{
			template : "scripts",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
					    drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
						// cursor: "move",
						// cursorAt: { top: 10, left: 100 }
						//containment: "parent"
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
					    resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa6867').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa6867');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa6867');
				var appendedDOM = $('#52ab89690baa46c9ebfa6867');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/converter': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa6868',{
			template : "converter",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
						// cursor: "move",
						// cursorAt: { top: 10, left: 100 }
						//containment: "parent"
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa6868').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa6868');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa6868');
				var appendedDOM = $('#52ab89690baa46c9ebfa6868');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/balsamiq': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa6869',{
			template : "balsamiq",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
						// cursor: "move",
						// cursorAt: { top: 10, left: 100 }
						//containment: "parent"
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa6869').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa6869');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa6869');
				var appendedDOM = $('#52ab89690baa46c9ebfa6869');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/everytimezone': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa6860',{
			template : "everytimezone",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa6860').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa6860');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa6860');
				var appendedDOM = $('#52ab89690baa46c9ebfa6860');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/thinkery': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa6861',{
			template : "thinkery",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa6861').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa6861');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa6861');
				var appendedDOM = $('#52ab89690baa46c9ebfa6861');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/pixlr': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa686a',{
			template : "pixlr",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa686a').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa686a');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa686a');
				var appendedDOM = $('#52ab89690baa46c9ebfa686a');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/dotomorrow': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa686b',{
			template : "dotomorrow",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa686b').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa686b');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa686b');
				var appendedDOM = $('#52ab89690baa46c9ebfa686b');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/gett': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa686d',{
			template : "gett",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa686d').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa686d');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa686d');
				var appendedDOM = $('#52ab89690baa46c9ebfa686d');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/getflow': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa686e',{
			template : "getflow",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa686e').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa686e');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa686e');
				var appendedDOM = $('#52ab89690baa46c9ebfa686e');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/audiotool': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa686f',{
			template : "audiotool",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa686f').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa686f');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa686f');
				var appendedDOM = $('#52ab89690baa46c9ebfa686f');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/plusim': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa6889',{
			template : "plusim",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa6889').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa6889');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa6889');
				var appendedDOM = $('#52ab89690baa46c9ebfa6889');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/feedly': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa688c',{
			template : "feedly",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa688c').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa688c');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa688c');
				var appendedDOM = $('#52ab89690baa46c9ebfa688c');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/giflike': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa68d4',{
			template : "giflike",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa68d4').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa68d4');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa68d4');
				var appendedDOM = $('#52ab89690baa46c9ebfa68d4');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/markable': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa6859',{
			template : "markable",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa6859').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa6859');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa6859');
				var appendedDOM = $('#52ab89690baa46c9ebfa6859');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/blisscontrol': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa6870',{
			template : "blisscontrol",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
				$('#52ab89690baa46c9ebfa6870').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa6870');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa6870');
				var appendedDOM = $('#52ab89690baa46c9ebfa6870');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/titanpad': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa6888',{
			template : "titanpad",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
		        $('#52ab89690baa46c9ebfa6888 iframe').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa6888');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa6888');
				var appendedDOM = $('#52ab89690baa46c9ebfa6888');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/pdfzen': function() {
		$("#appContainer").renderManager('52ab89690baa46c9ebfa688a',{
			template : "pdfzen",
			data : {},
			callback: function(){
				$( "#appContainer .wm-window" )
					.draggable({ 
						stack: "#appContainer .wm-window",
						start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						drag: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    },
						iframeFix: true
					})
		            .resizable({
								start: function(){
						        $(this).animate({
									opacity: '0.5'
						        }, 300);
						        $('iframe').css('pointer-events', 'none');
						    },
						resize: function(){
								$(this).find('.wm-window-title').css({opacity: 1});
							},
						stop: function(){
						        $(this).animate({
									opacity: '1'
						        }, 300);
						        $('iframe').css('pointer-events', 'all');
						    }
						});
		        $('#52ab89690baa46c9ebfa688a iframe').iframeTracker({
			        blurCallback: function(){
			            var appendedDOM = $('#52ab89690baa46c9ebfa688a');
			            console.log('pdfzen');
						bringAppToForeground(appendedDOM);
			        }
			    });
				footerCubes.makeCubeSpin('52ab89690baa46c9ebfa688a');
				var appendedDOM = $('#52ab89690baa46c9ebfa688a');
				bringAppToForeground(appendedDOM);
	        }
		}).addClass('done');
	},
	'/': {
		on: function() {
			$("#appContainer").loadFromTemplate({
					template : "search",
					data : {}
				}).addClass('done');

		    var accountId = NP.user.accountId();
		    var height = NP.config.screenHeight();
		    var width = NP.config.screenWidth();
		    
		    var searchApp = new NP.module.search(accountId, height, width);

	        searchApp.init();
	        console.log('initiated' + accountId + ' __ ' + height + ' __ ' + width);
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
	}
};
 
var router = Router(routes);
router.configure({ after: listener });
router.init();
