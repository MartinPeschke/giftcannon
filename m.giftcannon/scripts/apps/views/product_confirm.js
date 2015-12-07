define([
    "require"
    , "tools/ajax"
    , "models/loginstatus"
    , "models/product"
    , "models/venue"
    , "text!templates/product_confirm.html"
    , "text!templates/product_details.html"
    , "text!templates/product_confirm_body.html"
    , "text!templates/venue_single.html"]
    , function (require, ajax, LoginStatus, ProductModels, Venue, page_template, product_template, page_body, venue_template) {
        var events = {};
        events[hnc.support.clickEvent + " .btn-proceed"] = "onProceed";

        var View = ajax.View.extend({
            template:_.template(page_body)
            , product_template:_.template(product_template)
            , venue_template:_.template(venue_template)
            , events: events
            , initialize: function() {
                this.setupPage($(page_template));
                this.$productDetails = this.$(".product-details");
                this.$bodyText = this.$(".product-confirm-body");
                this.model = ProductModels.catalog;
            }
            , onProceed: function(e){
                var msg = this.$("textarea").val();
                if(msg){
                    LoginStatus.setGiftMessage(msg);
                } else {
                    LoginStatus.clearGiftMessage();
                }
                window.app_router.navigate("/pay/"+this.product.get("id"), true);
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            , onVenues: function(product, venues) {
                var view = this, html = [];
                venues.each(function(model, idx){
                    html.push(view.venue_template({idx:idx+1, venue:model}));
                });
                this.$(".venue-details").html(html.join(''));
            }
            , onProduct: function(product){
                this.product = product;
                this.$productDetails.html(this.product_template({product: product}));
                this.$bodyText.html(this.template({product:product}));
                Venue.getVenues(product.get("id"), this.onVenues, this, product);
            }
            , render : function(id){
                if(!this.product || this.product.get("id") != id){
                    this.$productDetails.empty();
                    this.model.getProduct(id, this.onProduct, this);
                }
                var view = this;
                this.$el.find("#gift-personal-message").on({touchstart:hnc.noop, touchend: hnc.noop, click: hnc.noop})
                setTimeout(function(){
                    view.$el.find("#gift-personal-message").off();
                }, 500);

                this.$("#gift-personal-message").val(LoginStatus.getGiftMessage());
            }
        });
        return View;
    });