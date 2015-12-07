define(["tools/Gift", "tools/GiftView", "models/FBFriendModels", "tools/FBFriendCarousel", "tools/BootstrapButtons", "libs/jquery.validate", "libs/jquery_tooltip"]
  , function (gift, giftView, fbmodels, FBFriendCarousel, buttons) {

      var auth_handler = window.__auth__
    , View = Backbone.View.extend({
        el: $("#selectRecipient-page")
      , initialize: function () {
          var view = this
          , checkForm = _.debounce(_.bind(view.checkAndActivateButton, view), 25);
          auth_handler.getPermissions();
          this.proceedBtn = this.$el.find(".proceed-btn");
          this.filterbox = this.$el.find("#selectFriend-filter");

          var rcpt = this.getPresetRecipient();
          $("#rcpt-message").val(gift.get("message") || "");
          this.filterbox.bind("keydown", _.bind(this.checkFilter, this));
          this.filterbox.bind("keyup", _.bind(this.filter, this));

          this.friendlist_widget = new FBFriendCarousel();
          this.friendlist_widget.bind("selected", this.friendSelected, this);
          this.friendlist_widget.bind("unselected", this.friendUnSelected, this);

          this.btn_stream_publish = this.$el.find(".stream-publish");
          this.btn_send_anon = this.$el.find(".send-anonymous");

          this.model = new fbmodels.FBFriendList();
          this.model.fetch({ success: _.bind(this.setFriends, this) });

          if (Gift.getStreamPublish()) this.btn_stream_publish.button("toggle");
          if (Gift.getAnonymous()) this.btn_send_anon.button("toggle");

          $.validator.addMethod("fbfriend", function (value, element) {
              return !!(view.friendlist_widget.getSelectedFBId());
          }, "Please select a recipient for your gift from facebook");


          this.form_validator = $("#rcptform").validate({
              rules: { email: { required: true, email: true }
                  , name: { required: true, fbfriend: true }
                  , message: { required: true }
              }
          , errorElement: "span"
          , onkeyup: false
          , onfocusout: false
          , submitHandler: _.bind(this.proceed, this)
          , errorPlacement: function (error, elem) {
              $(elem).siblings("span.error").remove();
              $(elem).closest(".formLine").append(error);
              checkForm()
          }
          , highlight: function (element, errorClass, validClass) {
              if (element.type === 'radio') { this.findByName(element.name).addClass(errorClass).removeClass(validClass); }
              else { $(element).addClass(errorClass).removeClass(validClass); }
              checkForm()
          }
          , unhighlight: function (element, errorClass, validClass) {
              if (element.type === 'radio') { this.findByName(element.name).removeClass(errorClass).addClass(validClass); }
              else { $(element).removeClass(errorClass).addClass(validClass); }
              checkForm()
          }
          });
          this.checkAndActivateButton();
          this.$el.on({ keyup: checkForm , focusout: function(){view.wrapAndSaveRecipient()}}, "input.required, textarea.required");
          gift.bind("reset:recipient", this.unsetRecipient, this);
      }

      , getPresetRecipient: function () {
          var result = {}, rcpt = gift.get("recipient"), preset = this.options.preset;
          if (!_.isEmpty(rcpt)) {
              result = rcpt;
          } else if (preset && !_.isEmpty(preset.Recipient)) {
              preset.Recipient.isPreset = true;
              result = preset.Recipient;
          }
          return result;
      }

      , checkAndActivateButton: function () {
          if (giftView.checkEnabled("venue") || this.$el.find("#selectFriend-email").val() && this.form_validator.checkForm()) {
              sprints8.activateButton(this.proceedBtn);
          } else {
              sprints8.deActivateButton(this.proceedBtn);
          }
      }
      , wrapAndSaveRecipient: function (recipient) {
          var facebook_id = this.friendlist_widget.getSelectedFBId()
            , recipient = recipient || this.model.get(facebook_id) || {}
            , view = this, el = view.$el
            , notification = { stream_publish: view.btn_stream_publish.hasClass("active")
                            , anonymous: view.btn_send_anon.hasClass("active")
            };
          if (recipient.toJSON) recipient = recipient.toJSON();
          recipient.type = (recipient.facebook_id ? "FACEBOOK" : "EMAIL");
          recipient.email = el.find("#selectFriend-email").val();
          recipient.name = view.filterbox.val();
          recipient.picture = recipient.picture || "/static/img/sprites/default_profile_picture.png";
          gift.set({ message: el.find("#rcpt-message").val(), recipient: recipient, notification: notification });
          gift.save();
          this.checkAndActivateButton();
      }
      , friendSelected: function (facebook_id) {
          var recipient = this.model.get(facebook_id);
          this.filterbox.val(recipient.get("name"));
          this.form_validator.resetForm();
          this.wrapAndSaveRecipient(recipient);
      }
      , friendUnSelected: function (id) {
          this.filterbox.val("");
      }

      , setFriends: function () {
          var rcpt = this.getPresetRecipient(), selection;
          if (rcpt) {
              var emailfield = this.$el.find("#selectFriend-email");
              if (rcpt.isPreset) {
              } else {
                  emailfield.focus();
              }
              emailfield.val(rcpt.email);
              this.filterbox.val(rcpt.name);
              this.friendlist_widget.reset(_.shuffle(this.model.models), rcpt.facebook_id);
          } else {
              this.friendlist_widget.reset(_.shuffle(this.model.models));
          }
      }
      , unsetRecipient: function () {
          this.filterbox.val("");
          this.$el.find("#selectFriend-email").val("");
          this.filter();
          this.$el.find("#rcpt-message").val("");
          sprints8.deActivateButton(this.proceedBtn);
      }
      , reset: function () {
          this.unsetRecipient();
          gift.removeAttr("recipient");
      }
      , checkFilter: function (e) {
          switch (e.keyCode) {
              case 13:
              case 108:
                  this.friendlist_widget.selectFirst();
                  e.preventDefault();
                  e.stopPropagation();
                  break;
              case 27:
                  this.filterbox.val("");
                  break;
          }
      }
      , filter: function (e) {
          if (_([13, 27, 32, 108]).contains(e.keyCode)) return;
          var val = this.filterbox.val().toLowerCase(), len = val.length, rcpt_id = this.getPresetRecipient().facebook_id, rcpt_included = false, filteredlist;
          if (val == "") this.friendlist_widget.reset(this.model.models, rcpt_id);
          filteredlist = _.filter(this.model.models
            , function (item) {
                var names = item.get("name").toLowerCase(), result;
                names = [names].concat(names.split(" "));
                result = _.filter(names, function (name) { return name.substr(0, len) == val }).length > 0;
                if (result && rcpt_id == item.get("facebook_id")) rcpt_included = true;
                return result;
            });
          if (filteredlist.length == 0) {
              this.filterbox.addClass("error").removeClass("valid");
          } else {
              this.filterbox.addClass("valid").removeClass("error");
          }
          this.friendlist_widget.reset(filteredlist, rcpt_included ? rcpt_id : null);
      }

      , proceed: function (e) {
          require(["pages/venue"]); //preloading for performance only
          var view = this
        , proceed_for_real = function () {
            view.wrapAndSaveRecipient();
            window.app_router.navigate(view.proceedBtn.attr("href"), true);
        };

          perms = auth_handler.getPermissions();
          if (view.btn_stream_publish.hasClass("active") && !perms.publish_stream) {
              FB.login(function (response) {
                  if (response.status === "connected") {
                      proceed_for_real();
                  } else {
                      gift.setStreamPublish(false);
                  }
              }, { scope: "publish_stream,offline_access" });
          } else {
              proceed_for_real();
          }

      }
    , render: function () {
        sprints8.navigate_to("login-page");
        auth_handler.addLoginDeferred(function () {
            sprints8.navigate_to("selectRecipient-page");
        });
    }
    });
      return new View(window.__options__.giftview);
  }
);