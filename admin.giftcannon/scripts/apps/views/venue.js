define(["require", "tools/ajax", "models/venue", "text!templates/venues.html", "text!templates/venue_single.html"]
    , function (require, ajax, Venue, page_template, venue_template) {
        var View = ajax.View.extend({
            venue_template:_.template(venue_template)
            , initialize: function() {
                this.setupPage(page_template);
            }
            , onVenues: function(models){
                var view = this, html = [];
                models.each(function(model, idx){
                    html.push(view.venue_template({idx:idx+1, venue:model}));
                });
                this.$(".venue-details").html(html.join(''));
            }
            , render : function(){
                Venue.getVenues(this.onVenues, this);
            }
        });
        return View;
    });
