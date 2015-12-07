define(["require", "tools/ajax", "models/loginstatus", "text!templates/coupon_valid.html"]
    , function (require, ajax, LoginStatus, page_template) {
        var Gift = ajax.Model.extend({
                getProductName: function(){
                    return this.get("Product").name;
                }
                , getProductPicture: function(){
                    return "/imgs/items/" + this.get("Product").picture;
                }
            })
        , View = ajax.View.extend({
            template:_.template(page_template)
            , initialize: function() {}
            , renderValidCoupon: function(gift){
                this.$el.html(this.template({gift: new Gift(gift)}));
            }
            , render: function(code){
                var gift = window.app_router.getCoupon();
                if(_.isEmpty(gift))window.app_router.navigate("/redemption", true);
                else this.renderValidCoupon(gift);
            }
        });
        return View;
    });
