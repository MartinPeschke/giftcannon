from pyramid.view import view_config
from pyramid.httpexceptions import HTTPFound
from jsonmapper.backend import DBMessage
from giftcannon.models.auth import User

import logging, simplejson, formencode
log = logging.getLogger(__name__)

@view_config(route_name='fbtokenrefresh', renderer='json')
def fbtokenrefresh(request):
  isLogin = request.user.facebook_id != request.params.get('id')
  request.user.access_token = request.params.get('accessToken')
  return {"success":True, "isLogin": isLogin}

@view_config(route_name='login', renderer='giftcannon:website/templates/login.html', xhr=False)
def login(request):
  request.furl = request.params.get('furl') or request.route_path('home')
  if 'login' in request.session:
    request.fwd("register", _query = {'furl':request.furl})
  return {'title':'GiftCannon - Login'}

@view_config(route_name='fblogin', renderer='json')
def fblogin(request):
  g = request.registry.settings["g"]
  try:
    result = {'success': False}
    user_map = g.backend("User", method="POST", url="/api/user/FbLogin", data = request.json_body)
  except DBMessage, e:
    if e.message == 'NEWUSER':
      request.session['user'] = User.wrap(e.returnobj)
      result['success'] = True
      result['message'] = e.message
    else:
      raise Exception("UNRECOGNIZED DB RETURN CODE: %s", e.message)
  else:
      request.session['user'] = User.wrap(user_map)
      result['success'] = True
  return result

@view_config(route_name='logout')
def logout(request):
  if 'user' in request.session:
    del request.session['user']
  if 'login' in request.session:
    del request.session['login']
  raise HTTPFound(location = request.params.get('furl') or request.fwd('home') )

@view_config(route_name='asynclogout', renderer= "json")
def asynclogout(request):
  if 'user' in request.session:
    del request.session['user']
  if 'login' in request.session:
    del request.session['login']
  return {"success":True, "location" : request.route_path('home') }
