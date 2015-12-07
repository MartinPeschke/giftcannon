define(["tools/Gift", "tools/GiftView", "tools/VenueListView", "tools/BingMapsView", "libs/autocomplete"]
  , function (Gift, giftView, VenueListView, BingMapsView, autocomplete) {
      var 
      bingLoaded = false
    , bingLoadedFunc = function () { return bingLoaded }
    , mapsLoaded = new window.sprints8.deferreds(bingLoadedFunc)

    , page_id = "#selectVenue-page"
    , proceedBtn = $(page_id).find(".proceed-btn")
    , Venue = Backbone.Model.extend({ defaults: {} })
    , Venues = Backbone.Collection.extend({ model: Venue })
    , selectAutocompleteF = function (event) {
        var keyCode = $.ui.keyCode, $target = $(event.target);
        switch (event.keyCode) {
            case keyCode.ESCAPE:
                $target.val("");
                this.removeSelection(event);
                break;
            case keyCode.ENTER:
            case keyCode.NUMPAD_ENTER:
                var autocomplete = $target.data("autocomplete"), menu = autocomplete.menu;
                if (menu) {
                    menu.activate(event, menu.element.children().first());
                    menu.select(event);
                }
                break;
        }
    }


    , View = Backbone.View.extend({
        el: $("#selectVenue-page")
        , location_bar: $("#location-search-container")
        , initialize: function (options) {
            var view = this;

            this.model = new Venues();
            Gift.bind("reset:product", this.updateVenues, this);
            Gift.bind("change:venue", this.updateView, this);
            if (Gift.get("venue")) { this.updateView(Gift, true) }

            this.venueListView = new VenueListView({ model: this.model });
            this.mapView = new BingMapsView({ model: this.model, key: this.options.key });
            this.updateVenues(Gift);
            window.bingCallback = function () { bingLoaded = true; mapsLoaded.run() };
            mapsLoaded.add(_.bind(this.mapView.onMapsLoaded, this.mapView));

            this.location_search_widget = this.$el.find("#location-search-query").autocomplete({
                source: function (req, add) {
                    var searchServiceCallback = function (response) {
                        var widgets = [];
                        _.each(response.resourceSets, function (result) {
                            _.each(result.resources, function (res) {
                                if (res.confidence == 'High') {
                                    var params = { label: res.address.formattedAddress, latitude: res.point.coordinates[0], longitude: res.point.coordinates[1] }
                                    widgets.push(params);
                                }
                            });
                        });
                        add(widgets);
                    }
                    var query = req.term
                  , searchRequest = 'http://dev.virtualearth.net/REST/v1/Locations/' + query + '?c=en-GB&output=json&key=' + view.options.key + '&userIp=' + view.mapView.getUserIp() + '&userLocation=' + view.mapView.getLocation();
                    $.ajax({ url: searchRequest, dataType: "jsonp", success: searchServiceCallback, jsonp: "jsonp" });
                }
                , minLength: 2
                , appendTo: view.location_bar
                , change: function (e, ui) { if (!e.target.value) view.removeSelection(e) }
                , select: function (event, target) {
                    view.mapView.setLocation(target.item.latitude, target.item.longitude);

                    $(event.target).addClass("selected");
                    $(event.target).next(".icon").click(_.bind(view.removeSelection, view));
                }
            });
            this.location_search_widget.on("keyup", _.bind(selectAutocompleteF, this));
        }
        , removeSelection: function (e) {
            var target = $(e.target);
            if (!target.hasClass("selected")) { target = target.prev(".selected") }
            target.removeClass("selected").prop("value", "");
            this.updateVenues(Gift);
        }
        , updateVenues: function (gift) {
            var view = this, products = gift.get("product");
            if (products) {
                $.ajax({ url: "api/venue/bylocationandproduct"
                , data: JSON.stringify({ products: [products] })
                , mimeType: "application/json", contentType: "application/json"
                , dataType: "json"
                , type: "POST"
                , success: function (resp, status, xhr) {
                    var venues = [], rr = sprints8.resource_resolver;
                    _.each(resp.Merchant, function (merchant) {
                        _.each(merchant.Venue, function (venue) {
                            venues.push(_.extend(venue, { picture_url: rr.url(venue.picture), merchant: { name: merchant.name }, merchant_name: merchant.name }));
                        });
                    });
                    view.model.reset(venues);
                }
                });
            } else {
                view.model.reset();
            }
        }
        , updateView: function (model) {
            var giftvenue = model.get("venue");
            if (giftvenue) {
                sprints8.activateButton(proceedBtn);
            } else {
                sprints8.deActivateButton(proceedBtn);
            }
        }
        , render: function () {
            var view = this;
            if (giftView.checkAndForward("venue")) {
                sprints8.navigate_to("selectVenue-page");
                if ($("#bingMapsSources").length == 0) { // doing this so late, cos IE, maps in cache seems to conflict with trying create map on hidden div from cache
                    var n = document.createElement("script"), i = document.getElementsByTagName("head")[0]; n.type = "text/javascript"; n.language = "javascript"; n.id = "bingMapsSources";
                    n.src = "http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&onscriptload=bingCallback"; i.appendChild(n);
                }
            }
        }
    });
      var mainView = new View(window.__options__.maps)
      return mainView;
  });