require(["tools/Gift", "tools/CategoryView", "tools/BirthdayView", "tools/CheckboxView"], function (Gift, CategoryView, BirthDayView, checkboxes) {
	var auth_handler = window.__auth__
  , ThankYouView = Backbone.View.extend({
  	events: { "click .thank-btn": "sendThankYou" }
    , initialize: function () {
    	var view = this;
    	this.publish_options = new checkboxes.PublishOptionsView({ el: this.$el.find("#publish-options") });
    	this.button = new sprints8.LoadingButton(this.$el.find(".thank-btn"));
    }
    , render: function () {
    	this.$el.slideDown();
    }
    , sendThankYou: function (e) {
    	var view = this
      , proceed_for_real = function () {
      	var gift = JSON.parse(view.$el.find("#gift-json").val());
      	gift.Recipient.access_token = FB.getAccessToken();
      	gift.thankyou = view.$el.find("#thankyou-message").val();
      	gift.notification = { stream_publish: view.publish_options.getStatus() };
      	sprints8.send({ url: "/api/gift/thankyou"
          , data: gift
          , success: function (resp, status, xhr) {
          	view.button.stopLoading();
          	view.$el.slideUp();
          	view.$el.parent().find("#display-thankyou-area").html(gift.thankyou).hide().removeClass("hidden").slideDown();
          }
      	});
      };

    	this.button.setLoading();

    	perms = auth_handler.getPermissions();
    	if (this.publish_options.getStatus() && !perms.publish_stream) {
    		FB.login(function (response) {
    			if (response.status === "connected") {
    				proceed_for_real();
    			} else {
    				Gift.setStreamPublish(false);
    			}
    		}, { scope: "publish_stream,offline_access" });
    	} else {
    		proceed_for_real();
    	}
    }
  })

  , View = Backbone.View.extend({
  	el: $("#main")
    , initialize: function () {
    	Gift.destroy();
    	this.birthdayView = new BirthDayView({ el: $("#upcoming-birthdays") });
    	var target = this.$el.find("#code-text-loader")
    	if (target.length) {
    		this.issueCode(target);
    	}
    }
    , render: function () { }
    , issueCode: function (target) {
    	var view = this
      , thankyou_writearea = $("#send-thankyou-area");
    	this.gift_id = target.attr("_gift_id");
    	this.user_token = target.attr("_user_token");
    	if (thankyou_writearea.length) {
    		this.thankyouview = new ThankYouView({ el: thankyou_writearea, user_token: this.user_token, gift_id: this.gift_id });
    	}
    	sprints8.send({ url: "/api/gift/issue"
        , data: { gift: { id: this.gift_id, recipient: { user_token: this.user_token}} }
        , success: function (resp, status, xhr) {
        	var gift = resp.Gift, parent = target.closest(".coupon-code");
        	parent.find(".code-text.code").html(gift.code);
        	parent.find(".code-text.hideable").addClass("hidden");
        	parent.find(".success.hidden").removeClass("hidden");
        	target.remove();
        	if (view.thankyouview) view.thankyouview.render();
        }
    	});
    }
  });
	var page = new View(), categoryView = new CategoryView({ el: $("#suggested-gifts") });
	return page;
});