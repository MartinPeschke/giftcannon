define(["tools/Gift"], function (gift) {
    var rr = window.sprints8.resource_resolver;
    window.__options__.giftview = window.__options__.giftview || {};
    window.__options__.giftview.preset = window.__options__.giftview.preset || {};
    var preset = window.__options__.giftview.preset
    , workflow = {
        product: { enabledBy: []
                , template: _.template($("#giftview-product-template").html())
                , $box: $("#display-gift-tab")
                , $page: $("#selectProduct-page")
                , bc_text: "Select a gift"
                , isEnabled: function (gift) { return true; }
        }
        , recipient: { enabledBy: ["product"]
                , template: _.template($("#giftview-recipient-template").html())
                , $box: $("#display-recipient-tab")
                , $page: $("#selectRecipient-page")
                , bc_text: "Pick a friend"
                , isEnabled: function (gift) { return true; }
        }
        , venue: { enabledBy: ["recipient"]
                , template: _.template($("#giftview-venue-template").html())
                , $box: $("#display-venue-tab")
                , $page: $("#selectVenue-page")
                , bc_text: "Find a venue"
                , isEnabled: function (gift) {
                    var recipient = gift.get("recipient")
                    , email = recipient ? recipient.email : false
                    , id = recipient ? recipient.facebook_id : false;
                    return !!(gift.get("message") && gift.get("notification") && email && id);
                }
        }
        , send: { enabledBy: ["venue"], $page: $("#payment-page")
                , bc_text: "Send the gift"
                , isEnabled: function (gift) {
                    return !(_.isEmpty(Gift.get('product'))
                             || _.isEmpty(Gift.get('recipient'))
                             || _.isEmpty(Gift.get('venue')))
                            && workflow['venue'].isEnabled(gift);
                }
        }
        , all: ["product", "recipient", "venue", "send"]
    }
    , GiftView = Backbone.View.extend({
        el: $("#gift-summary-view")
        , events: { "click .spinner": "qtyAdjust" }
        , bcBar: $("#breadcrumbsbar")
        , bcBarTemplate: _.template($("#giftview-breadcrumb-template").html())
        , crumbslinks: {}
        , initialize: function () {
            var view = this;



            this.model = gift;
            this.model.bind("change:product", this.renderProduct, this);
            this.model.bind("change:recipient", this.renderRecipient, this);
            this.model.bind("change:message", this.renderRecipient, this);
            this.model.bind("change:venue", this.renderVenue, this);
            this.model.bind("save", this.checkBreadCrumbs, this);
            if (this.options.reset) {
                Gift.destroy();
                if (!_.isEmpty(this.options.preset.Product)) {
                    /* product cannot be preset by product.js, s it does not load when recipient is focused */
                    var product = _.clone(this.options.preset.Product);
                    product.picture_url = rr.url(product.picture);
                    Gift.set({ product: product });
                } else if (!_.isEmpty(this.options.preset.Recipient)) {
                    /* recipient is actually preset by recipient.js */
                    workflow.all = ["recipient", "product", "venue", "send"];
                }
            }


            _.each(workflow.all, function (key, idx, list) {
                var step = workflow[key], newbc, entity_key;
                if (step.$page) {
                    newbc = $(view.bcBarTemplate(
                          { number: idx + 1
                          , key: key
                          , bc_text: step.bc_text
                          , page_id: step.$page.attr('id')
                          }));
                    entity_key = newbc.attr("_for_entity")
                    step.breadcrumb = newbc.find(".crumbslink");
                    step.original_content = step.$box && step.$box.html()
                    view.bcBar.append(newbc);
                    var btn = step.$page.find(".proceed-btn"), next_key = list[idx + 1];
                    if (next_key && btn.length) {
                        btn.html(workflow[next_key].bc_text + "&raquo;").attr("_href", "#" + next_key);
                    }
                }
            });

            this.model.fetch({ success: _.bind(this.checkBreadCrumbs, this) });
            if (!_.isEmpty(this.options.preset)) Gift.save();
        }
        , checkBreadCrumbs: function () {
            var view = this, enable = true;
            _.each(workflow.all, function (key, idx) {
                var entity = workflow[key];
                enable = enable && gift.hasAllAttr(entity.enabledBy) && entity.isEnabled(gift);
                if (enable) {
                    view.enableBCrumb(entity.breadcrumb)
                    view.defaultPageIdx = idx;
                } else {
                    view.disableBCrumb(entity.breadcrumb)
                }
            });
        }
        , enableBCrumb: function (link) {
            link.addClass("possible").attr("href", link.attr("_href"));
        }
        , disableBCrumb: function (link) {
            link.removeClass("possible").removeAttr("href");
        }
        , renderEntity: function (entitykey, model, extra_params) {
            var view = this
            , entity = workflow[entitykey]
            , $box = entity.$box
            , params;
            if (!model) {
                $box.html(entity.original_content);
                return false;
            } else {
                if (model.toJSON) { model = model.toJSON() }
                if (extra_params) {
                    params = _.extend(_.clone(model), extra_params);
                } else {
                    params = _.clone(model);
                }
                $box.html(entity.template(params));
                return true;
            }
        }
        , renderProduct: function () {
            var product = this.model.get("product");
            return this.renderEntity("product", product, { quantity: this.model.getQuantity(), prettyprice: this.model.getTotalPrice() });
        }
        , renderVenue: function () {
            var model = this.model.get("venue");
            return this.renderEntity("venue", model); ;
        }
        , renderRecipient: function () {
            var model = _.clone(this.model.get("recipient"));
            if (model) model.message = this.model.get("message");
            return this.renderEntity("recipient", model);
        }
        , removeEntity: function (e) {
            this.model.removeAttr($(e.target).closest(".data-entity").attr("data-entity"));
        }
        , qtyAdjust: function (e) {
            var model = this.model, $target = $(e.target);
            if (model != null) {
                if ($target.hasClass("spinner-up")) {
                    model.setQuantity(model.getQuantity() + 1);
                } else {
                    model.setQuantity(Math.max(model.getQuantity() - 1, 1));
                }
                this.model.save();
                this.renderProduct();
            }
        }
        , getDefaultPage: function () {
            return workflow.all[this.defaultPageIdx || 0];
        }

        , getLastEnabledIdx: function () {
            var i = 0, len = workflow.all.length;
            for (i; i < len; i++) {
                var entity = workflow[workflow.all[i]]
                , enabled = gift.hasAllAttr(entity.enabledBy) && entity.isEnabled(gift);
                if (!enabled) {
                    break;
                }
            }
            return i - 1;
        }
        , checkEnabled: function (entity_key) {
            var view = this
            , entity = workflow[entity_key]
            , isEnabled = entity.isEnabled
            , enabled = isEnabled ? isEnabled(gift) : true;
            return enabled;
        }
        , checkAndForward: function (entity_key) {
            var enabled = this.checkEnabled(entity_key);
            if (!enabled) {
                window.app_router.navigate(workflow.all[this.getLastEnabledIdx()], true);
            } else return enabled;
        }
    });
    if (typeof window.GiftView == 'undefined') { window.GiftView = new GiftView(window.__options__.giftview); }
    return window.GiftView;
});