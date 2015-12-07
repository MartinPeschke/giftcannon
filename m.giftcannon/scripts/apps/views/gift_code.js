define(["tools/ajax"
    , "models/payment"
    , "models/venue"
    , "text!templates/gift_code.html"
    , "text!templates/venue_single.html"], function(ajax, Payment, Venue, page_template, venue_template){
    var View = ajax.View.extend({
        template:_.template(page_template)
        , venue_template:_.template(venue_template)
        , initialize: function(){}
        , baseRender: function(token, payment){
            if(payment.isEmpty()){
                window.app_router.navigate("", true);
                return;
            }
            var product = payment.getProduct();
            this.setupPage(this.template({token:token, code: payment.getGiftCode(), product : product}));
            Venue.getVenues(product.get("id"), this.onVenues, this);
        }
        , onVenues: function(models){
            var view = this, html = [];
            models.each(function(model, idx){
                html.push(view.venue_template({venue:model}));
            });
            this.$(".venue-details").html(html.join(''));
        }
        , render: function (token) {
            Payment.checkOrFetch("/app/gift", token, this.baseRender, this, token);
        }
    });
    return View;
});
