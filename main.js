(function() {
  'use strict';

  var tabs = document.querySelectorAll('.tab__content'),
    galleries = document.querySelectorAll('.gallery'),
    tabsList = [],
    flickityList = [];

  window.tabsList = tabsList;
  window.flickityList = flickityList;

  function resizeSliders() {
    setTimeout(function() {
      _.each(flickityList, function(flktyItem) {
        flktyItem.resize();
      });
    }, 0);
  };

  _.each(tabs, function(tabElement) {
    var tab = new CBPFWTabs(tabElement);
    tabElement.addEventListener('click', function() {
      resizeSliders();
    });
    tabsList.push(tab);
  });

  resizeSliders();

  _.each(galleries, function(gallery) {
    var flkty = new Flickity(gallery, {
      // options
      cellAlign: 'left',
      accessibility: false,
      pageDots: false,
      prevNextButtons: false,
      contain: true,
      freeScroll: true
    });

    flickityList.push(flkty);
  });

}());


///////////////////////////////////////////////////////////

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
    quantity: 500
  }
});

App.Views.Preview = Backbone.View.extend({
  el: "#preview",
  initialize: function() {
    this.listenTo(this.model, "change", this.update);
  },
  update: function() {
    var
      format   = [this.model.get("size"), this.model.get("color1")],
      color    = [this.model.get("color1")],
      material = [this.model.get('material')],
      cleft    = [this.model.get('ablagefach'), this.model.get('color1')],
      cright    = [this.model.get('model')];

    this._updateParagraph(material, 'container');
    this._updateParagraph(format, 'front');
    this._updateParagraph(format, 'back');
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
    'click .remove': 'removeExtra',
    'click .link': 'handleLink'
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
  },

  handleLink: function(e) {
    var href = $(e.target).attr("href").split("/");
    var tabIndex = locatePosByHref(href[0]);
    // open subtab if appropriate
    if (href[1]) {
      var subtab = $(href[0]).find("section")[href[1]];
      tabsList[tabIndex]._show(href[1]);
    } else {
      // find subtab with checked input
      subtab = $(href[0]).find("input:checked").parents("section");
      tabsList[tabIndex]._show(subtab.index());
    }
    // scroll selected element into view
    var flickityElement = $(subtab).find(".gallery")[0];
    var flickity = _.findWhere(flickityList, { element: flickityElement });
    var itemIndex = $(subtab).find("input:checked").parents(".gallery-cell").index();
    setTimeout(function() {
      flickity.resize();
      flickity.select(itemIndex);
    }, 100);
    // navigate to selected tab
    navigate(tabIndex);
    e.preventDefault();
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
    var data = this.computeTotal();
    this.$el.html(this.template(data));
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
    this.previewView = new App.Views.Preview({model: this.model});
    this.optionsView = new App.Views.OptionsView({model: this.model});
    this.costView = new App.Views.CostView({model: this.model});
    this.deliveryTimeView = new App.Views.DeliveryTimeView({model: this.model});
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
            var $options = $("input[name='" + option + "']");
            $options.each(function() {
              if (available.indexOf($(this).prop("id")) < 0) {
                $(this).parent().addClass("hide");
              } else {
                $(this).parent().removeClass("hide");
              }
            });
            // if current selection no longer available, set to first available option
            var availableOptionNames = $options.filter(function() {
              return !$(this).parent().hasClass("hide");
            }).map(function() {
              return $(this).data("name");
            });
            if (_.indexOf(availableOptionNames, self.model.get(option).name) < 0) {
              self.model.set(option, falseIfEmpty($options.filter("#"+available[0]).data()));
            }
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

// App.Router = Backbone.Router.extend({
//   routes: {
//     ':section': 'viewSection',
//     ':section/:tab': 'viewTab'
//   },
//
//   viewSection: function(section) {
//
//   }
// });

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
