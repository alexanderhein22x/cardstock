
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
    quantity: 300
  }
});

App.Views.TabView = Backbone.View.extend({
  events: {
    "click nav li": "resizeContent"
  },
  initialize: function() {
    this.tab = new CBPFWTabs(this.el);

    this.$tabs = this.$("nav li a");

    // create model and listen for changes
    this.model = new Backbone.Model({
      available: this.$tabs.map(function() {
        return $(this).attr("href");
      })
    });
    this.listenTo(this.model, "change:available", this.render);

    _.each(this.collection, function(contentView) {
      this.listenTo(contentView.model, "change:visible", this.visibleChanged);
    }, this);
  },
  render: function() {
    var available = this.model.get("available"), first;
    this.$tabs.each(function() {
      if (available.indexOf($(this).attr("href")) < 0) {
        $(this).parent().addClass("hide");
      } else {
        $(this).parent().removeClass("hide");
        if (!first) first = this;
      }
    });
    // show first available tab
    this.show(this.$tabs.index(first));
  },
  show: function(tabIndex) {
    this.tab._show(tabIndex);
    this.resizeContent(tabIndex);
  },
  visibleChanged: function(model, visibleOptions) {
    var available = this.model.get("available");
    var tabIndex = _.reduce(this.collection, function(tabIndex, view, index) {
      return view.model == model ? index : tabIndex;
    }, null);
    var tabId = $(this.$tabs[tabIndex]).attr("href");

    if (visibleOptions.length === 0) {
      this.model.set("available", _.without(available, tabId));
    } else {
      this.model.set("available", _.union(available, [tabId]));
    }
  },
  resizeContent: function(e) {
    if (typeof e === "number") {
      var tabIndex = e;
    } else {
      tabIndex = this.$tabs.index( $(e.target).parents("li").find("a") );
    }

    this.collection[tabIndex].resize();
  }
});

App.Views.GalleryView = Backbone.View.extend({
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
    }, 100);

    this.$options = this.$("input");
    this.name = this.$options.attr("name");

    // create model and listen to changes
    this.model = new Backbone.Model({
      available: this.$options.map(function() {
        return $(this).attr("id");
      })
    });
    this.listenTo(this.model, "change:available", this.render);
  },
  render: function() {
    var available = this.model.get("available");
    var $visibleOptions = this.$options.filter(function() {
      return available.indexOf($(this).attr("id")) >= 0;
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
  resize: function() {
    this.flkty.resize();
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
      cleft    = [this.model.get('ablagefach'), this.model.get('color-inside')],
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
  el: '.calculation .price',
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
  el: '.calculation .time',
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
    'click .gallery-cell': 'handleSelection'
  },
  initialize: function() {
    console.log("created AppView ", this.el, this.model);
    var self = this;

    this.previewView = new App.Views.Preview({model: this.model});
    this.optionsView = new App.Views.OptionsView({model: this.model});
    this.costView = new App.Views.CostView({model: this.model});
    this.deliveryTimeView = new App.Views.DeliveryTimeView({model: this.model});

    this.galleryViews = _.object(
      this.$("section").map(function() {
        return $(this).attr("id");
      }),
      this.$(".gallery").map(function() {
        return new App.Views.GalleryView({el: this});
      })
    );
    this.tabViews = this.$(".tab__content").map(function() {
      var contentViews = $(this).find("section").map(function() {
        return self.galleryViews[$(this).attr("id")];
      });
      return new App.Views.TabView({el: this, collection: contentViews});
    });

    this.listenTo(this.model, "change", this.updateSelection);
  },

  updateSelection: function() {
    _.each(this.model.keys(), function(attribute) {
      if (this.model.hasChanged(attribute)) {
        var selected = this.model.get(attribute);
        var $inputs = $("input[name='"+selected.name+"']");
        // check selected option
        $inputs.prop("checked", false);
        if (selected) {
          $inputs.filter("[data-name='"+selected.name+"']").prop("checked", true);
        } else {
          $inputs.filter("[value='none']").prop("checked", true);
        }
        //  show/hide available options
        if (_.has(selected, "availableOptions")) {
          var self = this;
          _.each(_.keys(selected.availableOptions), function(option) {
            var available = selected.availableOptions[option];
            _.each(_.where(self.galleryViews, {name: option}), function(view) {
              view.model.set("available", available);
            });
          });
        }
      }
    }.bind(this));
  },

  render: function() {
    this.previewView.update();
    this.optionsView.render();
    this.costView.render();
    this.deliveryTimeView.render();
  },

  handleSelection: function(e) {
    //console.log(e);
    var $target = $(e.target);
    if ($target.prop("tagName") == "INPUT") {
      var name = $target.attr("name");
      var data = $target.data();
      console.log(data);
      this.model.set(name, falseIfEmpty(data));
    }
  }
});

App.Router = Backbone.Router.extend({
  routes: {
    ':tab(/:subTab)': 'viewTab'
  },

  viewTab: function(tab, subTab) {
    var tabIndex = window.locatePosByHref('#' + tab);
    // open subtab if appropriate
    if (subTab) {
      if (subTab === "selected") {
        // find subtab with checked input
        subtabEl = $('[data-tab-id=' + tab + ']').find("input:checked").parents("section");
        window.tabsList[tabIndex]._show(subtabEl.index());
      } else {
        var subtabEl = $('[data-tab-id=' + tab + ']').find("section")[subTab];
        window.tabsList[tabIndex]._show(subTab);
      }
      // scroll selected element into view
      var flickityElement = $(subtabEl).find(".gallery")[0];
      var flickity = _.findWhere(window.flickityList, { element: flickityElement });
      var itemIndex = $(subtabEl).find("input:checked").parents(".gallery-cell").index();
      setTimeout(function() {
        flickity.resize();
        flickity.select(itemIndex);
      }, 100);
    }
    // navigate to selected tab
    navigate(tabIndex);
  }
});
var router = new App.Router();

// start routing
Backbone.history.start();

function falseIfEmpty(data) {
  return _.keys(data).length == 0 ? false : data;
}

// read default configuration from DOM
var defaults = _.object(
  $("input:checked").map(function() { return $(this).attr("name"); }),
  $("input:checked").map(function() { return falseIfEmpty($(this).data()); }) );

var config = new App.Models.Configuration();
var view = new App.Views.AppView({model: config});

// set defaults after initializing event listeners
config.set(defaults);
view.render();
