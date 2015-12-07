define(["require", "tools/messaging", "tools/ajax", "models/venue", "text!templates/venue_create.html"]
    , function (require, messaging, ajax, Venue, page_template) {
        var View = ajax.View.extend({
            events : {"submit .form-validated": "onSubmit"}
            , picture_template : _.template('<img src="{{ url }}"/><input type="hidden" name="picture" value="{{ url }}"/>')
            , initialize: function() {
                var view = this;
                this.setupPage(page_template);
                this.$(".page-title").html("Edit Venue");
                this.$(".btn-primary").text("Save");
                this.$(".page-header").prepend('<a href="" class="btn btn-primary link">Assign Products</a>')

                this.form = this.$(".form-validated");
                this.venue = new Venue.Venue();
                this.uploader = this.$(".file-picker-upload");
                var uploader = this.uploader;

                filepicker.makeDropPane(uploader[0], {
                    dragEnter: function() {
                        uploader.html("Drop to upload").css({
                            'backgroundColor': "#E0E0E0",
                            'border': "1px solid #000"
                        });
                    },
                    dragLeave: function() {
                        uploader.html("Drop files here").css({
                            'backgroundColor': "#F6F6F6",
                            'border': "1px dashed #666"
                        });
                    },
                    onSuccess: function(fpfiles) {
                        uploader.text("Done!");
                        var file = fpfiles[0];
                        view.$(".venue-picture-display").html(view.picture_template(fpfiles[0]));
                    },
                    onError: function(type, message) {
                        uploader.after().text('('+type+') '+ message);
                    },
                    onProgress: function(percentage) {
                        uploader.text("Uploading ("+percentage+"%)");
                    }
                });

            }
            , onSave: function(){
                messaging.addSuccess({message: "Changes saved"});
                this.setLoading(false);
            }
            , onSubmit: function(e){
                var view = this
                    , $form = $(e.target)
                    , data = ajax.serializeJSON($form);
                this.setLoading(true);
                data.id = this.venue.get("id");
                ajax.submitPrefixed({url:"/app/merchant/set", data: data, success:_.bind(this.onSave, this, data), error: function() {view.setLoading(false);}});
                return false;
            }
            , onVenue: function(venue){
                var view = this;
                _.each(venue.attributes, function(value, key, elem){
                    view.$("input[name="+key+"]").val(value);
                });
                this.$(".picture-display").html('<img class="venue-picture" src="'+venue.getPicture()+'"/>');
                this.$(".venue-picture-display").html(this.picture_template({url: this.venue.getPicture()}));
                this.$(".page-header").find(".btn-primary").attr("href", "/venue/products/"+venue.get("id"));
            }
            , scrub: function(){
                this.form.find("input").each(function(idx, elem){
                    elem.value="";
                });
                this.setLoading(false);
                this.$(".venue-picture-display").empty();
            }
            , render : function(id){
                this.scrub();
                this.venue.fetch(id, this.onVenue, this);
            }
        });
        return View;
    });
