(function() {
  'use strict';

  var galleries = document.querySelectorAll('.gallery'),
    tabs = document.querySelectorAll('.subtabs'),
    tabsList = [],
    flickityList = [];

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
    var radioButtons = _.flatten([_.slice(document.getElementsByName('size')), _.slice(document.getElementsByName('color2'))]),
      colorRadioButtons = document.getElementsByName('color1'),
      cleftRadioButtons = _.flatten([_.slice(document.getElementsByName('model')), _.slice(document.getElementsByName('color1'))]);

    function update() {
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
    'click .remove': 'removeExtra'
  },
  initialize: function() {
    console.log("created OptionsView ", this.el, this.model);
    this.listenTo(this.model, 'change', this.render);
  },
  template: Handlebars.compile($('#optionsTpl').html()),
  render: function() { this.$el.html(this.template(this.model.toJSON()));
  },

  removeExtra: function(e) {
    e.preventDefault();
    var item = $(e.target).data('item');
    console.log("remove " + item)
    this.model.set(item, null);
  }
});

App.Views.CostView = Backbone.View.extend({
  el: '.calculation',
  events: {
    'click label': 'updateQuantity'
  },
  quantities: [25, 100, 250, 500, 1000, 2500, 5000],
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

    var unitPrice = this.model.values().reduce(function(sum, option) {
      return sum + (_.has(option, "price") ? option.price : 0);
    }, 0);

    return this.quantities.map(function(q) {
      return {
        quantity: q,
        price: unitPrice * q,
        selected: q == selectedQuantity
      }
    });
  },
  computeTotal: function() {
    var prices = this.computePrices();
    var index = _.findIndex(prices, function(p) {
      return p.selected;
    });
    var net_total = prices[index].price;
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
    'click #material .gallery-cell': 'selectMaterial',
    'click #model .gallery-cell': 'selectModel',
    'click #size .gallery-cell': 'selectSize',
    'click #extra1 .gallery-cell': 'selectExtra',
    'click #extra2 .gallery-cell': 'selectExtra',
    'click #extra3 .gallery-cell': 'selectExtra',
    'click #color1 .gallery-cell': 'selectColor',
    'click #color2 .gallery-cell': 'selectColor',
    'click #color3 .gallery-cell': 'selectColor'
  },
  initialize: function() {
    console.log("created AppView ", this.el, this.model);
    this.optionsView = new App.Views.OptionsView({model: this.model});
    this.costView = new App.Views.CostView({model: this.model});
  },

  render: function() {
    this.optionsView.render();
    this.costView.render();
  },

  selectMaterial: function(e) {
    //console.log(e);
    var material = $(e.target).data();
    console.log(material);
    if (material) this.model.set('material', material);
  },

  selectModel: function(e) {
    //console.log(e);
    var model = $(e.target).data();
    console.log(model);
    if (model) this.model.set('model', model);
  },

  selectSize: function(e) {
    //console.log(e);
    var size = $(e.target).data();
    console.log(size);
    if (size) this.model.set('size', size);
  },

  selectExtra: function(e) {
    //console.log(e);
    var section = $(e.target).parents('section').attr('id');
    var extra = $(e.target).data();
    console.log(section, extra);
    if (extra) this.model.set(section, extra);
  },

  selectColor: function(e) {
    //console.log(e);
    var section = $(e.target).parents('section').attr('id');
    var color = $(e.target).data();
    console.log(section, color);
    if (color) this.model.set(section, color);
    console.log(this.model)
  },
});

var defaults = _.object(
  $(".is-selected input").map(function() { return $(this).parents("section").attr("id") }),
  $(".is-selected input").map(function() { return $(this).data() }) );
var config = new App.Models.Configuration(defaults);
var view = new App.Views.AppView({model: config});
view.render();
