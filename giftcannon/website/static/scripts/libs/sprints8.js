String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

window.sprints8 = {
	resizePopup: function (e) {
		var popup = $(".loadingpopup:not(hidden)")
			, bg = $(".loadingbackground")
			, m = Math.max;
		if (popup)
			popup.css({
				top: m(0, (bg.height() - popup.height()) / 2) + "px"
			, left: m(0, (bg.width() - popup.width()) / 2) + "px"
			});
	}
	, gotoUrl: function (url) {
		return function () { window.location.href = url; }
	}
	, prettyPrintPrice: function (number, currency) {
		return number ? (currency || "&pound;") + (number / 100).toFixed(2) : "";
	}
	, activateButton: function (btn) {
		btn.removeClass("inactive");
		if (btn.attr("_href")) { btn.attr({ "href": btn.attr("_href") }) }
	}
	, deActivateButton: function (btn) {
		btn.addClass("inactive");
		if (btn.attr("href")) { btn.removeAttr("href") }
	}
	, LoadingButton: function (btn) {
		this.is_loading = false;
		this.btn = btn;
		this.enable = function () {
			if (this.btn.hasClass("inactive")) this.btn.removeClass("inactive").removeAttr("disabled");
		};
		this.disable = function () {
			if (!this.btn.hasClass("inactive")) this.btn.addClass("inactive").attr("disabled", "disabled");
		};
		this.setState = function (value) {
			if (value) { this.enable() } else { this.disable() }
		};
		this.setLoading = function () {
			this.is_loading = true;
			this.original_button_text = btn.val();
			btn.addClass("loading inactive").val("");
		};
		this.stopLoading = function () {
			this.is_loading = false;
			btn.removeClass("loading inactive").val(this.original_button_text);
		}
		return this;
	}
	, show_msg: function (text) {
		$(".loadingpopup .content").html(text || "loading");
		$(".loadingbackground, .loadingpopup .closing_button").click(this.hide_msg);
		$("body > .loading.hidden").removeClass("hidden");
		$(window).bind("resize", this.resizePopup);
		this.resizePopup();
	}
	, hide_msg: function () {
		$("body > .loading").addClass("hidden");
		$(".loadingbackground").add(".loadingpopup .closing_button").unbind();
		$(window).unbind("resize", this.resizePopup);
	}
	, isEmail: function (email) { return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(email) }
	, navigate_to: function (toPageId) {
		var activePageClass = "active-page";
		var frompage = $("#main").children(".page-container." + activePageClass), topage = $("#" + toPageId);
		if (frompage.id != toPageId) {
			sprints8.hideToolTips(frompage.find('.tooltipshown'));
			frompage.removeClass(activePageClass);
			topage.addClass(activePageClass);
			var bc = $("#breadcrumbsbar"), fromLink = bc.find(".active").removeClass("active").addClass("possible").find(".crumbslink");
			fromLink.attr("href", fromLink.attr("_href"));
			bc.find("#bcfor-" + toPageId).addClass("active");
		}
	}
	, cleanToolTips: function (elements) {
		_(elements).each(function (elem) {
			elem = $(elem);
			var tt = elem.data('tooltip');
			if (tt) {
				$(tt.getTip()).remove();
				elem.unbind().removeData("tooltip");
			}
		});
	}
	, hideToolTips: function (elements) {
		_(elements).each(function (elem) { $(elem).data("tooltip").hide() });
	}
	, tooltipUp: function (elements) {
		elements.tooltip({ onShow: function (e) { $(e.target).addClass("tooltipshown") }, onHide: function (e) { $(e.target).removeClass("tooltipshown") } })
	}
	, ConfigStore: function (key) {
		this.key = "configStore";
		this.save = function (data) {
			localStorage.setItem(this.key, JSON.stringify(data))
		};
		this.get = function () {
			return JSON.parse(localStorage.getItem(this.key) || "{}");
		};
		this.delList = function (link) {
			var config = this.get();
			config.unique_hash[link] = false;
			config.lists = _.filter(config.lists, function (l) { return l.link != link });
			this.save(config);
		};
		this.addList = function (link, name, afterSave, context) {
			var config = this.get(), newentry;
			config.unique_hash = config.unique_hash || {};
			if (config.unique_hash[link]) {
				return;
			} else {
				newentry = { link: link, name: name };
				config.lists = config.lists || []
				config.lists.unshift(newentry);
				config.unique_hash[link] = true;
				this.save(config);
				if (afterSave) { afterSave.call(context || this, newentry) }
			}
		};
		this.getAllLists = function () {
			return (this.get() || {}).lists || [];
		};
	}

	, deferreds: function (doneFunc, context) {
		var deferreds = [], _t = this;
		this.doneFunc = doneFunc;
		this.add = function (f) {
			deferreds.push(f);
			_t.run(arguments);
		};
		this.run = function () {
			if (_t.doneFunc.apply(context)) {
				var i = 0; len = deferreds.length;
				for (; i < len; i++) {
					var f = deferreds.pop();
					f.apply(_t, arguments);
				}
			}
		};
	}
	, send: function (options) {
		var params = _.extend({
			type: "POST"
			, dataType: "json"
			, contentType: "application/json; charset=utf-8"
		}, options || {});
		params.success = function (resp, status, xhr) {
			if (resp.redirect) {
				window.location.href = resp.redirect;
			} else if (options.success) options.success.apply(this, arguments);
		};
		if (typeof params.data != 'string') { params.data = JSON.stringify(params.data) }
		$.ajax(params);
	}
	, cookie: {
		set: function (name, value, days) {
			var expires;
			if (days) {
				var date = new Date();
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				expires = "; expires=" + date.toGMTString();
			}
			else expires = "";
			document.cookie = name + "=" + value + expires + "; path=/";
		}
		, get: function (name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
			}
			return null;
		}
		, del: function (name) {
			sprints8.cookie.set(name, "", -1);
		}
	}
	, store: {
		get: function (key) {
			var raw;
			if ('localStorage' in window && key in window.localStorage)
				raw = window.localStorage.getItem(key);
			else raw = sprints8.cookie.get(key);
			if (raw) return JSON.parse(raw);
		}
		, set: function (key, value, time) {
			if ('localStorage' in window) {
				window.localStorage.setItem(key, JSON.stringify(value));
			} else {
				sprints8.cookie.set(key, JSON.stringify(value), time || 365);
			}
		}
		, update: function (key, value, time) {
			var value_ = sprints8.store.get(key) || {};
			_.extend(value_, value);
			sprints8.store.set(key, value_, time);
		}
		, remove: function (key) {
			sprints8.cookie.del(key);
			if ('localStorage' in window) {
				window.localStorage.removeItem(key);
			}
		}
	}
	, getPageDimensions: function () {
		var de = document.documentElement, db = document.body
		, width = window.innerWidth || self.innerWidth || (de && de.clientWidth) || db.clientWidth
		, height = window.innerHeight || self.innerHeight || (de && de.clientHeight) || db.clientHeight
		, xOffset = Math.max(window.pageXOffset ? window.pageXOffset : 0, de ? de.scrollLeft : 0, db ? db.scrollLeft : 0)
		, yOffset = Math.max(window.pageYOffset ? window.pageYOffset : 0, de ? de.scrollTop : 0, db ? db.scrollTop : 0)
		return { w: width, h: height, xOffset: xOffset, yOffset: yOffset };
	}
	, centerElementInViewPort: function (elem) {
		var w = elem.width(), h = elem.height()
		, pageDimensions = sprints8.getPageDimensions()
		, computedHeight = (pageDimensions.yOffset + 75)
		, left = Math.max(0, (pageDimensions.xOffset + (pageDimensions.w - w) / 2)) + "px"
		, top = Math.max(75, (pageDimensions.yOffset + Math.max(pageDimensions.h / 3 - h, 75))) + "px";
		elem.css({ top: top, left: left });
	}
	, Popup: function (html) {
		var view = this;
		this.html = html;
		this.root = $("#popup-root");
		this.show = function () {
			this.root.append(this.html);
			this.node = this.root.find(".popup").last();
			this.node.find(".close-btn").click(_.bind(this.destroy, this));
			this.root.find(".popup-background").click(_.bind(this.destroy, this));
			this.root.removeClass("hidden");
			sprints8.centerElementInViewPort(this.node);
			this.root.removeClass("invisible");
		};
		this.hide = function () {
			this.root.addClass("hidden");
		};
		this.destroy = function () {
			this.node.find(".close-btn").unbind();
			this.root.find(".popup-background").unbind();
			this.node.remove();
			this.root.addClass("hidden invisible");
		};
		return this;
	}
	, serializeJSON : function(elements) {
        var json = {};
        jQuery.map(elements, function(elem, i){
            elem = $(elem);
            var name = elem.attr("name"), val = elem.val(), keys = name.split('.'), length = keys.length - 1, key, i = 0, tmp = json;
            for(;i<length;i++){
                key = keys[i];
                if(!(key in tmp))tmp[key] = {};
                tmp = tmp[key];
            }
            tmp[_.last(keys)] = val;
        });
        return json;
    }
};


if (_.has(window, "__options__") && _.has(window.__options__, "deploy") && _.has(window.__options__.deploy, "resource_host")) {
  window.sprints8.resource_resolver = new (function () {
	var rr = this;
	this.reshost = window.__options__.deploy.resource_host;
	this.url = function (path) {
	  if (path[0] != '/') path = '/' + path;
	  return window.location.protocol + '//' + rr.reshost + path;
	};
	return this;
  })()
} else {
  window.sprints8.resource_resolver = function () { this.url = function (e) { return e; }; return this; };
}