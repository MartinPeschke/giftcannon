define(["tools/Gift", "tools/GiftView"]
  , function (Gift, giftView, validate, tooltips) {
    var View = Backbone.View.extend({
      el: $("#paymentFailed-page")
      , initialize : function(){}
      , render: function () {
        sprints8.navigate_to(this.$el.attr("id"));
      }
    });
    return new View();
  }
);