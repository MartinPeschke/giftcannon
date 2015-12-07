define([]
  , function () {
      var Carousel = Backbone.View.extend({
          /* requires el, entryTemplate */
          events: { "click .arrow": "slideOnClick",
              "dblclick .arrow": "silence",
              "click .listbutton": "onSelect"
          }
      , FOCUSCLASS: "highlighted"
      , SELECTEDCLASS: "selected"
      , UNSELECTEDCLASS: "unselected"
      , PAGECLASS: "carouselPage"
      , ACTIVEPAGECLASS: "active-page"
      , PAGESIZE: 5
      , current_page_idx: 0
      , transitioning: false
      , initialize: function () {
          this.$el.bind("focus", _.bind(this.connectKeys, this));
          this.$el.bind("blur", _.bind(this.disconnectKeys, this));
          this.$el.on({
              mouseenter: _.bind(this.mouseEnter, this)
          }, ".listbutton");
          this.onCreate();
      }
      , silence: function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (document.selection && document.selection.empty) {
              document.selection.empty();
          } else if (window.getSelection) {
              var sel = window.getSelection();
              sel.removeAllRanges();
          }
      }
      , getPage: function (idx) {
          return $(this.pages[idx]);
      }
      , getCurrentPage: function () {
          return this.getPage(this.current_page_idx);
      }
       , focusElement: function ($elem, $lastElem) {
           var FOCUSCLASS = this.FOCUSCLASS;
           if ($elem != $lastElem) {
               $elem.addClass(FOCUSCLASS);
               if ($lastElem && $lastElem.length) $lastElem.removeClass(FOCUSCLASS);
           }
           return $elem;
       }

      , mouseEnter: function (eMouseEnter) {
          var $target = $(eMouseEnter.currentTarget)
            , $last_focus = this.getCurrentPage().children("." + this.FOCUSCLASS);
          this.focusElement($target, $last_focus);
      }
      , connectKeys: function (efocus) {
          var view = this
            , FOCUSCLASS = view.FOCUSCLASS
            , focussed_elem = view.getCurrentPage().find("." + FOCUSCLASS);
          if (focussed_elem.length === 0) {
              focussed_elem = view.getCurrentPage().find("." + view.SELECTEDCLASS);
              if (focussed_elem.length === 0) {
                  focussed_elem = view.focusElement(view.getCurrentPage().children().first());
              }
              this.focusElement(focussed_elem);
          }

          this.$el.unbind("keydown.scollnav");
          this.$el.bind("keydown.scollnav", function (ekeydown) {
              var page = view.getCurrentPage()
                , focussed_elem = page.children("." + FOCUSCLASS)
                , next_elem;
              if (focussed_elem.length === 0) {
                  focussed_elem = view.focusElement(view.getCurrentPage().children().first());
              }
              switch (ekeydown.keyCode) {
                  case 39: // arrow right
                      next_elem = focussed_elem.next(".listbutton");
                      if (next_elem.length) {
                          view.focusElement(next_elem, focussed_elem);
                      } else {
                          if (view.trySlideStep(1)) {
                              view.focusElement(view.getCurrentPage().children().first(), focussed_elem);
                          }
                      }
                      break;
                  case 37:  // arrow left
                      next_elem = focussed_elem.prev(".listbutton");
                      if (next_elem.length) {
                          view.focusElement(next_elem, focussed_elem);
                      } else {
                          if (view.trySlideStep(-1)) {
                              view.focusElement(view.getCurrentPage().children().last(), focussed_elem);
                          }
                      }
                      break;
                  case 13:
                  case 32:
                      if (focussed_elem.length) {
                          view.selectItem(focussed_elem);
                      }
                      break;
              }
          });
      }
      , disconnectKeys: function (e) {
          this.$el.unbind("keydown");
          this.$el.find(".listbutton." + this.FOCUSCLASS).removeClass(this.FOCUSCLASS);
      }
      , getModelId: function (model) { return null; }
      , reset: function (slice, selected_id) {
          var view = this
          , t = view.entryTemplate
          , render_pages = function (pages, page_number, current_render_run, oncomplete, oncancel) {
              if (current_render_run === view.render_run) {
                  var PAGESIZE = view.PAGESIZE
              , first = _.first(pages, PAGESIZE)
              , rest = _.rest(pages, PAGESIZE)
              , wrap_page = function (items, isactivepage) {
                  return $('<ul class="' + view.PAGECLASS + ' ' + (isactivepage ? view.ACTIVEPAGECLASS : "") + '">' + items.join('') + '</ul>');
              }
              , page = []
              , isactivepage = !selected_id && page_number == 0
              , data;
                  _.each(first, function (elem, i, fulllist) {
                      data = elem.toJSON();
                      data.pos = i;
                      data.is_last = i == (fulllist.length - 1);
                      if (selected_id == view.getModelId(data)) {
                          isactivepage = true;
                          view.current_page_idx = page_number;
                          data.addclasses = view.SELECTEDCLASS;
                      } else {
                          data.addclasses = (selected_id!=null)?view.UNSELECTEDCLASS:"";
                      }
                      page.push(t(data));
                  });
                  page = wrap_page(page, isactivepage).appendTo(view.$el);
                  view.pages = view.pages.add(page);
                  view.onPageRender(page);
                  if (rest.length) { setTimeout(_.bind(render_pages, view, rest, page_number + 1, current_render_run, oncomplete, oncancel), 16); }
                  else if (oncomplete) oncomplete(view.pages);
              } else if (oncancel) oncancel();
          };

          this.render_run = Math.random();
          this.current_page_idx = 0;
          this.transitioning = false;
          this.pages = $();
          this.onPageTearDown(this.$el);
          this.$el.find("." + view.PAGECLASS).remove();
          if (slice.length > 0) {
              render_pages(slice, 0, this.render_run);
          }
      }
      , slideOnClick: function (e) {
          var target = $(e.target);
          if (target.hasClass("right")) { this.trySlideStep(1); } else { this.trySlideStep(-1); }
          e.preventDefault();
          e.stopPropagation();
      }
      , trySlideStep: function (step) {
          var n = this.current_page_idx + step, arrow;
          if (!this.pages || n < 0 || n >= this.pages.length) {
              if (step < 0) arrow = this.$el.children(".arrow.left");
              else arrow = this.$el.children(".arrow.right");
              arrow.addClass("forbidden");
              setTimeout(function () { arrow.removeClass("forbidden"); }, 100);
              return false;
          } else if (this.transitioning == true) {
              return false;
          } else {
              this.slide(n);
              return true
          }
      }
      , slide: function (n) {
          var view = this
          , reverseClass = (this.current_page_idx > n) ? " reverse" : ""
          , frompage = $(this.pages.get(this.current_page_idx))
          , topage = $(this.pages.get(n))
          , ACTIVEPAGECLASS = view.ACTIVEPAGECLASS
          , transEnd = function (e) {
              frompage.removeClass(ACTIVEPAGECLASS + " out slide " + reverseClass);
              topage.removeClass("in slide" + reverseClass);
              topage.unbind('webkitAnimationEnd');
              topage.unbind('animationend');
              topage.unbind('oAnimationEnd');
              view.transitioning = false;
          };
          if (Modernizr.csstransitions) {
              this.transitioning = true;
              topage.bind('webkitAnimationEnd', transEnd);
              topage.bind('animationend', transEnd);
              topage.bind('oAnimationEnd', transEnd);
              frompage.addClass("slide out" + reverseClass);
              topage.addClass("slide in " + ACTIVEPAGECLASS + reverseClass);
          } else {
              frompage.removeClass(ACTIVEPAGECLASS);
              topage.addClass(ACTIVEPAGECLASS);
          }
          this.current_page_idx = n;
      }

      , onSelect: function (e) {
          this.selectItem($(e.target).closest(".listbutton"));
      }
      , selectFirst: function () {
          this.selectItem(this.pages.first().find(".listbutton").first());
      }
      , selectItem: function ($target) {
          var SELECTEDCLASS = this.SELECTEDCLASS
            , UNSELECTEDCLASS = this.UNSELECTEDCLASS
            , data_id = $target.attr("data-entity-id");
          if ($target.hasClass(SELECTEDCLASS)) {
              return;
          } else {
              this.trigger("selected", data_id);
              this.$el.find(".listbutton." + SELECTEDCLASS).removeClass(SELECTEDCLASS);
              $target.removeClass(UNSELECTEDCLASS).addClass(SELECTEDCLASS);
              $target.siblings(".listbutton").addClass(UNSELECTEDCLASS);
          }
      }
      , getSelectedDataId: function () {
          return this.$el.find(".listbutton." + this.SELECTEDCLASS).attr("data-entity-id") || null
      }
      , onCreate: function () { }
      , onPageRender: function (page) { }
      , onPageTearDown: function ($el) { }
      })
      return Carousel;
  }
);