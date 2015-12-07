define(["tools/ajax", "models/product"], function(ajax,ProductModels){
    var PAYMENT_STORAGE_KEY = 'LS_GIFT_PAYMENT'
        , Payment = ajax.Model.extend({
            initialize: function () {
                var data = store.get(PAYMENT_STORAGE_KEY);
                if(data)this.set(data);
                this.on('change', this.persist, this);
            }
            , persist: function(){
                store.set(PAYMENT_STORAGE_KEY, this.toJSON());
            }
            , getGiftCode: function(){
                return this.get("Gift").code;
            }
            , getGiftToken : function(){
                var gift = this.get("Gift");
                return gift?gift.token:null;
            }
            , getAmount: function(){
                return (this.get("amount")/100).toFixed(2);
            }
            , getMessage: function(){
                return this.get("Gift").message;
            }
            , getProduct: function(){
                return new ProductModels.Product(this.get("Gift").Product);
            }
            , amISender: function(loginstatus){
                return !loginstatus.get("id") || loginstatus.get("id") == this.get("Gift").User.id;
            }
            , isEmpty: function(){
                return _.isEmpty(this.get("Gift"));
            }
            , checkOrFetch: function(url, token, callback, context){
                var rest = Array.prototype.slice.call(arguments, 4).concat(this), model = this;
                if(token != this.getGiftToken()){
                    this.fetch(url, token, function(resp, status, xhr){
                        model.set({"Gift":resp.Gift});
                        callback.apply(context, rest);
                    });
                } else {
                    callback.apply(context, rest);
                }
            }
            , fetch: function(url, token, callback){
                ajax.submitPrefixed({url: url
                        , data: {token:token}
                        , success: callback
                })
            }



        });
    return new Payment();
});
