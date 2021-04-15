/**
 * @author Thiago.Honorato
 * @version 1.1.0
 * 
 * Notice
 */

(function($){
	
	'use strict';
	
	var Notice = function(message, options) {
		this.message = message;
		this.options = options;
		this.$wrapper;
		this.$container;
		
		this.init();
	};
	
	Notice.OPTIONS = {
			autoHide: true,
			autoHideDelay: 5000,
			autoHidePause: true,
			clickToHide: true,
			className: "success" // success|info|warn|error
	};
	
	Notice.prototype.init = function() {
		var that = this;
		
		if ( typeof this.options === "string" ) {
			that.options = { className: that.options };
		}
		
		that.options = $.extend({}, Notice.OPTIONS, that.options);
		
		// create notice wrapper
		that.$wrapper = $("#notice-wrapper");
		if ( that.$wrapper.length === 0 ) {
			that.$wrapper = $("<div id='notice-wrapper'></div>");
			$("body").append( that.$wrapper );
		}
		
		// create notice container
		that.$container = $("<div class='notice-container notice-" + that.options.className + "'></div>");
		if ( that.options.clickToHide === true )
			that.$container.append("<i class='notice-message-close fa fa-times'></i>");
		that.$container.append( that.getIcon() );
		that.$container.append("<div class='notice-message-text'>" + that.message + "</div>");
		
		// add new notice 
		that.$wrapper[isMobile() ? "append" : "prepend"]( that.$container );
		
		that.show();
		
		that.autoHide();
		that.autoHidePause();
		that.clickToHide();
	};
	
	Notice.prototype.show = function() {
		var that = this;
		
		isMobile() ? that.$container.addClass("notice-show") :
			that.$container.animate({
				"opacity": "1"
			}, 300, function(){});
	};
	
	Notice.prototype.hide = function() {
		var that = this;
		
		if (isMobile() ) {
			that.$container.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
				that.$container.remove();
			});
			that.$container.addClass("notice-hide");
		} else {
			that.$container.animate({
				"opacity": "0",
			}, 200, function(){
				
				$(this).animate({
					"height": "0"
				}, 500, function() {
					that.$container.remove();
				})
				
			})
		}
	};
	
	Notice.prototype.autoHide = function() {
		var that = this;
		
		if ( !that.options.autoHide ) {
			return;
		}
		
		that.timer = new Timer(() => {
			that.hide();
		}, that.options.autoHideDelay);
	};
	
	Notice.prototype.autoHidePause = function() {
		var that = this;
		
		if ( !that.options.autoHidePause || !that.options.autoHide ) {
			return;
		}
		
		that.$container.hover(function() {
			that.timer.pause();
		}, function() {
			that.timer.resume();
		});
	};
	
	Notice.prototype.clickToHide = function() {
		var that = this;
		
		if ( !isMobile() && !that.options.clickToHide ) {
			return;
		}
		
		isMobile() ? this.$container.on("click", $.proxy(function() {
			this.hide();
		}, this)) : this.$container.on("click", ".notice-message-close", $.proxy(function() {
			this.hide();
		}, this))
	};
	
	Notice.prototype.getIcon = function() {
		if ( this.options.className === "success" ) 
			return "<i class='notice-message-icon fa fa-check-circle'></i>";
		else if ( this.options.className === "info" ) 
			return "<i class='notice-message-icon fa fa-info-circle'></i>";
		else if ( this.options.className === "warn" ) 
			return "<i class='notice-message-icon fa fa-exclamation-triangle'></i>";
		else if ( this.options.className === "error" ) 
			return "<i class='notice-message-icon fa fa-exclamation-circle'></i>";
	};
	
	function isMobile() {
		return window.innerWidth < 768;
	}
	
	// https://gist.github.com/ncou/3a0a1f89c8e22416d0d607f621a948a9
	function Timer(callback, delay) {
	    var timerId, start, remaining = delay;

	    this.pause = function() {
	        window.clearTimeout(timerId);
	        remaining -= new Date() - start;
	    };

	    this.resume = function() {
	        start = new Date();
	        window.clearTimeout(timerId);
	        timerId = window.setTimeout(callback, remaining);
	    };

	    this.resume();
	}
	
	
	
	var NoticePlugin = function(message, options) {
		return new Notice(message, options);
	}
	
	$.notice             = NoticePlugin;
	$.notice.Constructor = Notice;
	
})(jQuery);