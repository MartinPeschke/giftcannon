define(["tools/Gift", "tools/GiftView"]
  , function (Gift, giftView) {

      var BingMapsView = Backbone.View.extend({
          el: $("#selectVenue-page-map")
      , template: _.template($("#infobox-venue-template").html())

      , user_location: null
      , user_ip: null
      , defaults: { center: { latitude: 51.49372996502337, longitude: -0.13329023305040488 }, initial_zoom: 13, selected_zoom: 17 }

      , areMapsLoaded: false
      , initialize: function () {
          var view = this;

          sprints8.send({ url: "/api/location", data: null, success: _.bind(this.setUserLocation, this), type: "GET" });
          this.mapsLoaded = new window.sprints8.deferreds(function () { return view.mapsLoaded });
      }
      , onMapsLoaded: function () {
          var view = this, center = this.defaults.center;
          center.location = new Microsoft.Maps.Location(center.latitude, center.longitude);
          this.map = new Microsoft.Maps.Map(document.getElementById(this.$el.attr("id")),
                { credentials: this.options.key
                , center: center.location
                , mapTypeId: Microsoft.Maps.MapTypeId.road
                , showDashboard: true
                , showMapTypeSelector: false
                , disableBirdseye: true
                , showScalebar: true
                , enableClickableLogo: false
                , enableSearchLogo: false
                , showCopyright: false
                , zoom: this.defaults.initial_zoom
                });
          Microsoft.Maps.Events.addHandler(this.map, "tiledownloadcomplete", function () { view.areMapsLoaded = true; view.mapsLoaded.run(); })
          window.map = this.map
          if (this.model.models.length) { this.render(this.model); }  //if venues already did arrive, lets first render 
          this.model.bind("reset", this.render, this);

          if (Gift.get("venue")) { this.updateView(Gift, true) } //gift already preselected
          Gift.bind("change:venue", this.updateView, this);

          this.model.bind("highlight", this.highLightVenueOnMap, this); // viewOnMap
      }

      , updateView: function (model, lenient) {
          var giftvenue = model.get("venue");
          if (giftvenue) {
              var venue = this.model.get(giftvenue.id);
              if (venue) this.highLightVenueOnMap(venue);
          } else if (!lenient) {
              this.resetMapView();
          }
      }
      , highLightVenueOnMap: function (venue) {
          this.setLocation(venue.get("latitude"), venue.get("longitude"), true);
          this.showInfoBox(venue, true);
      }
      , resetMapView: function () {
          if (this.model.models.length > 0) {
              var venue = this.model.models[0];
              this.map.setView({ center: new Microsoft.Maps.Location(venue.get("latitude"), venue.get("longitude")), zoom: this.defaults.initial_zoom });
          } else {
              this.map.setView({ center: this.defaults.center.location, zoom: this.defaults.initial_zoom });
          }
      }
      , getLocation: function () {
          var center = this.map.getCenter();
          return center.latitude + "," + center.longitude;
      }
      , setLocation: function (latitude, longitude, zoomed_in) {
          this.map.setView({ center: new Microsoft.Maps.Location(latitude, longitude), zoom: zoomed_in ? this.defaults.selected_zoom : this.defaults.initial_zoom, centerOffset: new Microsoft.Maps.Point(0, 60) });
      }
      , getUserIp: function () { return this.user_ip }
      , setUserLocation: function (resp, status, xhr) {
          this.user_location = resp.location;
          this.user_ip = resp.location.ip;
      }
          /* MAP Pin & Infobox Manipulation */
      , infoBoxClicked: function (e) {
          var target = $(e.originalEvent.target).closest(".remover");
          if (target.length > 0) {
              var id = $(e.target).prop("data-entity-id")
            , venue = this.model.get(id);
              this.hideInfoBox(venue, true);
          }
      }
      , pinClicked: function (e) {
          var id = $(e.target).prop("data-entity-id")
          , venue = this.model.get(id);
          Gift.setVenue(venue);
      }
      , pinMouseHover: function (e) {
          var id = $(e.target).prop("data-entity-id")
          , venue = this.model.get(id);
          return this.showInfoBox(venue, false);
      }
      , pinMouseOut: function (e) {
          var id = $(e.target).prop("data-entity-id")
          , venue = this.model.get(id);
          if (e.originalEvent.offsetY > 0) this.hideInfoBox(venue, false);
      }
      , infoboxMouseOut: function (e) {
          if (!$(e.target).prop("_forceOpen")) {
              e.target.setOptions({ visible: false });
          }
      }
      , hideInfoBox: function (venue, force) {
          if (venue && venue._infobox) {
              var wasForcedOpen = $(venue._infobox).prop("_forceOpen");
              if (wasForcedOpen && force || !wasForcedOpen) {
                  venue._infobox.setOptions({ visible: false });
              }
          }
      }
      , showInfoBox: function (venue, force) {
          var infobox = venue._infobox, view = this;

          if (infobox && infobox.getVisible()) { return; }

          this.model.each(function (venue) {
              var ib = venue._infobox;
              if (ib && ib != infobox) {
                  ib.setOptions({ visible: false });
              }
          });

          if (!infobox) {
              var location = new Microsoft.Maps.Location(venue.get("latitude"), venue.get("longitude"));
              infobox = new Microsoft.Maps.Infobox(location, { visible: false, zIndex: 1, offset: new Microsoft.Maps.Point(-102, 20) });
              Microsoft.Maps.Events.addHandler(infobox, 'click', _.bind(this.infoBoxClicked, this));
              Microsoft.Maps.Events.addHandler(infobox, 'mouseleave', _.bind(this.infoboxMouseOut, this));
              $(infobox).prop("data-entity-id", venue.id);
              this.map.entities.push(infobox);
              venue._infobox = infobox;
          }
          var giftvenue_id = this.getSelectedVenueId()
            , html = this.template(_.extend({ selected: giftvenue_id == venue.id }, venue.toJSON()));
          infobox.setHtmlContent(html);
          $(infobox).prop("_forceOpen", force);
          infobox.setOptions({ visible: true });
      }
      , getSelectedVenueId: function () {
          return (Gift.get("venue") || {}).id;
      }



      , render: function (venues) {
          var view = this, pinlist = []
            , venue, pin
            , pos, i = 0, len = venues.models.length, location;
          for (; i < len; i++) {
              pos = (i + 1) + "";
              venue = venues.models[i];
              location = new Microsoft.Maps.Location(venue.get("latitude"), venue.get("longitude"));
              pin = new Microsoft.Maps.Pushpin(location, { text: pos, draggable: false, zIndex: 0, typeName: "pushPin", icon: "/static/img/sprites/mappin.png", height: 40, width: 40, textOffset: new Microsoft.Maps.Point(0, 0), anchor: new Microsoft.Maps.Point(20, 20) });
              $(pin).prop("data-entity-id", venue.id);
              Microsoft.Maps.Events.addThrottledHandler(pin, 'mouseover', _.bind(this.pinMouseHover, this), 250);
              Microsoft.Maps.Events.addHandler(pin, 'mouseout', _.bind(this.pinMouseOut, this));
              Microsoft.Maps.Events.addHandler(pin, 'click', _.bind(this.pinClicked, this));
              pinlist.push(pin);
          }
          this.mapsLoaded.add(function () {
              var mapentities = view.map.entities;
              if (mapentities.getLength()) { mapentities.clear(); } _(pinlist).each(function (pin) { mapentities.push(pin) });

              view.resetMapView();
          });
      }
      });
      return BingMapsView;
  });