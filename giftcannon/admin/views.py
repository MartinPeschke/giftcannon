from pyramid.view import view_config
from pyramid.httpexceptions import HTTPFound
from pyramid.path import AssetResolver, CALLER_PACKAGE
from beaker.cache import cache_region
from operator import attrgetter
from itertools import ifilter, imap
import os, logging, simplejson, formencode
log = logging.getLogger(__name__)

### jsonmapper imports
from jsonmapper.backend import DBMessage, DBException

### local imports
from giftcannon.admin.models.merchant import Merchant, Product, Venue, MerchantDetails, CreateMerchant, Category
from giftcannon.admin.models import merchant


pathresolver = AssetResolver('giftcannon')


def getCategories(backend):
  result = sorted(map(Category, backend.query(method="GET", url="/api/product/catalog").get("Category", [])), key = lambda x: x.sort)
  return result


def get_globals(request):
  path = pathresolver.resolve('website/static/img/products')
  files = []
  for fname in path.listdir():
     a = pathresolver.resolve('website/static/img/products/{}'.format(fname))
     files.append(request.static_path(a.absspec()))
  g = request.registry.settings["g"]
  merchants = sorted(map(Merchant, g.backend.query(method="GET", url="/merchant/admin/all").get("Merchant",[])), key = attrgetter("id"))
  categories = getCategories(g.backend)
  return {"merchants": merchants, "categories":categories, "Venue":Venue,"CreateMerchant":CreateMerchant
          , 'product_pictures': files}

def findMerchant(mid, params):
  return filter(lambda x: x.id == mid, params['merchants'])[0]


@view_config(route_name='admin_index', renderer='giftcannon:admin/templates/index.html')
def admin_index(request):
  result = get_globals(request)
  result['title'] = 'GiftCannon - Admin Area'
  return result

@view_config(route_name='admin_merchant_details', renderer='giftcannon:admin/templates/venuesproducts.html')
def admin_merchant_details(request):
  g = request.registry.settings["g"]
  mid = int(request.matchdict['id'])
  result = get_globals(request)
  result['merchant'] = findMerchant(mid, result)
  result['md'] = MerchantDetails(g.backend("Merchant_Details", method="POST", url="/merchant/admin/merchantdetails", data = {"merchant": {"id":mid}}))
  result['title'] = 'GiftCannon - Admin Area'
  return result



@view_config(route_name='admin_entity_create', renderer="json")
def admin_entity_create(request):
  entity = getattr(merchant, request.matchdict['entity'], None)
  if(entity is None):
    return {"success":False, 'error':"Unknown entity"}
  g = request.registry.settings["g"]

  try:
    result = g.backend.query(method="POST", url="/merchant/admin/create{}".format(entity.__name__.lower()), data = request.json_body)
  except DBMessage, e:
    return {"success":False, 'error':e.message}
  except DBException, e:
    return {"success":False, 'error':str(e)}
  return {"success":True}



@view_config(route_name='admin_entity_update', renderer="json")
def admin_entity_update(request):
  g = request.registry.settings["g"]
  data = request.json_body
  query = data.get('query')
  url = data.get('url')
  try:
    result = g.backend.query(method="POST", url=url, data = query)
  except DBMessage, e:
    return {"success":False, 'error':e.message}
  except DBException, e:
    return {"success":False, 'error':str(e)}
  return {"success":True}

@view_config(route_name='admin_highlight_product', renderer="json")
def admin_highlight_product(request):
  g = request.registry.settings["g"]
  data = request.json_body
  try:
    result = g.backend.query(method="POST", url="/merchant/admin/highlightProduct", data = {"id":data['id'], "highlight":bool(data['highlight'])})
  except DBMessage, e:
    return {"success":False, 'error':e.message}
  except DBException, e:
    return {"success":False, 'error':str(e)}
  return {"success":True}
