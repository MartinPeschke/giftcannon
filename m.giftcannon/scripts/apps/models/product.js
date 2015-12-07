define(["tools/ajax"], function(ajax){
    var Product = ajax.Model.extend({
        initialize: function(){
            this.register()
        }
        , getPictureUrl : function(){
            return "/imgs/items/" + this.get('picture');
        }
        , getAmount: function(){
            return (this.get("price")/100).toFixed(2);
        }
        , getPrice : function(){
            return "&pound; " + (this.get("price") / 100).toFixed(2);
        }
        , getVenues : function(){
            ajax.submitPrefixed({url:"/app/product", method:"POST", success:function(resp, status, xhr){
                collection.addOrUpdate(resp.Product);
                collection.loaded = true
            }});
        }
    })
    , ProductCatalog = ajax.Collection.extend({
        model : Product
        , loaded : false
        , initialize: function(models, params){
            this.load = this._load;
        }
        , stale: function(){
            return ((new Date()).getTime() - this.timestamp) > 10000;
        }
        , getProducts: function(callback, context){
            if(!this.loaded || this.stale())this.load();
            if(!this.loaded)
                this.on("reset", callback, context);
            else
                callback.apply(context, [this]);
        }
        , getProduct: function(id, callback, context){
            this.getProducts(function(collection){
                callback.apply(context, [collection.get(id)]);
            }, this);
        }
        , _load: function(){
            var collection = this;
            ajax.submitPrefixed({url:"/app/product", method:"POST", success:function(resp, status, xhr){
                collection.addOrUpdate(resp.Product);
                collection.loaded = true;
                collection.timestamp = (new Date()).getTime();
            }});
        }
    });
    var catalog = new ProductCatalog();
    return {catalog: catalog, Product: Product, ProductCatalog: ProductCatalog};
});
