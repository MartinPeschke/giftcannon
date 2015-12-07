define([]
  , function () {
    var View = Backbone.View.extend({
      initialize: function () {
        var view = this;
        sprints8.send({ 
          url: "/api/config"
          , success : function(resp, status, xhr){
              view.messages = resp.Config.Suggested_Message;
              view.setMessages();
          }
        });
      }
      , setMessages : function(){
        var m = this.messages, msg = m[Math.floor(Math.random() * m.length)];
        this.$el.attr("placeholder", msg.message);
        setTimeout(_.bind(this.setMessages, this), this.options.timeout||5000);
      }
    });
    return View;
});

