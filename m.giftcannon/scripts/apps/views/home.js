define(["tools/ajax", "text!templates/home.html"], function(ajax, page_template){
    var View = ajax.View.extend({
        initialize: function(){
            this.$el.addClass("home-page");
            this.setupPage(page_template);
        }
        , render: function () {}
    });
    return View;
});