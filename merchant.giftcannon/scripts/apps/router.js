define(["require", "models/loginstatus", "views/auth" ]
    , function (require, LoginStatus) {
      var $rootContainer = window.__options__.$container
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
      , authedDodo = function(required, idx, action){
          return function(){
              if(LoginStatus.isLoggedIn()){
                  dodo(required, idx, action).apply(this, arguments);
              } else {
                  window.app_router.navigate("/login", true);
              }
          }
      }
      , AppRouter = Backbone.Router.extend({
              routes: {
                "login": "login"
                , "logout": "logout"
                , "redemption": "redemption"
                , "valid/:code": "valid"
                , "*default": "default"
              }
              , initialize:function(){
                  this.on("route:default", function(path){
                      if(LoginStatus.isLoggedIn()){
                          window.app_router.navigate("/redemption", true);
                      } else{
                          window.app_router.navigate("/login", true);
                      }
                  });
                  this.on("route:login", dodo(["views/auth"], 30));
                  this.on("route:redemption", dodo(["views/redemption"], 40));
                  this.on("route:valid", dodo(["views/coupon_valid"], 50));
                  this.on("route:logout", function(){
                      if(confirm("Really logout?")){
                          LoginStatus.logout();
                          window.app_router.navigate("/login", true);
                      } else {
                          window.history.back();
                      }

                  });
              }
        })
        , initialize = function () {
              window.app_router = new AppRouter;
              Backbone.history.start({ pushState: true });
              var onTap = function(e){
                if($(e.target).hasClass("stop")){
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                } else if($(e.target).hasClass("history-back")){
                    window.history.back();
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                } else if(!(e.ctrlKey||e.metaKey)){
                    if(!$(e.currentTarget).attr("disabled") && !$(e.target).closest(".link-stop").length)window.app_router.navigate($(e.currentTarget).attr("href"), true);
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                } else if(!$(e.currentTarget).is("a")) {
                  window.open($(e.currentTarget).attr("href"), "_blank");
                }
              };

              var events = {};
              events['click'] = function(e){e.preventDefault();};
              events[hnc.support.clickEvent] = onTap;
              events['keyup'] = function(e){
                  if(e.keyCode == 13){
                      if(!(e.ctrlKey||e.metaKey)){
                          if(!$(e.currentTarget).attr("disabled")
                              && !$(e.target).closest(".link-stop").length)
                              window.app_router.navigate($(e.currentTarget).attr("href"), true);
                          e.preventDefault();
                      } else if(!$(e.currentTarget).is("a")) {
                          window.open($(e.currentTarget).attr("href"), "_blank");
                      }
                  }
              };
              $("body").on(events, ".link");
              $("body").on(events, ".stop");

              window.app_router.getCoupon = function(){
                if(_.isEmpty(PAGE_MAP[40]))return;
                else return PAGE_MAP[40].gift;
              }

        };
        return { initialize: initialize };
    }
);