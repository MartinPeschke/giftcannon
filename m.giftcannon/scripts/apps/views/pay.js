define(["require", "tools/messaging", "tools/ajax", "tools/creditcard"
    , "models/product"
    , "models/payment"
    , "models/loginstatus"
    , "text!templates/pay.html"
    , "text!templates/pay_form.html"
    , "text!templates/pay_form_saved.html"
    , "text!templates/product_details.html"
    , "text!templates/popup/cvc.html"
    , "text!templates/popup/email.html"
    , "text!templates/popup/expired.html"]
    , function (require, messaging, ajax, CreditCard, ProductModels, Payment, LoginStatus, page_template, form_template, form_template_saved, product_template
        , cvc_help, email_help, details_expired_help
    ) {
        var valid_email = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i
        , HELPS = {"cvc": cvc_help, email:email_help, expired: details_expired_help}
        , View = ajax.View.extend({
            template: _.template(page_template)
            , product_template:_.template(product_template)
            , saved_template:_.template(form_template_saved)
            , events: {"keyup #creditcard-form-number": "checkNumber", "keydown #creditcard-form-number": "checkInputNumber"}
            , validCardEntered: false
            , noop: hnc.noop
            , initialize: function() {
                this.setupPage(this.template({backLink:'/product', helpLink: '/help/pay'}));
                this.$body = this.$(".payment-form");
                this.catalog = ProductModels.catalog;

                this.events[hnc.support.clickEvent + " .context-help"] = "showContextHelp";
                this.events["click .btn-discard"] = "noop";
                this.events[hnc.support.clickEvent + " .btn-discard"] = "discardSavedDetails";
            }
            , cleanForm: function(){
                this.validCardEntered = false;
                this.$form.find(".error").removeClass("error").find(".help-block").remove();
            }
            , showError: function(elem, m){
                m = m.replace(/_/g, " ").replace(/_/g, " ").replace(/^validation 140 /, '').toLowerCase().toTitleCase();
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
            }
            , wrapGift: function(form){
                var data = ajax.serializeJSON(form);
                data.Gift.Product = {id: this.product.get("id")};
                data.Gift.url = "http://gftc.me/";
                data.Gift.message = LoginStatus.getGiftMessage();
                return data;
            }
            , render: function (productId) {
                var view = this, details = LoginStatus.getPaymentDetails();
                if(this.$form)this.$form.off();
                if(_.isEmpty(details)){
                    this.$body.html(form_template);
                    this.$form = this.$(".form-validated");
                    this.$form.on({submit:_.bind(this.onSubmitNew, this)});
                    this.$numberInput = $("#creditcard-form-number");
                } else {
                    this.$body.html(this.saved_template({details: details, email: LoginStatus.get("email")}));
                    this.$form = this.$(".form-validated");
                    this.$form.on({submit:_.bind(this.onSubmitSaved, this)});
                    this.$numberInput = null;
                }
                this.$("#cardholder-email").val(LoginStatus.get("email"));
                this.catalog.getProduct(productId, this.onProduct, this);

                this.$el.find("#card-holder-name").on({touchstart:hnc.noop, touchend: hnc.noop, click: hnc.noop});
                setTimeout(function(){
                    view.$el.find("#card-holder-name").off();
                }, 500);

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
            /* ==================== CREDIT CARD SECTION =================== */
            , checkInputNumber: function(e){
                if(e.metaKey|| e.ctrlKey)return;
                if(e.keyCode>57 && e.keyCode != 229 || e.keyCode > 47 && this.getCleanNumber().length > 15){
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
            , getCleanNumber: function(){
                return this.$numberInput.val().replace(/-/g, "");
            }
            , checkNumber: function(e){
                var $t = $(e.target), val = $t.val();
                if(val){
                    var result = CreditCard.guessType(val);
                    if(result.success){
                        this.validCardEntered = this.validCardEntered || result.valid;
                        if(this.validCardEntered && !result.valid){
                            this.showError(this.$numberInput, hnc.translate("INVALID_CREDIT_CARD"));
                        } else if(result.success && result.sure && result.valid){
                            this.cleanForm();
                        }
                    } else {
                        if(val.length > 13)this.showError(this.$numberInput, hnc.translate("INVALID_CREDIT_CARD"));
                    }
                }
            }

            , discardSavedDetails: function(){
                LoginStatus.discardPaymentDetails();
                this.render(this.product.get("id"));
                _gaq.push(['_trackEvent', 'PrePayment', 'DiscardDetails']);
            }
            , onSubmitSaved: function(e){
                var view = this, data = this.wrapGift($(e.target));

                if(!this.validateEmail(data))return false;

                _.extend(data, LoginStatus.getPaymentDetails());

                this.setLoading(true);
                ajax.submitPrefixed({url:"/app/gift/create", data: data, success:_.bind(this.onPayment, this, data), error: function() {view.setLoading(false);}});
                _gaq.push(['_trackEvent', 'PrePayment', 'WithSavedDetails', this.product.get("name"), this.product.get("amount")]);
                return false;
            }
            , onSubmitNew: function(e){
                var view = this, $t = this.$numberInput, data = this.wrapGift($(e.target));

                if(!this.validateEmail(data))return false;

                this.cleanForm();
                var result = CreditCard.guessType($t.val());
                if(result.success && result.sure && result.valid)
                    data.method = result.candidates[0].code;
                else {
                    this.showError(this.$numberInput, hnc.translate("INVALID_CREDIT_CARD"));
                    return false;
                }
                this.setLoading(true);
                data.number = CreditCard.cleanUp($t.val());
                LoginStatus.set({"email":this.$("#cardholder-email").val()});
                ajax.submitPrefixed({url:"/app/gift/create", data: data, success:_.bind(this.onPayment, this, data), error: function(resp) {
                        view.setLoading(false);
                    }
                });
                _gaq.push(['_trackEvent', 'PrePayment', 'NewDetails', this.product.get("name"), this.product.get("amount")]);
                return false;
            }
            , onPayment: function(details, resp, status, xhr){
                this.setLoading(false);
                if(resp.PaymentStatus.success){
                    Payment.set(resp.Payment);
                    var obfNumber = "xxxx-xxxx-xxxx-" + details.number.substr(details.number.length - 4);
                    LoginStatus.setPaymentDetails({shopperRef:resp.Payment.shopperRef, method: details.method, number: obfNumber});
                    LoginStatus.clearGiftMessage();

                    _gaq.push(['_addTrans', Payment.getGiftToken(), 'GiftCannonMobile', Payment.getAmount(), 0, 0, "Oxford", "Oxford", "UK"]);
                    _gaq.push(['_addItem', Payment.getGiftToken(), Payment.getProduct().get("id"), Payment.getProduct().get("name"), "Products", Payment.getAmount(), "1"]);
                    _gaq.push(['_trackTrans']);

                    window.app_router.navigate("/pay/success/"+resp.Payment.Gift.token, true);
                } else {
                    var m = resp.PaymentStatus.message;
                    _gaq.push(['_trackEvent', 'PostPayment', 'Failure', m]);
                    if(m == "Object reference not set to an instance of an object."){
                        this.discardSavedDetails();
                        this.showPopup("expired");
                    } else if(/^validation 140 /.test(m)){
                        this.showError(this.$form.find("[name=expiryMonth]"), m);
                    } else {
                        this.showError(this.$form.find("[name=number]"), m);
                    }
                }
            }
        });
        return View;
    });
