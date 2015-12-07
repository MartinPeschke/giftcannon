require([], function () {
	var MyGiftsView = Backbone.View.extend({
		el: "#MyGifts-page"
	, events: { "click .showOnMapLink": "showMapPopup" }
	, switchTab: function (target) {
		var toTab = this.$el.find("#" + target.attr("_target")).find(".tab-body");
		this.$el.find(".active").removeClass("active");
		target.add(toTab).addClass("active");
	}
	, renderSent: function () {
		this.switchTab(this.$el.find(".tab.sent"));
	}
	, renderRcvd: function () {
		this.switchTab(this.$el.find(".tab.received"));
	}
	, onMapsLoaded: function () {
		var view = this;
		this.map = new Microsoft.Maps.Map(document.getElementById("directions_page_map"),
				{ credentials: this.options.key
				, mapTypeId: Microsoft.Maps.MapTypeId.road
				, showDashboard: true
				, showMapTypeSelector: false
				, disableBirdseye: true
				, showScalebar: true
				, enableClickableLogo: false
				, enableSearchLogo: false
				, showCopyright: false
				, zoom: 14
				});
	}
	, showMapPopup: function (e) {
		var $target = $(e.target).closest(".showOnMapLink")
			, location = new Microsoft.Maps.Location($target.attr("data-latitude"), $target.attr("data-longitude"))
			, pin = new Microsoft.Maps.Pushpin(location, {draggable: false, zIndex: 0, typeName: "pushPin", icon: "/static/img/sprites/mappin.png", height: 40, width: 40, anchor: new Microsoft.Maps.Point(0, 0) });
		this.map.entities.clear(); 
		this.map.entities.push(pin);
		this.map.setView({center: location });
		this.popup = this.popup || (new sprints8.Popup($("#popup-with-map").remove()));
		this.popup.show();
		
	}
	});
	var page = new MyGiftsView(window.__options__.maps)
	, AppRouter = Backbone.Router.extend({
		routes: {
			"received": "received"
			, "sent": "sent"
			, "*home": "default"
		}
		, received: function () {
			page.renderRcvd()
		}
		, sent: function () {
			page.renderSent()
		}
		, "default": function () {
			window.app_router.navigate("#received", true);
		}
	})
    , bingLoaded = false
    , bingLoadedFunc = function () { return bingLoaded }
    , mapsLoaded = new window.sprints8.deferreds(bingLoadedFunc);
	window.bingCallback = function () { bingLoaded = true; mapsLoaded.run() };
	mapsLoaded.add(_.bind(page.onMapsLoaded, page));
	if ($("#bingMapsSources").length == 0) { // doing this, cos IE, maps in cache seems to conflict with trying create map on hidden div from cache
		var n = document.createElement("script"), i = document.getElementsByTagName("head")[0]; n.type = "text/javascript"; n.language = "javascript"; n.id = "bingMapsSources";
		n.src = "http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&onscriptload=bingCallback"; i.appendChild(n);
	}

	window.app_router = new AppRouter;
	Backbone.history.start({ pushState: false });
	return app_router;
});