define(["require"
    , "views/venue"
    , "views/venue_edit"
    , "views/venue_create"

    ]
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
      , AppRouter = Backbone.Router.extend({
              routes: {
                "venues": "venues"
                , "venue/new": "venueCreate"
                  , "venue/products/:id": "venueProducts"
                  , "venue/:id": "venueEdit"
                , "*default": "default"
              }
              , venues: dodo(["views/venue"], 10)
              , venueEdit: dodo(["views/venue_edit"], 20)
              , venueCreate: dodo(["views/venue_create"], 30)
              , venueProducts: dodo(["views/venue_product"], 40)
              , default: function(path){
                    window.app_router.navigate("/venues", true);
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

              var opts = window.__options__, events = {};
              events['click'] = function(e){e.preventDefault();};
              events[opts.clickEvent] = onTap;
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