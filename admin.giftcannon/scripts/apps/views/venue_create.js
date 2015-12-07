define(["require", "tools/messaging", "tools/ajax", "models/venue", "text!templates/venue_create.html"]
    , function (require, messaging, ajax, Venue, page_template) {
        var View = ajax.View.extend({
            events : {"submit .form-validated": "onSubmit"}
            , picture_template : _.template('<img src="{{ url }}"/><input type="hidden" name="picture" value="{{ url }}"/>')
            , initialize: function() {
                var view = this;
                this.setupPage(page_template);
                this.form = this.$(".form-validated");
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
            , onCreate: function(data, resp, status, xhr){
                messaging.addSuccess({message: "Merchant: " +data.name+ " created"});
                this.setLoading(false);
                window.app_router.navigate("/venue/"+resp.Merchant[0].id, true);
            }
            , onSubmit: function(e){
                var view = this
                    , $form = $(e.target)
                    , data = ajax.serializeJSON($form);
                this.setLoading(true);
                ajax.submitPrefixed({url:"/app/merchant/set", data: data, success:_.bind(this.onCreate, this, data), error: function() {view.setLoading(false);}});
                return false;
            }
            , scrub: function(){
                this.form.find("input").each(function(idx, elem){
                    elem.value="";
                });
                this.setLoading(false);
                this.$(".venue-picture-display").empty();
                this.uploader.html(this.uploader.attr("data-default"));
            }
            , render : function(){
                this.scrub();
                this.setLoading(false);
            }
        });
        return View;
    });
