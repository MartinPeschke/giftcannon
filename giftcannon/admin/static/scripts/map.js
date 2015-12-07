(function (root) {
  root.create_map = function (bingkey) {

    var center = new Microsoft.Maps.Location(51.49372996502337, -0.13329023305040488)
    , setPin = function (map, location) {
      var pin = new Microsoft.Maps.Pushpin(location, { draggable: false })
        , form = $("#submitForm_Venue");
      map.entities.clear();
      form.find("input[name=latitude]").val(location.latitude);
      form.find("input[name=longitude]").val(location.longitude);
      map.entities.push(pin);
    }
    root.__map__ = new Microsoft.Maps.Map(
                  document.getElementById("map-root"),
                  { credentials: bingkey
                  , center: center
                  , mapTypeId: Microsoft.Maps.MapTypeId.road
                  , showDashboard: true
                  , showMapTypeSelector: false
                  , disableBirdseye: true
                  , showScalebar: true
                  , enableClickableLogo: true
                  , enableSearchLogo: true
                  , showCopyright: false
                  , zoom: 13
                  });
    setPin(root.__map__, center);
    Microsoft.Maps.Events.addHandler(root.__map__, "mousedown", function (e) {
      var location = root.__map__.tryPixelToLocation(new Microsoft.Maps.Point(e.getX(), e.getY()));
      setPin(root.__map__, location);
    });
  };
})(window);