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
  
  ///////////////////////////////////////////////////////////
  
  var App = {
    Models: {},
    Views: {}
  };
  
  App.Models.Configuration = Backbone.Model.extend({
    defaults: {
      material: 'Material 1',
      model: 'Model 1',
      size: 'Size 1',
      extra1: '',
      extra2: '',
      extra3: '',
      color1: 'Color1 Red',
      color2: 'Color2 Red',
      color3: 'Color3 Red'
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
    el: '.calculation .quantity',
    events: {
      'click input[radio]': 'updateQuantity'
    },
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function() {},
    updateQuantity: function(e) {
      $(e.target);
    }
  });
  
  App.Views.AppView = Backbone.View.extend({
    el: 'body',
    events: {
      'click #materialaa .gallery-cell': 'selectMaterial',
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
    },
    
    render: function() {
      this.optionsView.render();
    },
    
    selectMaterial: function(e) {
      //console.log(e);
      var material = $(e.target).data('name');
      console.log(material);
      if (material) this.model.set('material', material);
    },
    
    selectModel: function(e) {
      //console.log(e);
      var model = $(e.target).data('name');
      console.log(model);
      if (model) this.model.set('model', model);
    },
    
    selectSize: function(e) {
      //console.log(e);
      var size = $(e.target).data('name');
      console.log(size);
      if (size) this.model.set('size', size);
    },
    
    selectExtra: function(e) {
      //console.log(e);
      var section = $(e.target).parents('section').attr('id');
      var extra = $(e.target).data('name');
      console.log(section, extra);
      if (extra) this.model.set(section, extra);
    },
     
    selectColor: function(e) {
      //console.log(e);
      var section = $(e.target).parents('section').attr('id');
      var color = $(e.target).data('name');
      console.log(section, color);
      if (color) this.model.set(section, color);
      console.log(this.model)
    },
  });

var config = new App.Models.Configuration();
var view = new App.Views.AppView({model: config});
view.render();

}());