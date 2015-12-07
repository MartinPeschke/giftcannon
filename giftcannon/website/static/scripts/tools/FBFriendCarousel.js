define(["../tools/Carousel", "../libs/jquery_tooltip"]
  , function (Carousel) {
  	var FBFriendCarousel = Carousel.extend({
  		el: $("#fb-friend-contentslider")
      , entryTemplate: _.template($("#friend-template").html())
      , getSelectedFBId: function () {
      	return this.getSelectedDataId();
      }
	  , onPageRender:function (page){
		sprints8.tooltipUp(page.find(".listbutton"));
	  }
	  , onPageTearDown: function ($el) { sprints8.cleanToolTips($el.find('.listbutton')); }
	  , getModelId: function (model) { return model.facebook_id; }
  	})
  	return FBFriendCarousel;
  }
);