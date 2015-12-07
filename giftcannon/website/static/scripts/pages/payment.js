define(["tools/Gift", "tools/GiftView", "libs/jquery.validate", "libs/jquery_tooltip"]
, function (gift, giftView, validate, tooltips) {
    var qtyErrorMsg = "You can only send one gift with a voucher."
        , checkQty = function (value, elem) {
            var quantity = gift.getQuantity(), maxQty = parseInt($(elem).attr("max-quantity"), 10);
            return quantity <= maxQty;
        };
    if (typeof jQuery.validator != 'undefined') {
        jQuery.validator.addMethod("max-product-quantity", checkQty, qtyErrorMsg);
    }
    var View = Backbone.View.extend({

        el: $("#payment-page")
        , events: { "click .questionmark": "showCVCPopup" }
        , original_button_text: null
        , payment_heading_template: _.template($("#payment-heading-template").html())
        , is_sending: false

        , initialize: function () {
            var view = this;
            this.checkForm = _.debounce(_.bind(view.checkValidation, view), 25);
            this.validator = this.getValidator();
            this.button = new sprints8.LoadingButton(this.$(".btn.pay-now"));

            // connect usedDetails radio to highlighting/dimming
            this.$el.find(".js-payment-selector").change(_.bind(this.highlightOptions, this));
            this.highlightOptions();

            // connect card type radio boxes to validation rule updating
            this.$(".payment-type-selector").change(_.bind(this.switchPaymentTypeOnClick, this));
            this.on("payment:visible", this.preCheckPaymentForm, this);
            this.curPaymentType = this.$(".payment-type-selector:checked").val();

            // Check for Used Credit Card Details and set CVC hint accordingly
            var ctypeinput = this.$el.find("#card-type-used");
            if (ctypeinput.length) this.setCVCRules(this.$el.find("#security-code-used"), ctypeinput.val());

            this.$el.on({ keyup: function (e) { view.button.setState(view.validator.checkForm()); } }, "input.required");

            this.$pageTitle = this.$el.find(".js-payment-heading");
            gift.bind("change:quantity", this.reRenderProductPrice, this);
            gift.bind("change:quantity", this.reCheckPaymentMethod, this);
        }
        , reCheckPaymentMethod: function(gift, quantity){
            this.$("#payment-form").valid();
        }
        , preCheckPaymentForm: function(){
            var view = this
                , cardtype = this.curPaymentType
                , payment_meta = this.options.payment_types[cardtype]
                , fieldset = this.$("#"+payment_meta.fieldsetId);

            // reimplementing hlf of validate's fuinctionlituy for displaying only this one up front
            if(fieldset.length) {
                fieldset.find(".max-product-quantity").each(function(idx, elem){
                    if(!checkQty(idx, elem)){
                        var params = {};
                        params[$(elem).attr("name")] = qtyErrorMsg;
                        view.validator.showErrors(params);
                    }
                });
            }
        }
        , highlightOptions: function (e) {
            var target = (e && e.target) ? $(e.target) : this.$el.find(".js-payment-selector:checked");
            this.$el.find(".creditcard-form.highlighted")
                .removeClass("highlighted")
                .find(".money").find("input,select")
                .prop('disabled', true);
            $(target).closest(".creditcard-form")
                .addClass("highlighted").find(".money")
                .find("input,select").prop('disabled', false);
            this.validator.resetForm();
        }
        , switchPaymentTypeOnClick: function (e) {
            return this.setPaymentType($(e.target))
        }
        , setPaymentType: function (target) {
            var cardtype = target.val()
                , payment_meta = this.options.payment_types[cardtype]
            this.curPaymentType = cardtype;
            if (payment_meta.disableAllFields) {
                this.$(".payment-form").addClass("dimmed").find("input,select").attr("disabled", true);
                this.validator.resetForm();
                target.closest(".money").find(".error").removeClass("error");
            } else if(payment_meta.fieldsetId){
                var curFieldset = this.$el.find("fieldset.payment-form:not(.hidden)");
                if(curFieldset.attr("id") !== payment_meta.fieldsetId) {
                    curFieldset.addClass("hidden")
                    this.$("#"+payment_meta.fieldsetId).removeClass("hidden").find("input,select").removeAttr("disabled");
                }
                this.$(".payment-form").removeClass("dimmed")
                this.$("#"+payment_meta.fieldsetId).find("input:disabled,select:disabled").removeAttr("disabled")
            }
            if(payment_meta.isCreditCard) {
                var code = this.$el.find("#security-code")
                    , cardnumber = this.$el.find("#card-number4")
                    , payment_meta = this.options.payment_types[cardtype]
                    , digits = payment_meta.cvcDigits
                    , numberDigits = payment_meta.numberDigits;
                cardnumber.rules("remove", "minlength maxlength max");
                cardnumber.prop("maxlength", numberDigits).rules("add",
                    { minlength: numberDigits
                        , maxlength: numberDigits
                        , max: (Math.pow(10, numberDigits) - 1)
                    }
                );
                this.setCVCRules(code, cardtype);
            }
            this.trigger("payment:visible");
            this.button.setState(this.validator.checkForm());
        }
        , setCVCRules: function (cvcInput, type) {
            var payment_meta = this.options.payment_types[type]
                , digits = payment_meta.cvcDigits;
            cvcInput.rules("remove", "minlength maxlength max");
            cvcInput.rules("add", { minlength: digits, maxlength: digits, max: (Math.pow(10, digits) - 1) });
            cvcInput.siblings(".security-code-hint").html(payment_meta.securityHint);
            cvcInput.prop("maxlength", digits);
        }
        , checkValidation: function (elems) {
            var val = this.validator.checkForm();
            this.button.setState(val);
        }
        , getValidator : function() {
            var view = this;
            return $("#payment-form").validate({
                rules: {
                    "card-holder": { required: "#use-saved-false:checked" }
                    , "card-type": { required: "#use-saved-false:checked" }
                    , "card-number1": { required: "#use-saved-false:checked", minlength: 4, maxlength: 4 }
                    , "card-number2": { required: "#use-saved-false:checked", minlength: 4, maxlength: 4 }
                    , "card-number3": { required: "#use-saved-false:checked", minlength: 4, maxlength: 4 }
                    , "card-number4": { required: "#use-saved-false:checked", minlength: 4, maxlength: 4 }
                    , "security-code": { required: "#use-saved-false:checked", minlength: 3, maxlength: 3 }
                    , "code": { required: "#use-saved-false:checked" }
                    , "security-code-used": { required: "#use-saved-true:checked", minlength: 3, maxlength: 3 }
                }
                , errorElement: "span"
                , errorPlacement: function (error, elem) {
                    $(elem).siblings("span.error").remove();
                    $(elem).closest(".formLine").append(error);
                    view.checkForm()
                }
                , submitHandler: _.bind(this.proceed, this)
                , highlight: function (element, errorClass, validClass) {
                    if (element.type === 'radio') { this.findByName(element.name).addClass(errorClass).removeClass(validClass); }
                    else { $(element).addClass(errorClass).removeClass(validClass); }
                    view.checkForm()
                }
                , unhighlight: function (element, errorClass, validClass) {
                    if (element.type === 'radio') { this.findByName(element.name).removeClass(errorClass).addClass(validClass); }
                    else { $(element).removeClass(errorClass).addClass(validClass); }
                    view.checkForm()
                }
                , onkeyup: false
            });
        }

        , proceed: function () {
            var view = this
            if (!this.is_sending) {
                this.button.setLoading();
                var errors = gift.check(), params;
                if (errors.length == 0) {
                    params = _.extend({
                        type: "POST"
                        , dataType: "json"
                        , url: "/api/gift/send"
                        , contentType: "application/json; charset=utf-8"
                        , data: this.wrap_gift(gift)
                        , success: _.bind(this.handleSubmissionResult, this)
                        , error: function () { if (typeof console != 'undefined') { console.log(arguments); } view.button.stopLoading(); }
                    }, {});
                    $.ajax(params);
                } else {
                    this.$el.find("#submit-payment-button").after('<div class="errorhint formLine"><span class="error">Please select a ' + errors[0] + ' first</span></div>');
                    this.button.stopLoading();
                }
            }
        }
        , wrap_gift: function (gift) {
            var result = gift.toJSON(), form = $("#payment-form");
            delete result.recipient.id;
            delete result.category_id;
            if ($("#use-saved-false").prop("checked")) {
                var cardtype = this.$el.find('.payment-type-selector:checked').val()
                    , payment_meta = this.options.payment_types[cardtype];
                result.payment = { type: cardtype, save_details: false }
                if (payment_meta.isCreditCard === true) {
                    _.extend(result.payment,
                        {
                            holder: form.find("#card-holder").val()
                            , number: _.pluck(form.find(".creditcard_"), 'value').join("")
                            , expiry_year: form.find("#expiry-year").val()
                            , expiry_month: form.find("#expiry-month").val()
                            , cvs: form.find("#security-code").val()
                            , save_details: form.find("#save-details").prop("checked")
                            , use_saved_details: false
                        }
                    );
                } else {
                    _.extend(result.payment, sprints8.serializeJSON(this.$("#"+payment_meta.fieldsetId).find("input")));
                }
            } else {
                result.payment = {
                    use_saved_details: true
                    , cvs: form.find("#security-code-used").val()
                    , type: form.find("#card-type-used").val()
                };
            }
            result.sender = window.__auth__.user;
            return JSON.stringify(result);
        }
        , handleSubmissionResult: function (resp, status, xhr) {
            var result = resp.Payment_Result;
            if (result) {
                if (result.redirectUrl) {
                    window.location = result.redirectUrl;
                } else if (result.success === true) {
                    gift.save({ token: resp.Gift.token });
                    window.__auth__.refreshUser();
                    window.location.href = this.options.success_furl + resp.Gift.token + "#refresh";
                } else {
                    if (result.message == "INVALID_CARD_NUMBER") {
                        result.message = result.message.split("_").join(" ").toProperCase();
                        this.validator.showErrors({
                            "card-number1": result.message
                            , "card-number2": result.message
                            , "card-number3": result.message
                            , "card-number4": result.message
                        });
                    } else if (result.message == "PAYMENT_FAILED") {
                        app_router.navigate("send/failed", true);
                    } else { if (typeof console != 'undefined') console.log("unknown payment response: ", result) }
                    this.button.stopLoading();
                }
            } else {
                if (resp.dbMessage == "INVALID_VOUCHER") {
                    this.validator.showErrors({
                        "code": "Invalid voucher code"
                    });
                    } else if (resp.dbMessage == "QUANTITY_MUST_BE_ONE") {
                        this.validator.showErrors({
                            "code": "Too many products for this payment method."
                    });
                }
                this.button.stopLoading();
            }
        }
        , showCVCPopup: function (e) {
            this.popup = this.popup || (new sprints8.Popup($("#cvcPopupTemplate").html()));
            this.popup.show();
        }
        , render: function () {
            var view = this;
            if (giftView.checkAndForward("send")) {
                this.reRenderProductPrice(gift, gift.getQuantity());
                this.$el.find("#submit-payment-button").siblings(".errorhint").remove();
                sprints8.navigate_to("payment-page");
                this.button.setState(this.validator.checkForm());
                this.trigger("payment:visible");
            }
        }
        , reRenderProductPrice : function(gift, quantity){
            var product = gift.get("product");
            this.$pageTitle.html(this.payment_heading_template(
                _.extend({ pretty_price: gift.getTotalPrice(), quantity: quantity }, product)));
        }
    });
    return new View(window.__options__);
}
);