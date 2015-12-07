define(["tools/ajax"
    , "tools/map"
    , "models/payment"
    , "models/venue"
    , "text!templates/gift_map.html"
    , "text!templates/venue_single.html"]
    , function(ajax, Map, Payment, Venue, page_template, venue_template){
        var View = ajax.View.extend({
            template:_.template(page_template)
            , productId : null
            , initialize: function(){}
            , baseRender: function(token, payment){
                if(payment.isEmpty()){
                    window.app_router.navigate("", true);
                    return;
                } else {
                    var product = payment.getProduct();
                    if(product.get("id") != this.productId){
                        this.setupPage(this.template({token:token}));
                        this.map = new Map({root: this.$(".map-container")});
                        this.map.on("infobox:clicked", function(id){window.app_router.navigate("/venue/"+id, true)})
                        this.map.render();

                        this.venues = new Venue.Venues(null,null,{pid:product.get("id")});
                        this.venues.getVenues(this.onVenues, this);
                    }
                    this.productId = product.get("id");
                }
            }
            , onVenues: function(models){
                var view = this, html = [];
                this.map.onLoaded(function(){
                    models.each(function(model, idx){
                        view.map.addNumberedPin(
                            {latitude: model.get("latitude"), longitude: model.get("longitude")}
                            , idx+1
                            , model.get("name")
                            , model.get("id"));
                    });
                });
            }
            , render: function (token) {
                Payment.checkOrFetch("/app/gift", token, this.baseRender, this, token);
            }
        });
        return View;
    });
