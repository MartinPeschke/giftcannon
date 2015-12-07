define(["tools/messaging", "tools/ajax"
    , "models/payment"
    , "models/loginstatus"
    , "text!templates/pay_success.html"
    , "text!templates/popup/copysend.html"], function(messaging, ajax, Payment, LoginStatus, page_template, copysend_help){
    var HELPS = {"copysend": copysend_help}
        , events = {};
        events[hnc.support.clickEvent + " .context-help"] = "showContextHelp";
        events["longTap .url"] = "copySuccess";
        events[hnc.support.touchStartEvent + " .longtap-anchor"] = "copyInProgress";
    var View = ajax.View.extend({
        template:_.template(page_template)
        , initialize: function(){}
        , events: events
        , baseRender: function(payment){
            if(payment.isEmpty()){
                window.app_router.navigate("", true);
                return;
            }
            var product = payment.getProduct()
                , couponURL = 'http://gftc.me/' + payment.getGiftToken()
                , message;
            if(payment.getMessage()){
                message = encodeURIComponent('Hey there,\n\n' + payment.getMessage() + '\n\nYour '+ product.get('name').toLowerCase() +' is ready to pick up! Click on the link below to redeem it!\n'+couponURL +'\n\n-----------------------------------------------------\nSent via of http://giftcannon.com')
            } else {
                message = encodeURIComponent('Hey there,\n\nYour '+ product.get('name').toLowerCase() +' is ready to pick up! Click on the link below to redeem it!\n'+couponURL +'\n\n-----------------------------------------------------\nSent via of http://giftcannon.com')
            }
            this.setupPage(this.template({
                code: payment.getGiftCode()
                , iAmSender: payment.amISender(LoginStatus)
                , product: product
                , couponURL:couponURL
                , mailtoSubject: encodeURIComponent("A "+product.get('name').toLowerCase()+" for you")
                , mailtoBody:message
                }));
        }
        , copySuccess: function(e){
            this.$(".longtap-anchor").removeClass("active btn-multiline").html("Copied!");
        }
        , copyInProgress: function(e){
            $(e.target).addClass("active btn-multiline").html("Hold a bit longer<br/>to copy");
        }
        , showContextHelp: function(e){
            var popup = _.intersection(e.target.className.split(" "), _.keys(HELPS));
            if(popup.length){
                messaging.showModal(HELPS[popup]);
                _gaq.push(['_trackEvent', 'ShowPopup', popup[0]])
            }
        }
        , render: function (token) {
            Payment.checkOrFetch("/app/gift/senderGet", token, this.baseRender, this);
        }
    });
    return View;
});
