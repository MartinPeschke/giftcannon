define(['tools/ajax'], function(ajax){
    var USER_STORAGE_KEY = 'LS_USER_STATE'
    , User = ajax.Model.extend({
        initialize:function () {
            var user_data = store.get(USER_STORAGE_KEY);
            if(user_data){
                this.set(user_data);
                this.trigger("auth:login", this);
            }
            this.on('change', this.persist, this);
        }
        , persist:function(){
            store.set(USER_STORAGE_KEY, this.toJSON())
        }
        , setPaymentDetails: function(paymentResult){
            this.set({paymentDetails: paymentResult});
        }
        , discardPaymentDetails : function(){
            this.unset("paymentDetails");
        }
        , setGiftMessage: function(msg){
            this.set({gift_message: msg});
        }
        , clearGiftMessage: function(){
            this.set({gift_message: null});
        }
        , getGiftMessage: function(){
            return this.get("gift_message");
        }
        , getPaymentDetails : function(){
            return this.get("paymentDetails");
        }
        , login:function(params){
            params = params||{};
            var model = this, success = function(resp, status, xhr){
                model.set(resp.User);
                model.trigger("auth:login");
                params.success&&params.success(model);
            };
            ajax.submitPrefixed({url:"/app/user/fblogin"
                , data: params.data
                , success: success
                , handleMessage: success
                , error: params.error
            });

        }
        , logout : function(onLogout){
            var model = this;
            ajax.submitAuthed({url:"/user/logout", success:function(){
                model.clear();
                model.trigger("logout");
                onLogout&&onLogout();
            }});
        }
        , isLoggedIn: function(){
            return !!this.get('id');
        }
    });

    return (new User());
});