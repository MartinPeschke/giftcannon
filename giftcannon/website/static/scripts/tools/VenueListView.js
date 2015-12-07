define(["tools/Gift", "tools/GiftView"]
  , function (Gift, giftView) {
    var VenueListView = Backbone.View.extend({
      el: $("#venue-list-container")
      , template: _.template($("#list-venue-template").html())
      , events: { "click .showMap": "showOnMap"
            , "click .venue-select": "venueSelected"
      }
      , initialize: function (params) {
        this.model.bind("reset", this.render, this);
        Gift.bind("change:venue", this.updateView, this);
      }
      , updateView: function (model, lenient) {
        var venue = model.get("venue");
        if (venue) {
          this.$el.find(".venue-select.inactive").removeClass("inactive").html("Select");
          this.$el.find("#venue-entity-" + venue.id).find(".venue-select").addClass("inactive").html("Selected");
        }
      }
      , showOnMap: function (e) {
        var id = $(e.target).closest(".venue-entity").attr("data-entity-id")
          , venue = this.model.get(id);
        venue.trigger("highlight", venue);
      }
      , venueSelected: function (e) {
        var target = $(e.target)
            , id = target.closest(".venue-entity").attr("data-entity-id")
            , venue = this.model.get(id);
        if (target.hasClass("inactive")) return;
        Gift.setVenue(venue);
      }
      , render: function (venues) {
        var widgetlist = []
            , len = venues.models.length
            , i = 0
            , giftvenue_id = this.getSelectedVenueId()
            , t = this.template
            , venue;
        for (; i < len; i++) {
          venue = venues.models[i];
          widgetlist.push(t(_.extend({ pos: (i + 1) + "" }, venue.toJSON())));
        }
        this.$el.html(widgetlist.join(""));
        if (Gift.get("venue")) { this.updateView(Gift, true) }
      }
      , getSelectedVenueId: function () {
        return (Gift.get("venue") || {}).id;
      }
    });
    return VenueListView;
  });