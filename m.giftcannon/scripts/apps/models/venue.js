define(["tools/ajax"], function(ajax){
    var BING_KEY = window.__options__.BingKey, MAX_HEIGHT = 834, MAX_WIDTH = 900
    , slice = Array.prototype.slice
    , Venue = ajax.Model.extend({
        getAddress: function(){
            return [this.get("line1"), this.get("postCode"), this.get("city"), 'UK'].join(", ");
        }
        , getPicture: function(){
            var url = this.get('picture');
            if(url && url.indexOf("http") == 0)
                return url;
            else return "http://m.giftcannon.com/imgs/venues/" + url ;
        }
        , getLocationStr: function(){
            return this.get("latitude") + "," + this.get("longitude");
        }
        , hasURL: function(){
            return !!this.get("url");
        }
        , getURL: function(){
            var url = this.get("url")||"";
            return !!~url.indexOf("http")?url:"http://"+url;
        }
        , getMapSize : function(w,h){
            return Math.min(MAX_WIDTH, Math.round(w)) + "," + Math.min(MAX_HEIGHT, Math.round(h));
        }
        , getMapLink: function(){
            return 'http://maps.apple.com/maps?daddr='+this.getAddress();
            //return 'http://www.bing.com/maps/?v=2&where1='+this.get("name")+", "+this.getAddress();
        }
        , getRoadMap: function(w,h){
            return "http://dev.virtualearth.net/REST/v1/Imagery/Map/Road/"+this.getLocationStr()+"/17?mapSize="+this.getMapSize(w,h)+"&pushpin="+this.getLocationStr()+"&format=jpeg&key="+BING_KEY;
        }
        , fetch: function(id, callback, context){
            var model = this, rest = slice.call(arguments, 3).concat(this);
            ajax.submitPrefixed({url:"/app/merchant/index", method:"POST", data:{"id":id}, success:function(resp, status, xhr){
                model.set(resp.Merchant[0]);
                callback.apply(context, rest);
            }});
        }
    })
    , Venues = ajax.Collection.extend({
        model:Venue
        , initialize: function(models, options, opts){
            this.load(opts.pid);
        }
        , getVenues: function(callback, context){
            var rest = slice.call(arguments, 2).concat(this);
            if(!this.loaded){
                this.on("reset", function(){
                        callback.apply(context, rest);
                });
            } else {
                callback.apply(context, rest);
            }
        }
        , load: function(pid){
            var collection = this;
            ajax.submitPrefixed({url:"/app/product/venues", method:"POST", data:{"id":pid}, success:function(resp, status, xhr){
                collection.addOrUpdate(resp.Merchant);
                collection.loaded = true
            }});
        }
    })
    , VENUE_CACHE = {}
    , getVenues = function(productId, callback, context){
       if(_.isEmpty(VENUE_CACHE[productId])){
           VENUE_CACHE[productId] = new Venues(null,null,{pid:productId});
       }
       var venue = VENUE_CACHE[productId], rest = slice.call(arguments, 1);
       venue.getVenues.apply(venue, rest);
    };
    return {Venues: Venues, Venue: Venue, getVenues: getVenues}
});
