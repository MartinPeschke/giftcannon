define(["require", "tools/ajax", "models/loginstatus", "text!templates/login.html"]
    , function (require, ajax, LoginStatus, page_template) {
        var View = ajax.View.extend({
            template:_.template(page_template)
            , events: {"submit .form-validated": "onSubmit"}
            , initialize: function() {
                this.$el.html(page_template);
                this.form = this.$(".form-validated");
            }
            , onLogin: function(resp, status, xhr){
                LoginStatus.login(resp.Merchant[0]);
                this.setLoading(false);
                window.app_router.navigate("/redemption", true);
            }
            , onError: function(msg, resp){
                this.setLoading(false);
                if(msg == 'LOGIN_FAILED'){
                    this.showError(this.form.find("[name=email]"), "Unknown email or password")
                }
            }
            , onSubmit: function(e){
                var view = this, data = ajax.serializeJSON($(e.target));
                this.setLoading(true);
                this.cleanForm();
                ajax.submitPrefixed({url:"/app/merchant/login", data: data, success:_.bind(this.onLogin, this), handleMessage: _.bind(this.onError, this)});
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            , render : function(){
                if(LoginStatus.isLoggedIn()){
                    window.app_router.navigate("/redemption", true);
                } else {
                    this.$el.find("input").val("").first().focus();
                }
            }
        });
        return View;
    });
