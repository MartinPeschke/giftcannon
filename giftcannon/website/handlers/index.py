from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound

@view_config(route_name='home', renderer='giftcannon:website/templates/index.html')
def index(request):
  return {'title':'GiftCannon - Welcome'}


