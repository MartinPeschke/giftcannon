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
        , login:function(data){
            this.set(data);
        }
        , logout : function(onLogout){
            this.clear();
            this.trigger("logout");
        }
        , isLoggedIn: function(){
            return !!this.get('token');
        }
    });

    return (new User());
});