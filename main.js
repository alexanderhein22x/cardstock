Handlebars.registerHelper("checkedIf", function(condition) {
  return (condition) ? "checked" : "";
});

Handlebars.registerHelper("formatMoney", function(amount) {
  var options = {
  	symbol : "€",
  	decimal : ",",
  	thousand: ".",
  	precision : 2,
  	format: "%v %s"
  };
  return accounting.formatMoney(amount, options); // 4.999,99 €
});

var App = {
  Models: {},
  Views: {},
  MWST: 0.19
};

App.Models.Configuration = Backbone.Model.extend({
  defaults: {
    quantity: "300"
  },
  initialize: function() {
    this.on("change", this.attributeChanged);
    this.on("change:material", this.materialChanged);
  },
  materialChanged: function() {
    var quantity = this.get("quantity");
    var quantityDiscount = this.get("material").quantityDiscount;
    var quantities = _.keys(quantityDiscount);

    if (quantities.indexOf(quantity) < 0) {
      this.set("quantity", quantities[0]);
    }
  },
  attributeChanged: function() {
    _.each(this.changedAttributes(), function(selected, attribute) {
        if (_.has(selected, "availableOptions")) {
          this.availableOptionsChanged(attribute, selected);
        }
    }, this);
  },
  availableOptionsChanged: function(attribute, selected) {
    _.each(selected.availableOptions, function(available, option) {
      var current = this.get(option);
      if (!current || _.indexOf(available, current.id) < 0) {
        if (available.length > 0) {
          var $input = $("input#" + available[0]);
          var newValue = _.extend($input.data(), {id: $input.attr("id")});
        } else {
          newValue = false;
        }
        this.set(option, falseIfEmpty(newValue));
      }
    }, this);
  }
});

App.Views.TabView = Backbone.View.extend({
  events: {
    "click nav li": "resizeContent"
  },
  initialize: function(options) {
    this.tab = new CBPFWTabs(this.el, options);
    this.$tabs = this.$(this.tab.tabs);
    var self = this;

    this.contentViews = this.$(".gallery").map(function() {
      return new App.Views.GalleryView({el: this, model: self.model});
    });
    _.each(this.contentViews, function(contentView) {
      this.listenTo(contentView.model, "change:visible", this.visibleChanged);
    }, this);

    // create model and listen for changes
    this.model = new Backbone.Model({
      available: this.$tabs.map(function() {
        return $(this).attr("href");
      })
    });
    this.listenTo(this.model, "change:available", this.render);
  },
  render: function() {
    var available = this.model.get("available"), first;
    this.$tabs.each(function() {
      if (available.indexOf($(this).find("a").attr("href")) < 0) {
        $(this).addClass("hide");
      } else {
        $(this).removeClass("hide");
        if (!first) first = this;
      }
    });
    // show first available tab
    this.show(this.$tabs.index(first));
  },
  show: function(tabIndex) {
    this.tab._show(tabIndex);
    // scroll selected element into view
    this.contentViews[tabIndex].showSelectedItem();
    this.resizeContent(tabIndex);
  },
  visibleChanged: function(model, visibleOptions) {
    var available = this.model.get("available");
    var tabIndex = _.reduce(this.contentViews, function(tabIndex, view, index) {
      return view.model == model ? index : tabIndex;
    }, null);
    var tabId = $(this.$tabs[tabIndex]).find("a").attr("href");

    if (visibleOptions.length === 0) {
      this.model.set("available", _.without(available, tabId));
    } else {
      this.model.set("available", _.union(available, [tabId]));
    }
  },
  resizeContent: function(e) {
    if (typeof e === "number" || typeof e === "string") {
      var tabIndex = e;
    } else {
      tabIndex = this.$tabs.index( $(e.target).parents("li") );
    }

    this.contentViews[tabIndex].resize();
  }
});

App.Models.GalleryModel = Backbone.Model.extend({
  defaults: {},
  initialize: function(attributes, options) {
    this.name = options.name;
    this.listenTo(options.model, "change:" + this.name, this.selectionChanged);
    this.listenTo(options.model, "change", this.availableOptionsChanged);
  },
  selectionChanged: function(model, value) {
    var newValue = _.has(value, "id") ? value.id : false;
    this.set("selected", newValue);
  },
  availableOptionsChanged: function(model) {
    _.each(model.changedAttributes(), function(selected, attribute) {
      if (_.has(selected, "availableOptions") &&
          _.has(selected.availableOptions, this.name)) {
        this.set("available", selected.availableOptions[this.name]);
      }
    }, this);
  }
});

