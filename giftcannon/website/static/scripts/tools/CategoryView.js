define(["tools/Gift", "libs/jquery_tooltip"]
, function (Gift, tooltips) {
    var View = Backbone.View.extend({
        events: {
            "click .gift-frame": "startGiftGiving"
        }
      , initialize: function () {
        var boxes = this.$el.find(".gift-frame");
        sprints8.tooltipUp(boxes);
      }
      , render: function () { }
      , startGiftGiving: function (e) {
        var product_id = $(e.currentTarget).attr("data-entity-id");
        var prod = JSON.parse($(e.currentTarget).attr("data"));
        Gift.setCategory(prod.category_id);
        delete prod.category_id;
        Gift.addProduct(prod);
        $(e.currentTarget).addClass("selected");
      }
    });
    return View;
});