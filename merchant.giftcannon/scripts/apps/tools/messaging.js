define(["tools/hash"], function(hashlib){
    var mevents = {}, msevents = {};
    mevents[hnc.support.clickEvent+" .close"] = "clear";
    msevents[hnc.support.clickEvent+" .message-container"] = "clear";

    var STORAGE_KEY = 'LS_USER_MESSAGES'
        , Message = Backbone.Model.extend({
            defaults:{ level : "info", title : null, message : null, added: 0}
            , initialize: function(json){
                var model = this;
                this.set({id: hashlib.fast(JSON.stringify(json))});
                if(this.get("level") == 'success' || this.get("level") == 'info'){
                    setTimeout(function(){model.clear();}, 10000);
                } else if(this.get("level") == 'error'){
                    setTimeout(function(){model.clear();}, 15000);
                }
            }
            , clear: function() {
                this.destroy();
            }
            , sync: function(){/*this is not synced anyways*/}
        })
        , Messages = Backbone.Collection.extend({
            model : Message
            , initialize:function () {
                this.on("add", this.save, this);
                this.on("remove", this.save, this);
                this.on("change:added", this.save, this);
            }
            , fetch: function(){
                var data = store.get(STORAGE_KEY), collection = this;
                if(data && data.length){
                    collection.reset(data);
                }
            }
            , save:function(){
                store.set(STORAGE_KEY, this.toJSON())
            }
        })
        , MessageView = Backbone.View.extend({
            tagame: "div"
            , events: mevents
            , className: "alert clearfix"
            , template:_.template('<a class="close">×</a><div class="alert-inner">{% if(title){ %}<strong>{{ title }}</strong> {% } %} {{ message }}</div>')
            , number_templ:_.template('<span class="numbering">{{ added }}</span>')
            , initialize: function(){
                this.model.on('change:added', this.changedAdding, this);
                this.model.on('destroy', this.remove, this);
            }
            , changedAdding: function(model){
                var added = this.model.get("added");
                if(added>0){
                    if(!this.$el.find(".numbering").html(added+1).length){
                        this.$el.append(this.number_templ({added:added+1}));
                    }
                }
            }
            , render: function() {
                var added = this.model.get("added");
                this.$el.html(this.template(this.model.toJSON()));
                this.$el.addClass("alert-"+this.model.get("level"));
                if(added>0){
                  this.$el.append(this.number_templ({added:added+1}));
                }
                return this;
            }
            , clear: function() {
                this.model.clear();
            }

        })
        , View = Backbone.View.extend({
            events: msevents
            , initialize: function(){
                var view = this;
                this.model = new Messages();
                this.model.on('add', this.addOne, this);
                this.model.on('reset', this.addAll, this);
                this.model.on('all', this.render, this);
                this.model.fetch();
                this.baseOffset = $("header").height();
            }
            , clear: function(e){
                if(!e.keyCode|| e.keyCode == 13){
                    if(!$(e.target).closest(".alert").length){
                        this.model.each(function(elem){elem.clear();});
                        this.model.reset();
                    }
                }
            }
            , addAll: function(){
                this.model.each(_.bind(this.addOne, this));
            }
            , addOne : function(model){
                var view = new MessageView({model: model});
                view.render().$el.appendTo(this.$el).closest(".message-container").show();
            }
            , render: function(){
                if(this.model.models.length){
                    this.$el.closest(".message-container").show();
                } else {
                    this.$el.closest(".message-container").hide();
                }
            }
        })
        , view = new View({el: window.__options__.$messagingContainer})
        , addMessage = function(params){
            var model = new Message(params)
            try {
                view.model.add(model);
            } catch(err) {
                model = view.model.get(model.get("id"));
                model.set({"added": model.get("added")+1});
            }
        }
        , addError = function(params){
            addMessage(_.extend(params, {level:"error"}));
        }
        , addSuccess = function(params){
            addMessage(_.extend(params, {level:"success"}));
        };

        return {view: view
            , addSuccess:addSuccess
            , addError:addError
            , addMessage: addMessage
            , models:{Message:Message, Messages:Messages}
        };
    });
