(function (root) {
    var FBAuthHandler = function (options) { /* app_id, fbRootNode */
        var _t = this, loadDefs, loginDefs, e
        , defaultRollback = function () {
            document.body.style.cursor = "";
        };
        this.user = options.user || {};
        this.fbDoneLoading = false;
        this.fbUserID = this.user.facebook_id;
        this.fbToken = this.user.access_token || "NOTOKEN";
        this.fbFriends = null;
        this.fbPerms = {};
        this.require_refresh = false
        this.isLoggedIn = function () {
            return FB.getAccessToken() && this.user.id;
        };

        loadDefs = new sprints8.deferreds(function () { return this.fbDoneLoading }, this);
        this.addFBDeferred = loadDefs.add;
        this.runFBDeferred = loadDefs.run;

        loginDefs = new sprints8.deferreds(function () { return this.fbDoneLoading && this.isLoggedIn() }, this);
        this.addLoginDeferred = loginDefs.add;
        this.runLoginDeferred = loginDefs.run;
        this.getPicFromUserID = function (id) { return "http://graph.facebook.com/" + id + "/picture" };

        this.getPermissions = function () {
            var fbh = this;
            fbh.addLoginDeferred(function () {
                FB.api("/me/permissions", function (response) {
                    if (_.isArray(response.data)) fbh.fbPerms = response.data[0];
                });
            });
            return fbh.fbPerms;
        };
        if (options.require_permissions) { this.getPermissions() }


        this.getFriends = function (cb) {
            if (!_t.fbFriends) {
                this.addLoginDeferred(function () {
                    FB.api("/me/friends", { fields: 'name,id,birthday,gender,picture' }, function (response) {
                        _t.fbFriends = response.data;
                        if (cb) cb(_t.fbFriends)
                    });
                });
            }
            else if (cb) cb(_t.fbFriends);
        };

        this.sendUserToServer = function (profile, authResponse, options) {
            sprints8.send(_.extend({ url: "/fblogin", data: JSON.stringify({ authResponse: authResponse, profile: profile }) }, options || {}));
        };

        this.backlogin = function (authResponse, rollback) {
            rollback = rollback || defaultRollback;
            FB.api("/me", function (profile) {
                if (_.isEmpty(profile) || !profile.name) { rollback(); return; }
                profile.picture = window.__auth__.getPicFromUserID(profile.id);
                window.__auth__.sendUserToServer(profile, authResponse, {
                    success: sprints8.gotoUrl(window.__options__.furl)
                    , complete: rollback || function (xhr, status) { document.body.style.cursor = ""; }
                });
            });
        };

        this.refreshUser = function () {
            var auth = this;
            this.addLoginDeferred(function () {
                auth.require_refresh = true;
                FB.api("/me", function (profile) {
                    profile.picture = window.__auth__.getPicFromUserID(profile.id);
                    auth.sendUserToServer(profile, FB.getAuthResponse(), { success: function (resp, status, xhr) { auth.require_refresh = false; } });
                });
            });
        }
        if (!! ~(window.location.hash.indexOf("refresh"))) { this.refreshUser(); }


        $(document).on({
            click: function (click_event) {
                var $target = $(click_event.target), $bodyTarget = $("body").add($target)
                , rollback = function () {
                    $bodyTarget.css("cursor", "");
                    $target.siblings(".loading").addClass("hidden");
                    $target.removeClass("hidden");
                };
                $bodyTarget.css("cursor", "wait");
                if ($target.siblings(".loading").removeClass("hidden").length > 0) {
                    $target.addClass("hidden");
                }

                if ($target.hasClass("logout")) {

                    FB.logout(function (response) { });

                } else {

                        FB.login(function (response) {
                            var aR = response.authResponse;
                            if (aR) {
                                _t.backlogin(aR, rollback);
                            } else {
                                rollback();
                            }
                        }, { scope: "email,user_birthday,friends_birthday,publish_stream,offline_access" });

                }
            }
        }, ".fbconnect");

        window.fbAsyncInit = function () {
            var channelUrl = document.location.protocol + "//" + document.location.host + "/static/scripts/channel.html";
            FB.init({ appId: options.appId, status: true, authResponse: true, cookie: true, xfbml: false, channelUrl: channelUrl });
            _t.fbDoneLoading = true;
            _t.runFBDeferred();
            FB.Event.subscribe('auth.authResponseChange', function (response) {
                if (response.authResponse) { // login/token refresh
                    if (_t.user.facebook_id != response.authResponse.userID) {
                        _t.backlogin(response.authResponse);
                    } else {
                        if (_t.fbToken != response.authResponse.accessToken) {
                            sprints8.send({ url: "/fbtokenrefresh", data: { accessToken: response.authResponse.accessToken }, success: function (resp, status, xhr) { if (resp.isLogin) _t.backlogin(response.authResponse); } });
                        }
                        _t.fbToken = response.authResponse.accessToken
                        _t.user.access_token = _t.fbToken;
                        _t.runLoginDeferred();
                    }
                }
            });


            FB.Event.subscribe('auth.statusChange', function (response) {
                if (!_.isEmpty(_t.user) && !response.authResponse) { // logout
                    sprints8.send({ url: "/asynclogout", success: function (resp, status, xhr) { window.location.href = resp.location } });
                }
            });
        };
        e = document.createElement("script");
        e.src = "https://connect.facebook.net/en_US/all.js";
        e.async = true;
        document.getElementById(options.fbRootNode || "fb-root").appendChild(e);
    };
    root.__auth__ = new FBAuthHandler(window.__options__.fb);
})(window);