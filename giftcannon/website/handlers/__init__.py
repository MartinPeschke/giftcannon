from pyramid.exceptions import NotFound
from giftcannon.website.handlers.errors import notfound_view

def includeme(config):
    config.add_route('home', '/')
    config.add_route('gift', '/gift')
    config.add_route('preset_gift', '/send/:actionlink')
    config.add_route('preset_recipient', '/gift/recipient/preset')
    config.add_route('payment_success', '/success/:token')
    config.add_route('gift_coupon', '/gift/:token')
    config.add_route('dosend', '/dosend')

    config.add_route('paypal_result', '/paypal/result')


    config.add_route('login', '/login')
    config.add_route('fblogin', '/fblogin')
    config.add_route('fbtokenrefresh', '/fbtokenrefresh')
    config.add_route('logout', '/logout')
    config.add_route('asynclogout', '/asynclogout')
    config.add_route('me_gifts', '/me/gifts')
    config.add_view(notfound_view, context=NotFound)
    
    config.add_static_view('static', 'giftcannon:website/static', cache_max_age=3600)