App.Views.GalleryView = Backbone.View.extend({
  events: {
    "click .gallery-cell": "handleSelection"
  },
  initialize: function() {
    var flkty = this.flkty = new Flickity(this.el, {
      // options
      cellAlign: 'center',
      accessibility: false,
      pageDots: false,
      prevNextButtons: false,
      contain: true,
      freeScroll: true
    });

    this.flkty.on( 'staticClick', function( event, pointer, cellElement, cellIndex ) {
      if ( typeof cellIndex == 'number' ) {
        flkty.select( cellIndex );
      }
    });

    setTimeout(function() {
      flkty.resize();
    }, 0);

    this.$options = this.$("input");
    this.name = this.$options.attr("name");

    this.supermodel = this.model;
    // create model and listen to changes
    this.model = new App.Models.GalleryModel({
      available: this.$options.map(function() {
        return $(this).attr("id");
      }),
      selected: null
    }, {
      name: this.name,
      model: this.supermodel
    });

    this.listenTo(this.model, "change:available", this.render);
    this.listenTo(this.model, "change:selected", this.updateSelection);
  },
  render: function() {
    var available = this.model.get("available");
    var $visibleOptions = this.$options.filter(function() {
      return _.indexOf(available, $(this).attr("id")) >= 0;
    });
    this.$options.each(function() {
      $(this).parent().addClass("hide");
    });
    $visibleOptions.each(function()  {
      $(this).parent().removeClass("hide");
    });
    // notify Flickity that gallery elements have changed
    this.flkty.resize();
    // save currently visible options to model
    this.model.set("visible", $visibleOptions.map(function() {
      return $(this).attr("id");
    }));
  },
  updateSelection: function() {
    var selected = this.model.get("selected");
    var $inputs = this.$("input");
    // check selected option
    $inputs.prop("checked", false);
    if (selected) {
      $inputs.filter("#"+selected).prop("checked", true);
    } else {
      $inputs.filter("[value='none']").prop("checked", true);
    }
  },
  handleSelection: function(e) {
    //console.log(e);
    var $target = $(e.target);
    if ($target.prop("tagName") == "INPUT") {
      var data = _.extend($target.data(), {id: $target.attr("id")});
      console.log(data);
      this.supermodel.set(this.name, falseIfEmpty(data));
    }
  },
  selectedItemIndex: function() {
    return this.$("input:checked").parents(".gallery-cell").index();
  },
  select: function(itemIndex) {
    this.flkty.select(itemIndex);
  },
  resize: function() {
    this.flkty.resize();
  },
  showSelectedItem() {
    var itemIndex = this.selectedItemIndex(),
        galleryView = this;

    setTimeout(function() {
      galleryView.resize();
      galleryView.select(itemIndex);
    }, 0);
  }
});

App.Views.Preview = Backbone.View.extend({
  el: "#preview",
  initialize: function() {
    this.listenTo(this.model, "change", this.update);
  },
  update: function() {
    var
      format   = [this.model.get("size"), this.model.get("color-outside")],
      color    = [this.model.get("color-inside")],
      material = [this.model.get('material')],
      lamination = [this.model.get('lamination')],
      logo = [this.model.get('embossing')],
      cleft    = [this.model.get('ablagefach'), this.model.get('color-outside')],
      cright    = [this.model.get('model')];

    this._updateParagraph(material, 'container');
    this._updateParagraph(format, 'front');
    this._updateParagraph(format, 'back');
    this._updateParagraph(lamination, 'kit-front');
    this._updateParagraph(lamination, 'kit-back');
    this._updateParagraph(logo, 'embossing');
    this._updateParagraph(color, 'colorinner');
    this._updateParagraph(cleft, 'cleft');
    this._updateParagraph(cright, 'mechanik');
  },
  _updateParagraph: function(settings, className) {
    var paragraph = document.querySelector('.' + className);
    paragraph.className = className;
    this._updateParagraphClasslist(settings, paragraph);
  },
  _updateParagraphClasslist: function(settings, paragraph) {
    _.each(settings, function(setting) {
      if (_.has(setting, "visual")) {
        paragraph.classList.add(setting.visual);
      }
    });
  }
});

