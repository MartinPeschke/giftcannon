define([], function () {
	var now = new Date()
	, year = now.getFullYear()
	, now = new Date(year, now.getMonth(), now.getDate())
	, one_day = 1000 * 60 * 60 * 24
	, to_date = function (mon, day) { return new Date(year, mon - 1, day) }
	, auth_handler = window.__auth__
	, FBFriend = Backbone.Model.extend({
		defaults: function () { return { name: 'FBFriend 1' }; }
	})
	, FBFriendList = Backbone.Collection.extend({
		model: FBFriend
		, initialize: function () { }
		, parse: function (resp, xhr) {
			var model = this
			, options = window.__options__.giftview || {}
			, preset = options.preset, is_friend = false, preset_rcpt = {};
			if (preset && !_.isEmpty(preset.Recipient)) {
				preset_rcpt = preset.Recipient;
			}
			_(resp).map(function (entry) {
				entry.facebook_id = entry.id;
				is_friend = is_friend || entry.facebook_id == preset_rcpt.facebook_id;
				if (model.parseHook) { entry = model.parseHook(entry) };
			});
			if (!(is_friend || _.isEmpty(preset_rcpt))) {
				resp.push(preset_rcpt);
			}
			return resp;
		}
		, sync: function (method, model, options) {
			if (method != "read") {
				console.log("FU: FriendList: Anything but fetch is forbidden");
			} else {
				auth_handler.getFriends(options.success);
			}
		}
		})
	, FBFriendWithBirthdayList = FBFriendList.extend({
		parseHook: function (friend) {
			if (typeof friend.birthday == 'string') {
				friend.birthday = to_date.apply(this, friend.birthday.split("/"));
				friend.distance = Math.ceil((friend.birthday - now) / one_day);
				friend.bday_is_today = friend.distance in [0, 1] && friend.birthday.getDate() == now.getDate();
				friend.bday_is_tomorrow = friend.distance in [0, 1] && friend.birthday.getDate() != now.getDate();
			} else {
				friend.distance = -1;
				friend.bday_is_today = false;
				friend.bday_is_tomorrow = false;
			}
			return friend
		}
	});
	return { FBFriendList: FBFriendList, FBFriendWithBirthdayList: FBFriendWithBirthdayList };
}
);


