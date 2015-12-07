(function (root) {
    var 
        uploader_template = _.template($("#data-picture-uploader-template").html())
        , error_template = _.template($("#data-error-message-template").html())
        , error_root = $("#message-container").find(".span12");
    $("body").delegate(".delete-link", "click", function (e) {
        var target = $(e.target)
      , entity_row = target.closest(".entity")
      , entity = entity_row.attr("_entity")
      , id = entity_row.attr("_entity_id")
      , merchant_id = entity_row.attr("_merchant_id");


        if (confirm("Do you want to delete this " + entity + "?")) {
            $.ajax({ type: "POST"
              , dataType: "json"
              , contentType: "application/json; charset=utf-8"
              , url: '/admin/update'
              , data: target.attr("_data")
              , success: function (resp, status, xhr) {
                if (resp.success == true) {
                    entity_row.remove();
                } else {
                    error_root.append(error_template({ type: "error", heading: "ERROR", messageBody: resp.error }));
                }
              }
            });
        }
        e.preventDefault();
        e.stopPropagation();
    });
    $("body").delegate(".edit-link", "click", function (e) {
        var target = $(e.target)
      , entity_row = target.closest(".entity")
      , entity = entity_row.attr("_entity")
      , id = entity_row.attr("_entity_id")
      , merchant_id = entity_row.attr("_merchant_id");

        if (target.hasClass("edit")) {
            entity_row.find(".attribute").each(function (i, elem) {
                elem = $(elem);
                var name = elem.attr('_name'), child;
                elem.data("_original_content", elem.html());
                if (name == 'picture') {
                    var rand = ("upload-" + Math.random()).replace(/0\./, "");
                    elem.html(uploader_template({ name: name, elem_id: "" + rand, picture: elem.attr("_default") || elem.text().trim() }));
                    window.create_uploader("" + rand);
                } else {
                    child = $("<input/>"
                      , { type: elem.attr('_html_type') || "text"
                        , name: name
                        , value: elem.text().trim()
                        , placeholder: name
                        , required: elem.attr('_required')
                      });
                    elem.html(child);
                }
            });
            target.removeClass("edit").addClass("save").html("save");
            target.before('<a href="#" class="cancel edit-link">cancel</a>');
        } else if (target.hasClass("cancel")) {
            entity_row.find(".attribute").each(function (i, elem) {
                elem = $(elem);
                elem.html(elem.data("_original_content"));
            });
            target.siblings("a.save").removeClass("save").addClass("edit").html("edit");
            target.remove();
        } else if (target.hasClass("save")) {
            if (confirm("Sure you want to update?")) {
                var results = {};
                entity_row.find("input[name]").each(function (i, elem) { results[elem.name] = elem.value; });

                var updater = JSON.parse(target.attr("_data"))
                    , original = updater.query[updater.key];
                _.extend(original, results);
                $.ajax({ type: "POST"
                    , dataType: "json"
                    , contentType: "application/json; charset=utf-8"
                    , url: '/admin/update'
                    , data: JSON.stringify(updater)
                    , success: function (resp, status, xhr) {
                        if (resp.success == true) {
                            window.location.reload(true);
                        } else {
                            error_root.append(error_template({ type: "error", heading: "ERROR", messageBody: resp.error }));
                        }
                    }
                });
                target.siblings("a.cancel").remove();
                target.removeClass("save").addClass("edit").html("edit");
            }
        }
        e.preventDefault();
        e.stopPropagation();
    });

    $("body").on({ click: function (e) {
            var target = $(e.target);
            var pid = target.attr("data-entity-id");
            sprints8.send({ url: '/admin/product/highlight'
                            , data: { id: pid, highlight: !target.hasClass("HIGHLIGHTED") }
                            , success: function (resp, status, xhr) {
                                if (resp.success == true) {
                                    window.location.reload(true);
                                } else {
                                    error_root.append(error_template({ type: "error", heading: "ERROR", messageBody: resp.error }));
                                }
                            }
            });
        }
    }, ".highlight-product");


    $("form").each(function (idx, f) {
        $(f).validate({
            errorClass: "help-inline"
            , errorElement: "span"
            , highlight: function (element, errorClass, validClass) {
                $(element).closest(".control-group").addClass("error");
            }
            , unhighlight: function (element, errorClass, validClass) {
                $(element).closest(".control-group").removeClass("error");
            }
            , submitHandler: function (form) {
                var data = sprints8.objectifyForm($(form).find("input,select,textarea"));
                $.ajax({ type: "POST"
                    , dataType: "json"
                    , contentType: "application/json; charset=utf-8"
                    , url: form.action
                    , data: JSON.stringify(data)
                    , success: function (resp, status, xhr) {
                        if (resp.success) {
                            window.location.reload(true);
                        } else {
                            error_root.append(error_template({ type: "error", heading: "ERROR", messageBody: resp.error }));
                        }
                    }
                });
            }
            , errorClass: "help-inline"
            , errorElement: "span" // class='help-inline'
            , highlight: function (element, errorClass, validClass) {
                $(element).closest(".control-group").addClass("error");
            }
            , unhighlight: function (element, errorClass, validClass) {
                $(element).closest(".control-group").removeClass("error");
            }
        })
    });

    root.sprints8.objectifyForm = function (params) {
        var data = {};
        _(params).each(function (elem) {
            var keys = elem.name.split("."), len = keys.length, i = 0, holder = data
                , value
                , dataType = $(elem).attr("data-type");
             switch(dataType){
                case 'baseunits':   value = Math.round(parseFloat(elem.value) * 100);
                    break;
                case 'percentage':  value = parseFloat(elem.value) / 100;
                    break;
                default:            value = elem.value;
                    break;
             };
            if (elem.name.length === 0) { return }
            if (len > 1) {
                for (; i < len - 1; i++) {
                    holder[keys[i]] = holder[keys[i]] || {};
                    holder = holder[keys[i]];
                }
                holder[keys.slice(-1)[0]] = value;
            } else {
                data[elem.name] = value;
            }
        });
        return data;
    }

})(window);