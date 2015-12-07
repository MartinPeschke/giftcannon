define(["tools/ajax"], function(ajax){
    var slice = Array.prototype.slice
    , Venue = ajax.Model.extend({
        getAddress: function(){
            return [this.get("line1"), this.get("postCode"), this.get("city")].join(", ");
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
            return 'http://www.bing.com/maps/?v=2&where1='+this.get("name")+", "+this.getAddress();
        }
        , getRoadMap: function(w,h){
            return "http://dev.virtualearth.net/REST/v1/Imagery/Map/Road/"+this.getLocationStr()+"/17?mapSize="+this.getMapSize(w,h)+"&pushpin="+this.getLocationStr()+"&format=jpeg&key="+BING_KEY;
        }
        , fetch: function(id, callback, context){
            var model = this, rest = slice.call(arguments, 3).concat(this);
            ajax.submitPrefixed({url:"/app/merchant/index", method:"POST", data:{"id":id}, success:function(resp, status, xhr){
                model.clear({silent:true});
                model.set(resp.Merchant[0]);
                callback.apply(context, rest);
            }});
        }
    })
    , Venues = ajax.Collection.extend({
        model:Venue
        , initialize: function(){}
        , getVenues: function(callback, context){
            var rest = slice.call(arguments, 2).concat(this);
            var collection = this;
            ajax.submitPrefixed({url:"/app/merchant/all", method:"POST", data:{}, success:function(resp, status, xhr){
                collection.addOrUpdate(resp.Merchant);
                callback.apply(context, rest);
                collection.loaded = true
            }});
        }
    })
    , _venues
    , getVenues = function(callback, context){
        if(_.isEmpty(_venues)){
            _venues = new Venues();
        }
        _venues.getVenues.apply(_venues, arguments);
    };
    return {Venues: Venues, Venue: Venue, getVenues: getVenues}
});