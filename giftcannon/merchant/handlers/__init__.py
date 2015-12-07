### local imports
from contexts import merchantAuthedContextFactory, AnonymousRequiredContext, MerchantRootContext, MerchantResetPasswordContext

def includeme(config):
    config.add_route('merchant_support', '/merchant/support', factory = MerchantRootContext)
    # config.add_route('merchant_signup', '/merchant/signup', factory = AnonymousRequiredContext)
    config.add_route('merchant_login', '/merchant/login', factory = AnonymousRequiredContext)
    config.add_route('merchant_logout', '/merchant/logout', factory = MerchantRootContext)
    config.add_route('merchant_login_password_wo', '/merchant/login/password/', factory = AnonymousRequiredContext)
    config.add_route('merchant_login_password', '/merchant/login/password/:token', factory = MerchantResetPasswordContext)



    config.add_route('merchant_dashboard', '/merchant', factory = merchantAuthedContextFactory("REDEEM"))
    config.add_route('merchant_dashboard_history', '/merchant/history', factory = merchantAuthedContextFactory("HISTORY"))
    config.add_route('merchant_code_validate', '/merchant/validate', factory = merchantAuthedContextFactory("REDEEM"))
    config.add_route('merchant_code_redeem', '/merchant/redeem', factory = merchantAuthedContextFactory("REDEEM"))
    
    config.add_route('merchant_settings', '/merchant/settings', request_method="GET", \
        factory = merchantAuthedContextFactory("SETTINGS"))
    config.add_route('merchant_settings_post', '/merchant/settings', request_method="POST", \
        factory = merchantAuthedContextFactory("SETTINGS"))
    config.add_route('merchant_settings_operators', '/merchant/settings/operators', \
        factory = merchantAuthedContextFactory("SETTINGS"))
    config.add_route('merchant_settings_operator_delete', '/merchant/settings/operators/delete/:id', request_method="GET", \
        factory = merchantAuthedContextFactory("SETTINGS"))
    
    config.add_static_view('merchant/static', 'giftcannon:merchant/static', cache_max_age=3600)