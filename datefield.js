(function() {
'use strict';

// DateField
var DateField = function(options) { this.initialize(options); return this; }

// DateField Version
DateField.VERSION = '1.0.0';

$.extend(DateField.prototype, {

  options: {
    autoCompleteDelay: 500
  },

  initialize: function(options) {
    this.options = $.extend({}, this.options, options);
    this.el = $(this.options.el);
    this.el.data('dateField', this);
    this.createUI();
    this.setInitialValue();
    this.run(this.options);
  },

  createUI: function() {
    this.el.hide();
    this.ui = $(
      '<span class="ui-datepicker">' +
        '<input type="text" class="day" placeholder="dd" size="2" maxlength="2">' +
        '<span class="slash">/</span>' +
        '<input type="text" class="month" placeholder="mm" size="2" maxlength="2">' +
        '<span class="slash">/</span>' +
        '<input type="text" class="year" placeholder="yyyy" size="4" maxlength="4">' +
        '<span class="at"> at </span>' +
        '<input type="text" class="hour" placeholder="hh" size="2" maxlength="2">' +
        '<span class="colon">:</span>' +
        '<input type="text" class="minute" placeholder="mm" size="2" maxlength="2">' +
        '<a class="clear"></a>' +
      '</span>'
    );
    this.ui.insertAfter(this.el);

    this.dayInput = this.ui.find('.day');
    this.monthInput = this.ui.find('.month');
    this.yearInput = this.ui.find('.year');
    this.hourInput = this.ui.find('.hour');
    this.minuteInput = this.ui.find('.minute');

    this.clearButton = this.ui.find('.clear');

    var self = this;

    this.clearButton.on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      self.clear();
    });

    this.ui.find('input').
    on('keydown keypress', function(e) {
      self.inputWillReceiveKey(e);
      setTimeout(function() { self.inputDidReceiveKey(e) });
    }).
    on('blur', function(e) {
      self.inputDidLoseFocus(e);
    });
  },

  // Runs given commands.
  run: function(options) {
    for (var key in options) {
      var property = this[key];
      if ($.isFunction(property)) property.call(this, options[key]);
    }
  },

  // Sets the value from the value of `this.el`.
  setInitialValue: function() {
    if (this.el.val()) this.setValue(this.el.val());
  },

  // Setter method
  setValue: function(newValue) {
    if (newValue) {
      newValue = new Date(newValue);
      if (this._value && newValue.getTime() === this._value.getTime()) return;
      this._value = newValue;
      this.el.val(this._value.toISOString());
      this.clearButton.show();
    } else {
      this._value = null;
      this.el.val('');
      this.clearButton.hide();
    }

    this.updateUI();
  },

  // Returns the current value as `Date` object.
  value: function() {
    return this._value;
  },

  updateUI: function() {
    if (this._value) {
      this.yearInput.val(this._value.getFullYear());
      this.monthInput.val(this.lpad(this._value.getMonth() + 1, 2));
      this.dayInput.val(this.lpad(this._value.getDate(), 2));
      this.hourInput.val(this.lpad(this._value.getHours(), 2));
      this.minuteInput.val(this.lpad(this._value.getMinutes(), 2));
    } else {
      this.yearInput.val(null);
      this.monthInput.val(null);
      this.dayInput.val(null);
      this.hourInput.val(null);
      this.minuteInput.val(null);
    }
  },

  inputWillReceiveKey: function(e) {
    var input = $(e.target),
        klass = input.attr('class'),
        method = klass + 'InputWillReceiveKey';

    if (this[method]) this[method](e);
  },

  inputDidReceiveKey: function(e) {
    var input = $(e.target),
        klass = input.attr('class'),
        method = klass + 'InputDidReceiveKey';

    if (this[method]) this[method]();

    if (this.autoCompleteTimeout) clearTimeout(this.autoCompleteTimeout);

    var self = this;

    this.autoCompleteTimeout = setTimeout(function() {
      self.setValueFromUI();
    }, this.options.autoCompleteDelay);
  },

  inputDidLoseFocus: function(e) {
    var input = $(e.target),
        klass = input.attr('class'),
        method = klass + 'InputDidLoseFocus';

    if (this[method]) this[method](e);
  },

  setValueFromUI: function() {
    var year = this.yearInput.val(),
        month = this.monthInput.val(),
        day = this.dayInput.val(),
        hour = this.hourInput.val(),
        minute = this.minuteInput.val();

    if (year.match(/[0-9]{4}/) &&
        month.match(/[0-9]{1,2}/) &&
        day.match(/[0-9]{1,2}/)) {

      var newValue = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hour, 10) || 0,
        parseInt(minute, 10) || 0
      );

      this.setValue(newValue);
    } else if (year === '' && month === '' && day === '') {
      this.setValue(null);
    }
  },

  clear: function() {
    this.setValue(null);
  },

  dayInputDidLoseFocus: function(e) {
    if (this.dayInput.val() === '') return;
    this.dayInput.val(this.lpad(this.dayInput.val(), 2));
  },

  monthInputDidLoseFocus: function(e) {
    if (this.dayInput.val() === '') return;
    this.monthInput.val(this.lpad(this.monthInput.val(), 2));
  },


  // --- Helpers ---

  lpad: function(str, length, pad) {
    str = str.toString();
    if (pad === undefined) pad = '0';
    while (str.length < length) str = pad + str;
    return str;
  },

  capitalize: function(str) {
    var first = str.substr(0, 1),
        rest = str.substr(1);

    return first.toUpperCase() + rest;
  }

});


// DateField jQuery Method
$.fn.dateField = function(options) {
  return this.each(function() {
    var dateField = $(this).data('dateField');

    if (dateField) {
      dateField.run(options);
    } else {
      new DateField($.extend({ el: this }, options));
    }
  });
}

})();

