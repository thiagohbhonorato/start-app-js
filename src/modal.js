/**
 * @author Thiago.Honorato
 * @version 1.1
 * 
 * Bootstrap Utils (Bootstrap v3.3.7 (https://getbootstrap.com))
 * 
 * by TNT Technology
 */
(function($){
	'use strict';
	
	// MODAL CUSTOM
	// =========================================================================================================================
	
	(function() {
		
		var Modal = $.fn.modal.Constructor,
		    _show = Modal.prototype.show,
		    _hide = Modal.prototype.hide,
		    _hideModal = Modal.prototype.hideModal;
		
		Modal.MAXIMIZE_MARGIN = {
				"top":"5px",
				"right": "5px",
				"bottom": "5px",
				"left":"5px"
		};
		Modal.zIndex = 1040;
		Modal.seqShow = 0; 
		
		$.extend(Modal.DEFAULTS, {
			"draggable": true,
			"maximize": true,
			"autoFocus": true,
			
			"onShow": function() {
				
			},
			"onShown": function() {
				
			},
			
			"onHide": function() {
				
			},
			"onHidden": function() {
				
			},
			
			"onEscape": function() { 
				
			},
			
			"onMaximizeChange": function(/*Boolean*/ isMaximize) {
				// code
			},
			"onMaximizeChanged": function(/*Boolean*/ isMaximize) {
				// code
			},
	
			"onMaximize": function() {
				// code
			},
			"onMaximized": function() {
				// code
			},
	
			"onMinimize": function() {
				// code
			},
			"onMinimized": function() {
				// code
			},
			
		});
		
		Modal.EVENTS = {
	            'escape.bs.modal'          : 'onEscape',          // Dispara quando pressionado a tecla ESC
	            'show.bs.modal'            : 'onShow',            // 
	            'shown.bs.modal'           : 'onShown',            // 
	            'hide.bs.modal'            : 'onHide',            // 
	            'hidden.bs.modal'          : 'onHidden',          // 
				
	            'maximize-change.bs.modal' : 'onMaximizeChange',  // Este evento é disparado imediatamente quando o método de maximizar ou minimizar for chamado.
	            'maximize-changed.bs.modal': 'onMaximizeChanged', // Este evento é disparado quando o modal foi maximizado ou minimizado (aguardará a conclusão das transições CSS).
	            'maximize.bs.modal'        : 'onMaximize',        // Este evento é disparado imediatamente quando o método de maximizar for chamado.
	            'maximized.bs.modal'       : 'onMaximized',       // Este evento é disparado quando o modal foi maximizado (aguardará a conclusão das transições CSS).
	            'minimize.bs.modal'        : 'onMinimize',        // Este evento é disparado imediatamente quando o método de minimizar for chamado.
	            'minimized.bs.modal'       : 'onMinimized'        // Este evento é disparado quando o modal foi minimizar (aguardará a conclusão das transições CSS).
	    }
		
		var allowedMethods = [
	    	"show",
	    	"hide",
	    	"showLoading",
	    	"hideLoading"
		];
		
		Modal.prototype.show = function () {
			var that = this;
			
			that.draggable();
			that.maximize();
			that.adjustModal();
			that.adjustFocusField();
			that.loading();
			
			// reajusta a altura do modal na janela caso mude de tamanho
			function resize() { if ( that.isShown ) that.adjustModal(); }
			$(window).off("resize", resize).on("resize", resize);
			
			this.trigger2("show");
			
			_show.apply(this, Array.prototype.slice.apply(arguments));
			
			if ( !that.options.backdrop ) {
				that.$backdrop = $("<div></div>").addClass("modal-backdrop fade").appendTo("BODY");
				that.$backdrop.addClass("in");
			}
			
			// define o z-index para cada modal, para um fica sobre o outro
			that.$backdrop.css("zIndex", Modal.zIndex++);
			that.$element.css("zIndex", Modal.zIndex++);
			
			// define a sequência em que cada modal é aberto
			that.$element.attr("data-seqshow", Modal.seqShow++);
			
			//this.backdrop(function () {
			//	that.trigger2('shown');
			//})
		}
		
		Modal.prototype.hide = function (e) {
			var that = this;
			
			this.trigger2("hide");
			
			_hide.apply(this, Array.prototype.slice.apply(arguments));
		}
		
		Modal.prototype.hideModal = function () {
			var that = this;
			
			_hideModal.apply(this, Array.prototype.slice.apply(arguments));
			
			this.backdrop(function () {
				that.trigger2('hidden');
			})
			
			// define o foco no modal anterior ao que foi fechado
			if ( !that.isShown ) { 
				Modal.seqShow--;
				that.$element.removeAttr("data-seqshow");
				$(".modal[data-seqshow='"+ (Modal.seqShow-1) +"']").focus();
			}
			
			// Se ainda existir um modal aberto, adiciona a classe modal-open
			if ( $(".modal:visible").length > 0 ) { 
				if ( that.options.backdrop ) {
					that.$backdrop.one("bsTransitionEnd", function() {
						that.$body.addClass('modal-open');
					});
				} else {
					that.$body.addClass('modal-open');
				}
			}
		}
		
		Modal.prototype.draggable = function () {
			var that = this;
			
			if ( !that.options.draggable )
				return;
			
			that.$dialog.draggable({handle:".modal-header"});
			that.$dialog.draggable("enable");
			that.$dialog.css({"top":"","left":""}); // ao abrir volta para a posição original
		}
		
		Modal.prototype.adjustModal = function () {
			var that = this;
			
			if ( that.isMobile() ) // não habilita para mobile
				return;
			
			that.$element.show(); // Necessário para que o innerHeight funcione corretamente
			that.$dialog.find(".modal-body").css("maxHeight",""); // Volta a altura original
			that.$dialog.find(".modal-body").css("height","");    // Volta a altura original
			
			var $header = that.$dialog.find(".modal-header"),
			    $footer = that.$dialog.find(".modal-footer");
			
			var marginT = parseInt( that.$dialog.css("marginTop") ) || Number(0),
			    windowH = window.innerHeight,
			    hHeader = ($header.innerHeight() + parseInt( $header.css("borderTopWidth") ) + parseInt( $header.css("borderBottomWidth") ) ) || Number(0),
			    hFooter = ($footer.innerHeight() + parseInt( $footer.css("borderTopWidth") ) + parseInt( $footer.css("borderBottomWidth") ) ) || Number(0);
			
			var maxHeight = (windowH - (hHeader + hFooter + marginT + 7));
			
			var style = {
				"maxHeight" : maxHeight  + "px"
			};
			
			if (that.isMaximized() ) {
				that.$dialog.css({
					"top": Modal.MAXIMIZE_MARGIN.top,
					"right": Modal.MAXIMIZE_MARGIN.right,
					"bottom": Modal.MAXIMIZE_MARGIN.bottom,
					"left": Modal.MAXIMIZE_MARGIN.left
				});
				
				$.extend(style, { "height" : maxHeight  + "px" });
			}
			
			that.$dialog.find(".modal-body").css(style); // Define a altura do body
		}
		
		Modal.prototype.maximize = function() {
			var that = this;
			
			if ( !that.options.maximize )
				return;
			
			if ( that.isMobile() ) // não habilita o maximizar para mobile
				return;
			
			if ( that.$dialog.hasClass("modal-sm") ) // se for um modal pequeno, não habilita o maximizar (por exemplo, um modal de confirmação de exclusão)
				return;
			
			if ( !that.$dialog.hasClass("modal-maximize") ) {
				that.$dialog.addClass("modal-maximize");
				
				var $head = that.$dialog.find(".modal-header"),
				    $title = $head.find(".modal-title").remove(),
				    $maximize = $("<button type='button' class='maximize' aria-label='Maximize'><i class='material-icons'></i></button>");
				
				$head.append($maximize);
				$head.append($title);
				
				$head.off("dblclick").on("dblclick", function(e){ maximize(e) });
				$maximize.off("click").on("click", function(e){ maximize(e) });
				
				var maximize = function (e) {
					that.$dialog.toggleClass("maximized");
					
					var isMaximized = that.$dialog.hasClass("maximized");
					
					that.trigger("maximize-change", isMaximized);
					
					if ( isMaximized ) {
						
						that.trigger("maximize");
						
						if ( that.options.draggable ) 
							that.$dialog.draggable("disable"); // desabilita o draggable quando está maximizado
						
						that.POSITION = that.$dialog.offset(); // guarda a posição atual
						that.$dialog.css({
							"top": Modal.MAXIMIZE_MARGIN.top,
							"right": Modal.MAXIMIZE_MARGIN.right,
							"bottom": Modal.MAXIMIZE_MARGIN.bottom,
							"left": Modal.MAXIMIZE_MARGIN.left
						});
						
						that.adjustModal(); // ajusta o tamanho do modal
						
						that.trigger("maximized");
						
					} else {
						
						that.trigger("minimize");
						
						if ( that.options.draggable ) 
							that.$dialog.draggable("enable"); // habilita novamente o draggable
						
						var top  = (that.POSITION.top - $(window).scrollTop()) + "px",
							left = (that.POSITION.left - $(window).scrollLeft()) + "px";
						
						that.$dialog.css({ // volta a posição anterior
							"top":top,
							"right": "",
							"bottom": "",
							"left":left
						}); 
						
						that.adjustModal(); // ajusta o tamanho do modal
						
						that.trigger("minimized");
					}
					
					that.trigger("maximize-changed", isMaximized);
				}
			}
		}
		
		Modal.prototype.adjustFocusField = function() {
			var that = this;
			
			if ( !that.options.autoFocus )
				return;
			
			that.$element
				.off("shown.bs.modal", adjustFocus)
				.on("shown.bs.modal", adjustFocus);
			
			function adjustFocus() {
				var transition = $.support.transition && that.$element.hasClass('fade')
				
				transition ?
					that.$dialog.one('bsTransitionEnd', function () {
						focus();
					}).emulateTransitionEnd(Modal.TRANSITION_DURATION) : focus();
					
				var focus = function() {
					that.$element.find(".modal-body").find("[name]:not([disabled]):not([readonly]):visible").first().focus();
				}
			}
		}
		
		Modal.prototype.escape = function () {
			if (this.isShown && this.options.keyboard) {
				this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
					if ( e.which == 27 ) {
						this.hide();
						this.trigger("escape");
					}
				}, this))
			} else if (!this.isShown) {
				this.$element.off('keydown.dismiss.bs.modal')
			}
		}
		
		Modal.prototype.loading = function () {
			var that = this;
			
			if ( that.$loading )
				return;
			
			that.$loading = $("" +
					"<div class='modal-loading-progress-widget'>" +
					"	<div class='modal-loading-progress-bar mlp-bar1 progressbar'></div>" +
					"	<div class='modal-loading-progress-bar mlp-bar2 bufferbar'></div>" +
					"	<div class='modal-loading-progress-bar mlp-bar3 auxbar'></div>" +
					"</div>");
			that.$dialog.find(".modal-body").eq(0).prepend( that.$loading );
		}
		
		Modal.prototype.showLoading = function () {
			this.$loading.addClass("show");
		}
		
		Modal.prototype.hideLoading = function () {
			this.$loading.removeClass("show");
		}
		
		Modal.prototype.isMaximized = function() {
			return this.$dialog.hasClass("maximized");
		}
		
		Modal.prototype.isMobile = function() {
			return window.innerWidth < 768;
		}
		
		Modal.prototype.trigger = function (name) {
	        var args = Array.prototype.slice.call(arguments, 1);
	
	        name += '.bs.modal';
	        this.options[Modal.EVENTS[name]].apply(this.options, args);
	        this.$element.trigger($.Event(name), args);
	    }
		
		Modal.prototype.trigger2 = function (name) {
	        var args = Array.prototype.slice.call(arguments, 1);
	
	        name += '.bs.modal';
	        this.options[Modal.EVENTS[name]].apply(this.options, args);
	    }
	
	})();
	
	// DIALOG CUSTOM
	// =========================================================================================================================
	
	(function() {
		
		var DialogPlugin = function(settings) {
			return new Dialog(settings);
		}
		
		var Dialog = function(options) {
			this.options = $.extend({}, Dialog.DEFAULTS, options);
			
			this.init();
		}
		
		Dialog.DEFAULTS = {
				"title": undefined,
				"message": undefined,
				"classes": "modal-sm",
				"autoDestroy": true,
				"data": {}, // Options Modal
				"buttons": [] // BUTTON_DEFAULS
		}
		
		Dialog.MODAL_DEFAULTS = {
				"backdrop": true,
				"keyboard": true,
				"show": true,
				"remote": false,
				"maximize": false,
				"draggable": true,
				"autoFocus": true
		}
		
		Dialog.BUTTON_DEFAULS = {
				"text": undefined,
				"loadingText": undefined,
				"classes": "btn-default",
				"close": true,
				"focus": false,
				"fn": function(event, $btn, dialog) {
					// code
				}
		}
		
		Dialog.prototype.init = function() {
			this.$modal   = $("<div class='modal fade' tabindex='-1' role='dialog'></div>");
			this.$dialog  = $("<div class='modal-dialog' role='document'></div>");
			this.$content = $("<div class='modal-content'></div>");
			this.$header  = $("<div class='modal-header'></div>");
			this.$body    = $("<div class='modal-body'></div>");
			this.$footer  = $("<div class='modal-footer'></div>");
			
			this.initDialog();
			this.initEvents();
		}
		
		Dialog.prototype.initDialog = function() {
			this.$modal.append( this.$dialog );
			this.$dialog.append( this.$content );
			this.$content.append( this.$header );
			this.$content.append( this.$body );
			this.$content.append( this.$footer );
			
			this.$modal.data( $.extend({}, Dialog.MODAL_DEFAULTS, typeof this.options.data === "object" && this.options.data) );
			
			if ( this.options.classes ) 
				this.$dialog.addClass( this.options.classes );
			
			this.$header.append( "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" );
			
			if ( this.options.title ) 
				this.$header.append( "<h4 class='modal-title'>" + this.options.title + "</h4>" );
			
			if ( this.options.message ) {
				var $p = $("<p></p>");
				$p.html( this.options.message );
				this.$body.append( $p );
			}
			
			this.initButtons();
			
			$("body").append( this.$modal );
			
			this.show();
		}
		
		Dialog.prototype.initEvents = function() {
			var that = this;
			
			this.$modal.on("hidden.bs.modal", function() {
				that.destroy();
			});
		}
		
		Dialog.prototype.initButtons = function() {
			var that = this;
			
			if ( !this.options.buttons )
				return;
				
			$.each(this.options.buttons, function() {
				var button = this;
				var options = $.extend({}, Dialog.BUTTON_DEFAULS, this);
				
				var $button = $("<button type='button'></button>");
				
				if ( options.text )
					$button.text( options.text );
				
				if ( options.loadingText )
					$button.data("loading-text", options.loadingText);
				
				if ( options.classes )
					$button.addClass("btn " + options.classes);
				
				if ( button.fn ) {
					$button.on("click", function(e){
						button.fn.call( button.fn, e, $(this), that );
					});
				}
				
				if ( options.close == true )
					$button.attr("data-dismiss", "modal");
				
				if ( options.focus == true )
					$button.attr("data-focus", "true");
				
				button.$el = $button;
				
				that.$footer.append( $button );
			});
		}
		
		Dialog.prototype.show = function() {
			this.$modal.modal("show");
		}
		
		Dialog.prototype.hide = function() {
			this.$modal.modal("hide");
		}
		
		Dialog.prototype.destroy = function() {
			if ( !this.options.autoDestroy )
				return;
			
			this.$modal.remove();
		}
		
		$.dialog             = DialogPlugin;
		$.dialog.Constructor = Dialog;
	
	})();
	
})(jQuery);