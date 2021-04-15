/**
 * Funções para formulário.
 * 
 * Esse arquivo possui as seguintes funções:
 * 
 * 		- reset		    - Apaga os dados do formulário.
 * 		- formLoad	    - Carrega os campos do formulário.
 * 		- formValid	    - Verifica se os campos obrigatório do formulário foram preenchidos.
 * 		- formJSON	    - Retorna os campos do formulário em JSON (Atributos de cada campo).
 * 		- serializeJSON - Retorna os campos do formulário em JSON (nome e valor).
 * 		- formData	    - Retorna os campos do formulário em Array.
 *		- formFocus     - 
 * 		- field		    - Seleciona um campo do formulário.
 */
(function($){
	"use strict";
	
	/** 
	 * @name Form Reset
	 * 
	 * @description Semelhante a document.getElementById("form").reset()
	 * 
	 * @note Campos que são hidden e required o valor não é apagado, o mesmo acontece com campo readOnly e disabled.
	 * 
	 * @param force TRUE para forçar os campos a serem apagados, no caso de hidden.
	 -------------------------------------------------------------------------------------------------------------- */
	$.fn.reset = function(force) {
		var that = this;
		
		if ( that.prop( 'tagName' ) != "FORM" ) {
        	console.error( 'É esperado o elemento form' );
        	return;
        }
		
		that.each(function() { // percorre todos os formulários
			var form = this;
			var data = $(form).formData(); // recupera os campos do formulário
			form.reset(); // Limpa o formulário
			
			$.each(data, function() { // percorre os campos
				
				if ( force === true ) { // força os campos a ficarem vazios
					
					if ( this.element.type === "hidden" ) { // se o campo for oculto
						$(this.element).val( "" );
					}
					
				} else { // retorna o valor dos campos de acordo com o tipo
					
					if ( this.element.type === "hidden" ) { // se o campo for oculto
						if ( this.required ) $(this.element).val( this.value ); // se for required, retorna o valor ao campo
						else $(this.element).val( "" ); // se NÃO for required, limpa o valor do campo
					} else if ( this.readOnly || this.disabled ) { // se for apenas um campo para visualização
						$(this.element).val( this.value ); // retorna o valor ao campo
					}
					
				}
			});
			
			$(form).find("[name]").trigger("change"); // dispara o evento change
			$(form).find("[name]").removeClass("has-error"); // remove a classe has-error, caso o formulário foi validado ($.formValid)
			$(form).formFocus(); // move o foco para o primeiro campo do formulário
		});
	}
	
	/**
	 * @name Form Load
	 * 
	 * @description Preenche o formulário de acordo com o JSON, onde o name do elemento deve coincidir com o nome do parâmetro do JSON recebido, e assim o valor é inserido.
	 * 
	 * 				Checkbox é esperado booleano no objeto, e isso indica se deve ficar checked ou não.
	 * 				Radio é esperado que o valor no objeto recebido seja o value da opção a ser selecionada.
	 * 
	 * @param json Estrutura JSON para carregar o formulário
	 * @param reset TRUE para apagar os dados do formulário antes de carregá-lo. 
	 --------------------------------------------------------------------------------------------------------------------------------------------------------- */
	$.fn.formLoad = function(json, reset) {
		
		if ( this.prop( 'tagName' ) != "FORM" ) {
        	console.error( 'É esperado o elemento form' );
        	return false;
        }
		
		if ( typeof json === "undefined" || json == null || arguments.length == 0) {
			console.error("Informe um JSON válido");
			return false;
		}
		
		return this.each(function() {
			var $form = $( this );
			
			if ( reset === true ) {
				$form.reset();
				$form.find("label[data-name]").html("");
			}
			
			$( this.elements ).each( function ( ) {
				if ( ! this.name.length ) return;
				if ( json[ this.name ] == undefined ) return;
				if ( "checkbox" == this.type ) {
					$form.find( 'input[name="' + this.name + '"]' ).prop( "checked", json[ this.name ] );
				} else if ( "radio" == this.type ) {
					$form.find( 'input[name="' + this.name + '"]' ).prop( "checked", false );
					$form.find( 'input[name="' + this.name + '"][value="' + json[ this.name ] + '"]' ).prop( "checked", true );
				} else {
					$( this ).val( json[ this.name ] );
				}
			});
			
			$form.find("label[data-name]").each(function(){
				$(this).html( json[ $(this).data("name") ] );
			});
		});
	}
	
	/**
	 * @name Form Valid
	 * 
	 * @description Verifica se todos os campos obrigatórios foram preenchidos
	 * 
	 * @return Boolean
	 ------------------------------------------------------------ */
	$.fn.formValid = function() {
		var that = this;
		var empty = [];
		
		if ( that.prop( 'tagName' ) != "FORM" ) {
        	console.error( 'É esperado o elemento form' );
        	return false;
        }
		
		var fields = that.formData();
		for (var i = 0; i < fields.length; i++) {
			var field = fields[i];
			
			if ( field.required 				// Preenchimento obrigatório
					&& !field.value 			// Campo vazio
					&& field.type !== "hidden" 	// Não é invisível (exceção)
					&& !field.disabled 			// Não está desabilitado (exceção)
					&& !field.readOnly 			// Não é apenas para visualização (exceção)
					) {
				
				$(field.element).addClass("has-error");
				empty.push(field);
			} else {
				$(field.element).removeClass("has-error");
			}
		}
		
		if ( empty.length > 0 ) {
			$.notice("Campos obrigatórios não foram preenchidos","warn");
			console.warn("Campos obrigatórios não foram preenchidos");
			console.warn(empty);
		}
		
		return !(empty.length > 0);
	}
	
	/**
	 * @name Form JSON
	 * 
	 * @description Retorna um JSON dos campos do formulário.
	 * 
	 * @return JSON
	 ------------------------------------------- */
	$.fn.formJSON = function() {
		var data = $(this).formData(),
		    json = '{',
		    virg = '';
		
		for (var i in data) {
			json += virg + '"' + data[i].name + '":{}';
			virg = ',';
		}
		json = JSON.parse(json + '}');
		for (var i in data) {
			$.extend( json[ data[i].name ], data[i] );
		}
		return json;
	}
	
	/**
	 * @name Serialize JSON
	 * 
	 * @description Retorna um objeto JSON com os nomes dos inputs e o valor
	 */
	$.fn.serializeJSON = function() {
		var array = $(this).serializeArray(),
			json = {};
		for (var i = 0; i < array.length; i++) {
			var value = array[i]["value"];
			if ( $.inArray(value, ["true","false"]) > -1 ) {
				value = JSON.parse(value);
			}
			json[ array[i]["name"] ] = value;
		}
		return json;
	}
	
	/**
	 * @name Form Data
	 * 
	 * @description Retorna um Array dos campos do formulário.
	 * 
	 * @return Array
	-------------------------------------------- */
	$.fn.formData = function() {
		var that = this;
		var data = [];
		
		if ( that.prop( 'tagName' ) != "FORM" ) {
        	console.error( 'É esperado o elemento form' );
        	return;
        }
		
		if ( that.length > 1 ) {
			console.warn( 'É recomendável utilizar apenas um form no seletor' );
		}
		
		var elements = $(that).find("[name]");
		for (var e = 0; e < elements.length; e++) {
			var element = elements[e];
			
			var value = element.value || null,
			    el = element;
			if ( element.type == "radio" ) {
				value = null;
				el = $(that).find("[name='"+element.name+"']").toArray();
			} else if ( element.type == "checkbox" ) {
				value = element.checked;
			}
			
			var field = {
					element: el,
					type: element.type,
					name: element.name,
					value: value,
					required: element.required || false,
					readOnly: element.readOnly || false,
					disabled: element.disabled || false
			};
			
			if ( element.type == "radio" ) {
				var achou = false;
				for ( var d in data ) { // percorre o array para ver se já existe
					if ( data[d].name == element.name) {
						if ( element.checked ) { $.extend(data[d], {value: element.value}); }
						achou = true; break;
					}
				}
				if ( !achou ) {
					if ( element.checked ) { $.extend(field, {value: element.value}); }
					data.push(field); 
				}
			} else {
				data.push(field);
			}
		}

		return data; // Retorna um array com todos os campos dos forms
	}
	
	/**
	 * @name Form Focus
	 * 
	 * @description Ajusta o foco para um campo do formulário.
	 * 
	 * @param Nome do campo [atributo name] Se o parâmetro for omitido, o foco será no primeiro campo do formulário.
	 */
	$.fn.formFocus = function(name) {
		
		if ( this.prop( 'tagName' ) != "FORM" ) {
        	console.error( 'É esperado o elemento form' );
        	return false;
        }
		
		return this.each(function() {
			var $form = $( this ); 
			
			if ( name )
				$form.find("[name='" + name + "']:not([disabled]):not([readonly]):visible").first().focus();
			else
				$form.find("[name]:not([disabled]):not([readonly]):visible").first().focus();
			
		});
	}
	
	/** 
	 * @name Field
	 * 
	 * @description Retorna o campo do formulário, semelhante a função $.find()
	 * 
	 * @param name Nome identificação do elemento (atributo name)
	 * 
	 * @return jQuery Element
	 ------------------------------------------------------------- */
	$.fn.field = function(name) {
		var that = this;
		
		if ( that.prop( 'tagName' ) != "FORM" ) {
        	console.error( 'É esperado o elemento form' );
        	return;
        }
		
		var find = "",
		    virg = "",
		    names = name.split(",");
		for ( var n in  names) {
			find += virg + "[name='"+names[n].split(":")[0]+"']" + ( names[n].indexOf(":") > -1 ? ":"+names[n].split(":")[1] : "" );
			virg = ",";
		}
		
		return $(that).find(find);
	}
	
	/* Funções jQuery sobrescritas
	-----------------------------------*/
	/* A função VAL foi sobrescrita para que ao setar um valor no input o evento change seja desparado */
	var originalVal = $.fn.val;
	$.fn.val = function(value) {
		if (arguments.length >= 1) {
			return originalVal.call(this, value).trigger("change");
		}
		return originalVal.call(this);
	}
	/* Essa função foi criada para ter o mesmo comportamento que val(), a diferença é que essa não chama o evento change */
	$.fn.value = function(value) {
		if (arguments.length >= 1) {
			return originalVal.call(this, value);
		}
		return originalVal.call(this);
	}
	
	/* A função PROP foi sobrescrita para que ao setar um valor no input o evento change seja desparado */
	var originalProp = $.fn.prop;
	$.fn.prop = function(propertyName, value) {
		var ret = originalProp.apply(this, Array.prototype.slice.apply(arguments));
		if ( typeof value !== "undefined" && typeof value !== "function" ) 
			ret.trigger("change");
		
		return ret;
	}
	
})(jQuery);