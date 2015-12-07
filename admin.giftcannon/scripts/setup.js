(function(){
    var opts = window.__options__;
    window.__options__.clickEvent = !!('ontouchstart' in window)?"tap":"click";
    window.translate = function (s) {return s;};


    $(window).on({scroll: function(e){
        if($(window).scrollTop() > 0){
            opts.$messagingContainer.css({position:"fixed"});
        } else {
            opts.$messagingContainer.css({position:"static"});
        }
    }});

    window.hnc = {
        setLoading: function(loading){
            if(loading){
                $("body").addClass("loading");
            } else {
                $("body").removeClass("loading");
            }
        }
        , showPage: function($page){
            var navigate_to = function ($page) {
                window.scrollTo(0, 1);
                var activePageClass = "active-page"
                    , pages = opts.$container.find(".page-container")
                    , frompage = pages.filter("."+activePageClass), fromIdx = frompage.attr("data-page-index")
                    , topage = $page, toIdx = topage.attr("data-page-index");
                frompage.removeClass("afterAnim "+activePageClass);
                topage.addClass("afterAnim "+activePageClass);
            };
            navigate_to($page);
            this.setLoading(false);
        }
    };
    var mod = 'modernizr', modElem = document.createElement(mod)
        , mStyle = modElem.style
        , domPrefixes = 'Webkit Moz O ms Khtml'.split(' ')
        , testProps = function (props, prefixed) {
            for (var i in props)
                if (mStyle[props[i]] !== undefined)
                    return prefixed == 'pfx' ? props[i] : true;
            return false;
        }
        , testPropsAll = function (prop, prefixed) {
            var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1),
                props = (prop + ' ' + domPrefixes.join(ucProp + ' ') + ucProp).split(' ');
            return testProps(props, prefixed);
        };
    hnc.support = {supportsTouch: 'createTouch' in document, cssTransitions : testPropsAll('transitionProperty')};


    String.prototype.toTitleCase = function () {
        var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|vs?\.?|via)$/i;

        return this.replace(/([^\W_]+[^\s-]*) */g, function (match, p1, index, title) {
            if (index > 0 && index + p1.length !== title.length &&
                p1.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
                title.charAt(index - 1).search(/[^\s-]/) < 0) {
                return match.toLowerCase();
            }

            if (p1.substr(1).search(/[A-Z]|\../) > -1) {
                return match;
            }

            return match.charAt(0).toUpperCase() + match.substr(1);
        });
    };
    _.templateSettings = {
        interpolate : /\{\{ (.+?) \}\}/g
        , evaluate: /\{% (.+?) %\}/g
    };
    require(["site"]);
})();