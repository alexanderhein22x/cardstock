(function() {
  'use strict';

  var galleries = document.querySelectorAll('.gallery'),
    tabs = document.querySelectorAll('.subtabs'),
    tabsList = [],
    flickityList = [];
    window.tabsList = tabsList;

  _.each(galleries, function(gallery) {
    var flkty = new Flickity(gallery, {
      // options
      cellAlign: 'left',
      accessibility: false,
      pageDots: false,
      prevNextButtons: false,
      contain: true
    });

    flickityList.push(flkty);
  });

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

  function updateParagraphClasslist(radioButtons, paragraph) {
    _.each(radioButtons, function(radioButton) {
      if (radioButton.checked) {
        paragraph.classList.add(radioButton.value);
      }
    });
  }

  function updateParagraph(radioButtons, className) {
    var paragraph = document.querySelector('.' + className);
    paragraph.className = className;
    updateParagraphClasslist(radioButtons, paragraph);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var materialRadioButtons = document.getElementsByName('material'),
      radioButtons = _.flatten([_.slice(document.getElementsByName('size')), _.slice(document.getElementsByName('color1'))]),
      colorRadioButtons = document.getElementsByName('color1'),
      materialRadioButtons = document.getElementsByName('material'),
      cleftRadioButtons = _.flatten([_.slice(document.getElementsByName('model')), _.slice(document.getElementsByName('color1'))]);

    function update() {
      updateParagraph(materialRadioButtons, 'container');
      updateParagraph(radioButtons, 'front');
      updateParagraph(radioButtons, 'back');
      updateParagraph(colorRadioButtons, 'colorinner');
      updateParagraph(cleftRadioButtons, 'cleft');
    }

    _.each(radioButtons, function (radioButton) {
      radioButton.addEventListener('change', update, false);
    });

    update();
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
      tabsList[tabIndex]._show(href[1]);
    }
    navigate(tabIndex);
    e.preventDefault();
  }
});

App.Views.CostView = Backbone.View.extend({
  el: '.calculation',
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

App.Views.AppView = Backbone.View.extend({
  el: 'body',
  events: {
    'click .gallery-cell': 'handleSelection'
  },
  initialize: function() {
    console.log("created AppView ", this.el, this.model);
    this.optionsView = new App.Views.OptionsView({model: this.model});
    this.costView = new App.Views.CostView({model: this.model});
    this.listenTo(this.model, "change", this.updateSelection);
  },

  updateSelection: function() {
    _.each(this.model.keys(), function(attribute) {
      if (this.model.hasChanged(attribute)) {
        var selected = this.model.get(attribute);
        var $section = $("section#" + attribute);
        $section.find("input").prop("checked", false);
        if (selected) {
          $section.find("input[data-name='"+selected.name+"']").prop("checked", true);
        } else {
          $section.find("input[value='none']").prop("checked", true);
        }
      }
    }.bind(this));
  },

  render: function() {
    this.optionsView.render();
    this.costView.render();
  },

  handleSelection: function(e) {
    //console.log(e);
    var $target = $(e.target);
    var section = $target.parents('section').attr('id');
    if ($target.prop("tagName") == "INPUT") {
      var data = $(e.target).data();
      console.log(data);
      this.model.set(section, falseIfEmpty(data));
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

var defaults = _.object(
  $(".is-selected input").map(function() { return $(this).parents("section").attr("id") }),
  $(".is-selected input").map(function() { return falseIfEmpty($(this).data()); }) );
var config = new App.Models.Configuration(defaults);
var view = new App.Views.AppView({model: config});
view.render();
