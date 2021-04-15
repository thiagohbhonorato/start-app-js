
(function($){
	"use strict";
	
	$.fn.inputSwitch = function(option) {
		var args = Array.prototype.slice.call(arguments, 1);
		
		this.each(function(i, _element) {
			var $el = $(_element),
				options = $.extend({}, InputSwitch.DEFAULTS, $el.data(), typeof option === 'object' && option),
				inputSwitch = $el.data('inputSwitch'),
				value;
			
			if ( typeof option === "string" ) { // method
				
				if ($.inArray(option, allowedMethods) < 0) {
                    throw new Error("Unknown method: " + option);
                }
				
				if (!inputSwitch) {
                    return;
                }
				
                value = inputSwitch[option].apply(inputSwitch, args);
				
			} 
			// new instance
			else if ( !inputSwitch ) {
				inputSwitch = new InputSwitch($el, options);
				$el.data('inputSwitch', inputSwitch);
			}
		});
		
		return typeof value === 'undefined' ? this : value;
	};
	
	var InputSwitch = function ($el, options) {
		this.options = options;
        this.$el = $el;
		this.init();
	};
	
	InputSwitch.DEFAULTS = {
		name: "",
		value: false,
		label: undefined,
		labelPosition: "before", // after|before
		display: "block", //block|inline
		
		onChange: function(bool) {
			
		}
	};
	
	InputSwitch.EVENTS = {
            'change.bs.inputSwitch': 'onChange'
    };
	
	var allowedMethods = [
		"value"
	];
	
	InputSwitch.prototype.init = function() {
		this.$el
			.addClass("input-switch-container")
			.addClass("label-position-"+this.options.labelPosition)
			.addClass("display-"+this.options.display);
		
		this.$switch = $("<a/>", {"href":"#","class":"input-switch"})
						.append( $("<div/>", {"class":"input-switch-handle"}).append("<span class='input-switch-focus'>") )
						.append( $("<input/>", {"type":"text","name":this.options.name,"value":String(this.options.value)}) )
						.appendTo( this.$el )
						[this.options.labelPosition]( $("<label/>").text( this.options.label || "" ) );
		
		this.$input = this.$switch.find("input");
		
		this.options.value && this.$switch.addClass("on");
		
		this.events();
	};
	
	InputSwitch.prototype.events = function() {
		var that = this;
		
		this.$el.on("click",$.proxy(function(e) {
			e.preventDefault();
			this.$switch.focus();
			var bool = this.$input.val() !== "true";
			this.$input.val( String(bool) );
		}, this));
		
		$(document).off("change", ".input-switch-container input")
					.on("change", ".input-switch-container input", function(e){
			e.preventDefault();
			$(this).parents(".input-switch-container").data("inputSwitch").change();
		});
	};
	
	InputSwitch.prototype.change = function() {
		var bool = this.$input.val() === "true";
		if (bool) this.$switch.addClass("on"); else this.$switch.removeClass("on");
		$.extend(this.options, {value: bool});
		this.trigger("change", bool);
	};
	
	InputSwitch.prototype.value = function( bool ) {
		this.$input.val( String(bool) );
	};
	
	InputSwitch.prototype.trigger = function (name) {
        var args = Array.prototype.slice.call(arguments, 1);
        name += '.bs.inputSwitch';
        this.options[InputSwitch.EVENTS[name]].apply(this.options, args);
        this.$el.trigger($.Event(name), args);
    };
	
})(jQuery);