define([], function () {
    var Gift = Backbone.Model.extend({
        defaults: { notification: { stream_publish: true }, quantity: 1 }
    , isNew: function () { return false }
    , all: ["product", "recipient", "venue"]
    , sync: function (method, model, options) {
        if (method == 'create') {
            console.log('error, gift cant be created');
        } else if (method == 'update') {
            options.success(sprints8.store.set("gift", model.toJSON()));
            this.trigger("save");
        } else if (method == 'delete') {
            options.success(sprints8.store.remove("gift"));
        } else if (method == 'read') {
            options.success(sprints8.store.get("gift"));
        }
    }
    , removeAttr: function (attr) {
        this.unset(attr);
        if (attr == 'product') this.unset("venue");
        else if (attr == 'venue' && this.get("product")) {
            var p = _.clone(this.get("product"));
            if (p.price) delete p.price;
            this.set({ product: p });
        }
        this.save();
        this.trigger("reset:" + attr, this);
    }
    , updateAttr: function (attr, params) {
        var options = {};
        options[attr] = _.extend(_.clone(this.get(attr) || {}), params);
        this.set(options);
        this.save();
    }
    , isComplete: function () {
        return this.hasAllAttr(this.all);
    }
    , hasAllAttr: function (elems) {
        var view = this, i = 0, len = elems.length, result = true;
        for (; i < len; i++) {
            result = result && !!this.get(elems[i]);
        }
        return result;
    }
    , setNotification: function (key, val, options) {
        var result = _.clone(this.get("notification"));
        result[key] = val;
        this.save({ notification: result }, options);
    }
    , getStreamPublish: function () { return this.get("notification").stream_publish }
    , setStreamPublish: function (val, options) { this.setNotification('stream_publish', val, options) }
    , getAnonymous: function () { return this.get("notification").anonymous }
    , setAnonymous: function (val, options) { this.setNotification('anonymous', val, options) }
    , setProductFromId: function () {
        this.destroy();

    }
    , setCategory: function (id) {
        this.unset("product");
        this.unset("venue");
        this.set({ "category_id": id });
        this.save();
        this.trigger("reset:product", this);
    }
    , addProduct: function (product_json) {
        this.unset("venue");
        this.save({ product: product_json });
        this.trigger("reset:product", this);
    }
    , unsetVenue: function () {
        var p = _.clone(this.get("product"));
        if (p.price) {
            delete p.price;
            this.set({ product: p });
        }
        this.unset("venue");
        this.save();
    }
    , setVenue: function (venue) {
        if (venue.toJSON) venue = venue.toJSON();
        if (!(venue.Product != null
                && venue.Product.length
                && _.filter(_.pluck(venue.Product, 'price'), function (x) { return !!x })
          )) {
            if (typeof console != 'undefined') console.log("Venue without Any Product or Pricing", venue.Product);
            alert("Venue without Any Product or Pricing");
            return;
        }
        var v = venue, p = _.clone(this.get("product"));
        p.price = venue.Product[0].price;
        p.prettyprice = venue.Product[0].prettyprice;
        delete v.Product;
        this.set({ "venue": v, product: p });
        this.save();
    }

    , getQuantity: function () {
        return this.get("quantity");
    }
    , setQuantity: function (val) {
        this.set({ quantity: val });
        this.save();
    }
    , getTotalPrice: function () {
        var product = this.get("product");
        if (product) { return sprints8.prettyPrintPrice(this.getQuantity() * product.price); }
        else return "";
    }
    , check: function () {
        var errors = [], members = ['product', 'recipient', 'venue', 'notification'], i = 0, len = members.length;
        for (; i < len; i++) {
            if (!this.get(members[i])) errors.push(members[i])
        }
        return errors;
    }
    });
    if (typeof window.Gift == 'undefined') { window.Gift = new Gift(); }
    return window.Gift;
});