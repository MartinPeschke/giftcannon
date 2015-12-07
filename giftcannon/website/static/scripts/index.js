require(["tools/Gift"], function (gift) {
    gift.destroy();

    var View = Backbone.View.extend({
        el: $("#home")
        , initialize: function () {
            this.resize();
            $(window).resize(_.bind(this.resize, this));
        }
        , resize: function (e) {
            var w = $(window).width(), h, pad;
            if (w < 768) {
                this.$el.children(".row").css("height", "auto");
            } else {
                pad = parseInt(this.$el.css("padding-top").replace(/[^0-9]*/, ''), 10);
                h = $(window).height() - $("footer").height() - pad;
                this.$el.children(".row").css("height", h + 2 + "px");
            }
        }
    })
    , page = new View();
    return page;
});