App.Views.OptionsView = Backbone.View.extend({
  el: '#options',
  events: {
    'click .remove': 'removeExtra'
  },
  initialize: function() {
    console.log("created OptionsView ", this.el, this.model);
    this.listenTo(this.model, 'change', this.render);
  },
  template: Handlebars.compile($('#optionsTpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
  },

  removeExtra: function(e) {
    e.preventDefault();
    var item = $(e.target).data('item');
    console.log("remove " + item)
    this.model.set(item, null);
  }
});

App.Views.CostView = Backbone.View.extend({
  el: '.price',
  events: {
    'click label': 'updateQuantity'
  },
  template: Handlebars.compile($('#costViewTpl').html()),
  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
  },
  render: function() {
    // save scroll position
    var scrollTop = this.$(".quantity").prop("scrollTop");
    // update data / template
    var data = this.computeTotal();
    this.$el.html(this.template(data));
    // restore scroll position
    this.$(".quantity").prop("scrollTop", scrollTop);
    // check selected quantity
    var quantityIdx = _.findIndex(data.quantities, { selected: true });
    this.$("#quantity" + quantityIdx).prop("checked", true);
  },
  computePrices: function() {
    var selectedQuantity = this.model.get("quantity");
    var quantityDiscount = this.model.get("material").quantityDiscount;
    var quantities = _.keys(quantityDiscount);

    var unitPrice = this.model.values().reduce(function(sum, option) {
      return sum + (_.has(option, "price") ? option.price : 0);
    }, 0);

    return quantities.map(function(q) {
      var netUnitPrice = unitPrice * quantityDiscount[q];
      return {
        quantity: q,
        netUnitPrice: netUnitPrice,
        unitPrice: netUnitPrice * (1 + App.MWST),
        selected: q == selectedQuantity
      }
    });
  },
  computeTotal: function() {
    var prices = this.computePrices();
    var index = _.findIndex(prices, function(p) {
      return p.selected;
    });
    var net_total = prices[index].netUnitPrice * prices[index].quantity;
    return {
      quantities: prices,
      net_total: net_total,
      sales_tax: net_total * App.MWST,
      total: net_total * (1 + App.MWST)
    };
  },
  updateQuantity: function(e) {
    // handle clicking on span instead of label
    var $target = e.target.tagName == "SPAN" ? $(e.target).parent() : $(e.target);
    var selectedQuantity = $target.prev().val();
    this.model.set("quantity", selectedQuantity);
  }
});

App.Views.DeliveryTimeView = Backbone.View.extend({
  el: '.time',
  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
  },
  render: function() {
    this.$el.find("#day").html(this.calculateDeliveryTime());
  },
  calculateDeliveryTime: function() {
    return this.model.values().reduce(function(sum, option) {
      return sum + (_.has(option, "date") ? option.date : 0);
    }, 0);
  }
});

App.Views.AppView = Backbone.View.extend({
  el: 'body',
  events: {
    "click a.link": "showTab"
  },
  initialize: function() {
    console.log("created AppView ", this.el, this.model);
    var self = this;

    this.previewView = new App.Views.Preview({model: this.model});
    this.optionsView = new App.Views.OptionsView({model: this.model});
    this.costView = new App.Views.CostView({model: this.model});
    this.deliveryTimeView = new App.Views.DeliveryTimeView({model: this.model});
    this.tabViews = this.$(".tab__content").map(function() {
      return new App.Views.TabView({el: this, model: self.model});
    });

    this.listenTo(this.model, "change", this.updateSelection);
  },
  render: function() {
    this.previewView.update();
    this.optionsView.render();
    this.costView.render();
    this.deliveryTimeView.render();
  },
  showTab: function(e) {
    var href = $(e.target).attr("href").split("/");
    var tab = href[0].substring(1), subTab = href[1];
    var tabIndex = window.locatePosByHref('#' + tab);
    // open subtab if appropriate
    if (subTab) {
      if (subTab === "selected") {
        // find subtab with checked input
        subtabEl = $('[data-tab-id=' + tab + ']').find("input:checked").parents("section");
        this.tabViews[tabIndex].show(subtabEl.index());
      } else {
        var subtabEl = $('[data-tab-id=' + tab + ']').find("section")[subTab];
        this.tabViews[tabIndex].show(subTab);
      }
    }
    // navigate to selected tab
    navigate(tabIndex);
    e.preventDefault();
  }
});

function falseIfEmpty(data) {
  // we consider a data object empty if it has nothing but
  // an 'id' attribute
  return _.keys(data).length == 1 && _.has(data, 'id') ? false : data;
}

// read default configuration from DOM
var defaults = _.object(
  $("input:checked").map(function() { return $(this).attr("name"); }),
  $("input:checked").map(function() { return falseIfEmpty(_.extend($(this).data(), {id: $(this).attr("id")})); }) );

var config = new App.Models.Configuration();
var view = new App.Views.AppView({model: config});

// set defaults after initializing event listeners
config.set(defaults);
view.render();
