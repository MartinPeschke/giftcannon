define(["tools/ajax"
    , "models/venue"
    , "text!templates/venue_details.html"]
    , function(ajax, Venue, page_template){
        var View = ajax.View.extend({
            template:_.template(page_template)
            , initialize: function(){}
            , onVenue: function(venue_id, venue){
                var view = this;
                this.setupPage(this.template({venue:venue}));
            }
            , render: function (id) {
                this.$el.empty();
                this.venue = new Venue.Venue();
                this.venue.fetch(id, this.onVenue, this, id);
            }
        });
        return View;
    });
