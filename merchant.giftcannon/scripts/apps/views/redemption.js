define(["require", "tools/ajax", "models/loginstatus", "text!templates/redemption.html", "text!templates/coupon_valid.html"]
    , function (require, ajax, LoginStatus, page_template, coupon_template) {
        var events = {}, events = {};
        events[hnc.support.clickEvent + " .close"] = "closeDetails";
        events[hnc.support.clickEvent + " .btn-report"] = "submitReport";
        events["keyup .btn-report"] = "submitReport";
        events["submit .form-validated"] = "onSubmit";
        events["keyup input"] = "cleanForm";
        var View = ajax.View.extend({
            template:_.template(page_template)
            , coupon_template:_.template(coupon_template)
            , events: events
            , initialize: function() {
                this.$el.html(page_template);
                this.form = this.$(".form-validated");
            }
            , closeDetails : function(e){
                this.cleanForm();
                this.$("input").val("");
            }
            , onRedeem: function(resp, status, xhr){
                this.gift = resp.Gift;
                window.app_router.navigate("/valid/"+resp.Gift.code, true);
                this.setLoading(false);
            }
            , onError: function(msg, resp){
                this.setLoading(false);
                if(msg == 'INVALID_OR_USED_CODE'){
                    this.showError(this.form.find("[name=Gift\\.code]"), "Invalid or used code");
                }
                this.$("input").val("");
            }
            , onSubmit: function(e){
                e.preventDefault();
                e.stopPropagation();

                var view = this, data = ajax.serializeJSON($(e.target));
                if(hnc.getRecursive(data, "Gift.code", "").length < 4){
                    this.showError(this.form.find("[name=Gift\\.code]"), "Minimum 4 characters");
                    return false;
                }
                data.token = LoginStatus.get("token");
                this.setLoading(true);
                this.cleanForm();
                ajax.submitPrefixed({url:"/app/merchant/redeem", data: data, success:_.bind(this.onRedeem, this), handleMessage: _.bind(this.onError, this)});
                return false;
            }
            , submitReport: function(e){
                if(!e.keyCode || e.keyCode==13){
                    console.log($(e.target).data(("timeFrame")))
                }
            }
            , render : function(){
                if(!LoginStatus.isLoggedIn()){
                    window.app_router.navigate("/login", true);
                }
            }
        });
        return View;
    });
