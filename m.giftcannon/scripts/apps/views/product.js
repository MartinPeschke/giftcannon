define(["require", "tools/ajax", "models/product"
    , "text!templates/product.html"
    , "text!templates/product_single.html"]
    , function (require, ajax, ProductModels, page_template, product_template) {

        var View = ajax.View.extend({
            template:_.template(product_template)
            , initialize: function() {
                this.setupPage($(page_template));
                this.model = ProductModels.catalog;
            }
            , addAll: function(collection){
                var view = this, pt = this.template, $node = this.$(".product-selection"), html=[];
                collection.each(function(model){
                    html.push(pt({product:model}));
                });
                $node.html(html.join(""));
            }
            , render : function(){
                this.model.getProducts(this.addAll, this);
            }
        });
        return View;
    });
