define(["tools/Gift", "tools/GiftView"]
  , function (Gift, giftView, BirthDayView) {
    var View = Backbone.View.extend({
      el: $("#paymentSuccess-page")
      , birthday_template: _.template($("#upcoming-birthdays-template").html())
      , initialize: function () {
        var view = this;

        view.$el.find(".recipient_name").html(Gift.get("recipient").name);
        var proceedBtn = view.$el.find(".proceed-btn"), url = proceedBtn.attr("_href");
        proceedBtn.attr("_href", url + Gift.get("token"));
        sprints8.activateButton(proceedBtn);
      }
      , render: function () {
        sprints8.navigate_to("paymentSuccess-page");
      }
    });
    return new View();
  }
);