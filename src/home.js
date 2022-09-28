(function (global, $) {
  "use strict";

  function init() {
    global.downloaded = true;

    var home = new Home();
  }

  var Home = function () {
    this.$body = $("body");

    this.CONFIG_JSON = {
      leftbarOpen: false,
      leftbarBeginOpen: true,
      leftbarSave: false,
      topbarVisible: true,
      topbarItemsVisible: false,
      listHeadHighlight: false,
      theme: "light",
    };

    this.LIST_JSON = {
      name: "Default",
      link: "#Default",
      colspan: "2",
      class: "",
      type: "list",
      children: [],
    };

    this.ITEM_JSON = {
      name: "Item",
      image: "img/start-icon.png",
      colspan: "1",
      color: "light-blue",
      link: "#Item",
      description: undefined,
      class: "item animated zoomSmall",
      type: "item",
    };

    this.DEFAULT_JSON = {
      config: $.extend({}, this.CONFIG_JSON, {
        // ..
      }),
      data: [
        $.extend({}, this.LIST_JSON, {
          name: "Título",
          link: "#titulo1",
          colspan: "1",
          children: [
            $.extend({}, this.ITEM_JSON, {
              // ..
            }),
          ],
        }),
        $.extend({}, this.LIST_JSON, {
          name: "Título",
          link: "#titulo2",
          colspan: "1",
          children: [
            $.extend({}, this.ITEM_JSON, {
              color: "turquoise",
            }),
          ],
        }),
        $.extend({}, this.LIST_JSON, {
          name: "Título",
          link: "#titulo3",
          children: [
            $.extend({}, this.ITEM_JSON, {
              color: "purple",
            }),
          ],
        }),
      ],
    };

    this.init();
  };

  Home.prototype.init = function () {
    this.initLoad();
    this.initHead();
    this.initMenu();
    this.initBody();
    this.initTheme();
    this.initEvents();
  };

  Home.prototype.initLoad = function () {
    var jsonStr = localStorage.getItem("jsonHome");
    if (jsonStr) {
      var json = JSON.parse(jsonStr);
      $.extend(json.config, $.extend({}, this.CONFIG_JSON, json.config));
      this.json = json;
    } else {
      localStorage.setItem("jsonHome", JSON.stringify(this.DEFAULT_JSON));
      this.json = this.DEFAULT_JSON;
    }
  };

  Home.prototype.initHead = function () {
    this.$containerHead = $("<div class='container-head'></div>");

    this.$topBar = $("<div class='topbar' ></div>");
    this.$leftBar = $("<div class='leftbar'></div>");

    this.$topBarToggle = $(
      "<div class='topbar-toggle' data-toggle='tooltip' data-placement='bottom' data-delay='500' title='Menu lateral'><i class='fa fa-bars'></i></div>"
    );
    this.$topBarTitle = $("<div class='topbar-titles'></div>");
    this.$topBarOptions = $("<div class='topbar-options'></div>");

    this.$topBar.append(this.$topBarToggle);
    this.$topBar.append(this.$topBarTitle);
    this.$topBar.append(this.$topBarOptions);

    this.$containerHead.append(this.$topBar);
    this.$containerHead.append(this.$leftBar);

    if (this.json.config.leftbarOpen || this.json.config.leftbarBeginOpen) {
      this.$body.addClass("open-toggle");

      !this.json.config.topbarItemsVisible &&
        this.$topBarTitle.addClass("invisibility");
    }

    if (!this.json.config.topbarVisible) {
      this.$body.addClass("topbar-hidden");
    }

    var $navTitle = $("<nav class='sidebar'></nav>").appendTo(
      this.$topBarTitle
    );
    var $ulTitle = $("<ul class='nav'></ul>").appendTo($navTitle);

    $.each(this.json.data, function () {
      if (this.type === "list") {
        $("<li></li>")
          .appendTo($ulTitle)
          .append(
            sprintf(
              "<a href='%s'><span>%s</span></a>",
              treatLink(this.link),
              this.name
            )
          );
      }
    });

    $("<ul/>").appendTo(this.$topBarOptions);
    //.append("<li title='Exportar' onclick='download()'><i class='fa fa-arrow-down down'></i></li>")
    //.append("<li title='Importar' onclick='upload()'><i class='fa fa-arrow-up up'></i></li>");

    this.$body.append(this.$containerHead);
  };

  Home.prototype.initMenu = function () {
    this.$leftBarContainer = $(
      "<div class='leftbar-container'></div>"
    ).appendTo(this.$leftBar);
    this.$leftBarLists = $("<nav class='sidebar'></nav>")
      .appendTo(
        $("<div/>", { class: "leftbar-lists" }).appendTo(this.$leftBarContainer)
      )
      .append("<ul class='nav sidenav'></ul>")
      .children();

    var menu = this.createMenu(this.$leftBarLists, this.json.data);

    var that = this;
    $.when.apply($, menu).then(function () {
      that.$leftBarSettings = $("<ul></ul>").appendTo(
        $("<div/>", { class: "leftbar-settings" }).appendTo(
          that.$leftBarContainer
        )
      );

      $("<li onclick=\"newElement('list')\"></li>")
        .appendTo(that.$leftBarSettings)
        .append("<i class='fa fa-plus'></i><span>Criar novo bloco</span>");
      $("<li onclick='upload()'></li>")
        .appendTo(that.$leftBarSettings)
        .append("<i class='fa fa-arrow-up up'></i><span>Importar</span>");
      $("<li onclick='download()'></li>")
        .appendTo(that.$leftBarSettings)
        .append("<i class='fa fa-arrow-down down'></i><span>Exportar</span>");
      $("<li onclick='settings()'></li>")
        .appendTo(that.$leftBarSettings)
        .append("<i class='fa fa-cog'></i><span>Configurações</span>");
    });
  };

  Home.prototype.refreshMenu = function () {
    this.$leftBar.children().remove();
    this.initMenu();

    $(".container-body").removeData("bs.scrollspy");
    $(".container-body").scrollspy({
      target: ".sidebar",
      offset: 80,
    });
  };

  Home.prototype.initBody = function () {
    var that = this;

    this.$containerBody = $("<div class='container-body'></div>");
    this.$body.append(this.$containerBody);

    if (this.json.config.listHeadHighlight)
      this.$containerBody.addClass("list-head-highlight");

    $.map(this.json.data, function (item) {
      var $item = that.generatorEl(item).appendTo(that.$containerBody);
      $.map(item.children, function (children) {
        that.generatorEl(children).appendTo($item.children("ul")); //.data("data", children);
      });
    });

    this.initButtonsFixed();

    this.$chooserImg = $(
      "<input type='file' id='chooserImage' onchange='changeImage(event)' accept='image/*' style='display:none;'/>"
    ).appendTo(this.$body);
    this.$openFile = $(
      "<input type='file' id='openFile' onchange='openFile()' accept='.home' style='display:none;'/>"
    );
  };

  Home.prototype.initTheme = function () {
    this.$body.addClass(this.json.config.theme);
  };

  Home.prototype.refreshTheme = function () {
    this.$body
      .removeClass("light")
      .removeClass("dark")
      .addClass(this.json.config.theme);
  };

  Home.prototype.initButtonsFixed = function () {
    this.$btnsFixed = $("<div/>", { class: "btns-fixed" }).appendTo(this.$body);

    this.$btnPlus = $("<button/>", {
      type: "button",
      class: "btn btn-primary btn-circle btn-fixed btn-plus",
      "data-toggle": "tooltip",
      "data-placement": "left",
      title: "Novo item",
    })
      .append($("<div/>", { class: "bar-plus" }))
      .append($("<div/>", { class: "bar-plus" }))
      .appendTo(this.$btnsFixed);
  };

  Home.prototype.initEvents = function () {
    var that = this;

    $(".container-body").removeData("bs.scrollspy");
    $(".container-body").scrollspy({
      target: ".sidebar",
      offset: 80,
    });

    $(".container-body").on("activate.bs.scrollspy", function () {
      //console.log(arguments);
    });

    $(document).on("click", "a[href^='#']:not([href='#'])", function (e) {
      var $this = $(this);
      e.preventDefault();
      document.querySelector(this.hash).scrollIntoView();

      setTimeout(function () {
        $this.parent().siblings().removeClass("active");
        $this.parent().addClass("active");
      }, 10);
    });

    // Abre e fecha o menu lateral
    this.$topBarToggle.off("click").on(
      "click",
      $.proxy(function () {
        this.$body.toggleClass("open-toggle");
        this.json.config.leftbarSave && this.saveLeftbar();
        if (!this.json.config.topbarItemsVisible)
          (this.$body.hasClass("open-toggle") &&
            this.$topBarTitle.addClass("invisibility")) ||
            this.$topBarTitle.removeClass("invisibility");
      }, this)
    );

    // Evento para alterar o título de cada lista
    $(document)
      .off("click", ".list-name")
      .on("click", ".list-name", function (e) {
        var $this = $(this);

        if ($this.hasClass("editing")) return;

        var valueOld = $this.text().trim();

        var $input = $("<input type='text' class='list-name-edit'/>");
        $input.val(valueOld);

        $this.addClass("editing");
        $this.after($input);
        $input.focus();

        $input
          .on("blur", function (e) {
            this.value = this.value.trim();

            if (!this.value) {
              $input.val(valueOld);
              return;
            }

            $this.text(this.value);
            $this.removeClass("editing");
            $input.remove();

            if (this.value !== valueOld) {
              $this.attr(
                "id",
                that.utils.removerAcentos(this.value).toLowerCase()
              );
              that.saveData();
            }
          })
          .on("keydown", function (e) {
            if (e.which == 13) {
              e.preventDefault();
              $(this).trigger("blur");
            }
          });
      });

    $(".list-body")
      .sortable({
        connectWith: ".list-body",
        placeholder: "item-placeholder",
        start: function (e, ui) {
          ui.placeholder
            .addClass("colspan-" + ui.item.attr("colspan"))
            .addClass(ui.item.attr("color"))
            .addClass("item");
        },
        stop: function (e, ui) {
          //$(this).removeClass("block-sortable");
        },
        update: function (e, ui) {
          that.saveData();
        },
        change: function (e, ui) {
          //$this.hasClass(ui.item,ui.placeholder);
        },
      })
      .disableSelection();

    $(".container-body")
      .sortable({
        connectWith: ".list",
        handle: ".list-head",
        placeholder: "list-placeholder",
        start: function (e, ui) {
          ui.placeholder.addClass(ui.item.get(0).className);
          ui.placeholder.css("height", ui.item.innerHeight());

          ui.placeholder.animate(
            {
              height: "30px",
            },
            200,
            function () {
              $(this).css("background-color", "rgba(0,0,0,.2)");
            }
          );

          ui.item.css("height", "auto");
          ui.item.addClass("list-helper");
        },
        stop: function (e, ui) {
          var height = ui.item.innerHeight();
          ui.item.removeClass("list-helper");
          var autoHeight = ui.item.css("height", "auto").innerHeight();

          ui.item.css({
            height: height,
            minHeight: 0,
          });

          ui.item.animate(
            {
              height: autoHeight,
            },
            200,
            function () {
              ui.item.css({
                height: "",
                minHeight: "",
              });
            }
          );
        },
        update: function (e, ui) {
          that.saveData();
        },
      })
      .disableSelection();

    // Options List
    $.contextMenu({
      selector: "body .list .list-head",
      callback: function (key, opt) {
        that.resize($(this).parent(), key);
      },
      events: {
        show: function () {},
        hide: function () {},
      },
      items: {
        edit: {
          name: "Alterar",
          icon: "fa-edit",
          callback: function (key, opt) {
            $(this).find(".list-name").trigger("click");
          },
        },
        new: {
          name: "Novo",
          icon: "fa-plus",
          callback: function (key, opt) {
            that.new("list", $(this));
          },
        },
        remove: {
          name: "Excluir",
          icon: "fa-trash",
          callback: function (key, opt) {
            that.delete("list", $(this));
          },
        },
        sep1: "---------",
        redim: {
          name: "Redimensionar",
          icon: "fa-plus",
          items: {
            1: { name: "1 Coluna", icon: "edit" },
            2: { name: "2 Coluna", icon: "edit" },
          },
        },
      },
    });

    var loadBlocks = function () {
      var dfd = jQuery.Deferred();
      var items = {};

      $.when
        .apply(
          $,
          $.map(that.json.data, function (item, i) {
            if (item.type == "list")
              items["sub" + i] = {
                name: item.name,
                icon: "fa-check",
                callback: function () {
                  that.move(
                    this,
                    $(item.link).parents(".list").find(".list-body")
                  );
                },
              };
          })
        )
        .then(function () {
          dfd.resolve(items);
        });

      return dfd.promise();
    };

    // Options Items
    $.contextMenu({
      selector: "body .list-body li",
      build: function ($trigger, e) {
        console.log("build");
        return {
          callback: function (key, opt) {
            that.resize($(this), key);
          },
          events: {
            show: function () {},
            hide: function () {},
          },
          items: {
            copy: {
              name: "Copiar URL",
              icon: "fa-copy",
              callback: function (key, opt) {
                that.copyURL($(this));
              },
            },
            edit: {
              name: "Alterar",
              icon: "fa-edit",
              callback: function (key, opt) {
                that.editItem($(this));
              },
            },
            new: {
              name: "Novo",
              icon: "fa-plus",
              callback: function (key, opt) {
                that.new("item", $(this));
              },
            },
            duplicate: {
              name: "Duplicar",
              icon: "fa-clone",
              callback: function (key, opt) {
                that.duplicate($(this));
              },
            },
            move: {
              name: "Mover para",
              icon: "fa-share-square",
              items: loadBlocks(),
            },
            remove: {
              name: "Excluir",
              icon: "fa-trash",
              callback: function (key, opt) {
                that.delete("item", $(this));
              },
            },
            sep1: "---------",
            redim: {
              name: "Redimensionar",
              icon: "fa-plus",
              items: {
                1: { name: "1 Coluna", icon: "edit", disabled: disabledResize },
                2: {
                  name: "2 Colunas",
                  icon: "edit",
                  disabled: disabledResize,
                },
                3: {
                  name: "3 Colunas",
                  icon: "edit",
                  disabled: disabledResize,
                },
                4: {
                  name: "4 Colunas",
                  icon: "edit",
                  disabled: disabledResize,
                },
                5: {
                  name: "5 Colunas",
                  icon: "edit",
                  disabled: disabledResize,
                },
                6: {
                  name: "6 Colunas",
                  icon: "edit",
                  disabled: disabledResize,
                },
                7: {
                  name: "7 Colunas",
                  icon: "edit",
                  disabled: function () {
                    return window.innerWidth < 1400;
                  },
                },
                8: {
                  name: "8 Colunas",
                  icon: "edit",
                  disabled: function () {
                    return window.innerWidth < 1400;
                  },
                },
                9: {
                  name: "9 Colunas",
                  icon: "edit",
                  disabled: function () {
                    return window.innerWidth < 1920;
                  },
                },
                10: {
                  name: "10 Colunas",
                  icon: "edit",
                  disabled: function () {
                    return window.innerWidth < 1920;
                  },
                },
                11: {
                  name: "11 Colunas",
                  icon: "edit",
                  disabled: function () {
                    return window.innerWidth < 1920;
                  },
                },
                12: {
                  name: "12 Colunas",
                  icon: "edit",
                  disabled: function () {
                    return window.innerWidth < 1920;
                  },
                },
              },
            },
          },
        };
      },
    });

    $('[data-toggle="tooltip"]').tooltip();

    $('[data-toggle="tooltip"]').on("click", function () {
      $(this).tooltip("hide");
    });

    function disabledResize() {
      return $(this).parents(".list").attr("colspan") == "1";
    }

    $(document)
      .off("focus", "input")
      .on("focus", "input", function () {
        if (this.select) this.select();
      });

    this.$btnPlus.off("click").on("click", function (e) {
      var $list = $(that.$leftBarLists.find(".active a").attr("href"));
      var $item = $list
        .parents(".list")
        .children(".list-body")
        .children()
        .last();
      that.editItem(that.new("item", $item));
    });

    global.newElement = function (type, $el) {
      that.new(type, $el);
    };

    global.onbeforeunload = function () {
      if (!global.downloaded) return "As alterações não foram salvas em disco.";
    };

    global.download = function () {
      global.downloaded = true;
      var json = localStorage.getItem("jsonHome");
      if (json) {
        downloadFile("json.home", json);
      } else {
        alert("Não foi possível fazer o download do JSON!");
      }
    };

    global.downloadFile = function (filename, text) {
      var pom = document.createElement("a");
      pom.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(text)
      );
      pom.setAttribute("download", filename);

      if (document.createEvent) {
        var event = document.createEvent("MouseEvents");
        event.initEvent("click", true, true);
        pom.dispatchEvent(event);
      } else {
        pom.click();
      }
    };

    global.upload = function () {
      that.$openFile.click();
    };

    global.openFile = function () {
      var file = that.$openFile.get(0).files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        localStorage.setItem("jsonHome", reader.result);
        window.location.reload();
      };
      reader.readAsText(file, "UTF-8");
    };

    global.settings = function () {
      that.settings();
    };
  };

  Home.prototype.createMenu = function ($ul, data) {
    var that = this;

    var map = $.map(data, function (el) {
      var $li = $("<li></li>").appendTo($ul),
        $link = $("<a href='" + treatLink(el.link) + "'></a>")
          .appendTo($li)
          .text(el.name);

      (el.type == "list" &&
        that.createMenu(
          $("<ul class='nav'></ul>").appendTo($li),
          el.children
        )) ||
        $link.attr("target", "_blanck");
    });

    $.when.apply($, map).then(function () {});

    return map;
  };

  Home.prototype.generatorEl = function (item) {
    if (item.type === "item") {
      item = $.extend({}, this.ITEM_JSON, item);

      var $item = $("<li></li>"),
        $link = $("<a target='_blank'></a>"),
        $image = $("<img alt='...'/>"),
        $name = $("<span></span>");

      $item
        .addClass("colspan-" + item.colspan)
        .addClass(item.class)
        .addClass(item.color);

      $item.attr("colspan", item.colspan).attr("color", item.color);

      $link.attr("href", item.link || "");

      $image.attr("src", item.image || "");
      $name.text(item.name);

      $link.append($("<div class='image'/>").append($image));
      $link.append($("<div class='name'/>").append($name));
      $item.append($link);

      $item.data("data", item);

      return $item;
    } else if (item.type === "list") {
      item = $.extend({}, this.LIST_JSON, item);

      var $item = $("<div class='list'></div>"),
        $head = $("<div class='list-head'></div>"),
        $name = $("<div class='list-name'></div>"),
        $menu = $(
          "<div class='list-menu'><i class='fa fa-ellipsis-h'></i></div>"
        ),
        $list = $("<ul class='list-body'></ul>");

      $item.addClass("colspan-" + item.colspan).addClass(item.class);

      $item.attr("colspan", item.colspan);

      $name.text(item.name);
      $name.attr("id", treatLink(item.link.replace("#", "").toLowerCase()));

      $head.append($name);
      $head.append($menu);
      $item.append($head);
      $item.append($list);

      $item.data("data", item);

      return $item;
    }
  };

  Home.prototype.duplicate = function ($item) {
    var $clone = $item.clone(true, true);
    $clone.removeClass("context-menu-active");
    $item.after($clone);
    this.saveData();
  };

  Home.prototype.new = function (type, $el) {
    var $retEl;
    if (type === "item") {
      $retEl = this.generatorEl(this.ITEM_JSON);
      $el.after($retEl);
    } else if (type === "list") {
      $retEl = this.generatorEl(this.LIST_JSON);
      if ($el && $el.length > 0) $el.parent(".list").after($retEl);
      else {
        var $list = $retEl.appendTo(this.$containerBody);
        $list.find(".list-name").click();
      }
    }
    this.initEvents();
    this.saveData();

    return $retEl;
  };

  Home.prototype.resize = function ($el, colspan) {
    $el.removeClass("colspan-" + $el.attr("colspan"));
    $el.attr("colspan", colspan);
    $el.addClass("colspan-" + colspan);

    this.saveData();
  };

  Home.prototype.delete = function (type, $el) {
    var that = this;

    var message = "Deseja excluir esse item?";
    if (type === "list")
      message = "Deseja excluir o bloco e todos os seus itens?";

    $.dialog({
      title: "Confirmação",
      message: message,
      buttons: [
        {
          text: "Excluir",
          classes: "btn-primary",
          focus: true,
          fn: function (event, $btn, dialog) {
            if (type === "item") $el.remove();
            else $el.parent(".list").remove();

            that.saveData();
            dialog.hide();
          },
        },
        {
          text: "Cancelar",
        },
      ],
    });
  };

  Home.prototype.move = function ($item, $list) {
    $list.append($item.remove());
    this.saveData();
  };

  Home.prototype.saveLeftbar = function () {
    var leftbarOpen =
      this.json.config.leftbarSave && this.$body.hasClass("open-toggle");

    this.json.config = $.extend({}, this.CONFIG_JSON, this.json.config, {
      leftbarOpen: leftbarOpen,
    });

    localStorage.setItem("jsonHome", JSON.stringify(this.json));
  };

  Home.prototype.saveConfig = function (settings) {
    global.downloaded = false;

    var leftbarOpen =
      settings.leftbarSave && this.$body.hasClass("open-toggle");

    this.json.config = $.extend(this.json.config, this.CONFIG_JSON, settings, {
      leftbarOpen: leftbarOpen,
    });

    localStorage.setItem("jsonHome", JSON.stringify(this.json));
  };

  Home.prototype.saveData = function () {
    global.downloaded = false;

    var that = this,
      //json = JSON.parse(localStorage.getItem("jsonHome")),
      data = [];

    var lists = this.$containerBody.find(".list");
    for (var i = 0; i < lists.length; i++) {
      var $list = $(lists[i]),
        children = [];

      var items = $list.find(".list-body li");
      for (var y = 0; y < items.length; y++) {
        var $item = $(items[y]);

        // .data()
        var jsonItem = $.extend({}, that.ITEM_JSON, $item.data("data"));
        /*var jsonItem = $.extend({}, that.ITEM_JSON, {
					"image": $item.find("img").attr("src"),
					"name": $item.find(".name").text(),
					"link": $item.find("a").attr("href"),
					"colspan": $item.attr("colspan"),
					"color": $item.attr("color")
				});*/

        children.push(jsonItem);
      }

      var jsonList = $.extend({}, that.LIST_JSON, {
        link: "#" + $list.find(".list-name").attr("id"),
        name: $list.find(".list-name").text(),
        colspan: $list.attr("colspan"),
        children: children,
      });

      data.push(jsonList);
    }

    this.json.data = data;

    this.refreshMenu();

    localStorage.setItem("jsonHome", JSON.stringify(this.json));
  };

  Home.prototype.copyURL = function ($item) {
    try {
      var url = $item.find("a").attr("href");

      navigator.clipboard.writeText(url).then(
        function () {
          $.notice("URL copiada");
        },
        function (err) {
          var $input = $("<input/>", {
            type: "text",
          })
            .val(url)
            .appendTo("BODY");
          $input.get(0).select();
          document.execCommand("copy");
          $input.remove();

          $.notice("URL copiada");
        }
      );
    } catch (e) {
      $.notice("Não é possível copiar a URL", "warn");
    }
  };

  Home.prototype.editItem = function ($item) {
    var that = this,
      $clone = $item.clone();

    $clone.removeClass("context-menu-active");

    global.changeName = function (el) {
      $clone.find(".name").children().text(el.value);
    };

    global.chooserImage = function () {
      that.$chooserImg.click();
    };

    global.changeImage = function (event) {
      var file = event.target.files[0];
      var img = $clone.find(".image").children().get(0);

      var reader = new FileReader();
      reader.onload = (function (aImg) {
        return function (e) {
          aImg.src = e.target.result;
        };
      })(img);
      reader.readAsDataURL(file);

      if (event.target.files[0].mozFullPath) {
        $("#editImage").val(event.target.files[0].mozFullPath);
      } else {
        $("#editImage").val("Não implementado!!!");
      }
    };

    global.refreshImage = function () {
      $clone.find(".image").children().attr("src", $("#editImage").val());
    };

    global.changeResize = function (el) {
      var colspan = $clone.attr("colspan");
      $clone.removeClass("colspan-" + colspan);
      $clone.addClass("colspan-" + el.value);
      $clone.attr("colspan", el.value);
    };

    global.changeColor = function (el) {
      var color = $clone.attr("color");
      $clone.removeClass(color);
      $clone.addClass(el.value);
      $clone.attr("color", el.value);
    };

    global.changeLink = function (el) {
      $clone.find("a").attr("href", el.value);
    };

    var html =
      "	<form id='formEdit' class='form-horizontal'>" +
      "		<div class='form-group'>" +
      "			<div class='col-xs-4' id='clone'></div>" +
      "			<div class='col-xs-8'>" +
      "				<div class='form-group'>" +
      "					<div class='col-xs-12'>" +
      "						<label for='editName'>Título</label>" +
      "						<input type='text' class='form-control' name='name' id='editName' onkeyup='changeName(this)' placeholder='Título' required>" +
      "					</div>" +
      "				</div>" +
      "				<div class='form-group'>" +
      "					<div class='col-xs-12'>" +
      "						<label for='editImage'>Imagem</label>" +
      "						<div class='input-group'>" +
      "							<div class='input-group-btn'>" +
      "								<a href='javascript:chooserImage()' class='btn btn-default chooser-image'>" +
      "									<i class='fa fa-folder'></i>" +
      "								</a>" +
      "							</div>" +
      "							<input type='text' class='form-control' name='image' id='editImage' placeholder='Imagem' style='padding-left: 10px;' required>" +
      "							<div class='input-group-btn'>" +
      "								<button type='button' class='btn btn-default refresh-image' onclick='refreshImage()'>" +
      "									<i class='fa fa-refresh'></i>" +
      "								</button>" +
      "							</div>" +
      "						</div>" +
      "					</div>" +
      "				</div>" +
      "			</div>" +
      "		</div>" +
      "		<div class='form-group'>" +
      "			<div class='col-xs-4'>" +
      "				<label for='editColumn'>Dimensão</label>" +
      "				<select class='form-control' name='colspan' id='editColumn' onchange='changeResize(this);' required>" +
      "					<option value='1'>1 Coluna</option>" +
      "					<option value='2'>2 Colunas</option>" +
      "					<option value='3'>3 Colunas</option>" +
      "					<option value='4'>4 Colunas</option>" +
      "					<option value='5'>5 Colunas</option>" +
      "					<option value='6'>6 Colunas</option>" +
      "				</select>" +
      "			</div>" +
      "			<div class='col-xs-8'>" +
      "				<label for='editCor'>Cor</label>" +
      "				<select class='form-control' name='color' id='editCor' onchange='changeColor(this);' required>" +
      "					<option value='blue'        class='blue       '>blue       </option>" +
      "					<option value='light-blue'  class='light-blue '>light-blue </option>" +
      "					<option value='purple'      class='purple     '>purple     </option>" +
      "					<option value='white'       class='white      '>white      </option>" +
      "					<option value='orange'      class='orange     '>orange     </option>" +
      "					<option value='gray'        class='gray       '>gray       </option>" +
      "					<option value='light-gray'  class='light-gray '>light-gray </option>" +
      "					<option value='green'       class='green      '>green      </option>" +
      "					<option value='light-green' class='light-green'>light-green</option>" +
      "					<option value='black'       class='black      '>black      </option>" +
      "					<option value='red'         class='red        '>red        </option>" +
      "					<option value='dark-red'    class='dark-red   '>dark-red   </option>" +
      "					<option value='turquoise'   class='turquoise  '>turquoise  </option>" +
      "					<option value='pink'        class='pink       '>pink       </option>" +
      "					<option value='teal'        class='teal       '>teal       </option>" +
      "					<option value='brown'       class='brown      '>brown      </option>" +
      "					<option value='yellow'      class='yellow     '>yellow     </option>" +
      "				</select>" +
      "			</div>" +
      "		</div>" +
      "		<div class='form-group'>" +
      "			<div class='col-xs-12'>" +
      "				<label for='editUrl'>URL</label>" +
      "				<input type='text' class='form-control' name='link' onkeyup='changeLink(this)' id='editUrl' placeholder='URL' required>" +
      "			</div>" +
      "		</div>" +
      "		<div class='form-group'>" +
      "			<div class='col-xs-12'>" +
      "				<label for='editDescription'>Descrição</label>" +
      "				<textarea class='form-control' name='description' id='editDescription' placeholder='Descrição' rows='8'></textarea>" +
      "			</div>" +
      "		</div>" +
      "	</form>";

    $.dialog({
      title: "Alterar",
      message: html,
      classes: "",
      buttons: [
        {
          text: "Salvar",
          classes: "btn-primary",
          focus: true,
          close: false,
          fn: function (event, $btn, dialog) {
            var $form = $("#formEdit");

            if ($form.formValid()) {
              var item = $.extend({}, that.ITEM_JSON, $form.serializeJSON());
              $clone.data("data", item);

              //$item.replaceWith( $clone );
              $clone.replaceAll($item);

              that.saveData();

              dialog.hide();
            }
          },
        },
        {
          text: "Cancelar",
        },
      ],
      data: {
        backdrop: false,
        onShow: function () {
          $("#formEdit").formLoad($item.data("data"), true);
          $("#clone").append($clone);
        },
      },
    });
  };

  Home.prototype.settings = function () {
    var that = this,
      $form = $("<form class='form-horizontal'></form>"),
      style = { marginTop: 5, marginBottom: 5 };

    //-------------------------------------------------------

    var $opt1 = $("<div/>")
      .inputSwitch({
        name: "leftbarBeginOpen",
        value: this.json.config.leftbarBeginOpen,
        label: "Iniciar com a barra de menu lateral visível",
        onChange: function (bool) {
          bool && $opt2.inputSwitch("value", !bool);
        },
      })
      .appendTo($form)
      .css(style);

    //-------------------------------------------------------

    var $opt2 = $("<div/>")
      .inputSwitch({
        name: "leftbarSave",
        value: this.json.config.leftbarSave,
        label: "Salvar a posição da barra de menu lateral",
        onChange: function (bool) {
          bool && $opt1.inputSwitch("value", !bool);
        },
      })
      .appendTo($form)
      .css(style);

    //-------------------------------------------------------

    $("<div/>", { class: "separator" }).appendTo($form);

    //-------------------------------------------------------

    var $opt3 = $("<div/>")
      .inputSwitch({
        name: "topbarVisible",
        value: this.json.config.topbarVisible,
        label: "Exibir a barra de menu superior",
        onChange: function (bool) {
          !bool && $opt4.inputSwitch("value", bool);
        },
      })
      .appendTo($form)
      .css(style);

    //-------------------------------------------------------

    var $opt4 = $("<div/>")
      .inputSwitch({
        name: "topbarItemsVisible",
        value: this.json.config.topbarItemsVisible,
        label: "Sempre exibir os itens da barra de menu superior",
        onChange: function (bool) {
          bool && $opt3.inputSwitch("value", bool);
        },
      })
      .appendTo($form)
      .css(style);

    //-------------------------------------------------------

    $("<div/>", { class: "separator" }).appendTo($form);

    //-------------------------------------------------------

    var $opt5 = $("<div/>")
      .inputSwitch({
        name: "listHeadHighlight",
        value: this.json.config.listHeadHighlight,
        label: "Destacar o título do bloco",
        onChange: function (bool) {},
      })
      .appendTo($form)
      .css(style);

    //-------------------------------------------------------

    var $opt6 = $("<div/>", {
      class: "row",
    })
      .appendTo($form)
      .css(style);

    var $select6 = $("<select/>", {
      name: "theme",
      class: "form-control",
    });
    $opt6.append("<div class='col-xs-9'>Tema</div>");
    $("<div/>", {
      class: "col-xs-3",
    })
      .appendTo($opt6)
      .append($select6);

    $select6
      .append("<option value='light'>Leve</option>")
      .append("<option value='dark'>Escuro</option>");

    $select6.value(this.json.config.theme);

    //-------------------------------------------------------

    $.dialog({
      title: "Configurações",
      message: $form,
      classes: "",
      buttons: [
        {
          text: "Salvar",
          classes: "btn-primary",
          focus: true,
          close: false,
          fn: function (event, $btn, dialog) {
            var config = $form.serializeJSON();
            that.saveConfig($.extend({}, that.CONFIG_JSON, config));

            (that.json.config.topbarVisible &&
              that.$body.removeClass("topbar-hidden")) ||
              that.$body.addClass("topbar-hidden");

            (that.json.config.topbarItemsVisible &&
              that.$topBarTitle.removeClass("invisibility")) ||
              that.$topBarTitle.addClass("invisibility");

            (that.json.config.listHeadHighlight &&
              that.$containerBody.addClass("list-head-highlight")) ||
              that.$containerBody.removeClass("list-head-highlight");

            that.refreshTheme();

            dialog.hide();
          },
        },
        {
          text: "Cancelar",
        },
      ],
      data: {
        backdrop: false,
        onShow: function () {},
      },
    });
  };

  /**
   * Remove acentos de caracteres
   * @param  {String} stringComAcento [string que contem os acentos]
   * @return {String}                 [string sem acentos]
   */
  var removerAcentos = function (newStringComAcento) {
    var string = newStringComAcento;

    var mapaAcentosHex = {
      a: /[\xE0-\xE6]/g,
      A: /[\xC0-\xC6]/g,
      e: /[\xE8-\xEB]/g,
      E: /[\xC8-\xCB]/g,
      i: /[\xEC-\xEF]/g,
      I: /[\xCC-\xCF]/g,
      o: /[\xF2-\xF6]/g,
      O: /[\xD2-\xD6]/g,
      u: /[\xF9-\xFC]/g,
      U: /[\xD9-\xDC]/g,
      c: /\xE7/g,
      C: /\xC7/g,
      n: /\xF1/g,
      N: /\xD1/g,
    };

    for (var letra in mapaAcentosHex) {
      var expressaoRegular = mapaAcentosHex[letra];
      string = string.replace(expressaoRegular, letra);
    }

    return string;
  };

  var sprintf = function (str) {
    var args = arguments,
      flag = true,
      i = 1;

    str = str.replace(/%s/g, function () {
      var arg = args[i++];

      if (typeof arg === "undefined") {
        flag = false;
        return "";
      }
      return arg;
    });
    return flag ? str : "";
  };

  var treatLink = function (str) {
    return str.trim().replace(" ", "");
  };

  Home.prototype.utils = {
    removerAcentos: removerAcentos,
  };

  $(document).ready(init);
})(this, jQuery);
