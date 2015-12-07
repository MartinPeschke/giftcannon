var JSON;JSON||(JSON={});
(function(){function c(c){return 10>c?"0"+c:c}function g(c){h.lastIndex=0;return h.test(c)?'"'+c.replace(h,function(c){var e=w[c];return"string"===typeof e?e:"\\u"+("0000"+c.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+c+'"'}function e(c,f){var h,p,q,r,s=m,o,j=f[c];j&&"object"===typeof j&&"function"===typeof j.toJSON&&(j=j.toJSON(c));"function"===typeof n&&(j=n.call(f,c,j));switch(typeof j){case "string":return g(j);case "number":return isFinite(j)?""+j:"null";case "boolean":case "null":return""+j;
case "object":if(!j)return"null";m+=l;o=[];if("[object Array]"===Object.prototype.toString.apply(j)){r=j.length;for(h=0;h<r;h+=1)o[h]=e(h,j)||"null";q=0===o.length?"[]":m?"[\n"+m+o.join(",\n"+m)+"\n"+s+"]":"["+o.join(",")+"]";m=s;return q}if(n&&"object"===typeof n){r=n.length;for(h=0;h<r;h+=1)"string"===typeof n[h]&&(p=n[h],(q=e(p,j))&&o.push(g(p)+(m?": ":":")+q))}else for(p in j)Object.prototype.hasOwnProperty.call(j,p)&&(q=e(p,j))&&o.push(g(p)+(m?": ":":")+q);q=0===o.length?"{}":m?"{\n"+m+o.join(",\n"+
m)+"\n"+s+"}":"{"+o.join(",")+"}";m=s;return q}}if("function"!==typeof Date.prototype.toJSON)Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+c(this.getUTCMonth()+1)+"-"+c(this.getUTCDate())+"T"+c(this.getUTCHours())+":"+c(this.getUTCMinutes())+":"+c(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()};var f=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
h=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,m,l,w={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},n;if("function"!==typeof JSON.stringify)JSON.stringify=function(c,f,h){var g;l=m="";if("number"===typeof h)for(g=0;g<h;g+=1)l+=" ";else"string"===typeof h&&(l=h);if((n=f)&&"function"!==typeof f&&("object"!==typeof f||"number"!==typeof f.length))throw Error("JSON.stringify");return e("",
{"":c})};if("function"!==typeof JSON.parse)JSON.parse=function(c,e){function h(c,f){var g,m,j=c[f];if(j&&"object"===typeof j)for(g in j)Object.prototype.hasOwnProperty.call(j,g)&&(m=h(j,g),void 0!==m?j[g]=m:delete j[g]);return e.call(c,f,j)}var g,c=""+c;f.lastIndex=0;f.test(c)&&(c=c.replace(f,function(c){return"\\u"+("0000"+c.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(c.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return g=eval("("+c+")"),"function"===typeof e?h({"":g},""):g;throw new SyntaxError("JSON.parse");}})();(function(){function c(i,a,d){if(i===a)return 0!==i||1/i==1/a;if(null==i||null==a)return i===a;if(i._chain)i=i._wrapped;if(a._chain)a=a._wrapped;if(i.isEqual&&b.isFunction(i.isEqual))return i.isEqual(a);if(a.isEqual&&b.isFunction(a.isEqual))return a.isEqual(i);var A=n.call(i);if(A!=n.call(a))return!1;switch(A){case "[object String]":return i==""+a;case "[object Number]":return i!=+i?a!=+a:0==i?1/i==1/a:i==+a;case "[object Date]":case "[object Boolean]":return+i==+a;case "[object RegExp]":return i.source==
a.source&&i.global==a.global&&i.multiline==a.multiline&&i.ignoreCase==a.ignoreCase}if("object"!=typeof i||"object"!=typeof a)return!1;for(var e=d.length;e--;)if(d[e]==i)return!0;d.push(i);var e=0,f=!0;if("[object Array]"==A){if(e=i.length,f=e==a.length)for(;e--&&(f=e in i==e in a&&c(i[e],a[e],d)););}else{if("constructor"in i!="constructor"in a||i.constructor!=a.constructor)return!1;for(var k in i)if(b.has(i,k)&&(e++,!(f=b.has(a,k)&&c(i[k],a[k],d))))break;if(f){for(k in a)if(b.has(a,k)&&!e--)break;
f=!e}}d.pop();return f}var g=this,e=g._,f={},h=Array.prototype,m=Object.prototype,l=h.slice,w=h.unshift,n=m.toString,y=m.hasOwnProperty,v=h.forEach,x=h.map,p=h.reduce,q=h.reduceRight,r=h.filter,s=h.every,o=h.some,j=h.indexOf,t=h.lastIndexOf,m=Array.isArray,a=Object.keys,d=Function.prototype.bind,b=function(a){return new u(a)};if("undefined"!==typeof exports){if("undefined"!==typeof module&&module.exports)exports=module.exports=b;exports._=b}else g._=b;b.VERSION="1.3.1";var k=b.each=b.forEach=function(a,
d,z){if(null!=a)if(v&&a.forEach===v)a.forEach(d,z);else if(a.length===+a.length)for(var c=0,e=a.length;c<e&&!(c in a&&d.call(z,a[c],c,a)===f);c++);else for(c in a)if(b.has(a,c)&&d.call(z,a[c],c,a)===f)break};b.map=b.collect=function(a,b,d){var c=[];if(null==a)return c;if(x&&a.map===x)return a.map(b,d);k(a,function(a,i,e){c[c.length]=b.call(d,a,i,e)});if(a.length===+a.length)c.length=a.length;return c};b.reduce=b.foldl=b.inject=function(a,d,c,e){var f=2<arguments.length;null==a&&(a=[]);if(p&&a.reduce===
p)return e&&(d=b.bind(d,e)),f?a.reduce(d,c):a.reduce(d);k(a,function(a,b,i){f?c=d.call(e,c,a,b,i):(c=a,f=!0)});if(!f)throw new TypeError("Reduce of empty array with no initial value");return c};b.reduceRight=b.foldr=function(a,d,c,e){var f=2<arguments.length;null==a&&(a=[]);if(q&&a.reduceRight===q)return e&&(d=b.bind(d,e)),f?a.reduceRight(d,c):a.reduceRight(d);var k=b.toArray(a).reverse();e&&!f&&(d=b.bind(d,e));return f?b.reduce(k,d,c,e):b.reduce(k,d)};b.find=b.detect=function(a,b,d){var c;E(a,function(a,
i,e){if(b.call(d,a,i,e))return c=a,!0});return c};b.filter=b.select=function(a,b,d){var c=[];if(null==a)return c;if(r&&a.filter===r)return a.filter(b,d);k(a,function(a,i,e){b.call(d,a,i,e)&&(c[c.length]=a)});return c};b.reject=function(a,b,d){var c=[];if(null==a)return c;k(a,function(a,i,e){b.call(d,a,i,e)||(c[c.length]=a)});return c};b.every=b.all=function(a,b,d){var c=!0;if(null==a)return c;if(s&&a.every===s)return a.every(b,d);k(a,function(a,i,e){if(!(c=c&&b.call(d,a,i,e)))return f});return c};
var E=b.some=b.any=function(a,d,c){d||(d=b.identity);var e=!1;if(null==a)return e;if(o&&a.some===o)return a.some(d,c);k(a,function(a,b,i){if(e||(e=d.call(c,a,b,i)))return f});return!!e};b.include=b.contains=function(a,b){var d=!1;if(null==a)return d;return j&&a.indexOf===j?-1!=a.indexOf(b):d=E(a,function(a){return a===b})};b.invoke=function(a,d){var c=l.call(arguments,2);return b.map(a,function(a){return(b.isFunction(d)?d||a:a[d]).apply(a,c)})};b.pluck=function(a,d){return b.map(a,function(a){return a[d]})};
b.max=function(a,d,c){if(!d&&b.isArray(a))return Math.max.apply(Math,a);if(!d&&b.isEmpty(a))return-Infinity;var e={computed:-Infinity};k(a,function(a,b,i){b=d?d.call(c,a,b,i):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,d,c){if(!d&&b.isArray(a))return Math.min.apply(Math,a);if(!d&&b.isEmpty(a))return Infinity;var e={computed:Infinity};k(a,function(a,b,i){b=d?d.call(c,a,b,i):a;b<e.computed&&(e={value:a,computed:b})});return e.value};b.shuffle=function(a){var b=[],d;
k(a,function(a,i){0==i?b[0]=a:(d=Math.floor(Math.random()*(i+1)),b[i]=b[d],b[d]=a)});return b};b.sortBy=function(a,d,c){return b.pluck(b.map(a,function(a,b,i){return{value:a,criteria:d.call(c,a,b,i)}}).sort(function(a,b){var i=a.criteria,d=b.criteria;return i<d?-1:i>d?1:0}),"value")};b.groupBy=function(a,d){var c={},e=b.isFunction(d)?d:function(a){return a[d]};k(a,function(a,b){var d=e(a,b);(c[d]||(c[d]=[])).push(a)});return c};b.sortedIndex=function(a,d,c){c||(c=b.identity);for(var e=0,f=a.length;e<
f;){var k=e+f>>1;c(a[k])<c(d)?e=k+1:f=k}return e};b.toArray=function(a){return!a?[]:a.toArray?a.toArray():b.isArray(a)||b.isArguments(a)?l.call(a):b.values(a)};b.size=function(a){return b.toArray(a).length};b.first=b.head=function(a,b,d){return null!=b&&!d?l.call(a,0,b):a[0]};b.initial=function(a,b,d){return l.call(a,0,a.length-(null==b||d?1:b))};b.last=function(a,b,d){return null!=b&&!d?l.call(a,Math.max(a.length-b,0)):a[a.length-1]};b.rest=b.tail=function(a,b,d){return l.call(a,null==b||d?1:b)};
b.compact=function(a){return b.filter(a,function(a){return!!a})};b.flatten=function(a,d){return b.reduce(a,function(a,i){if(b.isArray(i))return a.concat(d?i:b.flatten(i));a[a.length]=i;return a},[])};b.without=function(a){return b.difference(a,l.call(arguments,1))};b.uniq=b.unique=function(a,d,c){var c=c?b.map(a,c):a,e=[];b.reduce(c,function(c,f,k){if(0==k||(!0===d?b.last(c)!=f:!b.include(c,f)))c[c.length]=f,e[e.length]=a[k];return c},[]);return e};b.union=function(){return b.uniq(b.flatten(arguments,
!0))};b.intersection=b.intersect=function(a){var d=l.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(d,function(d){return 0<=b.indexOf(d,a)})})};b.difference=function(a){var d=b.flatten(l.call(arguments,1));return b.filter(a,function(a){return!b.include(d,a)})};b.zip=function(){for(var a=l.call(arguments),d=b.max(b.pluck(a,"length")),c=Array(d),e=0;e<d;e++)c[e]=b.pluck(a,""+e);return c};b.indexOf=function(a,d,c){if(null==a)return-1;var e;if(c)return c=b.sortedIndex(a,d),a[c]===
d?c:-1;if(j&&a.indexOf===j)return a.indexOf(d);for(c=0,e=a.length;c<e;c++)if(c in a&&a[c]===d)return c;return-1};b.lastIndexOf=function(a,b){if(null==a)return-1;if(t&&a.lastIndexOf===t)return a.lastIndexOf(b);for(var d=a.length;d--;)if(d in a&&a[d]===b)return d;return-1};b.range=function(a,b,d){1>=arguments.length&&(b=a||0,a=0);for(var d=arguments[2]||1,c=Math.max(Math.ceil((b-a)/d),0),e=0,f=Array(c);e<c;)f[e++]=a,a+=d;return f};var F=function(){};b.bind=function(a,c){var e,f;if(a.bind===d&&d)return d.apply(a,
l.call(arguments,1));if(!b.isFunction(a))throw new TypeError;f=l.call(arguments,2);return e=function(){if(!(this instanceof e))return a.apply(c,f.concat(l.call(arguments)));F.prototype=a.prototype;var b=new F,d=a.apply(b,f.concat(l.call(arguments)));return Object(d)===d?d:b}};b.bindAll=function(a){var d=l.call(arguments,1);0==d.length&&(d=b.functions(a));k(d,function(d){a[d]=b.bind(a[d],a)});return a};b.memoize=function(a,d){var c={};d||(d=b.identity);return function(){var e=d.apply(this,arguments);
return b.has(c,e)?c[e]:c[e]=a.apply(this,arguments)}};b.delay=function(a,b){var d=l.call(arguments,2);return setTimeout(function(){return a.apply(a,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(l.call(arguments,1)))};b.throttle=function(a,d){var c,e,f,k,h,g=b.debounce(function(){h=k=!1},d);return function(){c=this;e=arguments;var b;f||(f=setTimeout(function(){f=null;h&&a.apply(c,e);g()},d));k?h=!0:a.apply(c,e);g();k=!0}};b.debounce=function(a,b){var d;return function(){var c=this,
e=arguments;clearTimeout(d);d=setTimeout(function(){d=null;a.apply(c,e)},b)}};b.once=function(a){var b=!1,d;return function(){if(b)return d;b=!0;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(l.call(arguments,0));return b.apply(this,d)}};b.compose=function(){var a=arguments;return function(){for(var b=arguments,d=a.length-1;0<=d;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return 0>=a?b():function(){if(1>--a)return b.apply(this,arguments)}};
b.keys=a||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var d=[],c;for(c in a)b.has(a,c)&&(d[d.length]=c);return d};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var d=[],c;for(c in a)b.isFunction(a[c])&&d.push(c);return d.sort()};b.extend=function(a){k(l.call(arguments,1),function(b){for(var d in b)a[d]=b[d]});return a};b.defaults=function(a){k(l.call(arguments,1),function(b){for(var d in b)null==a[d]&&(a[d]=b[d])});return a};b.clone=function(a){return!b.isObject(a)?
a:b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,b){return c(a,b,[])};b.isEmpty=function(a){if(b.isArray(a)||b.isString(a))return 0===a.length;for(var d in a)if(b.has(a,d))return!1;return!0};b.isElement=function(a){return!!(a&&1==a.nodeType)};b.isArray=m||function(a){return"[object Array]"==n.call(a)};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return"[object Arguments]"==n.call(a)};if(!b.isArguments(arguments))b.isArguments=
function(a){return!(!a||!b.has(a,"callee"))};b.isFunction=function(a){return"[object Function]"==n.call(a)};b.isString=function(a){return"[object String]"==n.call(a)};b.isNumber=function(a){return"[object Number]"==n.call(a)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return!0===a||!1===a||"[object Boolean]"==n.call(a)};b.isDate=function(a){return"[object Date]"==n.call(a)};b.isRegExp=function(a){return"[object RegExp]"==n.call(a)};b.isNull=function(a){return null===a};b.isUndefined=
function(a){return void 0===a};b.has=function(a,b){return y.call(a,b)};b.noConflict=function(){g._=e;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var c=0;c<a;c++)b.call(d,c)};b.escape=function(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")};b.mixin=function(a){k(b.functions(a),function(d){G(d,b[d]=a[d])})};var H=0;b.uniqueId=function(a){var b=H++;return a?a+b:b};b.templateSettings=
{evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var B=/.^/,C=function(a){return a.replace(/\\\\/g,"\\").replace(/\\'/g,"'")};b.template=function(a,d){var c=b.templateSettings,c="var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('"+a.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(c.escape||B,function(a,b){return"',_.escape("+C(b)+"),'"}).replace(c.interpolate||B,function(a,b){return"',"+C(b)+",'"}).replace(c.evaluate||B,function(a,
b){return"');"+C(b).replace(/[\r\n\t]/g," ")+";__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');",e=new Function("obj","_",c);return d?e(d,b):function(a){return e.call(this,a,b)}};b.chain=function(a){return b(a).chain()};var u=function(a){this._wrapped=a};b.prototype=u.prototype;var D=function(a,d){return d?b(a).chain():a},G=function(a,d){u.prototype[a]=function(){var a=l.call(arguments);w.call(a,this._wrapped);return D(d.apply(b,a),this._chain)}};
b.mixin(b);k("pop,push,reverse,shift,sort,splice,unshift".split(","),function(a){var b=h[a];u.prototype[a]=function(){var d=this._wrapped;b.apply(d,arguments);var c=d.length;("shift"==a||"splice"==a)&&0===c&&delete d[0];return D(d,this._chain)}});k(["concat","join","slice"],function(a){var b=h[a];u.prototype[a]=function(){return D(b.apply(this._wrapped,arguments),this._chain)}});u.prototype.chain=function(){this._chain=!0;return this};u.prototype.value=function(){return this._wrapped}}).call(this);String.prototype.toProperCase=function(){return this.replace(/\w\S*/g,function(c){return c.charAt(0).toUpperCase()+c.substr(1).toLowerCase()})};
window.sprints8={resizePopup:function(){var c=$(".loadingpopup:not(hidden)"),g=$(".loadingbackground"),e=Math.max;c&&c.css({top:e(0,(g.height()-c.height())/2)+"px",left:e(0,(g.width()-c.width())/2)+"px"})},gotoUrl:function(c){return function(){window.location.href=c}},prettyPrintPrice:function(c,g){return c?(g||"&pound;")+(c/100).toFixed(2):""},activateButton:function(c){c.removeClass("inactive");c.attr("_href")&&c.attr({href:c.attr("_href")})},deActivateButton:function(c){c.addClass("inactive");
c.attr("href")&&c.removeAttr("href")},LoadingButton:function(c){this.is_loading=!1;this.btn=c;this.setLoading=function(){this.is_loading=!0;this.original_button_text=c.val();c.addClass("loading inactive").val("")};this.stopLoading=function(){this.is_loading=!1;c.removeClass("loading inactive").val(this.original_button_text)};return this},show_msg:function(c){$(".loadingpopup .content").html(c||"loading");$(".loadingbackground, .loadingpopup .closing_button").click(this.hide_msg);$("body > .loading.hidden").removeClass("hidden");
$(window).bind("resize",this.resizePopup);this.resizePopup()},hide_msg:function(){$("body > .loading").addClass("hidden");$(".loadingbackground").add(".loadingpopup .closing_button").unbind();$(window).unbind("resize",this.resizePopup)},isEmail:function(c){return/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(c)},
navigate_to:function(c){var g=$("#main").children(".page-container.active-page"),e=$("#"+c);g.id!=c&&(sprints8.hideToolTips(g.find(".tooltipshown")),g.removeClass("active-page"),e.addClass("active-page"),g=$("#breadcrumbsbar"),e=g.find(".active").removeClass("active").addClass("possible").find(".crumbslink"),e.attr("href",e.attr("_href")),g.find("#bcfor-"+c).addClass("active"))},cleanToolTips:function(c){_(c).each(function(c){var c=$(c),e=c.data("tooltip");e&&($(e.getTip()).remove(),c.unbind().removeData("tooltip"))})},
hideToolTips:function(c){_(c).each(function(c){$(c).data("tooltip").hide()})},tooltipUp:function(c){c.tooltip({onShow:function(c){$(c.target).addClass("tooltipshown")},onHide:function(c){$(c.target).removeClass("tooltipshown")}})},ConfigStore:function(){this.key="configStore";this.save=function(c){localStorage.setItem(this.key,JSON.stringify(c))};this.get=function(){return JSON.parse(localStorage.getItem(this.key)||"{}")};this.delList=function(c){var g=this.get();g.unique_hash[c]=!1;g.lists=_.filter(g.lists,
function(e){return e.link!=c});this.save(g)};this.addList=function(c,g,e,f){var h=this.get();h.unique_hash=h.unique_hash||{};if(!h.unique_hash[c])g={link:c,name:g},h.lists=h.lists||[],h.lists.unshift(g),h.unique_hash[c]=!0,this.save(h),e&&e.call(f||this,g)};this.getAllLists=function(){return(this.get()||{}).lists||[]}},deferreds:function(c,g){var e=[],f=this;this.doneFunc=c;this.add=function(c){e.push(c);f.run(arguments)};this.run=function(){if(f.doneFunc.apply(g)){var c=0;for(len=e.length;c<len;c++)e.pop().apply(f,
arguments)}}},send:function(c){var g=_.extend({type:"POST",dataType:"json",contentType:"application/json; charset=utf-8"},c||{});g.success=function(e,f,h){e.redirect?window.location.href=e.redirect:c.success&&c.success.apply(this,arguments)};if("string"!=typeof g.data)g.data=JSON.stringify(g.data);$.ajax(g)},cookie:{set:function(c,g,e){if(e){var f=new Date;f.setTime(f.getTime()+864E5*e);e="; expires="+f.toGMTString()}else e="";document.cookie=c+"="+g+e+"; path=/"},get:function(c){for(var c=c+"=",
g=document.cookie.split(";"),e=0;e<g.length;e++){for(var f=g[e];" "==f.charAt(0);)f=f.substring(1,f.length);if(0==f.indexOf(c))return f.substring(c.length,f.length)}return null},del:function(c){sprints8.cookie.set(c,"",-1)}},store:{get:function(c){if(c="localStorage"in window&&c in window.localStorage?window.localStorage.getItem(c):sprints8.cookie.get(c))return JSON.parse(c)},set:function(c,g,e){"localStorage"in window?window.localStorage.setItem(c,JSON.stringify(g)):sprints8.cookie.set(c,JSON.stringify(g),
e||365)},update:function(c,g,e){var f=sprints8.store.get(c)||{};_.extend(f,g);sprints8.store.set(c,f,e)},remove:function(c){sprints8.cookie.del(c);"localStorage"in window&&window.localStorage.removeItem(c)}},getPageDimensions:function(){var c=document.documentElement,g=document.body,e=window.innerWidth||self.innerWidth||c&&c.clientWidth||g.clientWidth,f=window.innerHeight||self.innerHeight||c&&c.clientHeight||g.clientHeight,h=Math.max(window.pageXOffset?window.pageXOffset:0,c?c.scrollLeft:0,g?g.scrollLeft:
0),c=Math.max(window.pageYOffset?window.pageYOffset:0,c?c.scrollTop:0,g?g.scrollTop:0);return{w:e,h:f,xOffset:h,yOffset:c}},centerElementInViewPort:function(c){var g=c.width(),e=c.height(),f=sprints8.getPageDimensions(),g=Math.max(0,f.xOffset+(f.w-g)/2)+"px",e=Math.max(75,f.yOffset+f.h/2-e)+"px";c.css({top:e,left:g})},Popup:function(c){this.html=c;this.root=$("#popup-root");this.show=function(){this.root.append(this.html);this.node=this.root.find(".popup").last();this.node.find(".close-btn").click(_.bind(this.destroy,
this));this.root.find(".popup-background").click(_.bind(this.destroy,this));this.root.removeClass("hidden");sprints8.centerElementInViewPort(this.node);this.root.removeClass("invisible")};this.hide=function(){this.root.addClass("hidden")};this.destroy=function(){this.node.find(".close-btn").unbind();this.root.find(".popup-background").unbind();this.node.remove();this.root.addClass("hidden invisible")};return this}};(function(c){c.__auth__=new function(c){this.template=$("#logintemplate").html();this.user=c.user||{};this.fbDoneLoading=!1;this.fbUserID=this.user.facebook_id;this.fbToken=this.user.access_token||"NOTOKEN";this.fbFriends=null;this.fbPerms={};this.isLoggedIn=function(){return!!FB.getAccessToken()};var e=this,f=new sprints8.deferreds(function(){return this.fbDoneLoading},this);this.addFBDeferred=f.add;this.runFBDeferred=f.run;f=new sprints8.deferreds(function(){return this.fbDoneLoading&&this.isLoggedIn()},
this);this.addLoginDeferred=f.add;this.runLoginDeferred=f.run;this.getPicFromUserID=function(c){return"http://graph.facebook.com/"+c+"/picture"};this.getPermissions=function(){var c=this;c.addLoginDeferred(function(){FB.api("/me/permissions",function(e){if(_.isArray(e.data))c.fbPerms=e.data[0]})});return c.fbPerms};this.getFriends=function(c){e.fbFriends?c&&c(e.fbFriends):this.addLoginDeferred(function(){FB.api("/me/friends",{fields:"name,id,birthday,gender"},function(f){e.fbFriends=f.data;c&&c(e.fbFriends)})})};
this.sendUserToServer=function(c,e,f){sprints8.send(_.extend({url:"/fblogin",data:JSON.stringify({authResponse:e,profile:c})},f||{}))};this.backlogin=function(c){FB.api("/me",function(e){e.picture=window.__auth__.getPicFromUserID(e.id);window.__auth__.sendUserToServer(e,c,{success:sprints8.gotoUrl(window.__options__.furl),complete:function(){document.body.style.cursor=""}})})};c.connect&&$(c.connect_root||document).find(".fbconnect").click(function(c){$("body").add(c.target).css("cursor","wait");
window.__auth__.addFBDeferred(function(){FB.login(function(f){(f=f.authResponse)?e.backlogin(f):$("body").add(c.target).css("cursor","")},{scope:"email,user_birthday,friends_birthday"})})});window.fbAsyncInit=function(){FB.init({appId:c.appId,status:!0,authResponse:!0,cookie:!0,xfbml:!1,channelUrl:document.location.protocol+"//"+document.location.host+"/static/scripts/channel.html"});e.fbDoneLoading=!0;e.runFBDeferred();FB.Event.subscribe("auth.authResponseChange",function(c){if(c.authResponse)!_.isEmpty(e.user)&&
e.fbToken!=c.authResponse.accessToken&&sprints8.send({url:"/fbtokenrefresh",data:{accessToken:e.fbToken},success:function(f){f.isLogin&&e.backlogin(c.authResponse)}}),e.fbToken=c.authResponse.accessToken,e.runLoginDeferred()});_.isEmpty(e.user)||FB.Event.subscribe("auth.statusChange",function(c){c.authResponse||sprints8.send({url:"/asynclogout",success:function(c){window.location.href=c.location}})})};f=document.createElement("script");f.src="https://connect.facebook.net/en_US/all.js";f.async=!0;
document.getElementById(c.fbRootNode||"fb-root").appendChild(f)}(window.__options__.fb)})(window);(function(){var c=this,g=c.Backbone,e;e="undefined"!==typeof exports?exports:c.Backbone={};e.VERSION="0.5.3";var f=c._;if(!f&&"undefined"!==typeof require)f=require("underscore")._;var h=c.jQuery||c.Zepto;e.noConflict=function(){c.Backbone=g;return this};e.emulateHTTP=!1;e.emulateJSON=!1;e.Events={bind:function(a,d,b){var c=this._callbacks||(this._callbacks={});(c[a]||(c[a]=[])).push([d,b]);return this},unbind:function(a,d){var b;if(a){if(b=this._callbacks)if(d){b=b[a];if(!b)return this;for(var c=
0,e=b.length;c<e;c++)if(b[c]&&d===b[c][0]){b[c]=null;break}}else b[a]=[]}else this._callbacks={};return this},trigger:function(a){var d,b,c,e,f=2;if(!(b=this._callbacks))return this;for(;f--;)if(d=f?a:"all",d=b[d])for(var g=0,h=d.length;g<h;g++)(c=d[g])?(e=f?Array.prototype.slice.call(arguments,1):arguments,c[0].apply(c[1]||this,e)):(d.splice(g,1),g--,h--);return this}};e.Model=function(a,d){var b;a||(a={});if(b=this.defaults)f.isFunction(b)&&(b=b.call(this)),a=f.extend({},b,a);this.attributes={};
this._escapedAttributes={};this.cid=f.uniqueId("c");this.set(a,{silent:!0});this._changed=!1;this._previousAttributes=f.clone(this.attributes);if(d&&d.collection)this.collection=d.collection;this.initialize(a,d)};f.extend(e.Model.prototype,e.Events,{_previousAttributes:null,_changed:!1,idAttribute:"id",initialize:function(){},toJSON:function(){return f.clone(this.attributes)},get:function(a){return this.attributes[a]},escape:function(a){var d;if(d=this._escapedAttributes[a])return d;d=this.attributes[a];
return this._escapedAttributes[a]=(null==d?"":""+d).replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")},has:function(a){return null!=this.attributes[a]},set:function(a,d){d||(d={});if(!a)return this;if(a.attributes)a=a.attributes;var b=this.attributes,c=this._escapedAttributes;if(!d.silent&&this.validate&&!this._performValidation(a,d))return!1;if(this.idAttribute in a)this.id=a[this.idAttribute];
var e=this._changing;this._changing=!0;for(var g in a){var h=a[g];if(!f.isEqual(b[g],h))b[g]=h,delete c[g],this._changed=!0,d.silent||this.trigger("change:"+g,this,h,d)}!e&&!d.silent&&this._changed&&this.change(d);this._changing=!1;return this},unset:function(a,d){if(!(a in this.attributes))return this;d||(d={});var b={};b[a]=void 0;if(!d.silent&&this.validate&&!this._performValidation(b,d))return!1;delete this.attributes[a];delete this._escapedAttributes[a];a==this.idAttribute&&delete this.id;this._changed=
!0;d.silent||(this.trigger("change:"+a,this,void 0,d),this.change(d));return this},clear:function(a){a||(a={});var d,b=this.attributes,c={};for(d in b)c[d]=void 0;if(!a.silent&&this.validate&&!this._performValidation(c,a))return!1;this.attributes={};this._escapedAttributes={};this._changed=!0;if(!a.silent){for(d in b)this.trigger("change:"+d,this,void 0,a);this.change(a)}return this},fetch:function(a){a||(a={});var d=this,b=a.success;a.success=function(c,e,f){if(!d.set(d.parse(c,f),a))return!1;b&&
b(d,c)};a.error=t(a.error,d,a);return(this.sync||e.sync).call(this,"read",this,a)},save:function(a,d){d||(d={});if(a&&!this.set(a,d))return!1;var b=this,c=d.success;d.success=function(a,e,f){if(!b.set(b.parse(a,f),d))return!1;c&&c(b,a,f)};d.error=t(d.error,b,d);var f=this.isNew()?"create":"update";return(this.sync||e.sync).call(this,f,this,d)},destroy:function(a){a||(a={});if(this.isNew())return this.trigger("destroy",this,this.collection,a);var d=this,b=a.success;a.success=function(c){d.trigger("destroy",
d,d.collection,a);b&&b(d,c)};a.error=t(a.error,d,a);return(this.sync||e.sync).call(this,"delete",this,a)},url:function(){var a=o(this.collection)||this.urlRoot||j();return this.isNew()?a:a+("/"==a.charAt(a.length-1)?"":"/")+encodeURIComponent(this.id)},parse:function(a){return a},clone:function(){return new this.constructor(this)},isNew:function(){return null==this.id},change:function(a){this.trigger("change",this,a);this._previousAttributes=f.clone(this.attributes);this._changed=!1},hasChanged:function(a){return a?
this._previousAttributes[a]!=this.attributes[a]:this._changed},changedAttributes:function(a){a||(a=this.attributes);var d=this._previousAttributes,b=!1,c;for(c in a)f.isEqual(d[c],a[c])||(b=b||{},b[c]=a[c]);return b},previous:function(a){return!a||!this._previousAttributes?null:this._previousAttributes[a]},previousAttributes:function(){return f.clone(this._previousAttributes)},_performValidation:function(a,d){var b=this.validate(a);return b?(d.error?d.error(this,b,d):this.trigger("error",this,b,d),
!1):!0}});e.Collection=function(a,d){d||(d={});if(d.comparator)this.comparator=d.comparator;f.bindAll(this,"_onModelEvent","_removeReference");this._reset();a&&this.reset(a,{silent:!0});this.initialize.apply(this,arguments)};f.extend(e.Collection.prototype,e.Events,{model:e.Model,initialize:function(){},toJSON:function(){return this.map(function(a){return a.toJSON()})},add:function(a,d){if(f.isArray(a))for(var b=0,c=a.length;b<c;b++)this._add(a[b],d);else this._add(a,d);return this},remove:function(a,
d){if(f.isArray(a))for(var b=0,c=a.length;b<c;b++)this._remove(a[b],d);else this._remove(a,d);return this},get:function(a){return null==a?null:this._byId[null!=a.id?a.id:a]},getByCid:function(a){return a&&this._byCid[a.cid||a]},at:function(a){return this.models[a]},sort:function(a){a||(a={});if(!this.comparator)throw Error("Cannot sort a set without a comparator");this.models=this.sortBy(this.comparator);a.silent||this.trigger("reset",this,a);return this},pluck:function(a){return f.map(this.models,
function(d){return d.get(a)})},reset:function(a,d){a||(a=[]);d||(d={});this.each(this._removeReference);this._reset();this.add(a,{silent:!0});d.silent||this.trigger("reset",this,d);return this},fetch:function(a){a||(a={});var d=this,b=a.success;a.success=function(c,e,f){d[a.add?"add":"reset"](d.parse(c,f),a);b&&b(d,c)};a.error=t(a.error,d,a);return(this.sync||e.sync).call(this,"read",this,a)},create:function(a,d){var b=this;d||(d={});a=this._prepareModel(a,d);if(!a)return!1;var c=d.success;d.success=
function(a,e,f){b.add(a,d);c&&c(a,e,f)};a.save(null,d);return a},parse:function(a){return a},chain:function(){return f(this.models).chain()},_reset:function(){this.length=0;this.models=[];this._byId={};this._byCid={}},_prepareModel:function(a,d){if(a instanceof e.Model){if(!a.collection)a.collection=this}else{var b=a,a=new this.model(b,{collection:this});a.validate&&!a._performValidation(b,d)&&(a=!1)}return a},_add:function(a,d){d||(d={});a=this._prepareModel(a,d);if(!a)return!1;var b=this.getByCid(a);
if(b)throw Error(["Can't add the same model to a set twice",b.id]);this._byId[a.id]=a;this._byCid[a.cid]=a;this.models.splice(null!=d.at?d.at:this.comparator?this.sortedIndex(a,this.comparator):this.length,0,a);a.bind("all",this._onModelEvent);this.length++;d.silent||a.trigger("add",a,this,d);return a},_remove:function(a,d){d||(d={});a=this.getByCid(a)||this.get(a);if(!a)return null;delete this._byId[a.id];delete this._byCid[a.cid];this.models.splice(this.indexOf(a),1);this.length--;d.silent||a.trigger("remove",
a,this,d);this._removeReference(a);return a},_removeReference:function(a){this==a.collection&&delete a.collection;a.unbind("all",this._onModelEvent)},_onModelEvent:function(a,d,b,c){("add"==a||"remove"==a)&&b!=this||("destroy"==a&&this._remove(d,c),d&&a==="change:"+d.idAttribute&&(delete this._byId[d.previous(d.idAttribute)],this._byId[d.id]=d),this.trigger.apply(this,arguments))}});f.each("forEach,each,map,reduce,reduceRight,find,detect,filter,select,reject,every,all,some,any,include,contains,invoke,max,min,sortBy,sortedIndex,toArray,size,first,rest,last,without,indexOf,lastIndexOf,isEmpty,groupBy".split(","),
function(a){e.Collection.prototype[a]=function(){return f[a].apply(f,[this.models].concat(f.toArray(arguments)))}});e.Router=function(a){a||(a={});if(a.routes)this.routes=a.routes;this._bindRoutes();this.initialize.apply(this,arguments)};var m=/:([\w\d]+)/g,l=/\*([\w\d]+)/g,w=/[-[\]{}()+?.,\\^$|#\s]/g;f.extend(e.Router.prototype,e.Events,{initialize:function(){},route:function(a,d,b){e.history||(e.history=new e.History);f.isRegExp(a)||(a=this._routeToRegExp(a));e.history.route(a,f.bind(function(c){c=
this._extractParameters(a,c);b.apply(this,c);this.trigger.apply(this,["route:"+d].concat(c))},this))},navigate:function(a,d){e.history.navigate(a,d)},_bindRoutes:function(){if(this.routes){var a=[],d;for(d in this.routes)a.unshift([d,this.routes[d]]);d=0;for(var b=a.length;d<b;d++)this.route(a[d][0],a[d][1],this[a[d][1]])}},_routeToRegExp:function(a){a=a.replace(w,"\\$&").replace(m,"([^/]*)").replace(l,"(.*?)");return RegExp("^"+a+"$")},_extractParameters:function(a,d){return a.exec(d).slice(1)}});
e.History=function(){this.handlers=[];f.bindAll(this,"checkUrl")};var n=/^#*/,y=/msie [\w.]+/,v=!1;f.extend(e.History.prototype,{interval:50,getFragment:function(a,d){if(null==a)if(this._hasPushState||d){var a=window.location.pathname,b=window.location.search;b&&(a+=b);0==a.indexOf(this.options.root)&&(a=a.substr(this.options.root.length))}else a=window.location.hash;return decodeURIComponent(a.replace(n,""))},start:function(a){if(v)throw Error("Backbone.history has already been started");this.options=
f.extend({},{root:"/"},this.options,a);this._wantsPushState=!!this.options.pushState;this._hasPushState=!(!this.options.pushState||!window.history||!window.history.pushState);var a=this.getFragment(),d=document.documentMode;if(d=y.exec(navigator.userAgent.toLowerCase())&&(!d||7>=d))this.iframe=h('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow,this.navigate(a);this._hasPushState?h(window).bind("popstate",this.checkUrl):"onhashchange"in window&&!d?h(window).bind("hashchange",
this.checkUrl):setInterval(this.checkUrl,this.interval);this.fragment=a;v=!0;a=window.location;d=a.pathname==this.options.root;if(this._wantsPushState&&!this._hasPushState&&!d)return this.fragment=this.getFragment(null,!0),window.location.replace(this.options.root+"#"+this.fragment),!0;if(this._wantsPushState&&this._hasPushState&&d&&a.hash)this.fragment=a.hash.replace(n,""),window.history.replaceState({},document.title,a.protocol+"//"+a.host+this.options.root+this.fragment);if(!this.options.silent)return this.loadUrl()},
route:function(a,d){this.handlers.unshift({route:a,callback:d})},checkUrl:function(){var a=this.getFragment();a==this.fragment&&this.iframe&&(a=this.getFragment(this.iframe.location.hash));if(a==this.fragment||a==decodeURIComponent(this.fragment))return!1;this.iframe&&this.navigate(a);this.loadUrl()||this.loadUrl(window.location.hash)},loadUrl:function(a){var d=this.fragment=this.getFragment(a);return f.any(this.handlers,function(a){if(a.route.test(d))return a.callback(d),!0})},navigate:function(a,
d){var b=(a||"").replace(n,"");if(!(this.fragment==b||this.fragment==decodeURIComponent(b))){if(this._hasPushState){var c=window.location;0!=b.indexOf(this.options.root)&&(b=this.options.root+b);this.fragment=b;window.history.pushState({},document.title,c.protocol+"//"+c.host+b)}else if(window.location.hash=this.fragment=b,this.iframe&&b!=this.getFragment(this.iframe.location.hash))this.iframe.document.open().close(),this.iframe.location.hash=b;d&&this.loadUrl(a)}}});e.View=function(a){this.cid=f.uniqueId("view");
this._configure(a||{});this._ensureElement();this.delegateEvents();this.initialize.apply(this,arguments)};var x=/^(\S+)\s*(.*)$/,p="model,collection,el,id,attributes,className,tagName".split(",");f.extend(e.View.prototype,e.Events,{tagName:"div",$:function(a){return h(a,this.el)},initialize:function(){},render:function(){return this},remove:function(){h(this.el).remove();return this},make:function(a,d,b){a=document.createElement(a);d&&h(a).attr(d);b&&h(a).html(b);return a},delegateEvents:function(a){if(a||
(a=this.events)){f.isFunction(a)&&(a=a.call(this));h(this.el).unbind(".delegateEvents"+this.cid);for(var d in a){var b=this[a[d]];if(!b)throw Error('Event "'+a[d]+'" does not exist');var c=d.match(x),e=c[1],c=c[2],b=f.bind(b,this),e=e+(".delegateEvents"+this.cid);""===c?h(this.el).bind(e,b):h(this.el).delegate(c,e,b)}}},_configure:function(a){this.options&&(a=f.extend({},this.options,a));for(var c=0,b=p.length;c<b;c++){var e=p[c];a[e]&&(this[e]=a[e])}this.options=a},_ensureElement:function(){if(this.el){if(f.isString(this.el))this.el=
h(this.el).get(0)}else{var a=this.attributes||{};if(this.id)a.id=this.id;if(this.className)a["class"]=this.className;this.el=this.make(this.tagName,a)}}});e.Model.extend=e.Collection.extend=e.Router.extend=e.View.extend=function(a,c){var b=s(this,a,c);b.extend=this.extend;return b};var q={create:"POST",update:"PUT","delete":"DELETE",read:"GET"};e.sync=function(a,c,b){var g=q[a],b=f.extend({type:g,dataType:"json"},b);if(!b.url)b.url=o(c)||j();if(!b.data&&c&&("create"==a||"update"==a))b.contentType=
"application/json",b.data=JSON.stringify(c.toJSON());if(e.emulateJSON)b.contentType="application/x-www-form-urlencoded",b.data=b.data?{model:b.data}:{};if(e.emulateHTTP&&("PUT"===g||"DELETE"===g)){if(e.emulateJSON)b.data._method=g;b.type="POST";b.beforeSend=function(a){a.setRequestHeader("X-HTTP-Method-Override",g)}}if("GET"!==b.type&&!e.emulateJSON)b.processData=!1;return h.ajax(b)};var r=function(){},s=function(a,c,b){var e;e=c&&c.hasOwnProperty("constructor")?c.constructor:function(){return a.apply(this,
arguments)};f.extend(e,a);r.prototype=a.prototype;e.prototype=new r;c&&f.extend(e.prototype,c);b&&f.extend(e,b);e.prototype.constructor=e;e.__super__=a.prototype;return e},o=function(a){return!a||!a.url?null:f.isFunction(a.url)?a.url():a.url},j=function(){throw Error('A "url" property or function must be specified');},t=function(a,c,b){return function(e){a?a(c,e,b):c.trigger("error",c,e,b)}}}).call(this);
