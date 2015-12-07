define(["models/FBFriendModels"]
  , function (fbmodels) {
    var preset_gift_url = window.__options__.preset_gift_url
    , View = Backbone.View.extend({
      template: _.template($("#upcoming-birthdays-template").html())
      , events: { "click .js-birthday-selector": "prepopulateRecipient" }
      , fbFriendMap: {} // sparse friendmap, as only 3 can be clicked anyways, why save more?
      , initialize: function () {
        this.model = new fbmodels.FBFriendWithBirthdayList();
        this.model.fetch({ success: _.bind(this.friendsLoaded, this) });
      }
      , friendsLoaded: function (model, response) {
        var view = this
          , widgets = []
          , bday_friends = _.filter(model.models, function (friend) { return friend.get('distance') >= 0 });

        bday_friends.sort(function (a, b) {
          return a.get('distance') - b.get('distance')
        });
        _.each(bday_friends.slice(0, 3), function (friend) {
                              view.fbFriendMap[friend.id] = friend;
                              widgets.push(view.template(friend.attributes)); 
        });
        if (widgets.length) {
        	view.$el.find(".js-birthdaylist").html(widgets.join("")).closest(".giftcoupon-context").removeClass("hidden");
        }
      }
      , prepopulateRecipient: function (e) {
        var $target = $(e.target), selected = this.model.get($target.attr("data-entity-id"));
        this.$el.find("textarea").val(JSON.stringify({ Recipient: selected.attributes }));
        this.$el.submit();
      }
    });
    return View;
  });