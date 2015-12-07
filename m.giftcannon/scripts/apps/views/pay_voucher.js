define(["require", "tools/messaging", "tools/ajax", "tools/creditcard"
    , "models/product"
    , "models/payment"
    , "models/loginstatus"
    , "text!templates/pay.html"
    , "text!templates/pay_form_code.html"
    , "text!templates/product_details.html"
    , "text!templates/popup/email.html"]
    , function (require, messaging, ajax, CreditCard, ProductModels, Payment, LoginStatus, page_template, form_template_code, product_template, email_help) {
        var HELPS = {email:email_help}
        , valid_email = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i
        , View = ajax.View.extend({
            template: _.template(page_template)
            , product_template:_.template(product_template)
            , events: {}
            , initialize: function() {
                this.setupPage(this.template({backLink:'/', helpLink: '/help/codepay'}));
                this.$body = this.$(".payment-form");
                this.catalog = ProductModels.catalog;
                this.events[hnc.support.clickEvent + " .context-help"] = "showContextHelp";
            }
            , cleanForm: function(){
                this.$form.find(".error").removeClass("error").find(".help-block").remove();
            }
            , showError: function(elem, m){
                m = m.replace(/_/g, " ").replace(/_/g, " ").toLowerCase().toTitleCase();
                elem.closest(".control-group").addClass("error").find(".help-block").remove();
                elem.closest(".control-group").prepend('<div class="help-block">'+ m+'</div>');
            }
            , showContextHelp: function(e){
                var popup = _.intersection(e.target.className.split(" "), _.keys(HELPS));
                if(popup.length){
                    hnc.animateLink($(e.target));
                    this.showPopup(popup[0]);
                }
            }
            , showPopup: function(popup){
                messaging.showModal(HELPS[popup]);
                _gaq.push(['_trackEvent', 'ShowPopup', popup]);
            }
            , setLoading : function(loading){
                var setLoading = function(idx, elem){
                        elem = $(elem);
                        elem.data("label", elem.text()).text(elem.attr("data-loading")).attr("disabled", "disabled");
                    }
                    , unLoading = function(idx, elem){
                        elem = $(elem);
                        elem.text(elem.data("label")).removeAttr("disabled");
                    };
                hnc.setLoading(loading);
                this.$form.find(".btn").each(loading?setLoading:unLoading);
            }
            , onProduct: function(product){
                this.product = product;
                this.$(".product-details").html(this.product_template({product: product}));
                this.$(".btn-back").attr("href", "/product/"+product.get("id"));

                this.$(".voucher-link").html(this.voucher_link_template({product:product}));
                this.$(".creditcard-link").html(this.card_link_template({product:product}));
            }
            , wrapGift: function(form){
                var data = ajax.serializeJSON(form);
                data.Gift.url = "http://gftc.me/";
                return data;
            }
            , validateEmail: function(data){
                var ph = data.Gift.User.email;
                if(ph && valid_email.test(ph)){
                    data.Gift.User.email = ph;
                    this.$("#cardholder-email").removeClass("error").find(".help-block").remove();
                    return true;
                } else{
                    this.showError(this.$("#cardholder-email"), "Invalid email address");
                    return false;
                }
            }
            , onVoucherPayment: function(details, resp, status, xhr){
                this.setLoading(false);
                if(resp.PaymentStatus.success){
                    Payment.set(resp.Payment);
                    LoginStatus.clearGiftMessage();

                    _gaq.push(['_addTrans', Payment.getGiftToken(), 'GiftCannonMobile', Payment.getAmount(), 0, 0, "Oxford", "Oxford", "UK"]);
                    _gaq.push(['_addItem', Payment.getGiftToken(), Payment.getProduct().get("id"), Payment.getProduct().get("name"), "Products", Payment.getAmount(), "1"]);
                    _gaq.push(['_trackTrans']);

                    window.app_router.navigate("/pay/success/"+resp.Payment.Gift.token, true);
                } else {
                    var m = resp.PaymentStatus.message;
                    _gaq.push(['_trackEvent', 'PostPayment', 'Failure', m]);
                    this.showError(this.$form.find("[name=voucherCode]"), m);
                }
            }
            , onSubmitCode: function(e){
                var view = this, data = this.wrapGift($(e.target));

                if(!this.validateEmail(data))return false;
                LoginStatus.set({"email":this.$("#cardholder-email").val()});
                this.cleanForm();
                this.setLoading(true);
                data.method="VOUCHER";
                ajax.submitPrefixed({url:"/app/gift/create", data: data, success:_.bind(this.onVoucherPayment, this, data), complete: function(resp) {view.setLoading(false);}});
                _gaq.push(['_trackEvent', 'PrePayment', 'VoucherCode']);
                return false;
            }
            , render: function () {
                this.$body.html(form_template_code);
                this.$form = this.$(".form-validated");
                this.$form.on({submit:_.bind(this.onSubmitCode, this)});
                this.$("#cardholder-email").val(LoginStatus.get("email"));
            }
        });
        return View;
    });
