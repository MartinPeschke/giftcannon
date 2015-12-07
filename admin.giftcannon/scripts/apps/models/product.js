define(["tools/ajax"], function(ajax){
    var slice = Array.prototype.slice
        , Product = ajax.Model.extend({
            getPrice : function(){
                return "&pound; " + (this.get("price") / 100).toFixed(2);
            }
        })
        , ProductCollection = ajax.Collection.extend({
            model:Product
            , getProducts: function(pid, callback, context){
                var rest = slice.call(arguments, 3).concat(this);
                var collection = this;
                ajax.submitPrefixed({url:"/app/merchant/products", method:"POST", data:{id:pid}, success:function(resp, status, xhr){
                    collection.reset([], {silent:true});
                    collection.addOrUpdate(resp.Merchant[0].Product);
                    callback.apply(context, rest);
                }});
            }
        });
    return {ProductCollection: ProductCollection, Product: Product}
});