$(function(){
    Backbone.setDomLibrary($);
    window.hnc = {
        extend : function (protoProps, classProps) {
            var child = inherits(this, protoProps, classProps);
            child.extend = this.extend;
            return child;
        }
        , setupPage : function(page){

        }
        , getRecursive: function(obj, key, defaults){
            var tmp = obj, keys = key.split("."), i= 0, len = keys.length;
            for (;i<len;i++) {
                if(tmp.hasOwnProperty(keys[i])){
                    tmp = tmp[keys[i]];
                } else {
                    if(typeof tmp === 'undefined'){
                        return defaults;
                    }
                }
            }
            return tmp;
        }
        , translate : function (s) {return s;}
        , setLoading: function(loading){
            if(loading){
                $("body").addClass("loading");
            } else {
                $("body").removeClass("loading");
            }
        }
        , animateLink: function($link){
            var transEnd = function (e) {
                $(e.target).removeClass("active");
            };
            $link.addClass("active");
            window.setTimeout(function(){
                $link.removeClass("active");
            }, 600);
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

    window.hideAddressBar = function(){
        setTimeout(function(){window.scrollTo(0, 1);}, 20);
    };
    window.adjust = function(){
        $("body, #root-container").css({minHeight: $(window).height()+"px"});
        if($(window).height() > $("#root-container").height())
            $("body, #root-container").css({minHeight: $(window).height()+"px"});
        else if($(window).height() < $("#root-container").css("min-height").replace("px", ''))
            $("body, #root-container").css({minHeight: $(window).height()+"px"});
    };
    window.adjustAndHide = function(){

        hideAddressBar();
    };
    $(window).on({orientationchange:adjustAndHide, load: function(){ if(!window.pageYOffset){ adjustAndHide(); } }} );
    adjustAndHide();
    var opts = window.__options__, $rootContainer = $(opts.$container);
    hnc.setupPage($("#splash-page"));


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
    hnc.support = {
        cssTransitions : testPropsAll('transitionProperty')
        , clickEvent : !!('ontouchstart' in window && '__proto__' in {})?"tap":"click"
        , touchStartEvent: !!('ontouchstart' in window && '__proto__' in {})?"touchstart":"mousedown"
    };


    String.prototype.toTitleCase = function () {
        var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|vs?\.?|via)$/i;

        return this.replace(/([^\W_]+[^\s-]*) */g, function (match, p1, index, title) {
            if (index > 0 && index + p1.length !== title.length &&
                p1.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
                title.charAt(index - 1).search(/[^\s-]/) < 0) {
                return match.toLowerCase();
            }
            if (p1.substr(1).search(/[A-Z]|\../) > -1) return match;
            return match.charAt(0).toUpperCase() + match.substr(1);
        });
    };
    _.templateSettings = {
        interpolate : /\{\{ (.+?) \}\}/g
        , evaluate: /\{% (.+?) %\}/g
    };
    require(["site"]);
});