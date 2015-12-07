define(["tools/ajax"
    , "models/payment"
    , "text!templates/gift_welcome.html"
    , "text!templates/gift_welcome_body.html"], function(ajax, Payment, page_template, body_template){
    var View = ajax.View.extend({
        template:_.template(body_template)
        , initialize: function(){
            this.setupPage(page_template);
        }
        , baseRender: function(token, payment){
            if(payment.isEmpty()){
                window.app_router.navigate("", true);
                return;
            }
            var product = payment.getProduct();
            this.$(".page-body").html(this.template({token:token, message: payment.getMessage(), product : product}));
        }
        , render: function (token) {
            Payment.checkOrFetch("/app/gift", token, this.baseRender, this, token);
        }
    });
    return View;
});
