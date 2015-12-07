define(["require"
        , "models/loginstatus"
        , "views/home"
        , "views/help"
        , "views/product"
        , "views/product_confirm"
        , "views/pay"
        , "views/pay_voucher"
        , "views/pay_success"
        , "views/gift_welcome"
        , "views/gift_map"
        , "views/gift_code"
        , "views/venue_details"]
    , function (require, LoginStatus) {
      var $rootContainer = $(window.__options__.$container)
      , PAGE_MAP = {}
      , dodo = function(required, idx, action){
          return function(){
              var args = arguments
                , id = "page-container-"+idx
                , $el = $rootContainer.find("#"+id);
              if(!$el.length){
                  $el = $('<div id="'+id+'" class="page-container"></div>').appendTo($rootContainer);
                  if(!isNaN(idx))$el.attr("data-page-index", idx);
              }
              hnc.showPage($el);
              require(required, function (View) {
                if(_.isEmpty(PAGE_MAP[idx]))PAGE_MAP[idx] = new View({el: $el});
                  PAGE_MAP[idx][action||'render'].apply(PAGE_MAP[idx], args);
              });
          }
      }
      , AppRouter = Backbone.Router.extend({
          routes: {
              "product": "product"
              , "product/:id": "product_confirm"
              , "help/:page": "help"
              , "pay/success/:token": "pay_success"
              , "pay/:id": "pay"
              , "codepay": "codepay"
              , "gift/coupon/:token": "gift_coupon"
              , "gift/code/:token": "gift_code"
              , "gift/map/:token": "gift_map"
              , "venue/:id": "venue_details"
              , "": "home"
              , "*default": "default"
          }
          , initialize:function(){
                  this.on("route:default", function(path){
                        if(path)this.navigate("/", true);
                  });
                  this.on("route:home", dodo(["views/home"], 1));
                  this.on("route:product", dodo(["views/product"], 30));
                  this.on("route:product_confirm", dodo(["views/product_confirm"], 32));
                  this.on("route:pay", dodo(["views/pay"], 40));
                  this.on("route:codepay", dodo(["views/pay_voucher"], 45));
                  this.on("route:help", dodo(["views/help"], "help-screen"));
                  this.on("route:pay_success", dodo(["views/pay_success"], 50));
                  this.on("route:gift_coupon", dodo(["views/gift_welcome"], 60));
                  this.on("route:gift_map", dodo(["views/gift_map"], 70));
                  this.on("route:gift_code", dodo(["views/gift_code"], 80));
                  this.on("route:venue_details", dodo(["views/venue_details"], 90));
          }})
        , initialize = function () {
              window.app_router = new AppRouter({});
              Backbone.history.start({ pushState: true });
              window.app_router.on("all",function(route, router) {
                  _gaq.push(['_trackPageview', window.location.pathname]);
              });

              var last = 0, onTap = function(e){
                var $t = $(e.target);
                if($t.hasClass("stop")){
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                } else if($t.hasClass("history-back")){
                    hnc.animateLink($(e.currentTarget));
                    window.history.back();
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                } else if($(e.currentTarget).hasClass("external-link")) {
                    hnc.animateLink($(e.currentTarget));
                    window.open($(e.currentTarget).attr("href"), "_blank");
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }else if(!(e.ctrlKey||e.metaKey)){
                    if(!$(e.currentTarget).attr("disabled") && !$t.closest(".link-stop").length){
                        if((((new Date()).getTime()) - last) > 500){
                            last = (new Date()).getTime();
                            hnc.animateLink($(e.currentTarget));
                            var href = $(e.currentTarget).attr("href");
                            if(!~href.indexOf("http"))
                                window.app_router.navigate(href, true);
                            else
                                window.location = href;
                        }
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
              }
              , events = {click: function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
              }}, submitEvents = {};
              events[hnc.support.clickEvent] = onTap;
              submitEvents[hnc.support.clickEvent] = function(e){hnc.animateLink($(e.target))};
              $("body").on(events, ".link");
              $("body").on(submitEvents, "button");
        };
        return { initialize: initialize };
    }
);