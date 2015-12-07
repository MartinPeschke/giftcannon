define(["require"],
  function (require) {

    var AppRouter = Backbone.Router.extend({
      routes: {
        "product": "product"
        , "venue": "venue"
        , "recipient": "recipient"
        , "send": "send"
        , "send/failed": "sendfailed"
        , "send/success": "sendsuccess"
        , "*default": "default"
      }
      , product: function () {require(["pages/product"], function (view) { view.render(); });}
      , recipient: function () { require(["pages/recipient"], function (view) { view.render(); }); }
      , venue: function () { require(["pages/venue"], function (view) { view.render(); }); }
      , send: function () {require(["pages/payment"], function (view) {view.render();});}
      , sendfailed: function () {require(["pages/payment_failed"], function (view) {view.render();});}
      , sendsuccess: function () { require(["pages/payment_success"], function (view) { view.render(); }); }
      , "default": function () { require(["tools/GiftView"], function (GiftView) { window.app_router.navigate(GiftView.getDefaultPage(), true) }); }
    });

    var initialize = function () {
      window.app_router = new AppRouter;
      Backbone.history.start({ pushState: false });
    };
    return { initialize: initialize };
  }
);