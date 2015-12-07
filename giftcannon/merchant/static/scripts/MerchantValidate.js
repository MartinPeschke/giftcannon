require(["/static/scripts/libs/jquery.validate.js"]
  , function (validate) {
    var formatDate = function (d) {
      var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    }

    var ValidateView = Backbone.View.extend({

      validatedGiftTemplate: _.template($("#validated-gift-template").html())
      , events: { "click .js-redeem": "redeemNow"
        , "click .close": "hideCoupon" 
        , 
        }
      , initialize: function () {
        this.validator = this.$el.find("#validate-form").validate({
          errorClass: "help-inline"
          ,errorElement: "span" // class='help-inline'
          ,highlight: function (element, errorClass, validClass) {
            $(element).closest(".control-group").addClass("error");
          }
          , unhighlight: function (element, errorClass, validClass) {
            $(element).closest(".control-group").removeClass("error");
          }
          , submitHandler: _.bind(this.submitValidationForm, this)
          , onfocusout: false
        });
      }
      , submitValidationForm: function (form) {
        this.$el.find("#coupon-container").slideUp();
        sprints8.send({
          url: this.options.validateUrl
          , data: { code: $(form).find("#coupon-code").val() }
          , success: _.bind(this.renderValidatedGift, this)
          , error: function (resp, status, xhr) {
            console.log(arguments);
          }
        });
      }
      , renderValidatedGift: function (gift, status, xhr) {
        var content;
        if (gift.success === false) {
          this.validator.showErrors({ "coupon-code": "Invalid coupon code" });
          this.$el.find("#coupon-code").val("");
        } else {
          this.$el.find("#coupon-code").val("").closest(".control-group").removeClass("error");
          content = this.validatedGiftTemplate(this.wrapServerGift(gift));
          this.$el.find("#coupon-container").hide().html(content).slideDown();
        }
      }
      , redeemNow: function (e) {
        var view = this;
        sprints8.send({
          url: this.options.redeemUrl
          , data: { code: $(e.target).attr("_couponcode") }
          , success: function (gift, status, xhr) {
            gift.newly_redeemed = true;
            view.renderValidatedGift(gift);
          }
          , error: function (resp, status, xhr) {
            console.log(arguments);
          }
        });
      }
      , wrapServerGift: function(gift){
          gift.created = gift.created ? formatDate(new Date(gift.created)) : "-";
          gift.issued = gift.issued ? formatDate(new Date(gift.issued)) : "-";
          gift.redeemed = gift.redeemed ? formatDate(new Date(gift.redeemed)) : "-";
          gift.is_valid =  _.include(["OPEN", "ISSUED"], gift.status);
          gift.is_expired =  gift.status == "EXPIRED";
          gift.is_redeemed =  gift.status == "REDEEMED";
          gift.newly_redeemed = gift.newly_redeemed || false;
          return gift;
      }
      , hideCoupon: function () {
        this.$el.find("#coupon-container").slideUp();
      }
    });

    return new ValidateView(window.__merchant__.options);
  });