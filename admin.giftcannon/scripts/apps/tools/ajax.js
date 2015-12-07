define(['tools/messaging', "tools/hash"], function(messaging, hashlib){
  var CLIENT_TOKEN = window.__options__.ClientToken
  , ajax = {
      submit: function(options){
              var params = _.extend({
                  type: "POST"
                  , dataType: "json"
                  , contentType: "application/json; charset=utf-8"
              }, options || {});
              params.success = function (resp, status, xhr) {
                  if (resp.redirect) {
                      window.location.href = resp.redirect;
                  } else if (resp.dbMessage){
                        if(options.handleMessage){options.handleMessage(resp.dbMessage, resp);}
                        else {messaging.addError({message:translate(resp.dbMessage)})}
                  } else if (resp.errorMessage){
                      messaging.addError({message:translate(resp.errorMessage)})
                  } else if (options.success) options.success.apply(this, arguments);
                  $(".loading").removeClass("loading");
              };
              if (typeof params.data != 'string') { params.data = JSON.stringify(params.data) }
              params.headers = {'Client-Token':  CLIENT_TOKEN};
              $.ajax(params);
      }
      , submitPrefixed: function(options){
            options.url = '/api/0.0.1' + options.url
            this.submit(options);
      }
      , resetForm : function($form){
          $form = $form.is("form.form-validated") ? $form : $form.find("form.form-validated");
          $form.find("input,textarea").val("");
          $form.validate().resetForm();
          $form.find(".btn").button("reset");
      }
      , parseDate: function(input, format) {
          format = format || 'yyyy-mm-ddTHH:MM:SS'; // default format
          var parts = input.match(/(\d+)/g),
              i = 0, fmt = {};
          // extract date-part indexes from the format
          format.replace(/(yyyy|dd|mm|HH|MM|SS)/g, function(part) { fmt[part] = i++; });
          return new Date(parts[fmt.yyyy], parts[fmt.mm]-1, parts[fmt.dd], parts[fmt.HH]||0, parts[fmt.MM]||0, parts[fmt.SS]||0);
      }
      , serializeArray : function(list) {
          if(!list)return {};
          var json = {}, len = list.length, i=0, elem, key, value, keys, k, v, pos, j, add_in_fields;
          for(;i<len;i++){
              key = list[i].name;
              value = list[i].value;
              elem = json;
              keys = key.split(".");
              for(j=0;j<keys.length - 1;j++){
                  k = keys[j];
                  if(!!~k.indexOf("-")){
                      pos = parseInt(k.split("-")[1], 10);
                      k = k.split("-")[0];
                      if(!elem[k]) elem[k] = []
                      elem = elem[k];
                      add_in_fields = pos-elem.length+1;
                      for(var h=0; h<add_in_fields;h++)
                          elem.push({});
                      elem = elem[pos];
                  } else {
                      if(!elem[k]) elem[k] = {}
                      elem = elem[k];
                  }
              }
              elem[keys[keys.length-1]] = value;
          }
          return json;
      }
      , serializeJSON : function(form) {
          if($(form).is("form"))form = $(form)
          else form = $(form).find("form");
          return this.serializeArray(form.serializeArray());
      }
      , ifyForm: function(params, validationParams){
          var form = params.form
              , noop = function(){return false;}
              , baseFormsOnSubmit = function(form){
                  var $form = $(form), validator = $form.validate();
                  $(form).find(".btn").button("loading");
                  ajax.submit({
                      url: $form.attr("action")
                      , data: ajax.serializeJSON($form)
                      , success: function(resp, status, xhr){
                          $(form).find(".btn").button("reset");
                            if(resp.success === false && resp.errors) {
                              var formId = $form.find("[name=type]").val();
                              validator.showErrors(resp.errors);
                              for(var attr in resp.values){
                                  $form.find("#"+formId+"\\."+attr).val(resp.values[attr]);
                              }
                              $form.find(".error-hidden.hide").fadeIn(); // show any additional hints/elems
                              if(params.error)params.error(resp, status, xhr)
                          } else {
                            params.success(resp, status, xhr);
                          }
                      }
                  });
              };
          if($(form).is("form.form-validated"))form = $(form)
          else form = $(form).find("form.form-validated");
          form.on({submit: noop});
          validationParams = validationParams||{};
          return booksys.validate(_.extend(validationParams, {root: form, submitHandler : baseFormsOnSubmit}));
      }
      , Model : Backbone.Model.extend({
          shallowClear : function(options){
              var clearance = {}, options=options||{};
              options.unset = true;
              for(var attr in this.attributes){
                  if(!_.isObject(this.get(attr))){
                      clearance[attr] = null;
                  }
              }
              this.set(clearance, options);
          }
          , save: function(options) {
              var model = this, data = {}, success = options.success;
              if(!options.data){

                  data[this.apiLabel] = this.toJSON();
                  options.data = data;
              }
              options.url = this.saveURL();
              options.success = function(resp, status, xhr){
                  model.setRecursive(resp[model.apiLabel]);
                  if(success)success(model)
              }
              ajax.submitAuthed(options);
          }

          /* PROXY NESTED EVENTS */
          , register: function(models, options){
              var model, attr;
              for(attr in models){
                  model = models[attr];
                  models[attr].on("all", _.bind(this.onModelEvent, this, attr));
              }
              this.set(models, options);
              this.bind("destroy", _.bind(this._removeOnModelEvents, this, models));
          }
          , onModelEvent: function(attr, ev, evModel, collection, options){
              this.trigger.call(this, attr+":"+ev, evModel, collection, options);
          }
          ,_removeOnModelEvents: function(models) {
              var model, attr;
              for(attr in models){
                  model = models[attr];
                  models[attr].off("all", _.bind(this.onModelEvent, this, attr));
              }
          }
          , setRecursive: function(attrs, options){
              var setAttrs = {}
                  , curHash = this._hashValue
                  , newHash = hashlib.default(JSON.stringify(attrs))
                  , transl = this.translation
                  , allKeys
                  , deferreds;
              // no need to parse deep, is all same anyways
              if(curHash && curHash == newHash)return;
              allKeys = this.removableKeys;
              for (attr in attrs) {
                  var val = attrs[attr], target = this.get(transl[attr]||attr);

                  if(target && _.isFunction(target.setRecursive)){
                      target.setRecursive(val, options);
                  } else if(target && _.isFunction(target.addOrUpdate)){
                      target.addOrUpdate(val, options);
                  } else {
                      setAttrs[attr] = val;
                  }
                  allKeys = _.without(allKeys, attr);
              }

              if(allKeys.length){
                  var keysToRemoveMap = {}, idx, key, val;
                  for(idx in allKeys){
                      key = allKeys[idx];
                      val = this.get(key);
                      if(val)
                          if(_.isFunction(val['clear']))
                              this.get(key).clear();
                          else
                              keysToRemoveMap[key] = true;
                  }
                  this.set(keysToRemoveMap, {unset: true});
              }

              this.set(this.parseLocal(setAttrs), options);
              this._hashValue = newHash;
          }
          , translation : {}
          , removableKeys : [] /*these will be removed if not present in refresh data */
          , parseLocal: function(model){return model}
      })
      , Collection : Backbone.Collection.extend({
        clear: function(){
            var i= 0, models = _.clone(this.models), len = models.length, tmp;
            for(;i<len;i++){
                models[i].destroy();
            }
        }
        , addOrUpdate: function(models, options){
            if(models){
                options = options || {};
                models = _.isArray(models) ? models.slice() : [models];
                var i= 0, len = models.length, tmp, tmpModel, allIds = this.pluck("id") ;
                for(;i<len;i++){
                    tmp = models[i];
                    tmpModel = this.get(tmp.id);
                    if(tmpModel){
                        tmpModel.setRecursive(tmp, options);
                    } else {
                        tmpModel = new this.model();
                        tmpModel.setRecursive(tmp, options);
                        this.add(tmpModel, options);
                    }
                    allIds = _.without(allIds, tmp.id);
                }
                if(!options.preserve){
                    for(i=0;i<allIds.length;i++){
                        tmp = this.get(allIds[i]);
                        if(tmp)tmp.destroy();
                    }
                }
                this.trigger("reset", this);
            }
        }
        , fetch: function(options) {
            options.headers = options.headers || {};
            options.headers['Client-Token'] =  CLIENT_TOKEN;
            Backbone.Collection.prototype.fetch.call(this, options);
        }
    })
    , View : Backbone.View.extend({
        firedEvents: {}
        , recordSingularEvents: function(events) {
            this.on("all", function(event, model, collection, options){
                if(!!~events.indexOf(event))
                    this.firedEvents[event] = true;
            });
        }
        , onOrAfter: function(event, cb, context){
            var c = this, args = Array.prototype.slice.call(arguments, 3);
            if(c.firedEvents[event]) cb.apply(context, args);
            else this.on(event, function(){
                cb.apply(context, args);
            });
        }
        , setupPage: function(html){
          this.$el.html(html);
        }
        , cleanForm: function(){
          this.form.find(".error").removeClass("error").find(".help-block").remove();
        }
        , showError: function(elem, m){
          m = m.replace(/_/g, " ").replace(/_/g, " ").toLowerCase().toTitleCase();
          elem.after('<div class="help-block">'+ m +'</div>').closest(".control-group").addClass("error");
        }
        , setLoading : function(loading){
          var setLoading = function(idx, elem){
                  elem = $(elem);
                  elem.data("label", elem.text()).text(elem.attr("data-loading")).attr("disabled", "disabled");
              }
              , unLoading = function(idx, elem){
                  elem = $(elem);
                  if(elem.data("label"))
                    elem.text(elem.data("label")).removeAttr("disabled");
              };
          hnc.setLoading(loading);
          this.form.find(".btn").each(loading?setLoading:unLoading);
        }
    })
  };
  return ajax;
});