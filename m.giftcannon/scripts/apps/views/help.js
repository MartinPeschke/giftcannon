define(["require", "tools/ajax"
    , "text!templates/help/coupon.html"
    , "text!templates/help/pay.html"
    , "text!templates/help/codepay.html"
    , "text!templates/help/send.html"
    , "text!templates/help/splash.html"
    ]
    , function (require, ajax) {
        var View = ajax.View.extend({
            initialize: function() {}
            , render: function (page) {
                var view = this;
                require(["text!templates/help/"+page+".html"], function(template){
                    view.setupPage(template);
                })
            }
    });
    return View;
});