define(["require", "tools/messaging", "tools/ajax", "models/venue", "models/product", "text!templates/venue_products.html", "text!templates/product_single.html"]
    , function (require, messaging, ajax, Venue, Product, page_template, product_template) {
        var View = ajax.View.extend({
            events : {"submit .form-validated": "onSubmit"}
            , template:_.template(page_template)
            , product_template:_.template(product_template)
            , initialize: function() {
                var view = this;
                this.venue = new Venue.Venue();
                this.collection = new Product.ProductCollection();
            }
            , onSave: function(){
                messaging.addSuccess({message: "Changes saved"});
                this.setLoading(false);
            }
            , onSubmit: function(e){
                var view = this
                    , $form = $(e.target)
                    , data = ajax.serializeJSON($form);
                data.Product = _.filter(data.Product, function(elem){return elem.sold});
                this.setLoading(true);
                data.id = this.venue.get("id");
                ajax.submitPrefixed({url:"/app/merchant/setproduct", data: data, success:_.bind(this.onSave, this, data), error: function() {view.setLoading(false);}});
                return false;
            }
            , onProducts: function(models){
                var view = this, html = [];
                models.each(function(product, idx){
                    html.push(view.product_template({idx:idx, product:product}));
                });
                this.$("fieldset").html(html.join(""));
            }
            , onVenue: function(venue){
                this.setupPage(this.template({venue:venue}));
                this.form = this.$(".form-validated");
                this.collection.getProducts(venue.get("id"), this.onProducts, this);
            }
            , render: function(id){
                this.$("fieldset").empty();
                this.venue.fetch(id, this.onVenue, this);
            }
        });
        return View;
    });
