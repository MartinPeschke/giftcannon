define([], function(){

    var slice = Array.prototype.slice
        , opts = window.__options__
        , MapLoader = function(){
            this.mapsRegistered = true;
            this.mapsLoaded = false;
            this.initialize.apply(this, arguments);
        };
        _.extend(MapLoader.prototype, Backbone.Events, {
            initialize: function(options){
                window.bingLoadedCallback = _.bind(this._onMapsLoaded, this);
                window.bingThemeCallback = _.bind(this._onThemeLoaded, this);
                if(!this.mapsLoading) {
                    this.mapsLoading = true;
                    var n = document.createElement("script"), i = document.getElementsByTagName("head")[0]; n.type = "text/javascript"; n.language = "javascript"; n.id = "bingMapsSources";
                    n.src = "https://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&onscriptload=bingLoadedCallback&mkt=" + options.Locale+"&s="+((window.location.protocol=='https:')?1:0); i.appendChild(n);
                }
            }
            , _onThemeLoaded: function(){
                this.trigger("maps:loaded");
                this.mapsLoaded = true;
            }
            , _onMapsLoaded : function(){
                Microsoft.Maps.loadModule('Microsoft.Maps.Themes.BingTheme', {callback: bingThemeCallback});
            }
            , onLoaded: function(f, ctxt){
                var rest = slice.call(arguments, 2);
                if(this.mapsLoaded)f.apply(ctxt, rest);
                else this.on("maps:loaded", function(){f.apply(ctxt, rest)});
            }
        });
        var bingLoader, getLoader = function(){
            if(!bingLoader)bingLoader = new MapLoader(opts);
            return bingLoader;
        };

        var MapManager = function(options){
            this.options = options || {};
            this.$el = options.root;
            this.ApiKey = opts.BingKey;
            this.defaults = { center: this.options.location || { latitude: 51.752965, longitude: -1.254896 }, initial_zoom: 13, selected_zoom: 13 }
            this.initialize.apply(this, arguments);
        };

        _.extend(MapManager.prototype, Backbone.Events, {  /* low level interface working with MS.Location objects */
            mapOptions : { showDashboard: false, disablePanning: false, disableZooming: false, showMapTypeSelector:false }
            , visibleInfobox : []
            , initialize: function(options){
                options || (options = {});
                _.extend(this.mapOptions, options.mapOptions||{});
            }
            , _onMapTilesLoaded: function(){
                this.trigger("map:tilesloaded");
            }
            , _onMapsLoaded: function(){
                var view = this, center = this.defaults.center;
                center.location = new Microsoft.Maps.Location(center.latitude, center.longitude);
                this.$el.empty();
                this.map = new Microsoft.Maps.Map(this.$el[0],
                    _.extend({ credentials: this.ApiKey
                        , mapTypeId: Microsoft.Maps.MapTypeId.road
                        , showMapTypeSelector: false
                        , disableBirdseye: true
                        , showScalebar: true
                        , enableClickableLogo: false
                        , enableSearchLogo: false
                        , showCopyright: false
                        , zoom: this.defaults.initial_zoom
                        , center: center.location
                    }, this.mapOptions));
                Microsoft.Maps.Events.addHandler(this.map, "tiledownloadcomplete", _.bind(this._onMapTilesLoaded, this));
                this.mapsLoaded = true;
                this.trigger("map:loaded", this.map);

                Microsoft.Maps.Events.addHandler(this.map, "click", function(){
                    _.each(view.visibleInfobox, function(elem){elem.setOptions({visible:false})})
                    view.visibleInfobox = [];
                });
            }
            , onLoaded: function(f, ctxt){
                var rest = slice.call(arguments, 2);
                if(this.mapsLoaded)f.apply(ctxt, rest);
                else this.on("map:loaded", function(){f.apply(ctxt, rest)});
            }
            , render: function(){
                getLoader().onLoaded(_.bind(this._onMapsLoaded, this));
            }
            , requestLocation: function(){ /* is map safe*/
                if (typeof (navigator.geolocation) != 'undefined') {
                    var view = this
                        , watchID = navigator.geolocation.getCurrentPosition(
                            function(position){view.trigger("location:updated", position)}
                            , function (error) { /* ignore */ }, { enableHighAccuracy: true });

                }
            }
            , addPin: function(location){
                var pin = new Microsoft.Maps.Pushpin(location, { draggable: false });
                this.map.entities.push(pin);
                this.trigger("pin:dropped", location);
                return pin;
            }
            , addNumberedPin: function(location, number, name, id){
                var pin = new Microsoft.Maps.Pushpin(location, { draggable: false, text: ""+number});
                this.map.entities.push(this.addInfoBox(pin, number, name, id));
                this.map.entities.push(pin);
                this.trigger("pin:dropped", location);
                return pin;
            }
            , addInfoBox: function(pin, number, name, id){
                var view = this
                , infobox = new Microsoft.Maps.Infobox(pin.getLocation(), { visible: false, zIndex: 4, offset: new Microsoft.Maps.Point(-100, 40) });
                Microsoft.Maps.Events.addHandler(pin, "click", function(){
                    infobox.setOptions({visible:true});
                    view.visibleInfobox.push(infobox);
                });

                Microsoft.Maps.Events.addHandler(infobox, "click", function(){
                    window.app_router.navigate("/venue/"+id, true);
                    view.trigger("infobox:clicked", id);
                    this.setOptions&&this.setOptions({visible: false});
                });

                infobox.setHtmlContent('<div class="map-infobox">'+number+') '+name+'<span class="link-sign">&raquo;</span></div>');
                pin.infobox = infobox;
                return infobox;
            }
            , setPin : function (location) {
                var pin = new Microsoft.Maps.Pushpin(location, { draggable: false });
                this.clearMap();
                this.map.entities.push(pin);
                this.trigger("pin:dropped", location);
                return pin;
            }
            , center: function(location, zoom){
                this.map.setView({ center: location, zoom: zoom||this.defaults.selected_zoom });
                this.trigger("map:centered", location.latitude, location.longitude);
            }
            , resetView: function(clear){
                if(clear)this.map.entities.clear();
                this.map.setView({ center: this.defaults.center.location, zoom: this.defaults.initial_zoom });
            }
            , clearMap: function(){
                this.map.entities.clear();
            }

            /* higher level interface, course longitude / latitude aware */
            , addPins: function(locations){
                var view = this;
                _(locations).each(function(loc){
                    var location = new Microsoft.Maps.Location(loc.lat, loc.lng);
                    view.addPin(location);
                });
            }
            , setCenter: function(lat, lng, zoom){
                var location = new Microsoft.Maps.Location(lat, lng);
                this.center(location, zoom);
            }
            , setCenterAndRemember: function(lat, lng, zoom){
                var location = new Microsoft.Maps.Location(lat, lng);
                this.center(location, zoom);
                this.defaults.center.location = location;
            }
            , addPinAndCenter: function(lat, lng, zoom){
                var location = new Microsoft.Maps.Location(lat, lng);
                this.addPin(location);
                this.center(location, zoom);
            }
            , setPinAndCenter: function(lat, lng, zoom){
                var location = new Microsoft.Maps.Location(lat, lng);
                this.setPin(location);
                this.center(location, zoom);
            }
        });
        MapManager.extend = hnc.extend;
    return MapManager;
});
