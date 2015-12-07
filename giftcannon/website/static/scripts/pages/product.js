define(["require", "tools/Gift", "tools/GiftView", "libs/jquery_tooltip", "tools/CategoryCarousel"]
  , function (require, gift, giftView, tooltips, CategoryCarousel) {
      var 
      this_page = $("#selectProduct-page")
      , proceedBtn = this_page.find(".proceed-btn")
      , Product = Backbone.Model.extend({})
      , Products = Backbone.Collection.extend({ model: Product })
      , Category = Backbone.Model.extend({ defaults: {} })

      , Catalog = Backbone.Collection.extend({
          model: Category
        , url: function () { return "/api/product/catalog" }
        , parse: function (resp, xhr) {
            var rr = sprints8.resource_resolver;
            _.each(resp.Category, function (model) {
                model.picture_url = rr.url(model.picture);
                _.each(model.Product, function (product) { product.picture_url = rr.url(product.picture); });
            });
            return resp.Category;
        }
        , getSelectedCategory: function (id) {
            return id ? this.get(id) : null; //this.models[0];
        }
      })

      , ProductsView = Backbone.View.extend({
          el: $("#product-wrapper")
        , products_template: _.template($("#products-template").html())
        , events: { "click .selectable": "switchProduct" }
        , initialize: function () {
            this.model.bind("reset", this.render, this);
            this.productBox = this.$el.find("#product-box").masonry({
                itemSelector: '.product-inner', isAnimated: false,
                isResizable: true
            });
            Gift.bind("reset:product", this.unsetProduct, this);
            if (Gift.get("product")) sprints8.activateButton(proceedBtn);
        }
        , getPresetProduct: function () {
            var result = {}, product = Gift.get("product"), preset = window.__options__.giftview.preset; // BAD BAD BAD BAD BAD
            if (!_.isEmpty(product)) {
                result = product;
            } else if (preset && !_.isEmpty(preset.product)) {
                preset.product.isPreset = true;
                result = preset.product;
                Gift.set({ product: result });
                Gift.save();
            }
            return result;
        }
      , render: function () {
          var widgets = []
            , view = this
            , len = this.model.models.length
            , product = this.getPresetProduct()
            , selected = product ? product.id : null;

          if (len > 0) {
              this.model.each(function (elem, pos) {
                  var p = elem.toJSON();
                  _.extend(p, { pos: pos, is_last: pos == len - 1, selected: p.id == selected, picture_url: p.picture_url });
                  widgets.push(view.products_template(p));
              });
              this.$el.removeClass("hidden");
              this.productBox.html(widgets.join(""));
              this.productBox.imagesLoaded(
                function () {
                    view.productBox.masonry('reload').css({ "min-height": "0" });

                });
              this.productBox.find(".catalogpic").tooltip();






          } else {
              this.$el.addClass("hidden")
          }
      }
        , switchProduct: function (e) {
            var product = this.model.get($(e.currentTarget).attr("data-entity-id"));
            gift.addProduct(product.toJSON());
            this.$(".selectable.selected").removeClass("selected");
            $(e.currentTarget).addClass("selected");
            sprints8.activateButton(proceedBtn);
            require(["pages/recipient"]); //preloading for performance only
        }
        , unsetProduct: function () {
            this.$(".selectable.selected").removeClass("selected");
            sprints8.deActivateButton(proceedBtn);
        }
      })

      , CatalogView = Backbone.View.extend({
          el: $("#category-box")
        , category_template: _.template($("#category-template").html())
        , initialize: function () {

            this.category_widget = new CategoryCarousel();
            this.category_widget.bind("selected", this.switchCategory, this);
            this.model = new Catalog;
            this.model.fetch();
            this.model.bind("reset", this.addLinks, this);
        }
        , switchCategory: function (category_id) {
            var category = this.model.get(category_id);
            this.categoryview.model.reset(category.get('Product'));

            gift.setCategory(category.id);
            sprints8.deActivateButton(proceedBtn);
        }



        , getPresetCategoryId: function () {
            var category_id = gift.get('category_id'), preset = this.options.preset;
            if (preset && !_.isEmpty(preset.product) && preset.product.Category) {
                category_id = preset.product.Category.id;
            }
            return category_id;
        }

        , addLinks: function () {
            var category_id = this.getPresetCategoryId()
            , category = this.model.get(category_id)
            , models = _.sortBy(this.model.models, function (item) {
                return parseInt(item.get("sort"), 10) || Infinity;
            });
            this.category_widget.reset(models, this.getPresetCategoryId());
            this.category_widget.$el.focus();
            this.categoryview = new ProductsView({ model: new Products });
            if (category_id && category) {
                this.categoryview.model.reset(category.get('Product'));
            }
        }
        , render: function () {
            sprints8.navigate_to(this_page.attr("id"));
        }
      });
      return new CatalogView(window.__options__.giftview);
  });