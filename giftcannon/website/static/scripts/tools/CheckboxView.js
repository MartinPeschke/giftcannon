define(["tools/Gift"], function (gift) {
  /* DEPRECATED CHECKBOX BUTTON */
  var CheckboxView = Backbone.View.extend({
    events: {
      "click .checkbox-label": "toggleOption"
       , "click .checkbox": "toggleOption"
       , "keyup .checkbox": "keyPressOption"
    }
    , initialize: function () {
      this.checkbox = this.$el.find(".checkbox");
      this.onCreate && this.onCreate();
    }
    , keyPressOption: function (e) {
      if (_([13, 32]).contains(e.keyCode)) { this.toggleOption() }
    }
    , toggleOption: function () {
      var status = !this.getStatus();
      this.setStatus(status);
      this.onChange && this.onChange(status);
    }
    , getStatus: function () {
      return this.checkbox.hasClass("checked");
    }
    , setStatus: function (status) {
      if (status) {
        this.checkbox.addClass("checked").removeClass("unchecked");
      } else {
        this.checkbox.removeClass("checked").addClass("unchecked");
      }
    }
  })
  , auth_handler = window.__auth__
  , PublishOptionsView = CheckboxView.extend({
    onCreate: function () {
      auth_handler.getPermissions();
      this.setStatus(gift.getStreamPublish());
      gift.bind("change:notification", this.displayOptions, this);
    }
    , onChange: function (status) {
      gift.setStreamPublish(status, { silent: true });
    }
    , displayOptions: function (model) {
      this.setStatus(gift.getStreamPublish());
    }
  })
  , SendAnonymousView = CheckboxView.extend({
    onCreate: function () {
      gift.bind("change:notification", this.displayOptions, this);
      this.setStatus(gift.getAnonymous());
    }
    , onChange: function (status) {
      gift.setAnonymous(status, { silent: true });
    }
    , displayOptions: function (model) {
      this.setStatus(gift.getAnonymous());
    }
  });
  return { CheckboxView: CheckboxView, PublishOptionsView: PublishOptionsView, SendAnonymousView: SendAnonymousView };
});