define(["../tools/Carousel"]
  , function (Carousel) {
      var FBFriendCarousel = Carousel.extend({
          el: $("#category-box")
      , PAGESIZE: 4
      , entryTemplate: _.template($("#category-template").html())
	  , getModelId: function (model) { return model.id; }
      });
      return FBFriendCarousel;
  }
);